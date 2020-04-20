//模板地址
var TEMP = {
    html : {
        index 			: 'templet/index.html',
        record          : 'templet/record.html',
        recordLeave     : 'templet/recordLeave.html',
        recordVisitor 	: 'templet/recordVisitor.html',
        manager 		: 'templet/manager.html'

    },
    js : {
        index 			: 'js/index.js' ,
        record          : 'js/record.js',
        recordLeave     : 'js/recordLeave.js',
        recordVisitor 	: 'js/recordVisitor.js',
        manager 		: 'js/manager.js'
    },
    css : {
        index           : 'css/index.css',
        record          : 'css/record.css',
        recordLeave     : 'css/recordLeave.css',
        recordVisitor 	: 'css/recordVisitor.css',
        manager 		: 'css/manager.css'
    }
};
//请求地址
var AJAXPORT = 'https://jkws.zhihuixupu.com/api';
// var AJAXPORT = 'http://192.168.1.131:8089/api';

var _WEBSOCKET = null; //websocekt
/**
 * "id": 1,
    "username": "超级管理员",
    "employeeId": 0,
    "businessId": 0,
    "token": "10963f23-9267-476e-aafa-b320ad8c15df"
 * @type {[type]}
 */
var LOGINUSER = null; //登录者 
var HASHCACHE = Math.random(1000);//'v1105'; //缓存cache


$(window).bind('load' , function(){
    //禁止右键
    //window.document.oncontextmenu = function(){return false;}

	//验证登录
    if(!myfunc.getCookie('login_disease_control')){
        location.href = '/login.html';
        return;
    }
    LOGINUSER = JSON.parse(myfunc.getCookie('login_disease_control'));
    //左侧导航
    $('.d-leftNav ul').html(getLeftNavBy(LOGINUSER.userType));
    //头部信息
    $('.d-header .p-business').html(LOGINUSER.businessName+'&nbsp;'+LOGINUSER.deptName+'&nbsp;'+LOGINUSER.username);

    //退出登录
    $('.a-loginout').bind('click' , loginOut);
    //leftNav click
    $('.d-leftNav').bind('click' , onLeftNavClick);

	//核心 路由监控
	if(document.documentMode < 8){
		//ie 7
		setInterval(function(){
			var ischanged = isHashChanged();
			if(ischanged) {
				onPageHashChange();
			}
		},150);
	}else{
		onPageHashChange();
		$(window).bind('hashchange' , onPageHashChange);	
	}

    //优化等高
    resetContenHeight();
    onWindowResize.add(resetContenHeight);
});

function resetContenHeight(){
    $('.d-leftNav').css('height' , $(window).outerHeight() - $('.d-header').outerHeight() - $('.d-footer').outerHeight() - 15);
    $('#d-approut').css('height' , $(window).outerHeight() - $('.d-header').outerHeight() - $('.d-footer').outerHeight() - 15);
}


//登出
var _isLoginOutAJAX = true;
function loginOut(){
    if(!_isLoginOutAJAX)return;
    _isLoginOutAJAX = false;

    dialog_loading.set({content:'努力退出中..'}).show();
    $.ajax({
        url: AJAXPORT + '/admin/logout',
        type: 'get',
        data: {},
        success: function (res) {
            dialog_loading.hide();
            _isLoginOutAJAX = true;

            if(res.ret){
                myfunc.clearCookie('login_disease_control');
                LOGINUSER = null;
                location.href = '/login.html';
            }else{
                new myMessage({status : 'faile' , content : res.message});
            }
        }
    });
    
}







//核心路由
function onPageHashChange(){
	var hash = location.hash;
	var param = '';

	hash = hash.replace(/\s*/g,"");
	if(hash.split('#/').length != 2 || hash.split('\/')[0] != '#'){
		location.href="/#/index";
		return;
	}
	hash = hash.split('\/')[1];
	
	//默认null
	localStorage.setItem('DOMAIN_PARAM' , param);
	if(hash.indexOf('?') > 0){
		param = hash.split('?')[1];
		hash = hash.split('?')[0];
		
		
		param = '{"' + param.replace(/=/g,'":"') + '"}';
		if(param.split('&').length > 1){
			param = param.replace(/&/g,'","');
		}
		//储存参数
		localStorage.setItem('DOMAIN_PARAM' , param);
	}
	//储存hash
	localStorage.setItem('DOMAIN_HASH' , hash);
    //清理websocket
    if(_WEBSOCKET){
        _WEBSOCKET.close();  
    }
    //权限判定非超级管理员
    if(LOGINUSER.userType != 1 && hash == 'manager'){
        location.href="/#/index";
        return;
    }
    
    //路由
	switch(hash){
		//首页
		case 'index':
			loadTemplet(TEMP.html.index , [TEMP.js.index], [TEMP.css.index]);
		break;
        //统计-员工
        case 'record':
            loadTemplet(TEMP.html.record , [TEMP.js.record], [TEMP.css.record]);
        break;
        //统计-员工离开
        case 'recordLeave':
            loadTemplet(TEMP.html.recordLeave , [TEMP.js.recordLeave], [TEMP.css.recordLeave]);
        break;
		//统计-访客
		case 'recordVisitor':
			loadTemplet(TEMP.html.recordVisitor , [TEMP.js.recordVisitor], [TEMP.css.recordVisitor]);
		break;
		//管理设定
		case 'manager':
			loadTemplet(TEMP.html.manager , [TEMP.js.manager], [TEMP.css.manager]);
		break;
		//......
		//......
		//
		default : 
			loadTemplet(TEMP.html.index , [TEMP.js.index], [TEMP.css.index]);
		break;
	}
	//letnav hover
    leftNavHover();
	
}


