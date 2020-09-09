/**
 * [infoTpl 点击地图显示信息]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('infoTpl', ['tplUtil'], function (tplUtil) {
    fmp.tplUtil = tplUtil;

    var _fid = null;
    var res = null;
    var name = null;

    //显示信息窗口
    function showPanel(data) {
        res = data;
        //设置工具栏高度
        fmp.map.setToolbar();
        _fid = data.FID;
        name = data.name ? data.name : '位置';
        $(".info-wrap").css("display", "block");
        $('.facility-info-wrap').hide();
        $('.info-wrap-inner').show();
        $('.info-wrap .info-wrap-inner .modelname').text(name);
        $(".info-wrap .info-tel-btn a").attr("href", "#");
    }

    //隐藏信息窗口
    function hideInfoPanel() {
        $(".info-wrap").css("display", "none");
        $(".info-cho-wrap").css("display", "none");
    }

    //创建DOM
    function createUI(fmap) {
        if ($('.info-wrap').length > 0) return;

        var cDiv = $("<div>", {
            "class": "info-wrap",
            "html": "<div class='info-wrap-inner'></div>"
        }).appendTo($("body"));

        var iDiv = $("<div>", {
            "class": "info-wrap-detail",
            "html": "<div class='info-detail-msg'><h5 class='modelname'></h5><span class='info-route-btn'><i class=\"iconfont iconluxian\"></i>查路线</span><i class='iconfont iconguanbi'></i></div>"
        }).appendTo($(".info-wrap-inner"));

        var $cho = $("<div>", {
            "class": "info-cho-wrap",
            "html": "<div class='info-cho-inner'><div class='info-cho-detail'><h5></h5><span></span><span></span></div><div class='info-cho-btn'>确定选点</div></div>"
        }).appendTo($("body"))

        //点击查路线
        $(".info-wrap .info-route-btn").on("click", function () {
            $('.facility-wrap ul').find('li[class=facility-active]').removeClass('facility-active');

            $('.header-wrap').hide();
            $('.info-wrap').hide();
            $('#route-panel').show();

            fmp.markers.removeAllMarkers();

            //当前点击店铺作为导航终点
            $("#route-panel input[name='endTxt']").val(name);
            $("#route-panel input[name='startTxt']").focus();
            fmp.globalData.endFid = _fid;
        })

        //关闭显示信息
        $('.info-wrap .iconguanbi').on('click', function () {
            fmp.searchTpl.resetUI();
            fmp.map.showTool();
            fmp.map.resetToolbar();
            fmp.markers.removeAllMarkers();
            fmp.map.clearModelSel();
            $('.info-wrap').hide();
            $('.facility-wrap').show();
        });
    }

    return {
        createUI: createUI,
        showPanel: showPanel,
        hidePanel: hideInfoPanel
    }
});
