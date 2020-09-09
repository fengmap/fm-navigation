/**
 * [requirejs 配置]
 * 载入主程序模块
 */
if (typeof requirejs != 'undefined') {
    requirejs.config({
        baseUrl: 'FMPM_CommonMap/',
        paths: {
            'fengmap': 'lib/fengmap.min',
            'jquery': 'lib/jquery-3.4.1.min',
            'layer': 'lib/layer',
            "baidutts": "lib/baidu_tts_cors",
            'fmp': 'fmp/FMPInit',
            'fmp.config': 'fmp/config/FMPConfig',
            'fmp.globalData': 'fmp/config/FMPGlobalData',
            'fmp.events': 'fmp/FMPEvent',
            'map': 'fmp/FMPMap',
            'search': 'fmp/FMPSearch',
            'markers': 'fmp/FMPMarkers',
            'navi': 'fmp/FMPNavi',
            'voice': 'fmp/FMPBaiduVoice',
            'locMarker': 'fmp/FMPLocMarker',
            'orientateEvent': 'fmp/FMPOrientationEvent',
            'tplUtil': 'fmp/views/FMPTplUtil',
            'infoTpl': 'fmp/views/FMPInfoTpl',
            'routeInfoTpl': 'fmp/views/FMPRouteInfo',
            'routeTpl': 'fmp/views/FMPRouteTpl',
            'routeTipTpl': 'fmp/views/FMPRouteTipTpl',
            'searchTpl': 'fmp/views/FMPSearchTpl',
            'toolsTpl': 'fmp/views/FMPToolsTpl',
            'findFacility': 'fmp/views/FMPFindFacility',
        },
        shim: {
            fmp: {
                exports: 'fmp'
            },
            layer: {
                exports: 'layer'
            },
            'fmp.config': {
                exports: 'fmp.config'
            },
            'fmp.globalData': {
                exports: 'fmp.globalData'
            },
            'fmp.message': {
                exports: 'fmp.message'
            },
            'fmp.events': {
                exports: 'fmp.events'
            },
            'orientateEvent': {
                exports: 'orientateEvent'
            }
        }
    });

    //引入首页需加载的库文件
    requirejs(['fengmap', 'jquery', 'fmp', 'layer'], function (fengmap, $, fmp, layer) {
        $("body").append($("<div id='loader'><div id='loadContent'></div></div>"));
        $('body').height($('body')[0].clientHeight);
        $('#fengMap').height(document.body.clientHeight);
        $('body').height($('body')[0].clientHeight);
        $('#loading').height(document.body.clientHeight);
        window.layer = layer;
        requirejs(['fmp.config', 'fmp.globalData', 'map'], function (config, globaldata, map) {
            fmp.map = map;

            requirejs(['search', 'markers'], function (search, markers) {
                fmp.search = search;
                fmp.markers = markers;
            });

            //搜索ui界面加载
            requirejs(['searchTpl'], function (searchTpl) {
                fmp.searchTpl = searchTpl;
                // loadedArr.push('searchTpl');
                if (fmp.searchTpl)
                    fmp.searchTpl.createUI();
                fmp.searchTpl.createCategoryUI();
            });

            //路线ui界面加载
            requirejs(['routeTpl'], function (routeTpl) {
                fmp.routeTpl = routeTpl;
                if (fmp.routeTpl) fmp.routeTpl.createUI();
            });

            //地图选点确认卡展示
            requirejs(['routeInfoTpl'], function (routeInfoTpl) {
                fmp.routeInfoTpl = routeInfoTpl;
                //创建确认卡界面
                if (fmp.routeInfoTpl) fmp.routeInfoTpl.createUI();
            });

            //信息窗界面
            requirejs(['infoTpl'], function (infoTpl) {
                fmp.infoTpl = infoTpl;
                fmp.infoTpl.createUI();
            });

             //发现设施组件
             requirejs(['findFacility'], function (findFacility) {
                fmp.findFacility = findFacility;
                fmp.findFacility.createUI();
            });

            requireReady();
        });
    });
}
