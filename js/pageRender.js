
/**
 * 分页渲染
 * @type {Object}
 *
 * jq使用方法：
 * var _pageRender = new pageRender();
 * _pageRender.init({
    containerID : 'pageRender_box',
    container_table_className : 'd_table cf',
    container_page_className : 'd_pages cf',
    table_column : [
        '学校ID' , '学校名称' , '所属区域' , '校长' , '账号' , '详细地址' , '联系人' , '联系电话' 
    ],
    data_column : [
        'schoolID' , 'schoolName' , 'quyu' , 'xiaozhang' , 'username' , 'address' , 'contactname' , 'contactphone' 
    ],
    data_column_onlyName : 'schoolID',
    ajax_url : 'text.html',
    ajax_type : 'POST',
    ajax_data : {
        page : 1,
        showCount : 10
    },
    isOperation : true,
    operationTitle : '操作',
    operationContent : '<a href="javascript:;">编辑</a>...',
    noListNotice : '暂无数据',
    pageMode : 'select', //select \ input
    resetDateFunc : function(data , resouceData){ return data;},
    calback : function(data){}
 * }).show();
 *
 * vue中使用方法 注意：vue需捆绑axios，则vue.$axios
 * var _pageRender = new pageRender(vue);
 * _pageRender.init({
 *     containerID : 'pageRender_box',
        container_table_className : 'd_table cf',
        container_page_className : 'd_pages cf',
        table_column : [
            '学校ID' , '学校名称' , '所属区域' , '校长' , '账号' , '详细地址' , '联系人' , '联系电话' 
        ],
        data_column : [
            'schoolID' , 'schoolName' , 'quyu' , 'xiaozhang' , 'username' , 'address' , 'contactname' , 'contactphone' 
        ],
        data_column_onlyName : 'schoolID',
        axios_url : '/api/performance/pageIndex/'+_pageIndex+'/pageNum/'+_pageNum +'?year='+year_now+'&month='+month_now+'&state='+state+'&projectId='+proData.id,
        isOperation : true,
        operationTitle : '操作',
        operationContent : '<a href="javascript:;">编辑</a>...',
        noListNotice : '暂无数据',
        pageMode : 'select', //select \ input
        resetDateFunc : function(data , resouceData){ return data;},
        calback : function(data){}
 * }).show();
 * #######resetDateFunc 预处理方法需return data ###########
 * 
 * init初始化。之后可再用pageRender.set方法更改参数或请求参数，例如之后改为条件搜索：
 * _pageRender.set({
 *      page : 1 ,
 *      ajax_data : {
 *          key : '',
 *          ...
 *      }
 * }).show(localStorage.getItem(_containerID +'_pageHistory'));
 * #####.show方法可以单独传page参数，默认显示第几页
 *
 * 
 * 后端return数据例如：
 * {
    page : 3 , 
    pagecount : 20 , 
    result : [
        {
            'schoolID' : 0 , 
            'schoolName' : '红星路小学' , 
            'quyu' : '鹤城区' , 
            'xiaozhang' : '小明' , 
            'username' : 'xiaoming' , 
            'address' : '鹤城区红星路33号' , 
            'contactname' : '小白' , 
            'contactphone' : '13555555555'
        },
        {
            'schoolID' : 1 , 
            'schoolName' : '红星路小学' , 
            'quyu' : '鹤城区' , 
            'xiaozhang' : '小明' , 
            'username' : 'xiaoming' , 
            'address' : '鹤城区红星路33号' , 
            'contactname' : '小白' , 
            'contactphone' : '13555555555'
        }
        ]
}
 */

