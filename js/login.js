var AJAXPORT = 'https://jkws.zhihuixupu.com/api';
// var AJAXPORT = 'http://192.168.1.131:8089/api';


(function(){
    window.document.oncontextmenu = function(){return false;}
    //验证登录
    if(myfunc.getCookie('login_disease_control')){
        location.href = '/#/index';
        return;
    }
    //ie9以下新增Placeholder效果
    var uAgent = myfunc.getUA().userAgent_part;
    if(uAgent.split('msie').length > 1 && parseInt(uAgent.split(' ')[1]) <= 9 ){
        WindowIE8_Placeholder_Check();    
    }

    //reset loginbox
    resetLoginBox();
    onWindowResize.add(resetLoginBox);

    //evet bind
    $('.a-login').bind('click' , _gotoLogin);
    $(document.body).bind('keydown' , function(e){
        if(e.keyCode == 13 && e.target.nodeName == 'INPUT'){
            $('.a-login').click();
        }
    });
    $('.d-login input[type="text"]').focus();


})();

function resetLoginBox(){
    $('.d-loginBox').css('top' , ($(document.body).height() - $('.d-loginBox').outerHeight())/2);
}

//登录
function _gotoLogin(){
    var uname = $('.d-login input[type="text"]');
    var upwd = $('.d-login input[type="password"]');

    // var mobile_reg = /^1[3456789]\d{9}$/;
    // if( !(mobile_reg.test( uname.val() )) ){
    //     new myMessage({status : 'faile' , content : '请填写正确手机号码！'});
    //     uname.focus();
    //     return;
    // }
    if(upwd.val().length < 4 || upwd.val().length > 10){
        new myMessage({status : 'faile' , content : '密码长度应大于4位且小于10位！'});
        upwd.focus();
        return;
    }
    new $.umx.login({   
        //设置背景图片
        picList : ['images/login_checkbg1.jpg' , 'images/login_checkbg2.jpg'],
        left : uname.offset().left - 200,
        top : uname.offset().top - 130,
        calback : _submitLogin
    });
    
    
}
var _isLoginAJAX = true;
function _submitLogin(){
    if(!_isLoginAJAX)return;
    _isLoginAJAX = false;

    var uname = $('.d-login input[type="text"]');
    var upwd = $('.d-login input[type="password"]');
    dialog_loading.set({content : '努力登录中..'}).show();
  
    var ajaxData = {
        account : uname.val(),
        password : md5(upwd.val()).toUpperCase()
    };
    $.ajax({
        url: AJAXPORT + '/admin/login?' + myfunc.getUrlParamByData(ajaxData),
        type: 'post',
        data: {},
        success: function (res) {
            dialog_loading.hide();
            _isLoginAJAX = true;
            if(res.ret){
                myfunc.setCookie('login_disease_control' , JSON.stringify(res.data) , 1);
                location.href = '/#/index';
            }else{
                new myMessage({status : 'faile' , content : res.message});
            }
        }
    });
}