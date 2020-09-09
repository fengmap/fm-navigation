/**
 * [infoTpl 点击地图显示信息]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('findFacility', function () {

    //显示信息窗口
    function showPanel(data) {

    }

    //隐藏信息窗口
    function hideInfoPanel() {

    }

    function findNearestFacility(gid, facilityID, oriid) {
        var params = { nodeType: 5, typeID: facilityID };
        var models = fmp.search.searchByParams(params);
        var modArr = [];
        var floorArr = [];
        var jumpGroupID = null;
        if (models.length >= 1) {
            var modArr = [models[0].groupID];
            for (var i = 1; i < models.length; i++) {
                if (models[i].groupID !== models[i - 1].groupID) {
                    modArr.push(models[i].groupID);
                }
            }
            for (var i = 0; i < modArr.length; i++) {
                floorArr.push(Math.abs(modArr[i] - oriid))
            }
            var compare = function (x, y) {//比较函数
                if (x < y) {
                    return -1;
                } else if (x > y) {
                    return 1;
                } else {
                    return 0;
                }
            }
            floorArr = floorArr.sort(compare);
            if (floorArr[0] == floorArr[1]) {
                jumpGroupID = oriid - floorArr[0];
            } else {
                var paramsUp = { nodeType: 5, typeID: facilityID, groupID: oriid - floorArr[0] };
                var paramsDown = { nodeType: 5, typeID: facilityID, groupID: oriid + floorArr[0] };
                var modelsUp = fmp.search.searchByParams(paramsUp);
                var modelsDown = fmp.search.searchByParams(paramsDown);
                if (modelsUp.length >= 1) {
                    jumpGroupID = oriid - floorArr[0];
                }
                if (modelsDown.length >= 1) {
                    jumpGroupID = oriid + floorArr[0];
                }
            }
            var gnroup = fmp.map.fmap.listGroups.find((a) => a.gid == jumpGroupID)
            var gname = gnroup.gname.toUpperCase();
            layer.open({
                skin: "mylayer",
                title: false,
                closeBtn: 0,
                content: '<div class="tips-cont"><div class="tips-img"><img src="FMPM_CommonMap/images/nofind.png"></div><div><span>当前楼层未找到' + name + '</span></div><div><span>建议您前往最近的其他楼层</span></div><i class="iconfont iconguanbi"></i></div>',
                btn: [`前往${gname}`],
                yes: function (index, layero) {
                    fmp.map.fmap.focusGroupID = jumpGroupID;
                    layer.close(index);
                },
            });
            $('.tips-cont .iconguanbi').on('click', function (index) {
                layer.close(layer.index);
                $('.facility-wrap ul').find('li[class=facility-active]').removeClass('facility-active');
                fmp.markers.removeAllMarkers();
            })
        } else {
            layer.open({
                skin: "mylayer",
                title: false,
                closeBtn: 0,
                content: '<div class="tips-cont"><div class="tips-img"><img src="FMPM_CommonMap/images/nofind.png"></div><div><span>当前商场未找到' + name + '!</span></div><i class="iconfont iconguanbi"></i></div>',
                yes: function (index, layero) {
                    layer.close(index);
                },
            });
            $('.tips-cont .iconguanbi').on('click', function (index) {
                layer.close(layer.index);
            })
            return;
        }
    }

    //创建DOM
    function createUI(fmap) {
        $("<div>", {
            "class": "facility-wrap",
            "html": "<div class='up' style='background: url(FMPM_CommonMap/images/arrow3.png) 50% 50% no-repeat;'></div><ul></ul><div class='down' style='height: 18px; background: url(FMPM_CommonMap/images/arrow2.png) 50% 50% no-repeat; cursor: pointer;'></div>"
        }).appendTo($("body"));

        var faclis = fmp.globalData.facilityType.map(function (item) {
            return $('<li data-id="' + item.facilityID + '"  data-name="' + item.name + '">' +
                '<i class="iconfont ' + item.icon + '"></i>' +
                '<span>' + item.name + '</span>' +
                '</li>')
        });

        $(".facility-wrap ul").append(faclis);

        //点击发现设施
        $(".facility-wrap").on('click', 'ul li', function () {
            fmp.map.switchMapScaleLevel(19);
            fmp.map.moveLeft()
            fmp.map.updateMapRoate(0);
            var facilityID = $(this).data('id');
            var facilityName = $(this).data('name');
            fmp.globalData.isFindFacility = true;
            if ($(this).hasClass('facility-active')) {
                $(this).removeClass('facility-active')
                fmp.markers.removeAllMarkers();
                return
            } else {
                //初始化样式
                fmp.map.resetToolbar();
                $('.info-wrap').hide();
                fmp.map.clearModelSel();
                fmp.markers.removeAllMarkers();

                $(this).addClass('facility-active');
                $(this).siblings().removeClass('facility-active');
                fmp.globalData.findFacilityId = facilityID;
                var params = { nodeType: 5, typeID: facilityID };
                var models = fmp.search.searchByParams(params);

                fmp.markers.addManyMarker(models);
                var _marker = models.find((m) => m.groupID == fmp.map.fmap.focusGroupID);
                if (!_marker || _marker.length <= 0) {
                    findNearestFacility(fmp.map.fmap.focusGroupID - 1, facilityID, fmp.map.fmap.focusGroupID, 0)
                }
            }
        })

        //发现设施向上按钮
        $(".facility-wrap").on('click', '.up', function () {
            var scroll = $(".facility-wrap ul").scrollTop();
            scroll = Math.ceil(scroll / 47) - 1;
            $(".facility-wrap ul").scrollTop((scroll) * 47);
        })

        //发现设施向下按钮
        $(".facility-wrap").on('click', '.down', function () {
            var scroll = $(".facility-wrap ul").scrollTop();
            scroll = parseInt(scroll / 47);
            $(".facility-wrap ul").scrollTop((scroll + 1) * 47);
        })

        $(".facility-wrap ul").scroll(function (e) {
            e.preventDefault();
            e.stopPropagation();
            var scroH = $(".facility-wrap ul").scrollTop();  //滚动高度
            if (scroH < 47) {  //距离顶部小于47px时
                $(".facility-wrap .up").css('background', 'url(FMPM_CommonMap/images/arrow3.png) 50% 50% no-repeat');
            } else {
                $(".facility-wrap .up").css('background', 'url(FMPM_CommonMap/images/arrow1.png) 50% 50% no-repeat');
            }
            if (scroH > 94) {  //距离底部高度大于188px
                $(".facility-wrap .down").css('background', 'url(FMPM_CommonMap/images/arrow4.png) 50% 50% no-repeat');
            } else {
                $(".facility-wrap .down").css('background', 'url(FMPM_CommonMap/images/arrow2.png) 50% 50% no-repeat');
            }
        })
    }

    return {
        createUI: createUI,
        showPanel: showPanel,
        hidePanel: hideInfoPanel,
        findNearestFacility: findNearestFacility
    }
});
