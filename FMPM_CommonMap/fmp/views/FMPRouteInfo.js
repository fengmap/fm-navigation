/**
 * [infoTpl 地图选点及导航显示信息]
 * @param  {[type]} ) {	return     {	}} [description]
 * @return {[type]}   [description]
 */
define('routeInfoTpl', ['tplUtil'], function (tplUtil) {
    fmp.tplUtil = tplUtil;
    var model = null;
    var facilityModel = null;
    var floor = null;
    var _fid = null;

    //显示信息窗口
    function showInfoPanel(target) {
        _fid = target.FID;
        facilityModel = fmp.search.findModelByFid(_fid);
        $(".route-info-wrap").css("display", "block");
        floor = target.groupID && fmp.map.getGroupNameByGid(target.groupID);
        $('.route-info-wrap .modelname').text(target.name);
        $('.route-info-wrap .floor').text(floor + '层');//楼层
    }

    //隐藏信息窗口
    function hideInfoPanel() {
        $(".route-info-wrap").css("display", "none");
    }

    //创建DOM
    function createUI(fmap) {
        if ($('.route-info-wrap').length > 0) return;

        var cDiv = $("<div>", {
            "class": "route-info-wrap",
        }).appendTo($("body"));

        var iDiv = $("<div>", {
            "class": "route-info-detail",
            "html": "<div class='route-info-msg'>" +
                "<h5 class='modelname'></h5>" +
                "<span class='floor'></span></div><div class='info-cho-btn'><span>确定起点</span></div>"
        }).appendTo($(".route-info-wrap"));

        // 确认选点
        $('.info-cho-btn').on('click', function () {
            fmp.routeTpl.showPanel();

            if (fmp.globalData.isStartInput == 1) {
                fmp.globalData.startFid = facilityModel.FID;
                $("#route-panel input[name='startTxt']").val(facilityModel.name ? facilityModel.name : '位置');
            } else {
                fmp.globalData.endFid = facilityModel.FID;
                $("#route-panel input[name='endTxt']").val(facilityModel.name ? facilityModel.name : '位置');
            }

            fmp.routeTpl.planRoute();

            //保存搜索记录
            fmp.routeTpl.historySearch({
                name: facilityModel.name ? facilityModel.name : '位置',
                fid: facilityModel.FID,
                fengmapFloors: floor,
            });
        });
    }


    return {
        createUI: createUI,
        showPanel: showInfoPanel,
        hidePanel: hideInfoPanel
    }
});
