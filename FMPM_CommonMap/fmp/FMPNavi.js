/**
 * [navi 导航类]
 * @return {[type]} [description]
 */
/**
 * [infoTpl 点击地图显示信息]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('navi', function () {

    var naviRouteDirection = 0;
    var fmap_, navi, routeIndex = 0;
    var preIndex = -1;

    //监听walking事件
    function handleNaviEvent() {
        //监听waling事件
        navi.on('walking', function (data) {
            updateNaviDataInfo(data);
        });

        //	导航完成事件
        navi.on('complete', function () {
        })
    }

    //获取剩余时间,单位：分钟
    function getRemainTime(dis) {
        return Math.ceil(dis / fmp.globalData.walkingSpeed);
    }

    //更新当前导航信息
    function updateNaviDataInfo(data) {
        if (data.angle != NaN) {
            fmp.globalData.routeDirection = data.angle;
        }
        var imgName = getNaviDirection(data.index);
        var disToCenter = (navi.naviEntrancesDistance && navi.naviEntrancesDistance.length == 2) ? parseInt(navi.naviEntrancesDistance[1]) : 0;
        var imgUrl = fmp.config.commonFolderPath + 'images/' + imgName + '.png';
        var prompt = getNaviDescription(data.index);
        var distance = Math.ceil(data.remain);
        //普通人每分钟走80米。
        var time = distance / 80;
        var m = Math.ceil(time);
        var s = Math.ceil((time % 1) * 60);
        if (distance === 1) {
            distance = 0;
        };
        if (!prompt) return;
        fmp.routeTipTpl.updateNaviInfo(prompt, distance, m, imgUrl);
        if (fmp.globalData.isNaving) {

            fmp.locMarker.updateLocMarkerPos(pointNoConstraint || data.point)
            // console.log('剩余距离', data.remain, '结束距离', fmp.globalData.finishDistance, '到门距离', disToCenter)
            if (data.remain < (fmp.globalData.finishDistance + (disToCenter || 0))) {
                distance = 0;
            }

            //地图视角根据定位点变化
            fmp.map.moveToCurPoint(data.point);
        }

        if (!$("#voiceStatus").hasClass("voiceStatus_close")) {

            if (preIndex != data.index) {
                if (data.distanceToNext >= 1.5) {
                    if (fmp.globalData.deviceType === 'ios') {
                        var message = prompt.replace(/\s/g, "");
                        message = message.replace(/undefined/g, ''); //去掉undiefined的文字
                        var utterThis = new window.SpeechSynthesisUtterance(message);
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(utterThis);
                    } else {
                        fmp.voice.pauseVoice();
                        fmp.voice.startVoice(prompt);
                    }
                    preIndex = data.index
                }

            }
        } else {
            fmp.voice.stopVoice();
        }

        //到达终点，自动结束
        if (distance === 0) {
            if (layer) {
                layer.msg('到达终点！', {
                    time: 10000
                }, function () {
                    //只关闭提示层
                    layer.closeAll('dialog'); //关闭信息框
                });
            }
            $(".navi-header").hide();
            $('.navi-btn').hide();
            $('#route-panel').show();
            $('#routeDescribePanel').show();
            $('#voiceStatus').hide();

            fmp.navi.stopNavi();
            fmp.map.resetMapPosition();

            $('.loc-btn').show();
            fmp.map.setToolbar();

            $('.fm-control-groups').css('pointer-events', 'auto');
        }
    }

    //路径方向，用于路径描述图片方向路径
    function getNaviDirection(index) {
        //左、左前、右、右前、终
        var des = navi.naviDescriptionsData[index];
        if (!des) return;
        switch (des.endDirection) {
            case '左':
                return 'zuo';
            case '右':
                return 'you';
            case '左前':
                return 'zuoqian';
            case '右前':
                return 'youqian';
            default:
                return 'qian';
        }
    }

    //重新规划路径
    function updateNavi(mapCoord_) {
    }

    //得到路径描述
    function getNaviDescription(index) {
        return navi.naviDescriptions[index];
    }

    //模拟导航开始
    function startNavi() {
        if (navi) navi.simulate();
    }

    //模拟导航暂停
    function pauseNavi() {
        if (navi) navi.pause()
    }

    //模拟导航继续
    function resumeNavi() {
        if (navi) navi.resume()
    }

    //模拟导航结束
    function stopNavi() {
        fmp.config.needImitateNavi = false;
        fmp.voice.stopVoice();
        fmp.config.naviVoice = false;
        if (navi) navi.stop();
        fmp.routeTipTpl.updateNaviInfo('开始导航', '', '', fmp.config.commonFolderPath + 'images/' + 'qian' + '.png');
    }

    //绘制路径线
    function addRouteLine(startPoint, startGroupID, endPoint, endGroupID) {

        clearRoutes();

        navi.setStartPoint(Object.assign({}, fmp.globalData.routeStartMarkerOpt, {
            x: startPoint.x,
            y: startPoint.y,
            groupID: startGroupID
        }));

        navi.setEndPoint(Object.assign({}, fmp.globalData.routeEndMarkerOpt, {
            x: endPoint.x,
            y: endPoint.y,
            groupID: endGroupID
        }));

        // 画导航线
        navi.drawNaviLine();

        //聚焦起点楼层，缩放地图，居中
        fmp.map.changeFocusGroupID(startGroupID);
        fmp.map.switchMapScaleLevel(19);
        fmp.map.moveLeft();

        /*if (startGroupID !== endGroupID) {
            fmap_.viewMode = fengmap.FMViewMode.MODE_3D
            fmp.map.showAllGroup(true)
        }*/
    }

    //清空路径线
    function clearRoutes() {
        if (navi) navi.clearAll();
    }

    //初始化导航类
    function initNavigation() {

        var options = Object.assign({}, {
            map: fmap_,
            lineStyle: fmp.globalData.lineStyle
        }, fmp.globalData.simulateNaviOptions);
        navi = new fengmap.FMNavigation(options);
        navi.on('walking', function (data) {
            if (data) updateNaviDataInfo(data);
        });
        navi.on('complete', function () {
            // console.log('模拟导航完成')
        })

    }

    //创建DOM
    function create(map) {
        fmap_ = map;

        initNavigation();
        handleNaviEvent();

        //需要语音导航
        requirejs(['voice'], function (voice) {
            fmp.voice = voice;
        })

    }

    //获取起点和终点的距离
    function setNaviPoint(startPoint, endPoint) {
        if (!startPoint) startPoint = curPoint;
        if (!endPoint) endPoint = curPoint;  //互换点，定位点为终点
        if (startPoint == null || endPoint == null) {
            return false;
        }
        navi.setStartPoint({
            x: startPoint.x,
            y: startPoint.y,
            groupID: startPoint.groupID
        });

        navi.setEndPoint({
            x: endPoint.x,
            y: endPoint.y,
            groupID: endPoint.groupID
        });
        return getNaviInstance(navi);
    }

    // 根据导航的起终点得到距离
    function getNaviInstance(navi) {
        //得到距离
        var naviDistance = Math.round(navi.naviDistance);
        //显示距离时间信息
        //普通人每分钟走80米。
        var time = naviDistance / 80;
        var m = Math.ceil(time);
        var s = Math.ceil((time % 1) * 60);

        var distanceObj = {};
        distanceObj.meter = naviDistance || 0;
        distanceObj.minute = m || 0;
        distanceObj.second = s || 0;
        return distanceObj;
    }


    return {
        create: create,
        addRouteLine: addRouteLine,
        clearRoutes: clearRoutes,
        startNavi: startNavi,
        stopNavi: stopNavi,
        pauseNavi: pauseNavi,
        resumeNavi: resumeNavi,
        setNaviPoint: setNaviPoint,
    }
});
