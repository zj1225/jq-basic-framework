var _page = 1;
var _pageNum = 8;
var _ajaxData = {
    //默认参数
    // isNormal : '', //排序方式：0时间倒序，1正常优先，2异常优先
    businessId : LOGINUSER.businessId //公司id
};

var _recordpageRender = new pageRender();
var _pageRenderId = 'recordVisitorListRender';
_recordpageRender.init({
    containerID : _pageRenderId,
    container_table_className : 'd-table cf',
    container_page_className : 'd-pages cf',
    table_column : ['姓名' , '体温℃' , '联系方式' , '出行方式' , '来访时间' , '离开时间' , '被访对象' , '来访事由' , '是否异常' , '单位或住址' , '备注' , '是否离开' ],
    data_column : ['_name' ,'_temperature' , '_phone' , '_tripMode' , '_startTime' , '_endTime' , '_visitDept' , '_visit' , '_isNormal' , '_address' , '_remark' , '_isLeave'],
    data_column_onlyName : 'id',
    ajax_type : 'GET',
    ajax_data : {},
    isOperation : false,
    noListNotice : '抱歉，暂无数据',
    pageMode : 'input'
});


(function(){
    //初始化datetimepicker
    initDateTimePicker();

    //加载分页数据
    _ajaxData.startDate = $('.d-searchBy .ipt-datetime1').val();
    _ajaxData.endDate = $('.d-searchBy .ipt-datetime1').val();
    getListBy(myfunc.getUrlParamByData(_ajaxData));

    

    //新增访客 搜索 导出
    $('.d-searchBy .a-add').bind('click' , onAddClick);
    $('.d-searchBy .a-search').bind('click' , reLoadList);
    $('.d-searchBy .a-out').bind('click', outList);
    //event bind
    $('#'+_pageRenderId).bind('click' , onItemClick);
    //搜索条件回车模拟点击
    $('.d-searchBy').bind('keydown' , _onkeyDownBySearch);
    
})();
//搜索条件回车模拟点击
function _onkeyDownBySearch(e){
    if(e.keyCode != 13)return;
    if(e.target.nodeName != "INPUT") return;

    var box = $(e.target.offsetParent);
    if(!box.hasClass('d-search')) return;
    box.find('.a-search').click(); //回车模拟点击
}
//导出
function outList(){
    var openUrl = AJAXPORT + '/guestRecord/exportGuestRecord?'+ myfunc.getUrlParamByData(_ajaxData);
    console.log(openUrl);
    window.open(openUrl);
}

//重新加载数据 根据条件
function reLoadList(page){
    //page参数从click来的话可能是event
    _page = (page && !page.type) ? page : 1;
    _ajaxData.name = $('.d-searchBy .ipt-name').val();
    _ajaxData.address = $('.d-searchBy .ipt-address').val();
    _ajaxData.startDate = $('.d-searchBy .ipt-datetime1').val();
    _ajaxData.endDate = $('.d-searchBy .ipt-datetime1').val();
    _ajaxData.isNormal = $('#'+_pageRenderId+' .sele-yc').val();

    getListBy(myfunc.getUrlParamByData(_ajaxData));
}


//根据参数获取数据
function getListBy(param){
    var ajaxUrl = AJAXPORT + '/guestRecord/pageIndex/'+_page+'/pageNum/'+_pageNum;
    if(param)
        ajaxUrl = ajaxUrl +'?' + param;

    _recordpageRender.set({
        ajax_url : ajaxUrl,
        ajax_data : {},
        resetDateFunc : function(data , resouceData){
            //预处理一下
            data.list = data.records;
            data.currentPage = data.current;
            data.totalPage = data.pages;

            $.each(data.list , function(index,item){
                item = _retunItemByData(item);
            });
            return data;
        },
        calback : function(data){
            var ths = $('#'+_pageRenderId).find('th');
            
            $(ths[8]).html('<select class="sele-yc cf"><option value="">是否异常</option><option value="1">正常</option><option value="2">异常</option></select>');
            $(ths[0]).css('width' , 100);
            $(ths[1]).css('width' , 100);
            $(ths[2]).css('width' , 120);
            $(ths[3]).css('width' , 100);
            $(ths[4]).css('width' , 100);
            $(ths[5]).css('width' , 100);
            $(ths[6]).css('width' , 200);
            $(ths[7]).css('width' , 100);
            $(ths[8]).css('width' , 100);
            $(ths[11]).css('width' , 100);


            //是否异常优化 赋值
            var sele_yc = $('#'+_pageRenderId+' .sele-yc');
            sele_yc.val(_ajaxData.isNormal);
            sele_yc.bind('change' , reLoadList);
            new checkSelectStyleChange(sele_yc);
            
            //优化
            _recordpageRender.resetSize();
        }
    }).show(_page);

}

