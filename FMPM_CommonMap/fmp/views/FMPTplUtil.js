/**
 * [界面工具类]
 * @param  {[type]}
 * @return {[type]}   [description]
 */
define('tplUtil', function() {
	var pageindex = 0;
	var pageIndex = {
		get pageIndex() {
			return pageindex;
		},

		set pageIndex(value) {
			pageindex = value;
		}
	};


	//获取界面中需要的json数据结构
	function getDataFromModel(model) {
		var data_ = {
			//fid: model.fid,
			x: model.mapCoord.x,
			y: model.mapCoord.y,
			groupID: model.groupID,
			name: model.name,
			groupName: model.groupName,
			type: model.typeID
		};
		data_.name = (!data_.name || data_.name == '' ? '地图选点' : data_.name);
		return data_;
	}

	//根据类名和坐标点对象填充当前dome的data属性
	function setInputDataAttr(classname, point) {
		if (!point) return;
		$(classname).data("x", point.x);
		$(classname).data("y", point.y);
		$(classname).data("gid", point.groupID);
	}

	//根据dom类名获取data信息
	function getPointByName(classname) {
		return {
			x: $(classname).data("x"),
			y: $(classname).data("y"),
			groupID: $(classname).data("gid")
		}
	}

	//获取分类数据，typeID和名称的对应关系
	function getPoiTypes(url, cb) {
		url = url || '../data/poitype.json';

		//获取json数据
		$.getJSON(url, function(data) {
			var jsonData = data.poiTypes;
			fmp.globalData.poiTypes = jsonData;

			if (cb && typeof cb == 'function') cb(jsonData);
		});
	}

	//当前是否已存在弹出窗口
	function hasPopWin() {
		if ($(".layui-layer-shade").css('display') && $(".layui-layer-shade").css('display') != 'none') return true;
		if ($('.layui-layer.layui-layer-dialog').css('display') != 'none' && $('.layui-layer.layui-layer-dialog').find('.layui-layer-btn').children().length == 2) return true;
		return false;
	}

	return {
		hasPopWin: hasPopWin,
		getDataFromModel: getDataFromModel,
		setInputDataAttr: setInputDataAttr,
		getPointByName: getPointByName,
		getPoiTypes: getPoiTypes,
		pageIndex: pageIndex.pageIndex
	}
});
