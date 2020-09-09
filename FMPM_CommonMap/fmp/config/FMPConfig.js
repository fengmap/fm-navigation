/*
 * @Descripttion: LOGNGFOR project
 * @version: v1.0
 * @Author: chenwenji
 * @Date: 2019-12-19 18:51:58
 * @LastEditors  : chenwenji
 * @LastEditTime : 2020-02-12 16:05:28
 */
/**
 * [config 系统各个模块配置项]
 * @type {Object}
 */
fmp.config = {
    commonFolderPath: 'FMPM_CommonMap/', //配置资源的根目录，如模块内引用的图片、json、地图文件等的路径时需要。
    clickSearchInfoPage: true, //是否需要点击地图查询信息功能【显示/隐藏】
    searchBar: true, //顶部搜索栏，带搜索功能【显示/隐藏】
    searchByTypesPage: true, //业态搜索功能【显示/隐藏】
    searchHistoryPage: true, //搜索历史【显示/隐藏】
    scrollGroupControl: true, //示楼层切换控件【显示/隐藏】
    compassControl: true, //指南针控件【显示/隐藏】
    routePage: true, //路径分析功能 【显示/隐藏】
    routeHistoryBar: true,  //路径历史记录 【显示/隐藏】
    routeSearchHistoryBar: true,  //路径搜索历史 【显示/隐藏】
    viewModeSwitchBtn: true, //二三维切换按钮 【显示/隐藏】
    zoomControl: true,  //放大缩小按钮 【显示/隐藏】
    enableRouteByClickMap: true, //点击地图可选择起点、终点
    naviPage: true, //导航功能
    naviVoice: true, //语音导航
};
