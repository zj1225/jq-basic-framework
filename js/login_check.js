$ = $ || {};
var proname = 'umx';
$[proname] = $[proname] || {};

/**
 * 登录验证
 * new $.umx.login({   
        //设置背景图片
        picList : [],
        left : 100,
        top : 100,
        calback : function(){
            //验证成功
            console.log('login');
        }
    });
 * @param  {[type]} param   [description]
 * @param  {[type]} calback [description]
 * @return {[type]}         [description]
 */
$[proname]['login'] = function(param){
    var that = this;
    var picList     = [
        'images/125724g54zr04a30r0yt6t.jpg',
        'images/131914nl2xu8bbtdpbjz01.jpg',
        'images/20151015205841_P2eiy.jpeg',
        'images/20171202202802_5SVas.jpeg'
    ];
    //显示的postion
    var left        = 0;
    var top       = 0;
    var calback     = null;
    //参数
    if(param && typeof param === 'object'){
        left        = param.left ? param.left : left;
        top         = param.top ? param.top : top;
        picList     = param.picList && param.picList.length > 0 ? param.picList : picList;
        calback     = param.calback && typeof param.calback === 'function' ? param.calback : calback;
    }
    //zindex 找出最大的
    var zindex = 2;
    for(var i = 0; i<document.body.children.length ; i++){
        var item = document.body.children[i];
        if($(item).css('z-index') && !isNaN($(item).css('z-index')) ){
            //是数字
            zindex = zindex < parseFloat($(item).css('z-index')) ? parseFloat($(item).css('z-index')) + 1 : zindex + 1;
        }
    }
    //parseInt(Math.random()*(max-min+1)+min,10);  期望最小值-期望最大值
    //图片随机数1-piclength
    var random = parseInt(Math.random()*(picList.length-1+1)+1 , 10); 
    var random_pos_left = parseInt(Math.random()*(220-40+1)+40 , 10);
    var random_pos_top = parseInt(Math.random()*(100-0+1)+0 , 10);
    
    var box = $('<div>');
    box.css({
        'position' : 'fixed' ,
        'z-index' : zindex,
        'left' : left,
        'top' : top,
        'padding' : '10px 10px 0',
        'background' : '#fff',
        'overFlow' : 'hidden',
        'transition' : 'all .3s ease',
        'border' : 'solid #ccc 1px',
        'box-shadow' : '0 0 3px #ccc',
        'opacity' : 0
    });
    box.attr('class' , 'd-login-check-box');
    //260*150
    var imgBox = $('<div>');
        imgBox.css({
            'display' : 'block',
            'position' : 'relative',
            'background' : 'url("'+picList[random-1]+'") no-repeat',
            'background-size' : '260px 150px',
            'height' : '150px',
            'overflow' : 'hidden'
        });
    var img_o = $('<i>');
        img_o.css({
            'display' : 'block',
            'width': '35px',
            'height' : '35px',
            'box-shadow' : '0 0 5px #000 inset , 0 0 3px #ffff00',
            'position' : 'absolute',
            'z-index' : '1',
            'left' : random_pos_left, //>40  <220
            'top' : random_pos_top, // <100
            'background' : 'rgba(0,0,0,0.5)'
        });
        img_o.appendTo(imgBox);
    var img_t = $('<i>');
        img_t.css({
            'display' : 'block',
            'width': '35px',
            'height' : '35px',
            'box-shadow' : '1px 1px 5px #000 , 1px 1px 5px #ffff00 inset',
            'position' : 'absolute',
            'z-index' : '2',
            'left' : 5, 
            'top' : random_pos_top, 
            'background' : 'url("'+picList[random-1]+'") no-repeat',
            'background-size' : '260px 150px',
            'background-position-x' : random_pos_left*-1,
            'background-position-y' : random_pos_top*-1
        });
        img_t.attr('_leftStart' , 5);//起步原点
        img_t.appendTo(imgBox);
    var img_notice = $('<em>');
        img_notice.css({
            'position' : 'absolute',
            'left' : 0,
            'right' : 0,
            'bottom' : -20,
            'z-index' : 3,
            'background' : '#f75000',
            'color' : '#fff',
            'font-size' : '12px',
            'font-style' : 'normal',
            'line-height' : '20px',
            'height' : '20px',
            'text-align' : 'center',
            'opacity' : 0,
            'display' : 'none'
        });
        img_notice.html('拖动滑块将悬浮图像正确拼合');
        img_notice.appendTo(imgBox);
    var img_success = $('<i>');
        img_success.css({
            'position' : 'absolute',
            'z-index' : 4,
            'display' : 'none',
            'left' : -20,
            'top' : -10,
            'bottom' : -10,
            'opacity' : 0,
            'width' : '20px',
            'border-radius' : '100%',
            'background' : ' linear-gradient(to right,rgba(255,255,255,0) 0% , rgba(255,255,255,0.7) 100%)',
            'box-shadow' : ' 0 0 5px rgba(255,255,255,0.3)',
            'transition' : 'all 0.3s ease',
            'transform' : 'rotate(25deg)'
        }); 
        img_success.appendTo(imgBox);
    var pngBg = '/images/sprite.1.2.3.png';

    var scroll = $('<div>');
        scroll.css({
            'display' : 'block',
            'padding' : '12px 0',
            'position' : 'relative',
            'margin-top' : '10px' 
        });
    var scroll_jdt = $('<span>');
    // font-color =>#dfe1e2
        scroll_jdt.css({
            'display' : 'block',
            'position': 'relative',
            'z-index' : '1',
            'height' : '38px',
            'line-height' : '38px',
            'color' : '#88949d' ,  
            'width' : '260px',
            'font-size' : '12px',
            'text-align' : 'center',
            'background' : 'url("'+pngBg+'") no-repeat',
            'user-select' : 'none',
            'transition' : 'color .3s ease'
        }); 
        scroll_jdt.appendTo(scroll);
        scroll_jdt.html('拖动左边滑块完成上方拼图');
    var scroll_btn = $('<a>');
        scroll_btn.css({
            'display' : 'block',
            'position' : 'absolute',
            'left' : '-10px',
            'top' : '0px',
            'z-index' : '2',
            'width' : '65px',
            'height' : '60px',
            'background' : 'url("'+pngBg+'") no-repeat 0px -46px',
            'overFlow':'hidden',
            'cursor' : 'pointer'
        });
        scroll_btn.attr('_leftStart' , '-10'); //原点
        scroll_btn.appendTo(scroll);
    var other = $('<span>');
        other.css({
            'display' : 'block',
            'border-top' : 'solid #eee 1px',
            'padding' : '10px 0',
            'margin-top' : '10px',
            'text-align' : 'left'
        });
    var a_close = $('<a href="javascript:;">');
        a_close.css({
            'display':'inline-block',
            'width' : '20px' ,
            'height' : '20px',
            'background' : 'url("'+pngBg+'") no-repeat 0 -188px'
        });
        a_close.appendTo(other);

    var a_fresh = $('<a href="javascript:;">');
        a_fresh.css({
            'display':'inline-block',
            'width' : '20px' ,
            'height' : '20px',
            'background' : 'url("'+pngBg+'") no-repeat 0 -341px',
            'margin-left' : '10px'
        });
        a_fresh.appendTo(other);
    
    //鼠标位置
    var _getMousePos = function(e) {
        var e = e || window.e;
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var x = e.pageX || e.clientX + scrollX;
        var y = e.pageY || e.clientY + scrollY;
        return { 'x': x, 'y': y };
    }
    //绑定事件
    var bindEvent = function(){
        a_close.bind('mouseover' , function(){
            a_close.css('background-position' , '0 -214px');
        });
        a_close.bind('mouseout' , function(){
            a_close.css('background-position' , '0 -188px');
        });
        a_close.bind('click' , function(){
            box.css('transition' , '');
            box.animate({'opacity' : 0 , 'top' : $(window).height()} , 'fast' , function(){
                box.remove();
            });
        });
        a_fresh.bind('mouseover' , function(){
            a_fresh.css('background-position' , '0 -367px');
        });
        a_fresh.bind('mouseout' , function(){
            a_fresh.css('background-position' , '0 -341px');
        });
        a_fresh.bind('click' , function(){
            new that['__proto__']['constructor'](param);
            a_close.click();
        });
        //原点
        var leftStart = parseInt(scroll_btn.attr('_leftStart'));
        var leftStart_img = parseInt(img_t.attr('_leftStart'));

        //是否click
        var isClick = false; 
        //click时的位置
        var isClick_position = {};
        //计时
        var time_down = 0;
        scroll_btn.bind('mousedown' , function(e){
            var hand_position = _getMousePos(e);
            //计时
            time_down = e.timeStamp;
            //按下
            isClick = true;
            isClick_position.x = hand_position.x;
            scroll_btn.css('background-position' , '0 -118px');
        });
        $(window).bind('mouseup' , function(e){
            //未点击过scroll_btn
            if(!isClick) return;

            var hand_position = _getMousePos(e);
            isClick = false;
            //计算图片移动的left绝对值
            if( Math.abs(hand_position.x - isClick_position.x + leftStart_img - random_pos_left) <= 3 ){
                //计时
                var time_over = parseInt(e.timeStamp - time_down)/1000;
                    time_over = time_over.toFixed(2);

                //正确范围之内
                img_success.show();
                img_success.animate({'opacity' : 1 ,'left' : box.outerWidth() * 1.1} , 'fast' , function(){
                    img_o.animate({'opacity' : 0} , 'fast');
                    img_t.animate({'opacity' : 0} , 'fast');
                });
                //提示
                img_notice.css('background' , '#00aa00').html(time_over+'秒的速度完成验证').show();
                img_notice.animate({'opacity' : 1 , 'bottom' : 0} , 'fast' , function(){
                    setTimeout(function(){
                        img_notice.animate({'opacity' : 0 , 'bottom' : -20} , 'fast' , function(){ img_notice.hide();});
                    },500);
                    setTimeout(function(){
                        var box_left = parseFloat(box.css('left').split('px')[0]);
                        var box_top = parseFloat(box.css('top').split('px')[0]);
                        //完成
                        box.css({
                            'left' : box_left + (box.width() - 100 )/2,
                            'top' : box_top + (box.height() - 100) /2,
                            'width' : '100px' , 
                            'height' : '100px',
                            'text-align' : 'center'
                        }).html('<i style="display:inline-block; border:solid #00aa00 1px; border-radius:100%; width:40px; height:40px; margin-top:10px;"><i style="display:inline-block; width:25px; height:12px; border-left:solid #00aa00 1px; border-bottom:solid #00aa00 1px; position:relative; left:1px; top:5px; transform:rotate(-45deg);"></i></i><em style="display:block; text-align:center; font-size:12px; color:#00aa00; padding:10px 0;">验证成功</em>');
                    },1000);
                    setTimeout(function(){
                        box.animate({'opacity' : 0} , 'fast' , function(){
                            box.remove();
                            //回调
                            calback();
                        });
                    },2000);
                });
                return;
            }
            //否则，回归原点并提示
            scroll_btn.animate({left : leftStart} , 'fast' ,function(){
                scroll_btn.css('left' , leftStart);
                scroll_btn.css('background-position' , '0 -46px');
                scroll_jdt.css('color' , '#88949d');
            });
            img_t.animate({left : leftStart_img} , 'fast' ,function(){
                img_t.css('left' , leftStart_img);
            });
            img_notice.show();
            img_notice.animate({'opacity' : 1 , 'bottom' : 0} , 'fast' , function(){
                setTimeout(function(){
                    img_notice.animate({'opacity' : 0 , 'bottom' : -20} , 'fast' , function(){ img_notice.hide();});
                },500);
            });
            box.css('transform' , 'rotate(-5.5deg)');
            setTimeout(function(){
                box.css('transform' , 'rotate(5.5deg)');
            },100);
            setTimeout(function(){
                box.css('transform' , 'rotate(-5.5deg)');
            },200);
            setTimeout(function(){
                box.css('transform' , 'rotate(5.5deg)');
            },300);
            setTimeout(function(){
                box.css('transform' , 'rotate(-3.5deg)');
            },400);
            setTimeout(function(){
                box.css('transform' , 'rotate(0deg)');
            },500);
            

        });
        $(window).bind('mousemove' , function(e){
            var hand_position = _getMousePos(e);
            if(!isClick) return;
            //小于click时的位置 return
            if(hand_position.x < isClick_position.x) return;
            //scroll_btn计算left
            var btn_left = hand_position.x - isClick_position.x + leftStart;
            var img_left = hand_position.x - isClick_position.x + leftStart_img;

            //left大于总长 return
            if(btn_left > scroll_jdt.outerWidth() - scroll_btn.outerWidth() - parseInt(scroll_btn.attr('_leftStart')) ) return;

            //btn 移动
            scroll_btn.css('left' , btn_left);
            //字变色
            scroll_jdt.css('color' , '#dfe1e2');
            //img-t移动
            img_t.css('left' , img_left);
        });

    }
    box.append(imgBox);
    box.append(scroll);
    box.append(other);
    box.appendTo($(document.body));
    box.animate({ 'opacity': 1 }, {
        step: function (now, fx) { 
            $(this).css('transform', 'scale(' + now + ')');
        },
        duration: 'fast',
        complete: function () {
            bindEvent();
            box.css({
                'height' : box.height(),
                'width' : box.width()
            });
        }
    }, 'linear');
}