//预处理
function _retunItemByData(data){
    data._name = data.name ? data.name : '-';
    data._temperature = data.temperature ? data.temperature : '-';
    data._phone = data.phone ? data.phone : '-';
    data._tripMode = data.tripMode ? data.tripMode : '-';
    data._startTime = data.startTime ? data.startTime.split('.')[0].replace(' ','<br />') : '';
    data._endTime = data.endTime ? data.endTime.split('.')[0].replace(' ','<br />') : '';
    data._visitDept = data.visitDept ? data.visitDept : '-';
    data._visit = data.visit ? data.visit : '-';
    data._address = data.address ? data.address : '-';
    data._remark = data.remark ? data.remark : '-';
    //isNormal  体温是否正常 1正常 2异常
    //ishandle  是否处理 1正常 2待处理 3已处理
    //endTime 有值则已离开  无值则未离开
    data._isLeave = data.endTime ? '<em style="color: #ccc;">已离开</em>' : '<a href="javascript:;" class="a-leave" opar="leave">离开</a>';
    data._isNormal = data.isNormal == 1 ? '正常' : data.isNormal == 2 ? '<em style="color: #fb672c;">异常</em>' : data.isNormal == 0 ? '<em style="color: #ccc;">未检测</em>' : '-';
    
    return data;
}


//启动ws
function wsInit (){
    if(!window.WebSocket)return;

    _WEBSOCKET = new WebSocket('ws://192.168.1.167:9090/imserver/1');///api/record/pageIndex/1/pageNum/20?'+myfunc.getUrlParamByData(_ajaxData)
    var isOpen = false;
    var _this = this;
    _WEBSOCKET.onopen = function(e){
        isOpen = true;
        console.log('open',e);
    }
    _WEBSOCKET.onmessage = function(res){
        console.log('message',res);
        var data = JSON.parse(res.data);
        if(data.ret){
            var item = $('<div class="d-item cf">');
                item.attr('data' , JSON.stringify(data.data));
                item.html(retunItemByData(data.data));
            $($('.d-list-content').children()[0]).before(item);
        }
    }
    _WEBSOCKET.onerror = function(e){
        console.log('error' , e);
    }
    _WEBSOCKET.onclose = function(e){
        console.log('close',e);
    }
    _this.start = function(){
        if(!isOpen){
            setTimeout(_this.start,100);
            return;
        }
        _ajaxData.toUserId = 1;
        _WEBSOCKET.send(JSON.stringify(_ajaxData));
    }
    
}

//初始化datetimepicker
function initDateTimePicker(){
    var ipt_datetime1 = $('.ipt-datetime1');
    var ipt_datetime2 = $('.ipt-datetime2');

    var datetimeOptions1 = {
        timepicker : false,
        format: 'Y-m-d'
    }
    var datetimeOptions2 = {
        timepicker : false,
        format: 'Y-m-d'
    }

    var _checkDate = function(){
        // console.log(ipt_datetime1.val() , ipt_datetime2.val());
        reLoadList();
    }
    var _getMinDate = function(date){
        var date = new Date(date);
        var minDate = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();


        datetimeOptions2.minDate = minDate;
        ipt_datetime2.datetimepicker(datetimeOptions2);
        _checkDate();
    }
    var _getMaxDate = function(date){
        var date = new Date(date);
        var maxDate = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();

        datetimeOptions1.maxDate = maxDate; 
        ipt_datetime1.datetimepicker(datetimeOptions1);
        _checkDate();
    }
    var _resetNumb = function(numb){
        numb = numb < 10 ? ('0'+ numb) : numb;
        return numb;
    }
    var _nokeydown = function(e){
        this.value = this.value;
        return false;
    }
    
    var date = new Date();
    var dateNow = date.getFullYear()+'-'+ _resetNumb(date.getMonth()+1)+'-'+ _resetNumb(date.getDate());

    
    datetimeOptions1.onSelectDate = _getMinDate;
    ipt_datetime1.datetimepicker(datetimeOptions1);
    ipt_datetime1.val(dateNow);
    ipt_datetime1.bind('keydown' , _nokeydown);
}

