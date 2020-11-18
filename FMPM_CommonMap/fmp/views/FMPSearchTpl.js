/**
 * [searchTpl 顶部搜索框]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('searchTpl', function () {

    //重置搜索界面
    function resetUI() {
        $('.search-type').hide();
        $(".clearBtn").hide();
        $(".returnBtn").hide();
        $("#hotwords").hide();
        $(".category-pop").hide();
        $(".info-wrap").hide();
        $("#searchTxt").val('');
        $("#searchTxt").css('display', 'block');
        $('.category-cont').show();
        $(".route-line").show();
        //清空高亮颜色
        fmp.map.clearModelSel();
    }

    //解决andriod 和 ios 在键盘弹出时，滚动界面不一致的问题。
    function resolveScroll() {
        // 防止内容区域滚到底后引起页面整体的滚动
        var content = $('.category-pop');
        var startY;

        content.on('touchstart', function (e) {
            if (e.touches)
                startY = e.touches[0].clientY;
        });

        content.on('touchmove', function (e) {
            if (!e.touches) return;
            // 高位表示向上滚动
            // 底位表示向下滚动
            // 1容许 0禁止
            var status = '11';
            var ele = this;

            var currentY = e.touches[0].clientY;

            if (ele.scrollTop === 0) {
                // 如果内容小于容器则同时禁止上下滚动
                status = ele.offsetHeight >= ele.scrollHeight ? '00' : '01';
            } else if (ele.scrollTop + ele.offsetHeight >= ele.scrollHeight) {
                // 已经滚到底部了只能向上滚动
                status = '10';
            }

            if (status != '11') {
                // 判断当前的滚动方向
                var direction = currentY - startY > 0 ? '10' : '01';
                // 操作方向和当前允许状态求与运算，运算结果为0，就说明不允许该方向滚动，则禁止默认事件，阻止滚动
                if (!(parseInt(status, 2) & parseInt(direction, 2)) && stopEvent) {
                    stopEvent(e);
                }
            }
        });
    }

    //创建主搜索页
    function createCategoryUI() {
        var cDiv = $("<div>", {
            "class": "category-pop"
        }).appendTo($("body"));

        //搜索历史
        if (fmp.config.searchHistoryPage == true) {
            createHistoriesUI();
        }

        //搜索结果展示
        cDiv.append($("<div id='hotwords' class='hotwords' style='display:none'></div>"));
        resolveScroll();
    }

    //首页搜索页面
    function createUI() {
        if ($(".header-wrap").length > 0) return;

        var cDiv = $("<div>", {
            "class": "header-wrap",
        }).appendTo($("body"));

        var iDiv = $("<div class='common-wrap search-wrap'><form class='search-style' id='form' action='javascript:void(0)' onsubmit='formSumbit'><i class='iconfont iconsousuo'></i>" +
            "<input type='text' placeholder='搜索' id='searchTxt' autocomplete='off' ><span class='search-type'></span>" +
            "<div class='clearBtn'><img src='FMPM_CommonMap/images/return.png' alt=''></div></form>" +
            "<div class='returnBtn'><span>取消</span></div></div>");

        cDiv.append(iDiv);

        //路线按钮
        if (fmp.config.routePage) {
            $('.search-style').append($("<div class='route-line'><i class='iconfont iconluxian'></i><span>路线</span></div>"))
        }

        //点击路线
        $('.route-line').on('click', function () {
            //初始化样式
            resetFacUI();

            if (fmp.routeTpl) fmp.routeTpl.showPanel();
            $(".route-wrap input[name='startTxt'] ").focus();
            $('.facility-wrap ul').find('li[class=facility-active]').removeClass('facility-active');
        });

        //模糊搜索
        var isInputZh = false;
        $("#searchTxt").on({
            'compositionstart': function () {
                isInputZh = true;
            },
            'compositionend': function () {
                isInputZh = false;
                if (isInputZh) return;
                var keyword = this.value;
                realSearch(keyword)
            },
            'input': function (e) {
                if (isInputZh) return;
                var keyword = this.value;
                realSearch(keyword)
            }
        })

        //取消按钮
        $(".returnBtn").on('click', function () {
            resetUI();
            fmp.map.showTool();
            fmp.map.resetToolbar();
            fmp.markers.removeAllMarkers();
            fmp.map.clearModelSel();
            $('.info-wrap').hide();
            $('.facility-wrap').show();
        });

        //清空按钮
        $(".clearBtn").on('click', function () {
            $('#searchTxt').val('');
            $(".route-line").hide();
            $(".category-pop").show();
            $('.category-cont.types').show();
            $('.category-pop .history-query').show();
            $(".hotwords").hide();
            $('#searchTxt').show();
            $(".clearBtn").hide();
            $(".search-type").hide();
            $('.info-wrap').hide();
            $('.fm-control-zoom').hide();
        });

        //主页搜索框获取焦点事件
        $("#searchTxt").on('focus', function () {
            $('.facility-wrap ul').find('li[class=facility-active]').removeClass('facility-active');
            //隐藏工具栏
            fmp.map.hideTool();

            //隐藏发现设施
            $('.facility-wrap').hide();

            //初始化样式
            resetFacUI();
            fmp.map.clearModelSel();

            var inputVal = $('#searchTxt').val();
            if (inputVal == null || inputVal == "") {
                $(".route-line").hide();
                $(".category-pop").show();
                $('.category-cont.types').show();
                $('.category-pop .history-query').show();
                $(".returnBtn").show();
            } else {
                $(".category-pop").show();
                $(".hotwords").show();
                $('.category-cont.types').hide();
                $('.category-pop .history-query').hide();
                realSearch(inputVal)
            }

            $('.header-wrap .discovery-facility ul li').removeClass("facility-active");//重置发现设施样式
        });

        //手机软键盘搜索功能
        $("#searchTxt").keypress(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                $('input').blur()
                return false;
            }
        })

    }

    //搜索
    function realSearch(keyword, type) {
        if (keyword == '') {
            $('.category-cont').show();
            $('.hotwords').hide();
            $(".search-style .clearBtn").hide();
            $('.category-pop .history-query').show();
            return false;
        }
        $(".category-cont").hide();
        $(".search-style .clearBtn").show();
        $(".category-pop").show();
        $(".category-pop .history-query").hide();
        //根据关键字查询结果
        var searchResult = searchBykeyWord(keyword);
        //显示搜索列表
        showSearchList(searchResult, keyword)
    }

    //关键词搜索
    function searchBykeyWord(keyword) {
        var modelRes = [];
        //搜索地图元素
        var params = {
            keyword: keyword,
            nodeType: 5,
        };
        modelRes = fmp.search.searchByParams(params);
        return modelRes;
    }

    //显示搜索结果列表
    function showSearchList(data, keyword) {
        //清空前搜索内容
        $("#hotwords").empty();

        var modelRes = data;

        if (modelRes.length > 0) {
            //获取业态
            var sDiv = $("<div>", {
                "class": "type-div shop-result",
                html: '<ul class="type-list"></ul>'
            }).appendTo($("#hotwords"));

            var lis = modelRes.map(function (item, index) {
                if (keyword) {
                    var name = fmp.routeTpl.keywordHighlight(item.name, keyword);
                }
                var fid = item.FID ? item.FID : "no";
                var gname = fmp.map.getGroupNameByGid(item.groupID);

                return $('<li data-fid="' + fid + '" data-name="' + item.name + '" data-type="shop" class="search-shop">' +
                    '<div class="type-item">' +
                    '<div><h3>' + name + '</h3>' +
                    '<div class="item-det"><span class="floor">' + gname + '层</span></div></div>' +
                    '<div class="navBtn" data-fid="' + item.FID + '" data-name="' + item.name + '"><i class=\'iconfont icongo\'></i></div>' +
                    '</div>' +
                    '</li>')
            })
            $('.shop-result .type-list').append(lis)
        }

        if (modelRes.length == 0) {
            $("#hotwords").append($('<div class="no-search-list">未查询到结果</div>'))
        }

        //点击搜索结果，跳转至地图页，并且将名称保存至历史记录
        $('#hotwords li').off('click').on('click', function (event) {
            event.stopPropagation();
            event.preventDefault();
            $('#searchTxt').blur(function () {
                $('#fengMap').height(document.body.clientHeigh);
            })
            var fid = $(this).data('fid');
            fmp.map.showTool();
            if (fid == 'no') {
                layer.open({
                    skin: "warn",
                    title: false,
                    closeBtn: 0,
                    content: '建设中！',
                    btn: ['取消'],
                    yes: function (index, layero) {
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    },
                });
            } else {
                gotoMap(fid);
            }
        });

        //点击搜索结果导航箭头
        $('#hotwords li .navBtn').off('click').on('click', function (event) {
            event.stopPropagation();
            event.preventDefault();
            $('.header-wrap').hide();
            $('#hotwords').hide();
            $('.route-wrap').show();
            $('.category-pop').hide();
            fmp.map.showTool();

            fmp.markers.removeAllMarkers();

            var fid = $(this).data('fid');
            var name = $(this).data('name');

            //当前点击店铺作为导航终点
            $("#route-panel input[name='endTxt']").val(name);
            $("#route-panel input[name='startTxt']").focus();
            fmp.globalData.endFid = fid;
        });

        $("#hotwords").css('display', 'block');
    }

    // 跳转至地图页
    function gotoMap(fid) {
        fid = fid.toString();
        var model = fmp.search.findModelByFid(fid);
        fmp.search.mapSelectModel(model);
        $('.facility-wrap').hide();
        $('.clearBtn').show();
        $('.category-pop').hide();
        $(".search-type").hide();
        $("#searchTxt").show();
        $("#searchTxt").val(model.name);
        fmp.map.setToolbar();
        historySearch({
            name: model.name,
            fid: fid,
            fengmapFloors: fmp.map.getGroupNameByGid(model.groupID),
        });
    }

    //创建历史记录界面
    function createHistoriesUI() {
        $('.category-pop').append($('<div class=\'history-query\'></div>'));
        $(".history-query").append($('<div class=\'history-cont\'></div>'));
        $(".history-cont").append($("<div class='history-head'></div>").append($("<h3>历史记录</h3>")))
            .append($("<ul class='history-list'></ul>"));
        $(".history-cont").append($("<div class='history-foot'></div>").append($("<span>清空历史记录</span>")))

        var historyData = localStorage.getItem('searchList') ? JSON.parse(localStorage.getItem('searchList')) : {};
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

        $('.history-list').append(lis);

        //点击每一个li进行地图回显
        $(".history-query").on('click', '.history-list li', function () {
            var name = $(this).find('h3').text();
            var fid = $(this).data('fid');
            var model = fmp.search.findModelByFid(fid);
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
            $("#searchTxt").val(name);
            fmp.map.showTool();
            gotoMap(fid);
        })

        // 清空历史记录
        $('.history-query .history-foot').click(function () {
            var historyData = localStorage.getItem('searchList') ? JSON.parse(localStorage.getItem('searchList')) : {};
            var appName = fmp.globalData.currentMapInfo.appName;
            var key = fmp.globalData.currentMapInfo.key;
            var mapId = fmp.globalData.currentMapInfo.mapId;
            var cur_ = appName + ';' + key + ';' + mapId;
            historyData[cur_] = [];
            localStorage.setItem('searchList', JSON.stringify(historyData))
            $('.history-list').html('');
        })
    }

    //存储搜索数据，搜索已有的，调换位置
    function historySearch(data) {
        var historyData = localStorage.getItem('searchList') ? JSON.parse(localStorage.getItem('searchList')) : {};
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
            $('.history-list li').eq(index).insertBefore($('.history-list li').eq(0))
        } else {
            historyList.unshift(data);
            $("<li data-fid='" + data.fid + "'>" +
                "<div class=\"type-item\"><div><h3>" + data.name + "</h3><div class=\"item-det\">" +
                "<span class=\"floor\">" + data.fengmapFloors + "层</span></div></div></div></li>").prependTo($('.history-list'))
            if (historyList && historyList.length > 10) {
                historyList.pop();
                $('.history-list li').eq(10).remove();
            }
        }
        historyData[cur_] = historyList;
        localStorage.setItem('searchList', JSON.stringify(historyData))
    }

    //清空marker,重置发现设施样式，重置店铺信息
    function resetFacUI() {
        $(".info-wrap").hide();
        fmp.markers.removeAllMarkers();
    }

    return {
        createUI: createUI,
        createCategoryUI: createCategoryUI,
        resetUI: resetUI,
        createHistoriesUI: createHistoriesUI,
        searchBykeyWord: searchBykeyWord,
    }
});