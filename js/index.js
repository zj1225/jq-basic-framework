var _isAjaxGo = true; //防止重复请求
var _CHARTSHOWDATECOUNT = 7; //显示7条日期  当前周
(function(){
    //优化
    setTimeout(_indexResetWidth , 200);
    onWindowResize.add(_indexResetWidth);

})();

function _indexResetWidth(){
    if(!$('.d-left-k').get(0)){
        onWindowResize.remove(_indexResetWidth);
        return;
    }
    $('.d-left-k').css('width' , ($('#d-approut').width()-15) /2);

    setTimeout(_loadChart,200);
}

//加载统计图
function _loadChart(){
    if(typeof Highcharts == 'undefined' || !Highcharts || !Highcharts.chart){
        setTimeout(function(){
            _loadChart();
        },100);
        return;
    }
    if(document.documentMode <= 8){
        new myMessage({status : 'faile' , content : '抱歉，您的浏览器不支持图表展示，为了更好使用体验，请升级您的浏览器！', width :1000});
        $('#ChartContainer1 p').html('抱歉，您的浏览器不支持图表展示，请升级浏览器！');
        $('#ChartContainer2 p').html('抱歉，您的浏览器不支持图表展示，请升级浏览器！');
        return;
    }
    if(!_isAjaxGo)return;
    _isAjaxGo = false;

    //加载数据
    var _date = new Date();
    var _dateNow = _date.getFullYear()+'-'+(_date.getMonth()+1)+'-'+_date.getDate();
    var _dateWeek = myfunc.getWeekDatesByDate(_dateNow); //获取当前一周的日期
    
    var ajaxData = {
        startDate : _dateWeek[0],
        endDate : _dateWeek[_dateWeek.length-1],
        businessId : LOGINUSER.businessId
    }
    $.ajax({
        url: AJAXPORT + '/statistics?' + myfunc.getUrlParamByData(ajaxData),
        type: 'GET',
        success: function (res) {
            _isAjaxGo = true; //可以继续请求
            dialog_loading.hide();
            if(res.ret){
                initCharts(res.data ,(_date.getMonth()+1)+'-'+_date.getDate());
            }else{
                new myMessage({status : 'faile' , content : '统计数据获取失败，请稍刷新再试！'});
            }
        }
    });
    
}
//展示统计数据
function initCharts(data , dateNow){
    var categories = [];
    var series_data1 = [];
    var series_data2 = [];
    var series_data3 = [];


    var categories_2 = [];
    var series_data1_2 = [];
    var series_data2_2 = [];
    var series_data3_2 = [];
    
    var isMax = false; //是否大于今天；大于今天 数据全部0
    $.each(data , function(index,json){
        json.businessPersonCount = json.businessPersonCount < 0 ? 0 : Math.ceil(json.businessPersonCount);
        json.businessCheckCount = json.businessCheckCount < 0 ? 0 : Math.ceil(json.businessCheckCount);
        json.businessUnCheckCount = json.businessUnCheckCount < 0 ? 0 : Math.ceil(json.businessUnCheckCount);

        json.checkSum = json.checkSum < 0 ? 0 : Math.ceil(json.checkSum);
        json.checkNormalSum = json.checkNormalSum < 0 ? 0 : Math.ceil(json.checkNormalSum);
        json.checkAbNormalSum = json.checkAbNormalSum < 0 ? 0 : Math.ceil(json.checkAbNormalSum);

        //是否大于今天；大于今天 数据全部0
        if(isMax){
            categories[categories.length] = json.date;
            series_data1[series_data1.length] = 0;
            series_data2[series_data2.length] = 0;
            series_data3[series_data3.length] = 0;

            series_data1_2[series_data1_2.length] = 0;
            series_data2_2[series_data2_2.length] = 0;
            series_data3_2[series_data3_2.length] = 0;
            return;
        }

        categories[categories.length] = json.date;
        series_data1[series_data1.length] = json.businessPersonCount;
        series_data2[series_data2.length] = json.businessCheckCount;
        series_data3[series_data3.length] = json.businessUnCheckCount;

        series_data1_2[series_data1_2.length] = json.checkSum;
        series_data2_2[series_data2_2.length] = json.checkNormalSum;
        series_data3_2[series_data3_2.length] = json.checkAbNormalSum;

        //3-18 = 3-18
        if(json.date.replace(/日/g,'').replace(/月/g,'-') == dateNow) {
            isMax = true; //超过今天
            //最后一条；今日数字
            $('<div style="left:0;"></div>').animate({left :json.businessPersonCount} , {
                step : function(now ,fx){
                    $('.d-main strong[opar="businessPersonCount"]').html(parseInt(now));
                },
                duration : 1000
            } , 'linear');
            $('<div style="left:0;"></div>').animate({left :json.businessCheckCount} , {
                step : function(now ,fx){
                    $('.d-main strong[opar="businessCheckCount"]').html(parseInt(now));
                },
                duration : 1000
            } , 'linear');
            $('<div style="left:0;"></div>').animate({left :json.businessUnCheckCount} , {
                step : function(now ,fx){
                    $('.d-main strong[opar="businessUnCheckCount"]').html(parseInt(now));
                },
                duration : 1000
            } , 'linear');

            $('<div style="left:0;"></div>').animate({left :json.checkSum} , {
                step : function(now ,fx){
                    $('.d-main strong[opar="checkSum"]').html(parseInt(now));
                },
                duration : 1000
            } , 'linear');
            $('<div style="left:0;"></div>').animate({left :json.checkNormalSum} , {
                step : function(now ,fx){
                    $('.d-main strong[opar="checkNormalSum"]').html(parseInt(now));
                },
                duration : 1000
            } , 'linear');
            $('<div style="left:0;"></div>').animate({left :json.checkAbNormalSum} , {
                step : function(now ,fx){
                    $('.d-main strong[opar="checkAbNormalSum"]').html(parseInt(now));
                },
                duration : 1000
            } , 'linear');
        }
        
    });
    new Highcharts.chart({
        chart: { renderTo : 'ChartContainer1' , type: 'column' },
        title: { text: '' },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: {text: '' },
            labels: {
                formatter: function() {
                    return this.value+'人';
                }
            },
            allowDecimals:false
        },
        series: [{
            name: '公司总人数',
            data: series_data1,
            color : '#108ad5'
        }, {
            name: '已检测人数',
            data:series_data2,
            color : '#3ae9a6'
        }, {
            name: '未检测人数',
            data: series_data3,
            color : '#f58c1b'
        }]
    });

    new Highcharts.Chart({
        //column/area/line/spline/areaspline
        chart : { renderTo : "ChartContainer2" , type : "area" },
        title : { text : '' },
        xAxis : {
            categories : categories
        },
        yAxis : {
            title : {text:""},
            labels: {
                formatter: function() {
                    return this.value+'次';
                }
            },
            allowDecimals:false
        },
        series : [
            {name:"检测总次数",data:series_data1_2 , color : '#2196ef' , stack : null , yaxis : null},
            {name:"检测正常次数",data:series_data2_2, color : '#17d695' , stack : null , yaxis : null},
            {name:"检测异常次数",data:series_data3_2 , color : '#fb672c' , stack : null , yaxis : null}
        ]
    });
}