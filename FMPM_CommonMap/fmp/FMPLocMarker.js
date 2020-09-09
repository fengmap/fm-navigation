/**
 * [markers 图标类]
 * @param  {[type]} fmap    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
define('locMarker', function () {
    var map_ = null;

    var locationMarker = null; //记录当前的locMarker
    var markerOptions = {}; //根据每种类型设置不同类型marker的属性

    //显示我的定位标注
    function showMyLocation(myCoord) {
        if (!locationMarker) {
            var m_opt = getMarkerOpt();
            locationMarker = new fengmap.FMLocationMarker({
                groupID: myCoord.groupID,
                url: m_opt.url,
                size: m_opt.size,
                height: m_opt.height,
            });

            map_.addLocationMarker(locationMarker);
        }

        locationMarker.show = true;

        if (myCoord) updateLocMarkerPos(myCoord);
    }

    //设置marker的属性
    function setMarkerOpt(options) {
        if (!markerOptions) markerOptions = {};
        markerOptions = options;
    }

    //获取marker 属性
    function getMarkerOpt() {
        var resOpt = markerOptions;

        if (!resOpt) resOpt = {};

        resOpt.url = resOpt.url || 'images/pointer.png';
        resOpt.size = resOpt.size || 32;
        resOpt.height = resOpt.height || 0;

        return resOpt;
    }

    //隐藏我的位置的marker
    function hideMyLocMarker() {
        if (locationMarker) {
            locationMarker.show = false;
        }
    }

    //更新定位坐标
    function updateLocMarkerPos(coord) {
        if (!coord.groupID) return;
        locationMarker.setPosition({
            //设置定位点的x坐标
            x: coord.x,
            //设置定位点的y坐标
            y: coord.y,
            //设置定位点所在楼层
            groupID: coord.groupID,
            //设置标注高度
            height: 1,
        });

    }

    //只更新方向
    function updateLocMarkerDirect(angle) {
        if (locationMarker && typeof angle == 'number' && (locationMarker.direction - angle > fmp.globalData.minDiffDirection))
            locationMarker.direction = angle;
        // console.log('update marker direction', angle);
    }

    //初始化
    function create(map) {
        map_ = map;
    }

    return {
        create: create,
        getMarkerOpt: getMarkerOpt,
        setMarkerOpt: setMarkerOpt,
        showMyLocation: showMyLocation,
        hideMyLocMarker: hideMyLocMarker,
        updateLocMarkerPos: updateLocMarkerPos,
        updateLocMarkerDirect: updateLocMarkerDirect
    }
});
