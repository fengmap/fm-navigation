/**
 * [globalData 配置和fmap地图相关的配置]
 * @type {Object}
 */
fmp.globalData = {
    tile: true, //开启切片加载
    minDiffDirection: 0, //更新角度的最小值
    isNaving: false, //当前是否是导航状态
    walkingSpeed: 80, //注：人的每分钟走80米
    preNaviLevel: 16, //导航前的级别
    naviLevel: 18, //导航过程中的级别
    allMapLevel: 18, //全地图显示时的级别
    currentLevel: 18, //记录当前级别
    preNaviRotate: 0, //导航前的地图旋转角度
    originMapRotate: 0, //初始地图旋转角度
    currentMapRotate: 0, //记录当前地图旋转
    minReRouteDis: 10, //路径规划窗口我的位置更新最小距离
    isTouched: false, //是否正在点击状态
    curDirection: 0, //locMarker 当前方向
    routeDirection: 0, //记录当前导航中的当前路径的方向
    naviConstraintDis: 3, //路径偏移的最小距离
    noOpTime: 5000, //外部未操作地图的时间间隔
    finishDistance: 8, //距离终点多少米提示路径结束
    clickNodeType: 0, //点击地图类型
    poiTypes: [], //poi typeID和名称的对应关系列表
    clickMarkerType: 'im-click', //点击地图添加marker的类型名称
    pickModel: null, //选中模型点数据
    searchLevel: 20, //搜索后聚焦店铺的级别或点击店铺级别
    isMapClick: false, //地图选点
    fmapID: '10347', //地图ID带版本
    currentMapCenter: null, //当前项目是否需要初始的中心点
    currentMapLevel: null,   //当前项目是否需要初始的级别显示
    //记录起始点数据
    startFid: null,
    endFid: null,
    isStartInput: 2, //是否是地图起点输入框，2表示默认点击地图选择终点，1表示点击地图选择起点
    startFids: null,
    endFids: null,
    isNavigation: true,//是否导航
    isFindFacility: false,//点击的是发现设施
    findFacilityId: null,//点击的发现设施的id
    mapOptions: {
        //渲染dom
        container: document.getElementById('fengMap'),
        //初始二维还是三维状态,默认是3D状态
        defaultViewMode: fengmap.FMViewMode.MODE_2D,
        //初始聚焦楼层ID
        defaultFocusGroup: 1,
        //初始显示楼层ID数组
        defaultVisibleGroups: [1],
        //初始指北针的偏移量
        compassOffset: [15, 60],
        //指北针大小默认配置
        compassSize: 44,
        // 默认比例尺级别设置为20级
        defaultMapScaleLevel: 19,
        // 分层加载
        // tile: true,
        //必要，地图应用名称，通过蜂鸟云后台创建
        appName: '蜂鸟研发SDK_2_0',
        //必要，地图应用密钥，通过蜂鸟云后台获取
        key: '57c7f309aca507497d028a9c00207cf8',
        //默认地图指北
        defaultControlsPose: 0,
        //默认高亮效果取消
        modelSelectedEffect: false,
    },
    scrollCtrlOption: {
        //默认在右上角
        position: fengmap.FMControlPosition.RIGHT_BOTTOM,
        //默认显示楼层的个数
        showBtnCount: 3,
        //初始是否是多层显示，默认单层显示
        allLayer: false,
        //是否显示多层/单层切换按钮
        needAllLayerBtn: true,
        //位置x,y的偏移量
        offset: {
            x: -15,
            y: -85
        },
        height: 32,
        imgURL: "FMPM_CommonMap/images/"
    },
    zoomCtlOpt: {
        position: fengmap.FMControlPosition.RIGHT_BOTTOM,
        //位置x,y的偏移量
        offset: {
            x: -15,
            y: -15
        },
        imgURL: "FMPM_CommonMap/images/"
    },
    toolCtlOpt: {
        position: fengmap.FMControlPosition.RIGHT_BOTTOM,
        //位置x,y的偏移量
        offset: {
            x: -15,
            y: -240
        },
        //初始化2D模式
        init2D: true,
        //当楼层切换按钮存在时,设置初始默认-false表示显示单层状态，true表示显示多层状态,.
        initGroups: false,
        //设置为false表示不显示,即只显示2D,3D切换按钮
        groupsButtonNeeded: false,
        //设置为false表示不显示,即只显示楼层切换按钮
        viewModeButtonNeeded: true,
        imgURL: "FMPM_CommonMap/images/"
    },
    //线型配置
    lineStyle: {
        //设置线为导航线样式
        lineType: fengmap.FMLineType.FMARROW,
        lineWidth: 3,
        //设置线的颜色
        // godColor: '#FF0000',
        //设置边线的颜色
        // godEdgeColor: '#920000',
    },
    //路径起点marker 配置
    routeStartMarkerOpt: {
        url: 'FMPM_CommonMap/images/start.png',
        size: 32,
        height: 2.5,
        anchor: fengmap.FMMarkerAnchor.TOP
    },
    //路径终点marker 配置
    routeEndMarkerOpt: {
        url: 'FMPM_CommonMap/images/end.png',
        size: 32,
        height: 2.5,
        anchor: fengmap.FMMarkerAnchor.TOP
    },
    //模拟导航的配置
    simulateNaviOptions: {
        locationMarkerUrl: 'FMPM_CommonMap/images/pointer.png',
        //设置Marker尺寸
        locationMarkerSize: 43,
        //设置跟随定位的默认为true
        followPosition: true,
        speed: 1, //5m/秒
        //模拟导航时是否改变地图角度，默认false
        followAngle: true,
        //是否在导航开始时改变地图的倾斜角度,默认为true
        changeTiltAngle: true,
        //导航跟随倾斜角度
        tiltAngle: 80,
        //模拟导航开始时地图的显示比例尺, 默认值为282,表示1:282的地图比例尺。对应比例尺级别21。
        scale: 282,
        //扶梯优先, 扶梯 > 直梯 > 步行梯
        naviPriority: fengmap.FMNaviPriority.PRIORITY_ESCALATORFIRST,
    },
    facilityType: [
        {
            name: "卫生间",
            facilityID: 200002, 
            icon: "iconweishengjian1"
        },
        // {
        //     name: "导诊台",
        //     facilityID: 200014,
        //     icon: "iconfenzhentai"
        // },
        // {
        //     name: "服务台",
        //     facilityID: 200008,
        //     icon: "iconfuwutai"
        // },
        {
            name: "开水间",
            facilityID: 200207,
            icon: "iconkaishuijian1"
        },
        {
            name: "直梯",
            facilityID: 200004,
            icon: "iconketi"
        },
        {
            name: "扶梯",
            facilityID: 200003,
            icon: "iconfuti"
        },
        {
            name: "步行梯",
            facilityID: 200005,
            icon: "iconbuhangti1"
        },
        {
            name: "出入口",
            facilityID: 200001,
            icon: "iconchurukou"
        }
    ],
};