;var pageRender = function(vue){
    var _pageRender = this;
    //ajax请求接收对象
    var _jQuery_ajax = null;
    //请求地址
    var _ajax_url = '';
    //请求方式
    var _ajax_type = 'POST';
    //请求参数
    var _ajax_data = null;


    //vue对象
    var _VUE = vue || null;
    //请求地址，仅支持vue axios get请求方式
    var _axios_url = '';


    //容器ID
    var _containerID = null;
    //装table容器的className
    var _container_table_className = '';
    //装页码的容器的className
    var _container_page_className = '';
    //table列名
    var _table_column = [];
    //渲染数据的字段名
    var _data_column = [];
    //唯一字段列名-比如一条数据的id字段名，可以根据id进行相关操作
    var _data_column_onlyName = '';
    //是否存在操作列
    var _isOperation = false;
    //操作列标题
    var _operationTitle = '';
    //操作列内容
    var _operationContent = '';
    //回调函数
    var _calback = null;
    //回调函数 data预处理方法
    var _resetDateFunc = null;
    //page按钮数量-单数
    var _pageBtnCount = 7;
    //无数据时提示语
    var _noListNotice = '暂无数据';
    //分页跳转模式  select默认：下拉选择分页  input:输入式
    var _pageMode = 'select';
    //用于鉴别window事件回车锁定对象
    var _pageModeRandom = ''; 

    var _responseData = null;

    var _showPage = function () {
        if(!document.getElementById(_containerID)){
            return false;
        }
        var container = document.getElementById(_containerID);
        var container_page = container.getElementsByClassName(_container_page_className.split(' ')[0])[0];

        if(!container_page){
            container_page = document.createElement('div');
            container_page.className = _container_page_className;
            container.appendChild(container_page);
        }
        container_page.innerHTML = '';
        //没有数据
        if (!_responseData || !_responseData.list || _responseData.list.length < 1) return true;

        _responseData.currentPage = parseInt(_responseData.currentPage);
        _responseData.totalPage = parseInt(_responseData.totalPage);
        var p = document.createElement('p');
        p.setAttribute('class', 'cf')
        var a_1 = document.createElement('a');
        a_1.href = 'javascript:;';
        a_1.innerHTML = '&lt;&lt;';
        a_1.setAttribute('page', 1)
        var a_2 = document.createElement('a');
        a_2.href = 'javascript:;';
        a_2.innerHTML = '&lt;';
        a_2.setAttribute('page', _responseData.currentPage - 1 < 1 ? 1 : _responseData.currentPage - 1);
        var a_3 = document.createElement('a');
        a_3.href = 'javascript:;';
        a_3.innerHTML = '&gt;';
        a_3.setAttribute('page', _responseData.currentPage + 1 > _responseData.totalPage ? _responseData.totalPage : _responseData.currentPage + 1);
        var a_4 = document.createElement('a');
        a_4.href = 'javascript:;';
        a_4.innerHTML = '&gt;&gt;';
        a_4.setAttribute('page', _responseData.totalPage)

        p.appendChild(a_1);
        p.appendChild(a_2);
        var page_cut = (_pageBtnCount - 1) / 2;
        var page_first = _responseData.currentPage - page_cut < 1 ? 1 : _responseData.currentPage - page_cut;
        var page_last = _responseData.currentPage + page_cut > _responseData.totalPage ? _responseData.totalPage : _responseData.currentPage + page_cut;
        if (_pageBtnCount - (page_last + 1 - page_first) >= 1 && _responseData.totalPage >= _pageBtnCount) {
            var addPage = _pageBtnCount - (page_last + 1 - page_first);
            if (_responseData.currentPage - page_cut < 1) {
                page_last += addPage;
            }
            if (_responseData.currentPage + page_cut > _responseData.totalPage) {
                page_first -= addPage;
            }
        }
        for (var i = page_first ; i <= page_last ; i++) {
            var a = document.createElement('a');
            a.href = 'javascript:;';
            a.innerHTML = i;
            a.setAttribute('page', i);
            a.setAttribute('ispage', 'ispage');
            if (_responseData.currentPage == i) {
                a.className = 'hover';
            }
            p.appendChild(a);
        }
        p.appendChild(a_3);
        p.appendChild(a_4);

        var span = document.createElement('span');
        span.innerHTML = '<em>共'+_responseData.totalPage+'页</em>';
        container_page.appendChild(span);
        container_page.appendChild(p);

        //分页跳转模式
        if(_pageMode == 'select'){
            var span = document.createElement('span');
            span.innerHTML = '<em>跳转到：</em>';
            var sele = document.createElement('select');
            for(var i = 1;i <= _responseData.totalPage; i++){
                var opt = document.createElement('option');
                opt.setAttribute('value' , i);
                opt.innerHTML = '第'+i+'页';
                sele.appendChild(opt);
            }
            span.append(sele);
            sele.value =_responseData.currentPage;

            
            container_page.appendChild(span);
            //优化sele
            new checkSelectStyleChange($(sele));
        }else if(_pageMode == 'input'){
            var span = document.createElement('span');
            span.innerHTML = '<em>前往</em>';
            var ipt = document.createElement('input');
            ipt.value = _responseData.currentPage;
            ipt.setAttribute('maxLength' , '3');
            ipt.setAttribute('title' , '翻页快捷键：←、→、↑、↓；或输入页码按回车');
            var em = document.createElement('em');
            em.innerHTML = '页';
            span.appendChild(ipt);
            span.appendChild(em);
            container_page.appendChild(span);
        }
        
        return true;
    };
    var _showTable = function () {
        if(!document.getElementById(_containerID)){
            return false;
        }
        var container = document.getElementById(_containerID);
        var container_table = container.getElementsByClassName(_container_table_className.split(' ')[0])[0];
        var table = document.createElement('table');

        if(!container_table){
            container_table = document.createElement('div');
            container_table.className = _container_table_className;
            container.appendChild(container_table);
        }
        //清理
        container_table.innerHTML = '';


        //table——head
        var tr_head = document.createElement('tr');
        for (var i = 0; i < _table_column.length; i++) {
            var th = document.createElement('th');
            th.innerHTML = _table_column[i];
            tr_head.appendChild(th);
        }
        //是否存在操作栏
        if (_isOperation) {
            var th = document.createElement('th');
            th.innerHTML = _operationTitle;
            tr_head.appendChild(th);
        }
        table.appendChild(tr_head);

        //table-body
        var oparId = 0;
        if (_responseData.list && _responseData.list.length > 0) {
            $.each(_responseData.list , function(index,item){
                var tr = document.createElement('tr');
                tr.setAttribute('data', JSON.stringify(item));
                $.each(_data_column,function(index2,item2){
                    for (var str in item) {
                        if (item2 == str) {
                            var td = document.createElement('td');
                            td.innerHTML = item[str] ? item[str] : '-';
                            tr.appendChild(td);
                        }
                    }
                });
                //是否存在操作栏
                if (_isOperation) {
                    var td_last = document.createElement('td');
                    td_last.innerHTML = _operationContent;
                    tr.appendChild(td_last);
                }
                table.appendChild(tr);
            });
        } else {
            var tr_body = document.createElement('tr');
            var colspan = _isOperation ? _table_column.length + 1 : _table_column.length;
            var td = document.createElement('td');
            td.innerHTML = _noListNotice;
            td.style.textAlign = 'center';
            td.style.color = '#ccc';
            if (colspan != 0) {
                td.colSpan = colspan;
            }
            tr_body.appendChild(td);
            table.appendChild(tr_body);
        }
        container_table.appendChild(table);
        //检查table尺寸
        _checkTable();
        return true;
    };
    var _checkTable = function(){
        if(!document.getElementById(_containerID)){
            return false;
        }
        var container = document.getElementById(_containerID);
        var container_table = $($(container).find('.'+_container_table_className.split(' ')[0]).get(0));
        //=0则说明在隐藏的元素里面进行了加载 高度拿不到
        // if(container_table.height() == 0){
        //     container_table.css('height' , '');
        //     setTimeout(function(){_checkTable();},200);
        //     return;
        // }
        // container_table.attr('_height_old' , container_table.height());
        // container_table.css('height' , '');
        // container_table.attr('_height_new' , container_table.height());
        // container_table.css('height' , container_table.attr('_height_old'));

        // container_table.animate({'height' : container_table.attr('_height_new')} , 'fast' ,function(){
        //     if(container_table.height() == 0){
        //         container_table.css('height' , '');
        //         setTimeout(function(){_checkTable();},200);
        //         return;
        //     }
        // });
    }
    var _changePageHover = function(page){
        var all_a = $('#'+_containerID).find('a');
        var all_ispage = $('#'+_containerID).find('a[ispage=ispage]');
        var all_page_now = $('#'+_containerID).find('a[page="'+page+'"]');
        var page_now = all_ispage.filter('[page="'+page+'"]');

        all_a.removeClass('hover').removeClass('disable');
        //所有等于这个页数的 disable
        all_page_now.addClass('disable');
        page_now.addClass('hover');
        
        page_now.closest('.d-pages').find('select').val(page_now.attr('page'));
        
    };
    var _loading = function () {
        if(!document.getElementById(_containerID)){
            return false;
        }
        var container = document.getElementById(_containerID);
        var loading = $('<p class="p_loading" style="display:none;">');
            loading.html('<span><i class="fa fa-spinner fa-pulse"></i><em>正在努力加载中...</em></span>');
        $(container).append(loading);
        loading.css({'opacity' : 0});
        loading.show();
        loading.animate({'opacity' : 1} , 'fast');
    };
    //分页请求过滤
    var _onTableBoxClick = function (e) {
        var target = myfunc.target(e);
        if (target.tagName != 'A' || !target.getAttribute('page')) return;
        if ($(target).hasClass('disable')) return;

        var page = target.getAttribute('page');
        _pageRender.show(page);
    };
    var _onSelectPageChange = function(){
        _pageRender.show(this.value);
    };
    var _onInputPageFocus = function(){
        $(this).select();
        //锁定对象
        _pageModeRandom = Math.random();
        $(this).attr('isfocus' , _pageModeRandom);
    };
    var _onInputPagePChange = function(){
        this.value = this.value.replace(/\D/gi,"");
        this.value = this.value == '' ? 1 : this.value;
        this.value = this.value > _responseData.totalPage ? _responseData.totalPage : this.value;
    };
    var _onInputPageChange = function(e){
        if(e.target.tagName != 'INPUT')return;
        if(e.target.getAttribute('isfocus') != _pageModeRandom) return;
        //inputpage分页 回车跳转
        if(e.keyCode == 13){
            _pageRender.show(e.target.value);
            return;
        }
        //← 键  上一页
        if(e.keyCode == 37){
            var p = parseInt(e.target.value);
            p = p - 1 < 1 ? 1 : p-1;
            e.target.value = p;
            _pageRender.show(p);
            return;
        }
        //→ 键  下一页
        if(e.keyCode == 39){
            var p = parseInt(e.target.value);
            p = p + 1 > _responseData.totalPage ? _responseData.totalPage : p+1;
            e.target.value = p;
            _pageRender.show(p);
            return;
        }
        //↑ 键  第一页
        if(e.keyCode == 38){
            e.target.value = 1;
            _pageRender.show(1);
            return;
        }
        //↓ 键  最后一页
        if(e.keyCode == 40){
            e.target.value = _responseData.totalPage;
            _pageRender.show(e.target.value);
            return;
        }
        

    };
    //绑定事件
    var _bindEvent = function () {
        if(!document.getElementById(_containerID)){
            return false;
        }
        var container = document.getElementById(_containerID);
        var pageDom = $(container).find('.'+_container_page_className.split(' ')[0]);
        pageDom.unbind('click', _onTableBoxClick);
        pageDom.bind('click', _onTableBoxClick);

        //分页跳转模式
        if(_pageMode == 'select'){
            var select = pageDom.find('select');
            select.unbind('change', _onSelectPageChange);
            select.bind('change', _onSelectPageChange);
        }else if(_pageMode == 'input'){
            var ipt = pageDom.find('input');
            ipt.unbind('input propertychange', _onInputPagePChange);
            ipt.bind('input propertychange', _onInputPagePChange);
            ipt.unbind('focus', _onInputPageFocus);
            ipt.bind('focus', _onInputPageFocus);
            $(window).unbind('keydown' , _onInputPageChange);
            $(window).bind('keydown' , _onInputPageChange);
        }
        
        
    };
    //结果处理
    var _endByRes = function(res , page){
        //预处理 返回的是 res.data.data; 预处理两个参数；第二个后加的方便处理响应根节点的数据，包括消息提示_noListNotice
        _responseData = typeof (_resetDateFunc) == 'function' ? _resetDateFunc(res.data , res) : res.data;


        if(!document.getElementById(_containerID)){
            return false;
        }
        var container = document.getElementById(_containerID);
        $(container).find('.p_loading').animate({'opacity' : 0} , 'fast' , function(){
            $(container).find('.p_loading').remove();
        });
        //请求失败
        if(!res || !res.ret){
            return;  
        } 
        //如果页码大于1 且集合小于1
        if(res.data.list.length < 1 && page > 1){
            page--;
            _pageRender.show(page);
            return;
        }
        
        //渲染 初始化 若无dom节点则过；
        if(_showTable() && _showPage()){ 
             _bindEvent();
             //更改page hover状态
            _changePageHover(page);
            
            if (typeof (_calback) == 'function') {
                _calback(res.data);
            }
        }
    };

    _pageRender.resetSize = function(){
        _checkTable();
    };
    //请求数据，开始渲染
    _pageRender.show = function (page) {

        _loading();
        page = page || 1;
        //new的时候调用show可以传这个缓存值,用于判断翻页的缓存页码以及当前location
        localStorage.setItem(_containerID +'_pageHistory' , page);
        //解析URL、
        var url_before = _ajax_url.split('pageIndex/')[0];
        var url_after = _ajax_url.split('pageIndex/')[1].split('pageNum')[1];
        var url = url_before + 'pageIndex/' + page + '/pageNum' + url_after;

        // if(_VUE && _VUE.$axios){
        //     _VUE.$axios.get(url)
        //     .then( res => {
        //         _endByRes(res ,page);
        //     });

        // }else {
            
            if (_jQuery_ajax != null) {
                _jQuery_ajax.abort();
            }
            if(document.documentMode <= 9){
                //ie9以及以下
                new myMessage({status : 'faile' , content : '抱歉，您的浏览器版本过低，请升级您的浏览器！', width :1000});
                return;
                    //需要在后端统一修改请求 "successCalbalck("+json.toString()+"}";吐这样的字符串出来
                    $.ajax({
                        url: url,
                        type: _ajax_type,
                        data: _ajax_data,
                        dataType : 'jsonp',
                        jsonp:'callback', 
                        jsonpCallback:"successCallback",  
                        success: function (res) {
                            _endByRes(res ,page);
                        },
                        error : function(res){
                            console.log('error', res);
                        }
                    });
                
            }else{
                _jQuery_ajax = $.ajax({
                    url: url,
                    type: _ajax_type,
                    data: _ajax_data,
                    success: function (res) {
                        _endByRes(res ,page);
                    }
                });
            }
            
        // }
        
    };
    //条件设置
    _pageRender.set = function (option) {
        if (option.containerID)                 _containerID                = option.containerID;
        if (option.container_table_className)   _container_table_className  = option.container_table_className;
        if (option.container_page_className)    _container_page_className   = option.container_page_className;

        if (option.ajax_url)                    _ajax_url                   = option.ajax_url;
        if (option.ajax_type)                   _ajax_type                  = option.ajax_type;
        if (option.ajax_data)                   _ajax_data                  = option.ajax_data;

        if (option.axios_url)                    _axios_url                 = option.axios_url;

        if (option.table_column)                _table_column               = option.table_column;
        if (option.data_column)                 _data_column                = option.data_column;
        if (option.data_column_onlyName)        _data_column_onlyName       = option.data_column_onlyName;
        if (option.isOperation)                 _isOperation                = option.isOperation;
        if (option.operationTitle)              _operationTitle             = option.operationTitle;
        if (option.operationContent)            _operationContent           = option.operationContent;
        if (option.calback)                     _calback                    = option.calback;
        if (option.resetDateFunc)               _resetDateFunc              = option.resetDateFunc;
        if (option.noListNotice)                _noListNotice               = option.noListNotice;
        if (option.pageMode)                    _pageMode                   = option.pageMode;
        return _pageRender;
    };

    _pageRender.init = function(option){
        _containerID                = option.containerID ? option.containerID : null;
        _container_table_className  = option.container_table_className ? option.container_table_className : '';
        _container_page_className   = option.container_page_className ? option.container_page_className : '';

        _ajax_url                   = option.ajax_url ? option.ajax_url : '';
        _ajax_type                  = option.ajax_type ? option.ajax_type : 'POST';
        _ajax_data                  = option.ajax_data ? option.ajax_data : null;

        _axios_url                  = option.axios_url ? option.axios_url : '';

        _table_column               = option.table_column ? option.table_column : [];
        _data_column                = option.data_column ? option.data_column : [];
        _data_column_onlyName       = option.data_column_onlyName ? option.data_column_onlyName : '';
        _isOperation                = option.isOperation ? option.isOperation : false;
        _operationTitle             = option.operationTitle ? option.operationTitle : '';
        _operationContent           = option.operationContent ? option.operationContent : '';
        _calback                    = option.calback ? option.calback : '';
        _resetDateFunc              = option.resetDateFunc ? option.resetDateFunc : '';
        _noListNotice               = option.noListNotice ? option.noListNotice : '暂无数据';
        _pageMode                   = option.pageMode ? option.pageMode : 'select';
        return _pageRender;
    };
};