//event bind
function onItemClick(e){
    var target = myfunc.target(e);
    if(target.tagName !='A') {
        //单击非A的tr
        if($(target).closest('tr').get(0) && $(target).closest('tr').attr('data')){
            var data = JSON.parse($(target).closest('tr').attr('data'));
            _onUpdateVisitor(data);
        }
        return;
    }
    //标记
    $('#'+_pageRenderId+' a[click="click"]').removeAttr('click');
    $(target).attr('click' , 'click');

    switch($(target).attr('opar')){
        case 'leave' :
        _onLeaveClick();//离开
        break;
    }

    
}
//点击离开
function _onLeaveClick(){
    var a = $('#'+_pageRenderId+' a[click="click"]');
    var data = JSON.parse(a.closest('tr').attr('data'));
    dialog.set({
        content : '<p style="padding:30px 0 0; display:block; text-align:center; font-size:16px; color:#333;">是否确定离开？</p>',
        btns : [
            {label : '取消' , calback : function(){dialog.hide();}},
            {label : '确定' , calback : function(){onLeaveSubmit(data);}}
        ]
    }).show();
}
//点击离开确认
function onLeaveSubmit(data1){
    dialog.hide();
    dialog_loading.set({content:'设置离开中...'}).show();
    
    var data = {
        id : data1.id,
        editUser : LOGINUSER.id
    }
    $.ajax({
        url: AJAXPORT + '/guestRecord/updateGuestLeave?'+myfunc.getUrlParamByData(data),
        type: 'POST',
        success: function (res) {
            dialog_loading.hide();
            if(res.ret){
                new myMessage({status : 'success' , content : '操作成功！' });
                reLoadList(localStorage.getItem(_pageRenderId + '_pageHistory')); //刷新当前页
            }else{
                new myMessage({status : 'faile' , content : '操作失败，请稍后再试！'});
            }
        }
    });

}
//修改访客
function _onUpdateVisitor(data){

    dialog_loading.set({content:'努力获取信息..'}).show();
    $.ajax({
        url: AJAXPORT + '/guestRecord/id/' + data.id,
        type: 'GET',
        success: function (res) {
            dialog_loading.hide();
            if(res.ret){
                onItemUpdateByData(data);
            }else{
                new myMessage({status : 'faile' , content : '抱歉，获取信息失败，请稍后再试！'});
            }
        }
    });
}

//修改访客信息 根据data显示dialog里 
function onItemUpdateByData(data){
    dialog.set({
        content : _addHtml(true),
        width : 700,
        btns : [
            {label : '取消' , calback: function(){dialog.hide();}},
            {label : '确定' , calback: function(){onUpdateSubmit(data);}}
        ],
        onShowCalBack : function(){
            //只能输入数字
            $('.ui-dialog-addVisitor .ipt-wd').bind('keyup' , function(e){
                var target = myfunc.target(e);
                myfunc.onlyNumber(target);
            });

            var _resetNumb = function(numb){
                numb = numb < 10 ? ('0'+ numb) : numb;
                return numb;
            }
            var _nokeydown = function(e){
                this.value = this.value;
                return false;
            }
            var dtOptions = {
                format: 'Y-m-d H:i:s',
                step : 5
            }
            $('.ui-dialog-addVisitor .ipt-name').val(data.name);
            $('.ui-dialog-addVisitor .ipt-wd').val(data.temperature);
            $('.ui-dialog-addVisitor .ipt-tel').val(data.phone);
            $('.ui-dialog-addVisitor .ipt-tripMode').val(data.tripMode);
            $('.ui-dialog-addVisitor .ipt-adres').val(data.address);
            $('.ui-dialog-addVisitor .ipt-vuser').val(data.visitDept); //访问对象
            $('.ui-dialog-addVisitor .ipt-fromdo').val(data.visit);//访问事由
            $('.ui-dialog-addVisitor .ipt-bank').val(data.remark);
            $('.ui-dialog-addVisitor .ipt-fromtime').val(data.startTime ? data.startTime.split('.')[0] : '');
            $('.ui-dialog-addVisitor .ipt-outtime').val(data.endTime ? data.endTime.split('.')[0] : '');
            $('.ui-dialog-addVisitor .ipt-fromtime').datetimepicker(dtOptions);
            $('.ui-dialog-addVisitor .ipt-outtime').datetimepicker(dtOptions);
            //限制输入
            // $('.ui-dialog-addVisitor .ipt-fromtime').bind('keydown' , _nokeydown);
            // $('.ui-dialog-addVisitor .ipt-outtime').bind('keydown' , _nokeydown);

            //chb check
            $('.ui-dialog-addVisitor .a-chb').bind('click' , function(e){
                var a = $(this);
                a.siblings('.a-chb-hover').removeClass('a-chb-hover');
                a.addClass('a-chb-hover');
            });
            //正常或异常
            if(data.isNormal == 1){
                $('.ui-dialog-addVisitor .a-chb:first').click();
            }else{
                $('.ui-dialog-addVisitor .a-chb:last').click();
            }
        }
    }).show();
}

