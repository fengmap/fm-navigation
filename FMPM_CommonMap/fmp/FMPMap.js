/**
 * [fmp.map 封装部分地图对象]
 * @return {[type]} [description]
 */
define('map', ['fmp.globalData', 'searchTpl', 'routeTpl'], function (tmap) {

    var fmap_ = null; //地图对象
    var element = 'fengMap'; //显示地图的Dom 的id
    var groupControl = null; //楼层控件对象
    var curMapGroupID = fmp.globalData.mapOptions.defaultFocusGroup;

    function create(options) {
        if (options.element) element = options.element
    }

    //打开fmap地图，传入options
    function openMap(options, success) {
        options = options || fmp.globalData.mapOptions;

        //url判断
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == 'appname') {
                fmp.globalData.currentMapInfo.appName = decodeURI(pair[1]);
            }
            if (pair[0] == 'appkey') {
                fmp.globalData.currentMapInfo.key = pair[1];
            }
            if (pair[0] == 'map') {
                fmp.globalData.currentMapInfo.mapId = pair[1];
            }
            if (pair[0] == 'theme') {
                fmp.globalData.currentMapInfo.defaultThemeName = pair[1];
            }
        }

        var mapOptions = Object.assign({}, options, fmp.globalData.currentMapInfo);

        if (fmap_) {
            fmap_.dispose();
            fmap_ = null;
        }

        fmap_ = new fengmap.FMMap(mapOptions);

        fmap_.showCompass = fmp.config.compassControl; //指南针控件
        fmap_.compass.setFgImage('FMPM_CommonMap/images/compass.png');

        //打开Fengmap服务器的地图数据和主题
        fmap_.openMapById(fmp.globalData.currentMapInfo.mapId, function (error) {
            alert('地图加载出错' + error);
            //打印错误信息
            // console.log(error);
        });

        //地图加载完成回掉方法
        var this_ = this;
        fmap_.on('loadComplete', function () {
            moveLeft();
            //是否需要添加导航类
            if (fmp.config.naviPage === true && fmp.config.routePage === true) {
                requirejs(['fmp.events', 'navi'], function (events, navi_) {
                    fmp.navi = navi_;
                    fmp.navi.create(fmap_);
                })
            }

            //url判断
            var FID = null;
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == 'fid') {
                    FID = pair[1];
                }
            }
            if (FID) {
                var model = fmp.search.findModelByFid(FID);
                if (model && model.name) {
                    $('.header-wrap').hide();
                    $('.info-wrap').hide();
                    $('#route-panel').show();
                    //当前点击店铺作为导航终点
                    $("#route-panel input[name='startTxt']").val(model.name);
                    $("#route-panel input[name='endTxt']").focus();
                    fmp.globalData.startFid = FID;
                }
            }
        });

        fmap_.on('visibleGroupLoaded', () => {
            var center = getGroupCenter(curMapGroupID);
            moveToCenter(center);

            //根据当前配置设置事件
            if (fmp.config) {
                //是否需要楼层控件
                if (fmp.config.scrollGroupControl) {
                    groupControl = new fengmap.FMScrollGroupsControl(fmap_, Object.assign({}, fmp.globalData.scrollCtrlOption));
                    $('.fm-layer-list label').removeClass('active');
                    $(".fm-layer-list label[data-gid='" + fmap_.focusGroupID + "']").addClass('active');
                }

                if (fmp.config.zoomControl) {
                    var zoomControl = new fengmap.FMZoomControl(fmap_, fmp.globalData.zoomCtlOpt);
                }

                if (fmp.config.viewModeSwitchBtn) {
                    var viewModeControl = new fengmap.FMToolControl(fmap_, fmp.globalData.toolCtlOpt);
                }

                if (fmp.search) fmp.search.create(fmap_);
                if (fmp.markers) fmp.markers.create(fmap_);
            }

            if (success && typeof success == 'function') {
                success();
            }
        })

        //初始化地图数据
        function success() {
            //地图背景色
            fmap_.setBackgroundColor('#F5F5F5');
            //去掉loading
            $('#loader').css('display', 'none');
        }

        //过滤不允许点击的地图元素，设置为true为允许点击，设置为false为不允许点击
        fmap_.pickFilterFunction = function (event) {
            //如设置点击墙模型时不高亮
            if (event.nodeType == fengmap.FMNodeType.MODEL) {
                return true;
            }
            return false
        };

        //点击地图事件
        fmap_.on('mapClickNode', function (event) {
            if (!fmp.globalData.isNavigation) return;

            fmp.searchTpl.resetUI();
            fmp.map.showTool();
            fmp.map.resetToolbar();
            fmp.markers.removeAllMarkers();
            fmp.map.clearModelSel();
            $('.info-wrap').hide();
            if (fmp.globalData.isMapClick) {
                $('.facility-wrap').hide();
                setToolbar();
            } else {
                $('.facility-wrap').show();
            }

            //清空marker 重置发现设施样式
            // $('.header-wrap .discovery-facility ul li').removeClass("facility-active");
            $('.facility-wrap ul li').removeClass("facility-active");

            if (!event.target) return;
            if (!event.target.FID) return;

            fmp.globalData.isFindFacility = false;

            //显示店铺信息，缩放，聚焦
            if (fmp.infoTpl) {
                var model = fmp.search.findModelByFid(event.target.FID);
                fmp.search.mapSelectModel(model);
                fmp.markers.removeAllMarkers();
                $('.facility-wrap').hide();
            }

            // 地图选点
            if (fmp.globalData.isMapClick) {
                event.target.name = event.target.name ? event.target.name : '位置';
                fmp.routeInfoTpl.showPanel(event.target);
                $('.route-info-wrap').show();
                $('.info-wrap').hide()
                fmap_.moveTo(event.target.mapCoord);
                return;
            }

            //路径规划页面，不出现详情框
            if ($('#route-panel').css('display') == 'block') {
                return;
            }

        });

        // 点击指南针事件, 使角度归0
        fmap_.on('mapClickCompass', function () {
            if (!fmp.globalData.isNaving) {
                updateMapRoate(fmp.globalData.originMapRotate);
            }
        });

        //聚焦楼层发生变化
        fmap_.on('focusGroupIDChanged', function (focusGroupID) {
            var gid = focusGroupID.gid;

            if (curMapGroupID == gid) return;
            curMapGroupID = gid;

            //改变聚焦楼层字体颜色
            $('.fm-layer-list label').removeClass('active');
            $(".fm-layer-list label[data-gid='" + gid + "']").addClass('active');

            $('.info-wrap').hide();
            if (!fmp.globalData.isFindFacility) {
                if (fmp.globalData.isNavigation) {
                    if (!fmp.globalData.isMapClick) {
                        fmp.markers.removeAllMarkers();
                        resetToolbar();
                    }
                }
            }

            //判断是否隐藏发现设施组件
            var info = $('.info-wrap').css('display');
            var describe = $('.route-describe-panel').css('display');
            if (info == 'none' && describe == 'none') {
                $('.facility-wrap').show();
            } else {
                $('.facility-wrap').hide();
            }
            if (fmp.globalData.isMapClick) {
                $('.facility-wrap').hide();
            }

            var faci = $('.facility-wrap ul').find('li[class=facility-active]').length;
            if (faci == 1) {
                var params = { nodeType: 5, typeID: fmp.globalData.findFacilityId };
                var models = fmp.search.searchByParams(params);
                var _marker = models.find((m) => m.groupID == fmp.map.fmap.focusGroupID);
                if (!_marker || _marker.length <= 0) {
                    fmp.findFacility.findNearestFacility(fmp.map.fmap.focusGroupID - 1, fmp.globalData.findFacilityId, fmp.map.fmap.focusGroupID, 0)
                }
            }

        });
    }

    //获取楼层gname
    function getGroupNameByGid(gid) {
        var group_ = fmap_.getFMGroup(gid);

        if (group_) return group_.groupName.toUpperCase();
        else return '';
    }

    //还原被点选改变的区块颜色
    function clearModelSel() {
        //todo: 取消高亮
        fmap_.selectNull();
        if (fmp.globalData.pickModel) fmp.globalData.pickModel.selected = false;
    }

    //更新地图旋转角度
    function updateMapRoate(angle) {
        if (angle != NaN && angle != undefined) {
            fmap_.rotateTo({
                //设置角度
                to: angle,
                //动画持续时间，默认为。3秒
                duration: .3,
                callback: function () { //回调函数
                }
            });
        }
    }

    //切换地图级别展示
    function switchMapScaleLevel(mapLevel) {
        fmap_.mapScaleLevel = mapLevel;
    }

    function getGroupCenter(gid) {
        let range = fmap_.getFMGroup(gid).mapCoordRange;
        return {
            x: (range[0].x + range[1].x) / 2,
            y: (range[0].y + range[1].y) / 2,
            groupID: gid
        }
    }

    //移动到中心点
    function moveToCenter(coord) {
        coord = !coord ? getGroupCenter(fmap_.focusGroupID) : coord;
        if (coord && coord.groupID != fmap_.focusGroupID) {
            fmap_.changeFocusToGroup({
                gid: coord.groupID,
                duration: 1.5,
                callback: () => {
                    if (coord) {
                        fmap_.moveTo(coord)
                    } else {
                        fmap_.moveToCenter();
                    }
                }
            })
            return;
        }

        if (coord) {
            fmap_.moveTo(coord)
        } else {
            fmap_.moveToCenter();
        }
    }

    //聚焦到中心点
    function changeFocusGroupID(groupID) {
        if (fmap_.focusGroupID != groupID) {
            fmap_.visibleGroupIDs = [groupID];
            fmap_.focusGroupID = groupID;
        }
    }

    //向左偏移地图
    function moveLeft() {
        var leftMove = {
            x: fmap_.center.x + 25,
            y: fmap_.center.y + 30,
        }
        fmap_.moveTo(leftMove);
    }

    //重置右侧工具栏高度
    function resetToolbar() {
        $('.fm-control-zoom').css('bottom', '40px');
        $('.fm-control-groups').css('bottom', '110px');
        $('.fm-control-tool-3d').css('bottom', '327px');
    }

    //点击信息框后调整工具栏高度
    function setToolbar() {
        $('.fm-control-zoom').css('bottom', '115px')
        $('.fm-control-groups').css('bottom', '185px')
        $('.fm-control-tool-3d').css('bottom', '402px')
    }

    //初始(缩放地图，居中，旋转角度，重置工具位置，清空marker，去掉高亮，隐藏店铺信息)
    function resetMapPosition() {
        switchMapScaleLevel(19);
        moveToCenter();
        updateMapRoate(0);
        resetToolbar();
        clearModelSel();
        $('.info-wrap').hide();
    }

    //隐藏工具栏
    function hideTool() {
        $('.fm-control-tool-3d').hide();
        $('.fm-control-zoom').hide();
        $('.fm-control-groups').hide();
    }

    //显示工具栏
    function showTool() {
        $('.fm-control-tool-3d').show();
        $('.fm-control-zoom').show();
        $('.fm-control-groups').show();
    }
    function getCurMapGroupID() {
        return curMapGroupID;
    }

    var tmp = {
        create: create,
        openMap: openMap,
        moveToCenter: moveToCenter,
        switchMapScaleLevel: switchMapScaleLevel,
        updateMapRoate: updateMapRoate,
        clearModelSel: clearModelSel,
        getGroupNameByGid: getGroupNameByGid,
        changeFocusGroupID: changeFocusGroupID,
        resetToolbar: resetToolbar,
        setToolbar: setToolbar,
        resetMapPosition: resetMapPosition,
        hideTool: hideTool,
        showTool: showTool,
        getGroupCenter: getGroupCenter,
        getCurMapGroupID: getCurMapGroupID,
        moveLeft: moveLeft,
    };

    Object.defineProperty(tmp, 'fmap', {
        get: function () {
            return fmap_;
        }
    });

    return tmp;
});