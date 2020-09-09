/**
 * [markers 图标类]
 * @param  {[type]} fmap    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
define('markers', function () {
    var map_ = null;

    var markers = {}; //记录系统所有添加的image markers
    var options = {}; //设置添加的图片地址/尺寸、高度

    var markerOptions = {}; //根据每种类型设置不同类型marker的属性
    var clickMarker = null;

    //获取marker 属性
    function getMarkerOpt(type) {
        var resOpt = markerOptions[type];

        if (!resOpt) resOpt = {};

        resOpt.imgUrl = resOpt.imgUrl || 'images/loc.png';
        resOpt.size = resOpt.size || 32;
        resOpt.height = resOpt.height || 0.1;

        return resOpt;
    }

    //添加标注
    function addMarker(gid, coord, cb) {
        if (!map_) return;
        var group = map_.getFMGroup(gid);

        //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
        var _layer = group.getOrCreateLayer('imageMarker');

        var m_opt = getMarkerOpt();
        var im = new fengmap.FMImageMarker({
            x: coord.x,
            y: coord.y,
            url: m_opt.imgUrl,
            size: m_opt.size,
            height: m_opt.height,
            anchor:fengmap.FMMarkerAnchor.TOP
        });
        _layer.addMarker(im);

        return im;
    }

    //批量添加标注
    function addManyMarker(models) {
        if (!map_) return;
        var groups = map_.groupIDs;
        var group = null;
        var _layer = null;
        var m_opt = getMarkerOpt();
        for (var i = 0; i < groups.length; i++) {
            group = map_.getFMGroup(groups[i]);
            _layer = group.getOrCreateLayer('imageMarker');
            for (var j = 0; j < models.length; j++) {
                if (models[j].groupID == groups[i] ) {
                    var im = new fengmap.FMImageMarker({
                        x: models[j].mapCoord.x,
                        y: models[j].mapCoord.y,
                        url: fmp.config.commonFolderPath + 'images/loc.png',
                        size: m_opt.size,
                        height: m_opt.height,
                        anchor:fengmap.FMMarkerAnchor.TOP
                    });
                    _layer.addMarker(im);
                }
            }
        }
    }

	//删除所有标注
	function removeAllMarkers() {
		var groups = map_.groupIDs;
		var group = null;
		var _layer = null;
		for (var i = 0; i < groups.length; i++) {
			group = map_.getFMGroup(groups[i]);
			_layer = group.getOrCreateLayer('imageMarker');
			_layer.removeAll();
		}
	}


    //初始化
    function create(map) {
        map_ = map;
    }

    function addClickMarker(coord) {
        if (!map_) return;
        var group = map_.getFMGroup(coord.groupID);
        var layer = group.getOrCreateLayer('imageMarker');
        removeAllMarkers();
        var m_opt = getMarkerOpt();
        clickMarker = new fengmap.FMImageMarker({
            x: coord.x,
            y: coord.y,
            url: fmp.config.commonFolderPath + 'images/loc.png',
            size: m_opt.size,
            height: m_opt.height,
            anchor:fengmap.FMMarkerAnchor.TOP
        });
        layer.addMarker(clickMarker);
    }

    return {
        create: create,
        getMarkerOpt: getMarkerOpt,
        addMarker: addMarker,
        addClickMarker: addClickMarker,
        addManyMarker: addManyMarker,
		removeAllMarkers: removeAllMarkers,
    }
});
