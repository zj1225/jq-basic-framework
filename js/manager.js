var _page = 1;
var _pageNum = 12;
var _ajaxData = {
    //默认参数
    // normal : '0', //排序方式：0时间倒序，1正常优先，2异常优先
    businessId : LOGINUSER.businessId //公司id
};

var _recordpageRender = new pageRender();
var _pageRenderId = 'managerListRender';
_recordpageRender.init({
    containerID : _pageRenderId,
    container_table_className : 'd-table cf',
    container_page_className : 'd-pages cf',
    table_column : ['所有中心' , '所有部门' , '姓名' , '联系方式' , '权限设置'],
    data_column : ['_parentDeptName' , '_empDept' , '_empName' , '_empPhone' , '_isAdmin'],
    data_column_onlyName : 'id',
    ajax_type : 'GET',
    ajax_data : {},
    isOperation : false,
    noListNotice : '抱歉，暂无数据',
    pageMode : 'input'
});

(function(){
    //加载分页数据
    getListBy(myfunc.getUrlParamByData(_ajaxData));

    //event bind
    $('#'+_pageRenderId).bind('click' , onItemClick);
})();




//event bind
function onItemClick(e){
    var target = myfunc.target(e);
    if(target.tagName !='A') return;
    if(!$(target).closest('tr').get(0))return;
    //标记
    $('#'+_pageRenderId+' a[click="click"]').removeAttr('click');
    $(target).attr('click' , 'click');

    var data = JSON.parse($(target).closest('tr').attr('data'));

    switch($(target).attr('opar')){
        case 'set':
        //设置管理员
        _setManager(data);
        break;
        case 'dele':
        //删除管理员
        _deleManager(data);
        break;
    }
}

//重新加载数据 根据条件
function reLoadList(page){
    //page参数从click来的话可能是event
    _page = (page && !page.type) ? page : 1;

    _ajaxData.parentDeptId = $('#'+_pageRenderId+' .sele-zx').val(); 
    _ajaxData.deptId = $('#'+_pageRenderId+' .sele-bm').val();
    getListBy(myfunc.getUrlParamByData(_ajaxData));
}

//根据参数获取数据
function getListBy(param){
    var ajaxUrl = AJAXPORT + '/employee/pageIndex/'+_page+'/pageNum/'+_pageNum;
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


            $(ths[0]).css('width' , 300);
            $(ths[1]).css('width' , 200);
            $(ths[2]).css('width' , 200);

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


            //优化
            _recordpageRender.resetSize();
        }
    }).show(_page);

}
//预处理
function _retunItemByData(data){
    data._parentDeptName = data.parentDeptName ? data.parentDeptName : '-';
    data._empDept = data.empDept ? data.empDept : '-';
    data._empName = data.empName ? data.empName : '-';
    data._empPhone = data.empPhone ? data.empPhone : '-';
    data._isAdmin = data.isAdmin == 1 ? '<a href="javascript:;" class="a-manager-dele" opar="dele">删除管理员</a>' : '<a href="javascript:;" class="a-manager-set" opar="set">设定管理员</a>';
    
    return data;
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
//取消管理员
function _deleManager(data){
    dialog.set({
        content : '<p style="padding:30px 0 0; display:block; text-align:center; font-size:16px; color:#333;">是否取消设置['+data.empName+']为管理员？</p>',
        btns : [
            {label : '取消' , calback : function(){dialog.hide();}},
            {label : '确定' , calback : function(){_setManagerSubmit(data,2);}}
        ]
    }).show();
}
//设置管理员
function _setManager(data){
    dialog.set({
        content : '<p style="padding:30px 0 0; display:block; text-align:center; font-size:16px; color:#333;">是否确定设置['+data.empName+']为管理员？</p>',
        btns : [
            {label : '取消' , calback : function(){dialog.hide();}},
            {label : '确定' , calback : function(){_setManagerSubmit(data,1);}}
        ]
    }).show();
}
//设置管理员确认
function _setManagerSubmit(data,isAdmin){
    dialog.hide();
    dialog_loading.set({content:'设置中...'}).show();
    
    var param = {
        editUser : LOGINUSER.id,
        isAdmin : isAdmin
    }
    $.ajax({
        url: AJAXPORT + '/employee/setAdmin/id/'+data.id+'?'+myfunc.getUrlParamByData(param),
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