//修改提交
function onUpdateSubmit(data){
    var ipt_name        = $('.ui-dialog-addVisitor .ipt-name');
    var ipt_wd          = $('.ui-dialog-addVisitor .ipt-wd');
    var ipt_tel         = $('.ui-dialog-addVisitor .ipt-tel');
    var ipt_tripMode    = $('.ui-dialog-addVisitor .ipt-tripMode');
    var ipt_adres       = $('.ui-dialog-addVisitor .ipt-adres');
    var ipt_vuser       = $('.ui-dialog-addVisitor .ipt-vuser');
    var ipt_fromtime    = $('.ui-dialog-addVisitor .ipt-fromtime');
    var ipt_outtime     = $('.ui-dialog-addVisitor .ipt-outtime');
    var ipt_fromdo      = $('.ui-dialog-addVisitor .ipt-fromdo');
    var ipt_bank        = $('.ui-dialog-addVisitor .ipt-bank');
    if(ipt_name.val() == ''){
        new myMessage({status : 'faile' , content : '请填写姓名！'});
        return;
    }
    if(ipt_wd.val() == ''){
        new myMessage({status : 'faile' , content : '请填写体温！'});
        return;
    }
    if(!(/^1[3456789]\d{9}$/.test(ipt_tel.val()))){ 
        new myMessage({status : 'faile' , content : '请正确填写联系方式！'});
        return;
    }
    if(ipt_fromtime.val() == ''){
        new myMessage({status : 'faile' , content : '登记时间不能为空！'});
        return;        
    }
    if(ipt_fromdo.val() == ''){
        new myMessage({status : 'faile' , content : '请填写来访事由！'});
        return;
    }
    
    dialog_loading.set({content:'提交中...'}).show();
    //整个data拿到 修改的值重新赋值传过去
    data.name = ipt_name.val();
    data.temperature = ipt_wd.val();
    data.phone = ipt_tel.val();
    data.tripMode = ipt_tripMode.val();
    data.address = ipt_adres.val();
    data.visitDept = ipt_vuser.val();
    data.visit = ipt_fromdo.val();
    data.startTime = ipt_fromtime.val();
    if(ipt_outtime.val()) data.endTime = ipt_outtime.val();
    data.remark = ipt_bank.val();
    data.isNormal = $('.ui-dialog-addVisitor .a-chb-hover').attr('opar');
    data.editUser = LOGINUSER.id;  //修改者ID （当前登陆者

    $.ajax({
        url: AJAXPORT + '/guestRecord/updateGuestRecord',
        type: 'POST',
        data: JSON.stringify(data),
        dataType:'json',
        contentType:"application/json;charset=UTF-8",
        success: function (res) {
            dialog_loading.hide();
            if(res.ret){
                new myMessage({status : 'success' , content : '修改成功！' });
                dialog.hide();
                reLoadList(localStorage.getItem(_pageRenderId + '_pageHistory')); //刷新当前页
            }else{
                new myMessage({status : 'faile' , content : '修改失败，请稍后再试！'});
            }
        }
    });
}

