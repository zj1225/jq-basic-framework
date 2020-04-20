var _page = 1;
var _pageNum = 8;
var _ajaxData = {
    //默认参数
    // normal : '0', //排序方式：0时间倒序，1正常优先，2异常优先
    businessId : LOGINUSER.businessId //公司id
};

var _recordpageRender = new pageRender();
var _pageRenderId = 'recordLeaveListRender';
_recordpageRender.init({
    containerID : _pageRenderId,
    container_table_className : 'd-table cf',
    container_page_className : 'd-pages cf',
    table_column : ['所有中心' , '所有部门' , '姓名' , '联系方式' , '外出时间' , '返回时间' , '体温℃' , '外出事由' , '是否异常' , '备注' ],
    data_column : ['_parentDeptName' , '_empDept' , '_name' , '_phone' , '_leaveTime' , '_backTime' ,'_temperature' , '_endReason' , '_isNormal' , '_remark'],
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

    //加载分页数据-默认加载一次
    _ajaxData.startDate = $('.d-searchBy .ipt-datetime1').val();
    _ajaxData.endDate = $('.d-searchBy .ipt-datetime1').val();
    getListBy(myfunc.getUrlParamByData(_ajaxData));

    
    //搜索条件回车模拟点击
    $('.d-searchBy').bind('keydown' , _onkeyDownBySearch);
    //搜索 //导出
    $('.d-searchBy .a-search').bind('click' , reLoadList);
    $('.d-searchBy .a-out').bind('click', outList);

    
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
    var openUrl = AJAXPORT + '/record/exportEmpLeaveRecord?'+ myfunc.getUrlParamByData(_ajaxData);
    console.log(openUrl);
    window.open(openUrl);
}

//加载select部门数据
function _loadSelectDeptOptions(){
    if(!DEPTDATA){
        setTimeout(_loadSelectDeptOptions,50);
        return;
    }
    var sele = $('#'+_pageRenderId+' .sele-bm');
        sele.html('<option value="">所有部门</option>');
    $.each(DEPTDATA , function(index,item){
        var opt = $('<option>');
            opt.val(item.id);
            opt.html(item.deptName);
            opt.appendTo(sele);
    });
    sele.val(_ajaxData.deptId);
    new checkSelectStyleChange($('#'+_pageRenderId+' .sele-bm'));
}


//重新加载数据 根据条件
function reLoadList(page){
    //page参数从click来的话可能是event
    _page = (page && !page.type) ? page : 1;
    _ajaxData.name = $('.d-searchBy .ipt-name').val();
    _ajaxData.phone = $('.d-searchBy .ipt-phone').val(); 
    //这2个日期导出用到
    _ajaxData.startDate = $('.d-searchBy .ipt-datetime1').val();
    _ajaxData.endDate = $('.d-searchBy .ipt-datetime1').val();

    _ajaxData.parentDeptId = $('#'+_pageRenderId+' .sele-zx').val(); 
    _ajaxData.deptId = $('#'+_pageRenderId+' .sele-bm').val();

    _ajaxData.isNormal = $('#'+_pageRenderId+' .sele-yc').val(); //跟访客有区别字段名字
    
    getListBy(myfunc.getUrlParamByData(_ajaxData));
}

//根据参数获取数据
function getListBy(param){
    var ajaxUrl = AJAXPORT + '/record/queryLeaveList/pageIndex/'+_page+'/pageNum/'+_pageNum;
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
            
            $(ths[0]).html('<select class="sele-zx cf"><option value="">所有中心</option></select>');
            $(ths[1]).html('<select class="sele-bm cf"><option value="">所有部门</option></select>');
            $(ths[8]).html('<select class="sele-yc cf"><option value="">是否异常</option><option value="0">未检测</option><option value="1">正常</option><option value="2">异常</option></select>');

            $(ths[0]).css('width' , 200);
            $(ths[1]).css('width' , 200);
            $(ths[2]).css('width' , 100);
            $(ths[3]).css('width' , 200);
            $(ths[4]).css('width' , 100);
            $(ths[5]).css('width' , 100);
            $(ths[6]).css('width' , 100);
            $(ths[8]).css('width' , 100);
            $(ths[9]).css('width' , 200);

            //部门二联动
            var sele1 = $('#'+_pageRenderId+' .sele-zx');
            var sele2 = $('#'+_pageRenderId+' .sele-bm');
            new checkSelectStyleChange(sele1);
            new checkSelectStyleChange(sele2);

            new loadDepts({parentId : 0} , function(data){
                $.each(data , function(index,item){
                    var opt = $('<option>');
                        opt.val(item.id);
                        opt.html(item.deptName);
                        opt.appendTo(sele1);
                });
                sele1.val(_ajaxData.parentDeptId ? _ajaxData.parentDeptId : '');
                new checkSelectStyleChange(sele1);
            });
            if(_ajaxData.parentDeptId){
                new loadDepts({parentId : _ajaxData.parentDeptId} , function(data){
                    $.each(data , function(index,item){
                        var opt = $('<option>');
                            opt.val(item.id);
                            opt.html(item.deptName);
                            opt.appendTo(sele2);
                    });
                    sele2.val(_ajaxData.deptId ? _ajaxData.deptId : '');
                    new checkSelectStyleChange(sele2);
                });
            }
            sele1.bind('change' , function(){
                sele2.val('');
                new checkSelectStyleChange(sele2);
                reLoadList();
            });
            sele2.bind('change' , reLoadList);

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
    data._parentDeptName = data.parentDeptName ? data.parentDeptName : '-';
    data._empDept = data.dept ? data.dept : '-';
    data._name = data.name ? data.name : '-';
    data._temperature = data.temperature ? data.temperature : '-';
    data._phone = data.phone ? data.phone : '-';
    data._leaveTime = data.leaveTime ? data.leaveTime.split('.')[0].replace(' ','<br />') : '-';
    data._backTime = data.startTime ? data.startTime.split('.')[0].replace(' ','<br />') : '-';
    data._endReason = data.endReason ? data.endReason : '-';
    data._isNormal = data.isNormal == 1 ? '正常' : data.isNormal == 2 ? '<em style="color: #fb672c;">异常</em>' : data.isNormal == 0 ? '<em style="color: #ccc;">未检测</em>' : '-';
    data._remark = data.remark ? data.remark : '-';
    return data;
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
    var _nokeydown = function(e){
        this.value = this.value;
        return false;
    }
    var _resetNumb = function(numb){
        numb = numb < 10 ? ('0'+ numb) : numb;
        return numb;
    }
    var date = new Date();
    var dateNow = date.getFullYear()+'-'+ _resetNumb(date.getMonth()+1)+'-'+ _resetNumb(date.getDate());

    datetimeOptions1.onSelectDate = _getMinDate;
    ipt_datetime1.datetimepicker(datetimeOptions1);
    ipt_datetime1.val(dateNow);
    ipt_datetime1.bind('keydown' , _nokeydown);

}