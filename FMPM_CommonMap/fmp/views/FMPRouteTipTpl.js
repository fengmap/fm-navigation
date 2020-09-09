/**
 * [路径显示界面]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('routeTipTpl', function () {

    var isPause = false;
    var distance = '';

    //显示信息窗口
    function showPanel(startTxt, endTxt, distanceObj) {
        distance = distanceObj;
        if (startTxt != '') {
            $('.route-result-start-span').text(startTxt);
        }
        if (endTxt != '') {
            $('.route-result-end-span').text(endTxt)
        }
        if (distanceObj) {
            $('.describe-meter span:last-child').text(distanceObj.meter + '米')
            $('.describe-time span:last-child').text(distanceObj.minute + '分钟')
            $('.route-time').text(distanceObj.minute + '分钟')
            $('.route-remain').text(distanceObj.meter)
        }
        if (distance.meter == 0) {
            layer.open({
                skin: "warn",
                title: false,
                closeBtn: 0,
                content: '该路线不通！',
                btn: ['取消'],
                yes: function (index, layero) {
                    layer.close(index); //如果设定了yes回调，需进行手工关闭
                },
            });
        }
    }

    //模拟导航时，实时更新数据
    function updateNaviInfo(des, dis, time, src) {
        $('.route-des').text(des);
        $('.route-remain').text(dis || 0);
        $('.route-time').text(time + '分钟' || 0);
        $('.route-img img').attr('src', src);
    }

    //隐藏信息窗口
    function hideRouteTipPanel() {
    }

    //提示是否退出当前导航
    function showConfirmStopNavi() {
        layer.open({
            type: 1,
            title: false,
            content: '是否退出导航',
            btn: ['是', '否'], //按钮
            closeBtn: 0,
            yes: function (index, layero) {
                layer.close(index); //如果设定了yes回调，需进行手工关闭
                $('#voiceStatus').hide();
                fmp.config.naviVoice = false;

                $(".navi-header").hide();
                $('.navi-btn').hide();
                $('#route-panel').show();
                $('#routeDescribePanel').show();

                fmp.navi.stopNavi();
                fmp.map.resetMapPosition();

                $('.loc-btn').show();
                fmp.map.setToolbar();

                $('.fm-control-groups').css('pointer-events', 'auto');
            },
            btn2: function (index, layero) {
                fmp.navi.resumeNavi();
                if (fmp.config.naviVoice === true) {
                    fmp.voice.startVoice();
                }

                //按钮【按钮二】的回调
                layer.close(index); //如果设定了yes回调，需进行手工关闭
            }
        });
    }

    //创建DOM
    function createUI() {
        var aDiv = $("<div>", {
            id: "routeDescribePanel",
            class: "route-describe-panel",
            html: "<div class='route-describe-wrap'></div>"
        }).appendTo($("body"));

        var bDiv = $('<div class="describe-detail">' +
            '<div><i class="iconfont iconquancheng\n"></i><div class="describe-meter"><span>全程</span><span>200米</span></div></div>' +
            '<div><i class="iconfont iconshijian"></i><div class="describe-time"><span>步行约</span><span>2分钟</span></div></div>' +
            '</div>');

        var cDiv = $("<div>", {
            class: "simulate-btn",
            html: "模拟导航",
        });

        /*路线全览按钮*/
        var fDiv = $("<div>", {
            class: "loc-btn",
        }).appendTo($("body"));

        var rDiv = $("<div>", {
            class: 'reset-route-btn',
            html: '<i class=\'iconfont iconquanju\'>',
            click: function () {
                fmp.map.switchMapScaleLevel(19);
                fmp.map.moveToCenter();
                fmp.map.updateMapRoate(0);
            }
        }).appendTo($('.loc-btn'));

        var dDiv = $("<div>", {
            class: 'navi-header',
            html: '<div class="route-img"><img src="FMPM_CommonMap/images/qian.png" alt=""></div>' +
                '<div class="route-des">沿当前道路 直行<span class="route-meter">12</span> 米&nbsp;&nbsp;右转</div>' +
                '<div>剩余<span class="route-remain"></span>米&nbsp;&nbsp;用时约<span class="route-time">0分钟</span></div>'
        }).appendTo($('body'));


        var eDiv = $("<div>", {
            class: 'navi-btn',
            html: '<div class="navi-fun"><div class="navi-pause">暂停</div><div class="navi-stop">退出</div></div>'
        }).appendTo($('body'));


        $('.route-describe-wrap').append(bDiv, cDiv);

        //点击模拟导航按钮
        $('.simulate-btn').on('click', function () {
            $('#route-panel').hide();
            $('#routeDescribePanel').hide();
            $('.navi-header').show();
            $('.navi-btn').show();
            
            $('.navi-pause').text('暂停');
            $('.loc-btn').hide();
            fmp.globalData.isNavigation = false;
            fmp.globalData.needToCenter = false;
            $('.fm-control-groups').css('pointer-events', 'none');
            fmp.map.setToolbar();

            $('.route-time').text(distance.minute + '分钟');
            $('.route-remain').text(distance.meter);
            $('#voiceStatus').show();
            if (fmp.globalData.deviceType === 'ios') {
                var utterThis = new window.SpeechSynthesisUtterance('');
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterThis);
            } 
            fmp.navi.startNavi();
        })

        //暂停导航
        $('.navi-pause').on('click', function () {
            if (!isPause) {
                //暂停导航
                fmp.navi.pauseNavi();
                $('.navi-pause').text('继续');
                isPause = true;
                fmp.voice.stopVoice();
            } else {
                //继续导航
                fmp.navi.resumeNavi();
                $('.navi-pause').text('暂停');
                isPause = false;
                if (fmp.config.naviVoice) {
                    fmp.voice.startVoice();
                }
            }
        })

        //结束导航
        $('.navi-stop').on('click', function () {
            fmp.navi.pauseNavi();
            fmp.voice.stopVoice();
            showConfirmStopNavi();
            fmp.globalData.needToCenter = true;
        });
    }

    return {
        createUI: createUI,
        showPanel: showPanel,
        hidePanel: hideRouteTipPanel,
        updateNaviInfo: updateNaviInfo,
    }
});
