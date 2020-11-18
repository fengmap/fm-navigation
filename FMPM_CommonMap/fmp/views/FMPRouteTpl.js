/**
 * [路径显示界面]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('routeTpl', ['tplUtil', 'routeTipTpl'], function (tplUtil, routeTipTpl) {
    fmp.tplUtil = tplUtil;
    fmp.routeTipTpl = routeTipTpl;
    fmp.routeTipTpl.createUI();

    var fmap_ = null;
    var isEqual = null;

    //显示信息窗口
    function showRoutePanel() {
        var sname = '',
            fmap = fmp.map,
            spnt = fmap && fmap.curPoint ? fmap.curPoint : null;
        if (!fmap_ && fmap) fmap_ = fmap;

        $("#route-panel").show();
        $("#routeHistory").show();
        $("#routeSearchResult").hide();
    }

    //是否是相同的起点和终点
    function isSameStartAndEnd(startPoint, endPoint) {
        if (startPoint.x == endPoint.x && startPoint.y == endPoint.y && startPoint.groupID == endPoint.groupID) {
            return true;
        }
        return false;
    }

    //为终点和起点设置路径
    function setStartAndEndPoint(startModel, endModel) {
        var fmap = fmp.map;
        if (!startModel) return;
        if (!endModel) return;
        if (startModel) var startData = fmp.tplUtil.getDataFromModel(startModel);
        if (endModel) var endData = fmp.tplUtil.getDataFromModel(endModel);

        if (startModel) fmp.tplUtil.setInputDataAttr("#route-panel input[name='startTxt']", startData);
        if (endModel) fmp.tplUtil.setInputDataAttr("#route-panel input[name='endTxt']", endData);

        var tmps = $("#route-panel input[name='startTxt']").val(),
            tmpsPoint = fmp.tplUtil.getPointByName("#route-panel input[name='startTxt']"),
            tmpe = $("#route-panel input[name='endTxt']").val(),
            tmpePoint = fmp.tplUtil.getPointByName("#route-panel input[name='endTxt']");
        //如果输入框中没有坐标，不路径规划
        if ((!tmpsPoint.x || !tmpePoint.x) && !fmap.curPoint) {
            return;
        }
        var routeRes = isSameStartAndEnd(tmpsPoint, tmpePoint);
        if (!fmap_) fmap_ = fmap;

        //如果起点和终点不一致
        if (!routeRes) {
            fmp.navi.addRouteLine(tmpsPoint, tmpsPoint.groupID, tmpePoint, tmpePoint.groupID);
            fmp.globalData.isMapClick = false;
            var distanceObj = fmp.navi.setNaviPoint(Object.assign({}, tmpsPoint, { groupID: tmpsPoint.groupID }), Object.assign({}, tmpePoint, { groupID: tmpePoint.groupID }));
            fmp.routeTipTpl.showPanel(tmps, tmpe, distanceObj);
            isEqual = true;
        } else {
            layer.open({
                skin: "warn",
                title: false,
                closeBtn: 0,
                content: '相同的起始点！',
                btn: ['取消'],
                yes: function (index, layero) {
                    layer.close(index); //如果设定了yes回调，需进行手工关闭
                },
            });
            isEqual = false;
        }
    }

    //隐藏信息窗口
    function hideRoutePanel() {
        $('.route-wrap').hide();
        //清空输入
        $('.route-cont input[name="startTxt"]').val('');
        $('.route-cont input[name="endTxt"]').val('');
    }

    //创建DOM
    function createUI(fmap) {
        if ($("#route-panel").length > 0) return;
        if (fmap) fmap_ = fmap;

        var cDiv = $("<div>", {
            "class": "route-wrap",
            "id": "route-panel",
            "html": "<div class='route-cont'><div class='route-s-e'></div></div>",
        }).appendTo($("body"));

        var rDiv = $("<div>", {
            "class": "route-loc-wrap",
            "html": "<div class='route-icon'><div class='route-start'><span></span></div><div  class='route-middle'><span></span><span></span><span></span></div><div class='route-end'><span></span></div></div>" +
                "<div class='route-input'><input type='text' name='startTxt' placeholder='起点'><input type='text' name='endTxt' placeholder='终点'></div><div class='loc-btn-wrap'><i class='iconfont iconzhuanhuan'></i></div>"
        });

        var dDiv = $("<div>", {
            "class": "btn-maploc",
            "html": "<span><i class='iconfont icondituxuandian'></i>地图选点</span>"
        });

        var fDiv = $("<div>", {
            "class": "route-back",
            "html": "<span>取消</span>"
        });

        $('.route-cont .route-s-e').append(fDiv, rDiv, dDiv);

        //语音功能
        $("<div id='voiceStatus' class='voiceStatus'><i class='iconfont iconshengyinkai'></i></div>").appendTo($('body'));
        $("#voiceStatus").click(function () {

            //停止声音
            if (!$(this).hasClass("voiceStatus_close")) {
                $(this).addClass("voiceStatus_close");
                $(this).find('i').addClass('iconshengyinguan').removeClass('iconshengyinkai');
                fmp.config.naviVoice = false;
                if (fmp.globalData.deviceType === 'ios') {
                    var utterThis = new window.SpeechSynthesisUtterance('');
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterThis);
                }
            } else {
                $(this).removeClass("voiceStatus_close");
                $(this).find('i').addClass('iconshengyinkai').removeClass('iconshengyinguan');
                fmp.config.naviVoice = true;
                if (fmp.globalData.deviceType === 'ios') {
                    var utterThis = new window.SpeechSynthesisUtterance('');
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterThis);
                }
            }
        });

        //历史记录
        if (fmp.config.routeHistoryBar == true) {
            createRouteHistoryUI();
        }

        //搜索历史
        if (fmp.config.routeSearchHistoryBar == true) {
            createRouteSearchHistoryUI();
        }

        var $result = $("<div>", {
            "class": 'list-wrap ',
            "id": "routeSearchResult",
            "html": "<ul></ul>"
        }).appendTo('#route-panel');

        //互换起点、终点
        $(".loc-btn-wrap").click(function () {
            var rouP = $('#routeDescribePanel').css('display');

            var sValue = $("#route-panel input[name='startTxt']").val(),
                tValue = $("#route-panel input[name='endTxt']").val();
            $("#route-panel input[name='startTxt']").val(tValue);
            $("#route-panel input[name='endTxt']").val(sValue);

            if (rouP == 'block') {
                var staPoint = fmp.tplUtil.getPointByName("#route-panel input[name='startTxt']"),
                    enPoint = fmp.tplUtil.getPointByName("#route-panel input[name='endTxt']");

                fmp.tplUtil.setInputDataAttr("#route-panel input[name='startTxt']", enPoint);
                fmp.tplUtil.setInputDataAttr("#route-panel input[name='endTxt']", staPoint);

                fmp.navi.addRouteLine(enPoint, enPoint.groupID, staPoint, staPoint.groupID);
            }
            var sFid = fmp.globalData.startFid;
            var eFid = fmp.globalData.endFid;
            fmp.globalData.startFid = eFid;
            fmp.globalData.endFid = sFid;
            // fmp.map.switchMapScaleLevel(19);
        });

        //起始点输入框获取焦点时
        $("#route-panel input[name='startTxt']").on('focus', function () {
            fmp.globalData.isStartInput = 1;
            handleInput();
            $('#route-panel').css('height', '100%');
            $('#routeDescribePanel').hide();
            $('.btn-maploc').show();
        });

        $("#route-panel input[name='endTxt']").on('focus', function () {
            fmp.globalData.isStartInput = 2;
            handleInput();
            $('#route-panel').css('height', '100%');
            $('#routeDescribePanel').hide();
            $('.btn-maploc').show();
        });

        var isInputZh = false;

        //起始点模糊查询
        $("#route-panel input").on({
            'compositionstart': function () {
                isInputZh = true;
            },
            'compositionend': function () {
                isInputZh = false;
                if (isInputZh) return;
                var keyword = this.value;
                handleInput(keyword)
            },
            'input': function (e) {
                if (isInputZh) return;
                var keyword = this.value;
                handleInput(keyword)
            }
        });

        // 取消返回首页
        $('.route-back').on('click', function () {
            fmp.globalData.isNavigation = true;
            //初始化
            fmp.map.resetToolbar();
            fmp.markers.removeAllMarkers();
            fmp.map.clearModelSel();
            $('.info-wrap').hide();

            hideRoutePanel();
            $('.route-info-wrap').hide();
            $('.header-wrap').show();
            $('.header-wrap').show();
            $('.facility-wrap').show();

            //隐藏全览按钮
            $('.loc-btn').hide();

            //隐藏路径信息页面
            $('#routeDescribePanel').hide();

            if (fmp.globalData.pickModel) fmp.globalData.pickModel.selected = false;
            fmp.globalData.isMapClick = false;
            //设置起点终点为空
            $('#route-panel input[name="startTxt"]').val('');
            $('#route-panel input[name="endTxt"]').val('');
            $('.header-wrap #searchTxt').val('');
            fmp.searchTpl.resetUI();

            fmp.tplUtil.setInputDataAttr("#route-panel input[name='startTxt']", {
                x: null,
                y: null,
                groupID: null
            });
            fmp.tplUtil.setInputDataAttr("#route-panel input[name='endTxt']", {
                x: null,
                y: null,
                groupID: null
            });
            fmp.navi.clearRoutes();
            fmp.map.resetToolbar();
        });

        //点击地图选点
        $('.btn-maploc').on('click', function () {
            fmp.globalData.isMapClick = true;
            fmp.globalData.isNavigation = true;
            fmp.navi.clearRoutes();
            $('#routeDescribePanel').hide();
            $('#route-panel').hide();
            $('.info-wrap').hide();
            $('.header-wrap').hide();
            $('.route-info-wrap').hide();
            $('.facility-wrap').hide();
            fmp.map.resetToolbar();
            fmp.map.clearModelSel();
            if (fmp.globalData.isStartInput == 2) {
                $('.route-info-wrap .info-cho-btn span').text('确认终点');
            } else {
                $('.route-info-wrap .info-cho-btn span').text('确认起点');
            }

            layer.msg('请选择地点', {
                time: 2000,
            });
        })
    }

    //起始点搜索展示列表
    function handleInput(keyword) {
        var startTxt = $("#route-panel input[name='startTxt']").val();
        var endTxt = $("#route-panel input[name='endTxt']").val();
        if (startTxt != '' && endTxt != '') {
            $('#routeHistory').hide();
            $('#routeSearchHistory').show();
            $('#route-panel .no-search-list').hide();
        } else if (startTxt || endTxt) {
            $('#routeHistory').hide();
            $('#routeSearchHistory').show();
            $('#route-panel .no-search-list').hide();
        } else {
            $('#routeHistory').show();
            $('#routeSearchHistory').hide();
        }

        if (!keyword) {
            $('#routeSearchResult').hide();
            return;
        }

        //搜索
        modelRes = fmp.searchTpl.searchBykeyWord(keyword)

        //显示搜索列表
        showSearchList(modelRes, keyword)

        if (modelRes.length !== 0) {
            $('#routeSearchHistory').hide();
            $('#routeSearchResult').show();
        } else {
            $('#routeSearchHistory').hide();
            $('#routeSearchResult').hide();
            $("#route-panel").append($('<div class="no-search-list">未查询到结果</div>'))
            return;
        }

    }

    function showSearchList(modelRes, keyword) {
        $('#routeSearchResult ul').empty();
        var li = '';

        //渲染model
        if (modelRes.length > 0) {

            for (var i = 0, ilen = modelRes.length; i < ilen; i++) {
                var model = modelRes[i];
                if (model.name && model.name != '') {
                    var name = keywordHighlight(model.name, keyword);
                    var fid = model.FID ? model.FID : 'no';
                    var gname = fmp.map.getGroupNameByGid(model.groupID);
                    li += '<li data-gid="' + model.groupID + '" data-name="' + model.name + '" data-fid="' + fid + '"><div class="item-wrap"><div><h5>' + name + '</h5><span>' + gname + '层</span></div></div></li>';
                }
            }
            $('#routeSearchResult ul').append(li);
        }

        //点击列表
        $('#routeSearchResult ul li').click(function () {
            var fid = $(this).data('fid');
            if (fid == 'no') {
                layer.open({
                    skin: "warn",
                    title: false,
                    closeBtn: 0,
                    content: '店铺正在建设中！',
                    btn: ['取消'],
                    yes: function (index, layero) {
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    },
                });

            } else {
                fid = fid.toString();
                var model = fmp.search.findModelByFid(fid);
                var floorName = fmp.map.getGroupNameByGid(model.groupID)

                $("#routeSearchResult").hide();

                //记录起始终点数据
                if (fmp.globalData.isStartInput == 1) {
                    fmp.globalData.startFid = model.FID;
                    $("#route-panel input[name='startTxt']").val(model.name);
                    // $("#route-panel input[name='startTxt']").focus();
                } else {
                    fmp.globalData.endFid = model.FID;
                    $("#route-panel input[name='endTxt']").val(model.name);
                    // $("#route-panel input[name='endTxt']").focus();
                }

                //保存搜索记录
                historySearch({
                    name: model.name,
                    fid: fid,
                    fengmapFloors: floorName,
                });

                //规划路线
                planRoute();
            }

        });
    }

    //关键字匹配颜色高亮
    function keywordHighlight(str, key) {
        var reg1 = /[\u4e00-\u9fa5-\w-\d]/g;
        var key1 = key.match(reg1);
        key = key1.join("");
        var reg = new RegExp("(" + key + ")", "gi");
        if (str) {
            var newstr = str.replace(reg, '<font style="color:#339fbe;">$1</font>');
        }
        return newstr;
    }

    //创建搜索历史UI
    function createRouteSearchHistoryUI() {
        $('#route-panel').append($('<div id=\'routeSearchHistory\'></div>'));
        $('#routeSearchHistory').append($('<div id=\'routesh-cont\'></div>'));
        $("#routesh-cont").append($("<div class='search-history-head'></div>").append($("<h3>搜索历史</h3>")))
            .append($("<ul class='search-history-list'></ul>"));
        $("#routesh-cont").append($("<div class='search-history-foot'></div>").append($("<span>清空历史记录</span>")))

        var historyData = localStorage.getItem('routeSearchList') ? JSON.parse(localStorage.getItem('routeSearchList')) : {};
        var appName = fmp.globalData.currentMapInfo.appName;
        var key = fmp.globalData.currentMapInfo.key;
        var mapId = fmp.globalData.currentMapInfo.mapId;
        var cur_ = appName + ';' + key + ';' + mapId;
        var history = historyData[cur_] || [];

        var lis = history.map(function (item) {
            return $('<li data-fid="' + item.fid + '">' +
                '<div class="type-item">' +
                '<div><h3>' + item.name + '</h3>' +
                '<div class="item-det"><span class="floor">' + item.fengmapFloors + '层</span></div></div>' +
                '</div>' +
                '</li>')
        });

        $('.search-history-list').append(lis);

        //点击每一个li进行地图回显
        $("#routeSearchHistory").on('click', '.search-history-list li', function () {
            var fid = $(this).data('fid');
            var model = fmp.search.findModelByFid(fid);
            var name = $(this).find('h3').text();
            if (model.length == 0 || model.name !== name) {
                layer.open({
                    skin: "warn",
                    title: false,
                    closeBtn: 0,
                    content: '数据已变更无法按原历史记录查询！',
                    btn: ['取消'],
                    yes: function (index, layero) {
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    },
                });
                return;
            }

            //记录起始终点数据
            if (fmp.globalData.isStartInput == 1) {
                fmp.globalData.startFid = model.FID;
                $("#route-panel input[name='startTxt']").val(model.name ? model.name : '位置');
            } else {
                fmp.globalData.endFid = model.FID;
                $("#route-panel input[name='endTxt']").val(model.name ? model.name : '位置');
            }

            //规划路线
            planRoute();
        })

        // 清空历史记录
        $('#routeSearchHistory .search-history-foot').click(function () {
            var historyData = localStorage.getItem('routeSearchList') ? JSON.parse(localStorage.getItem('routeSearchList')) : {};
            var appName = fmp.globalData.currentMapInfo.appName;
            var key = fmp.globalData.currentMapInfo.key;
            var mapId = fmp.globalData.currentMapInfo.mapId;
            var cur_ = appName + ';' + key + ';' + mapId;
            historyData[cur_] = [];
            localStorage.setItem('routeSearchList', JSON.stringify(historyData))
            $('.search-history-list').html('');
        })
    }

    //存储搜索数据，搜索已有的，调换位置
    function historySearch(data) {
        var historyData = localStorage.getItem('routeSearchList') ? JSON.parse(localStorage.getItem('routeSearchList')) : {};
        var appName = fmp.globalData.currentMapInfo.appName;
        var key = fmp.globalData.currentMapInfo.key;
        var mapId = fmp.globalData.currentMapInfo.mapId;
        var cur_ = appName + ';' + key + ';' + mapId;
        var historyList = historyData[cur_] || [];
        var index = historyList.findIndex(function (item) {
            return item.fid == data.fid && item.name == data.name;
        });
        if (index !== -1) {
            historyList.unshift(historyList.splice(index, 1)[0])  //调换位置放置最前
            //移动历史记录dom位置
            $('.search-history-list li').eq(index).insertBefore($('.search-history-list li').eq(0))
        } else {
            historyList.unshift(data);
            $("<li data-fid='" + data.fid + "'>" +
                "<div class=\"type-item\"><div><h3>" + data.name + "</h3><div class=\"item-det\">" +
                "<span class=\"floor\">" + data.fengmapFloors + "层</span></div></div></div></li>").prependTo($('.search-history-list'))
            if (historyList && historyList.length > 10) {
                historyList.pop();
                $('.search-history-list li').eq(10).remove();
            }
        }
        historyData[cur_] = historyList;
        localStorage.setItem('routeSearchList', JSON.stringify(historyData))
    }

    //创建路线历史记录UI
    function createRouteHistoryUI() {
        $('#route-panel').append($('<div id=\'routeHistory\'></div>'));
        $('#routeHistory').append($('<div id=\'routeh-cont\'></div>'));
        $("#routeh-cont").append($("<div class='route-history-head'></div>").append($("<h3>历史记录</h3>")))
            .append($("<ul class='route-history-list'></ul>"));
        $("#routeh-cont").append($("<div class='route-history-foot'></div>").append($("<span>清空历史记录</span>")));

        var historyData = localStorage.getItem('routeHistory') ? JSON.parse(localStorage.getItem('routeHistory')) : {};
        var appName = fmp.globalData.currentMapInfo.appName;
        var key = fmp.globalData.currentMapInfo.key;
        var mapId = fmp.globalData.currentMapInfo.mapId;
        var cur_ = appName + ';' + key + ';' + mapId;
        var history = historyData[cur_] || [];

        var lis = history.map(function (item) {
            if (item.mapID === fmp.globalData.currentFmId) {
                return $('<li data-stfid="' + item.startFid + '" data-enfid="' + item.endFid + '">' +
                    '<div class="type-item">' +
                    '<span>' + item.startName + '</span>' + '<i class=\'iconfont icontuxing\'></i>' + '<span>' + item.endName + '</span>' +
                    '</div></li>')
            }
        });

        $('.route-history-list').append(lis);

        //点击每一个li进行地图回显
        $("#routeHistory").on('click', '.route-history-list li', function () {
            var sName = $(this).find('.type-item span:first-child').text();
            var eName = $(this).find('.type-item span:last-child').text();
            $("#route-panel input[name='startTxt']").val(sName);
            $("#route-panel input[name='endTxt']").val(eName);
            var sFid = $(this).data('stfid');
            var eFid = $(this).data('enfid');
            fmp.globalData.startFid = sFid;
            fmp.globalData.endFid = eFid;
            var smodel = fmp.search.findModelByFid(sFid);
            var emodel = fmp.search.findModelByFid(eFid);
            if (smodel.length == 0 || emodel.length == 0 || smodel.name !== sName || emodel.name !== eName) {
                layer.open({
                    skin: "warn",
                    title: false,
                    closeBtn: 0,
                    content: '数据已变更无法按原历史记录查询！',
                    btn: ['取消'],
                    yes: function (index, layero) {
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    },
                });
                return;
            }
            //规划路线
            planRoute();
        })

        // 清空历史记录
        $('#routeHistory .route-history-foot').click(function () {
            var historyData = localStorage.getItem('routeHistory') ? JSON.parse(localStorage.getItem('routeHistory')) : {};
            var appName = fmp.globalData.currentMapInfo.appName;
            var key = fmp.globalData.currentMapInfo.key;
            var mapId = fmp.globalData.currentMapInfo.mapId;
            var cur_ = appName + ';' + key + ';' + mapId;
            historyData[cur_] = [];
            localStorage.setItem('routeHistory', JSON.stringify(historyData))
            $('.route-history-list').html('');
        })
    }

    //存储路线历史数据，搜索已有的，调换位置
    function history(data) {
        var historyData = localStorage.getItem('routeHistory') ? JSON.parse(localStorage.getItem('routeHistory')) : {};
        var appName = fmp.globalData.currentMapInfo.appName;
        var key = fmp.globalData.currentMapInfo.key;
        var mapId = fmp.globalData.currentMapInfo.mapId;
        var cur_ = appName + ';' + key + ';' + mapId;
        var historyList = historyData[cur_] || [];
        var index = historyList.findIndex(function (item) {
            return item.startFid == data.startFid && item.endFid == data.endFid && item.startName == data.startName && item.endName == data.endName;
        });
        if (index !== -1) {
            historyList.unshift(historyList.splice(index, 1)[0])  //调换位置放置最前
            //移动历史记录dom位置
            $('.route-history-list li').eq(index).insertBefore($('.route-history-list li').eq(0))
        } else {
            historyList.unshift(data);
            $('<li data-stfid="' + data.startFid + '" data-enfid="' + data.endFid + '">' +
                '<div class="type-item">' +
                '<span>' + data.startName + '</span>' + '<i class=\'iconfont icontuxing\'></i>' + '<span>' + data.endName + '</span>' +
                '</div></li>').prependTo($('.route-history-list'))
            if (historyList && historyList.length > 10) {
                historyList.pop();
                $('.route-history-list li').eq(10).remove();
            }
        }
        historyData[cur_] = historyList;
        localStorage.setItem('routeHistory', JSON.stringify(historyData))
    }

    //规划路线方法
    function planRoute() {
        var startTxt = $("#route-panel input[name='startTxt']").val();
        var endTxt = $("#route-panel input[name='endTxt']").val();
        if (startTxt && endTxt) {
            fmp.markers.removeAllMarkers();
            fmp.globalData.isNavigation = false;
            $('.switch-shop').hide();

            //隐藏地图选点
            $('.btn-maploc').hide();

            //获取起始点数据，规划路线
            var startD = fmp.search.findModelByFid(fmp.globalData.startFid);
            var endD = fmp.search.findModelByFid(fmp.globalData.endFid);
            if (startD && endD) {
                setStartAndEndPoint(startD, endD);
                var center = fmp.map.getGroupCenter(startD.groupID);
                fmp.map.moveToCenter(center);
                $('.facility-wrap').hide();

                if (!isEqual) return;

                //保存规划路线记录
                history({
                    startFid: fmp.globalData.startFid,
                    endFid: fmp.globalData.endFid,
                    startName: startD.name ? startD.name : '位置',
                    endName: endD.name ? endD.name : '位置',
                })

                fmp.map.setToolbar();
                $('.route-wrap .route-cont').show();
                $('.route-wrap').css('height', '0.71rem');
                $('#routeHistory').hide();
                $('#routeSearchResult').hide();
                $('#routeSearchHistory').hide();
                $('.route-info-wrap').hide();
                $('.header-wrap').hide();

                //显示全览按钮
                $('.loc-btn').show();

                //路径信息页面
                $('#routeDescribePanel').show();

                fmp.map.clearModelSel();
            } else {
                layer.open({
                    skin: "warn",
                    title: false,
                    closeBtn: 0,
                    content: '请确认起点终点是否为正确地址！',
                    btn: ['取消'],
                    yes: function (index, layero) {
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    },
                });
            }
        }
    }

    return {
        createUI: createUI,
        showPanel: showRoutePanel,
        hidePanel: hideRoutePanel,
        keywordHighlight: keywordHighlight,
        historySearch: historySearch,
        createRouteSearchHistoryUI: createRouteSearchHistoryUI,
        createRouteHistoryUI: createRouteHistoryUI,
        planRoute: planRoute,
    }
}
);