//新增访客
function onAddClick(){

    dialog.set({
        content : _addHtml(),
        width : 700,
        btns : [
            {label : '取消' , calback: function(){dialog.hide();}},
            {label : '确定' , calback: onAddSubmit}
        ],
        onShowCalBack : function(){
            //只能输入数字
            $('.ui-dialog-addVisitor .ipt-wd').bind('keyup' , function(e){
                var target = myfunc.target(e);
                myfunc.onlyNumber(target);
            });
        }
    }).show();
}
//新增提交
function onAddSubmit(){
    var ipt_name = $('.ui-dialog-addVisitor .ipt-name');
    var ipt_wd = $('.ui-dialog-addVisitor .ipt-wd');
    var ipt_tel = $('.ui-dialog-addVisitor .ipt-tel');
    var ipt_tripMode = $('.ui-dialog-addVisitor .ipt-tripMode');
    var ipt_adres = $('.ui-dialog-addVisitor .ipt-adres');
    var ipt_vuser = $('.ui-dialog-addVisitor .ipt-vuser');
    var ipt_fromdo = $('.ui-dialog-addVisitor .ipt-fromdo');
    var ipt_bank = $('.ui-dialog-addVisitor .ipt-bank');
    if(ipt_name.val() == ''){
        new myMessage({status : 'faile' , content : '请填写姓名！'});
        return;
    }
    if(ipt_wd.val() == ''){
        new myMessage({status : 'faile' , content : '请填写体温！'});
        return;
    }
    if(!(/^1[3456789]\d{9}$/.test(ipt_tel.val()))){ 
        new myMessage({status : 'faile' , content : '请正确填写联系方式！'});
        return;
    }
    if(ipt_fromdo.val() == ''){
        new myMessage({status : 'faile' , content : '请填写来访事由！'});
        return;
    }
    dialog_loading.set({content:'提交中...'}).show();
    var data = {
        "name": ipt_name.val(),
        "temperature": ipt_wd.val(),
        "phone": ipt_tel.val(),
        "tripMode": ipt_tripMode.val(),
        "address": ipt_adres.val(),
        "visitDept" : ipt_vuser.val(), //被访对象
        "visit": ipt_fromdo.val(), //来访事由
        "remark": ipt_bank.val(),
        "createUser": LOGINUSER.id, //创建者id（当前管理者登录的id）
        "businessId":LOGINUSER.businessId//公司id
    };
    $.ajax({
        url: AJAXPORT + '/guestRecord',
        type: 'POST',
        data: JSON.stringify(data),
        dataType:'json',
        contentType:"application/json;charset=UTF-8",
        success: function (res) {
            dialog_loading.hide();
            if(res.ret){
                new myMessage({status : 'success' , content : '新增成功！' });
                dialog.hide();
                reLoadList(localStorage.getItem(_pageRenderId + '_pageHistory')); //刷新当前页
            }else{
                new myMessage({status : 'faile' , content : '新增失败，请稍后再试！'});
            }
        }
    });
}
function _addHtml(isUpdate){
    var div = $();
    var html = ''
    +'<div class="ui-dialog-addVisitor cf">'
        +'<div class="cf">'
            +'<label><i>*</i>姓名</label>'
            +'<input type="text" value="" class="ipt-name" placeholder="访客姓名" maxlength="8" />'
        +'</div>'
        +'<div class="cf">'
            +'<label><i>*</i>体温</label>'
            +'<input type="text" value="" class="ipt-wd" placeholder="体温温度" maxlength="4" />'
            +'<i>℃</i>'
        +'</div>'
        +'<div class="cf">'
            +'<label><i>*</i>联系方式</label>'
            +'<input type="text" value="" class="ipt-tel" placeholder="访客联系方式" maxlength="11" />'
        +'</div>'
        +'<div class="cf">'
            +'<label>出行方式</label>'
            +'<input type="text" value="" class="ipt-tripMode" placeholder="自驾、公交、出租车、高铁、飞机、其他" maxlength="30" />'
        +'</div>'
        +'<div class="cf">'
            +'<label>单位或住址</label>'
            +'<input type="text" value="" class="ipt-adres" placeholder="访客单位名称或地址" maxlength="30" />'
        +'</div>'
        +'<div class="cf">'
            +'<label>被访对象</label>'
            +'<input type="text" value="" class="ipt-vuser" placeholder="被访对象名字或部门" maxlength="20" />'
        +'</div>';
    if(isUpdate){
        html += ''
        +'<div class="cf">'
            +'<label><i>*</i>来访时间</label>'
            +'<input type="text" value="" class="ipt-fromtime" />'
        +'</div>'
        +'<div class="cf">'
            +'<label>离开时间</label>'
            +'<input type="text" value="" class="ipt-outtime" />'
        +'</div>';
    }
    html += ''
        +'<div class="cf">'
            +'<label><i>*</i>来访事由</label>'
            +'<input type="text" value="" class="ipt-fromdo" placeholder="来访事由" maxlength="30" />'
        +'</div>'
        +'<div class="cf">'
            +'<label>备注</label>'
            +'<input type="text" value="" class="ipt-bank" placeholder="备注" maxlength="50" />'
        +'</div>';
    if(isUpdate){
        html += ''
        +'<div class="cf">'
            +'<label>是否异常</label>'
            +'<a href="javascript:;" class="a-chb a-chb-hover" opar="1">否</a>'
            +'<a href="javascript:;" class="a-chb" opar="2">是</a>'
        +'</div>';
    }
    html+='</div>';

    
    return html;
}