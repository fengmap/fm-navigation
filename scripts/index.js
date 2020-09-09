/**
 * [requireReady 按需加载的类显示完成回调]
 * @return {[type]} [description]
 */
var isMapLoaded = false;

function requireReady() {
    if (fmp.map && !isMapLoaded) {
        isMapLoaded = true;

        //打开地图
        fmp.map.create({
            element: 'fengMap'
        });
        fmp.map.openMap();

        //如果有点击地图查询信息功能或有点击地图设置起点、终点功能
        if (fmp.config.clickSearchInfoPage || fmp.config.enableRouteByClickMap)
            fmp.map.mapClickCallback = mapClickCallback;
    }
    deviceType();
}

//判断设备类型
function deviceType() {
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    var deviceType = null;
    if (isAndroid) {
        deviceType = 'android';
    } else if (isiOS) {
        deviceType = 'ios';
    }
    if (fmp.globalData) {
        fmp.globalData.deviceType = deviceType;
    }
}

//非导航模式下的地图点击事件会回调
function mapClickCallback(event) {
    // console.log('map clicked');
}