//获取部门数据 二级联动
function loadDepts(params,calback){
    var url = AJAXPORT + '/department/businessId/' + LOGINUSER.businessId + '?' + myfunc.getUrlParamByData(params);
    $.ajax({
        url: url,
        type: 'GET',
        success: function (res) {
            if(res.ret){
                if(calback)calback(res.data);
            }else{
                new myMessage({status : 'faile' , content : '抱歉，获取部门列表信息失败，请稍后再试！'});
            }
        }
    });
    
}
//得到所有中心
function loadDept1 (sele,calback){
    sele.html('<option value="" selected="selected">所有中心</option>');
    //得到所有中心
    var url = AJAXPORT + '/department/businessId/' + LOGINUSER.businessId + '?' + myfunc.getUrlParamByData({parentId : 0});
    $.ajax({
        url: url,
        type: 'GET',
        success: function (res) {
            if(res.ret){
                $.each(res.data , function(index,item){
                    var opt = $('<option>');
                        opt.val(item.id);
                        opt.html(item.deptName);
                        opt.appendTo(sele);
                });
                if(calback)calback();
            }else{
                new myMessage({status : 'faile' , content : '抱歉，获取部门列表信息失败，请稍后再试！'});
            }
        }
    });
}

//得到所有部门
function loadDept2 (sele,parentid,calback){
    sele.html('<option value="" selected="selected">所有部门</option>');
    var url = AJAXPORT + '/department/businessId/' + LOGINUSER.businessId + '?' + myfunc.getUrlParamByData({parentId : parentid});
    $.ajax({
        url: url,
        type: 'GET',
        success: function (res) {
            if(res.ret){
                $.each(res.data , function(index,item){
                    var opt = $('<option>');
                        opt.val(item.id);
                        opt.html(item.deptName);
                        opt.appendTo(sele);
                });
                if(calback)calback();
            }else{
                new myMessage({status : 'faile' , content : '抱歉，获取部门列表信息失败，请稍后再试！'});
            }
        }
    });
}



//加载templet
function loadTemplet(html , arrjs , arrcss){
	var _init = function(html , arrjs , arrcss){
		clearJsCss();
		$.get(html+'?'+HASHCACHE).success(function(content){
			$('#d-approut').html(content);
			$('#d-approut .d-main:first').animate({'opacity' : 1} , 'fast' , function(){
				// dialog_loading.hide();
			});
			//加载模块所需js 并添加标记
			if(arrjs) {
				$.each(arrjs , function(i,js){
					new loadJs(js+'?'+HASHCACHE);
				});
			}
			if(arrcss) {
				$.each(arrcss , function(i,css){
					new loadCss(css+'?'+HASHCACHE);
				});
			}
		});
	};
	if(!html) return;
	
	var oldBox = $('#d-approut .d-main:first');
	if(oldBox.length <= 0) {
		_init(html , arrjs , arrcss);
		return;
	}
	// dialog_loading.set({content:'页面努力加载中...'}).show();
	oldBox.animate({opacity : 0} , 'fast' ,function(){ 
		oldBox.remove(); 
		_init(html , arrjs , arrcss);
	});

	
}
//是否change hash
var historyHash = '';
function isHashChanged(){
	if(location.href.split('/#/').length < 2) return;
	var hash = location.href.split('/#/')[1];
	if(hash != historyHash){
		historyHash = hash;
		return true;
	}else{
		return false;
	}
}
//清除加载项
function clearJsCss(){
    $('script[sign="sign"]').remove();
    $('link[sign="sign"]').remove();
    //清除加载过的datetimepicker
    $('.xdsoft_datetimepicker').remove();
    
}
//加载js
function loadJs(src){
    var script = null;
    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.setAttribute('sign' , 'sign');//特殊标记
    document.getElementsByTagName("body")[0].appendChild(script);
}
//加载css
function loadCss(src){
    var link = null;
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = src;
    link.setAttribute('sign' , 'sign');//特殊标记
    document.getElementsByTagName("head")[0].appendChild(link);
}

function leftNavHover(){
	var hash = location.href.split('/#/')[1];
	$('.d-leftNav a').removeClass('a-hover');
	$('.d-leftNav li').removeClass('li-hover');

	var a = $('.d-leftNav a[href="/#/'+hash+'"]');
	a.addClass('a-hover');
	if(a.closest('p').get(0)){
		a.closest('li').addClass('li-hover');
		a.closest('p').css('height' , a.closest('p').find('a').length * 40);
	}else{
		$('.d-leftNav p').css('height' , 0);
	}
}
function onLeftNavClick(e){
	var target = myfunc.target(e);
	if(target.tagName != 'A' || target.href !='javascript:;')return;
	var a = $(target);
	if(a.siblings('p').get(0)){
		var p = $(a.siblings('p').get(0));
		$('.d-leftNav li').removeClass('li-hover');
		p.closest('li').addClass('li-hover');
		p.css('height' , p.find('a').length * 40);
		//模拟点击
		p.find('a').get(0).click();
	}
}

function getLeftNavBy(userType){
    var html = ''
        +'<li><a href="/#/index" ico="1">首页</a></li>'
        +'<li>'
            +'<a href="javascript:;" ico="2">统计登记</a>'
            +'<p>'
                +'<a href="/#/record">员工登记</a>'
                +'<a href="/#/recordLeave">员工外出</a>'
                +'<a href="/#/recordVisitor">访客登记</a>'
            +'</p>'
        +'</li>';
    if(userType === 1){
        html += ''
        +'<li><a href="/#/manager" ico="3">管理设定</a></li>';
    }
    return html;
}