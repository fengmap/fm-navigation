/**
 * [search 搜索类]
 * @return {[class]} [搜索类]
 */
define('search', function () {

    var map_ = null;
    var fmSearch_ = null;  //搜索对象

    //根据参数信息进行搜索
    function searchByParams(params) {

        if (!map_ || !fmSearch_) {
            return;
        }

        var searchRequest = new fengmap.FMSearchRequest();

        //配置keyword参数
        if (params.keyword && params.keyword != '') {
            searchRequest.keyword = params.keyword;
        }

        //配置groupID参数
        if (params.groupID) {
            searchRequest.groupID = params.groupID
        }

        //配置FID参数
        if (params.FID) {
            searchRequest.FID = params.FID;
        }

        //配置FID参数
        if (params.FIDs) {
            searchRequest.FIDs = params.FIDs;
        }

        //配置typeID参数
        if (params.typeID != null) {
            searchRequest.typeID = params.typeID;
        }

        //配置nodeType参数
        if (params.nodeType != null) {
            searchRequest.nodeType = params.nodeType;
        }


        //周边查询
        if (params.circle != null) {
            searchRequest.circle = params.circle;
        }

        var sortRes = [];
        fmSearch_.query(searchRequest, function (result) {
            sortRes = result;
        });

        return sortRes;
    }


    //初始化
    function create(map) {
        map_ = map;
        fmSearch_ = new fengmap.FMSearchAnalyser(map);
    }

    //地图数据匹配
    function findModelByFid(fid) {
        fid += '';
        var params = {};
        params.FID = fid;
        params.nodeType = fengmap.FMNodeType.MODEL;
        var result = searchByParams(params);
        if (result.length > 0) {
            var model = result[0];
            if (model != null) {
                return model;
            }
        }
    }

    // 选择的地图元素
    function mapSelectModel(model) {
        if (!model) return false;
        var coord = {
            x: model.mapCoord.x,
            y: model.mapCoord.y,
            groupID: model.groupID
        };
        if (model.groupID != map_.focusGroupID) {
            map_.changeFocusToGroup({
                gid: model.groupID,
                duration: 1.5,
                callback: () => {
                    map_.moveTo(coord);
                    fmp.map.switchMapScaleLevel(fmp.globalData.searchLevel);

                    fmp.markers.addClickMarker(coord);

                    //地图高亮元素
                    var target = model.target;
                    if (target) {
                        if (fmp.globalData.pickModel && fmp.globalData.pickModel.FID != target.FID) {
                            fmp.globalData.pickModel.selected = false;
                        }
                        target.selected = true;
                        fmp.globalData.pickModel = target;
                    }
                    if (fmp.infoTpl) fmp.infoTpl.showPanel(model);
                }
            })
            return;
        }
        map_.moveTo(coord);
        fmp.map.switchMapScaleLevel(fmp.globalData.searchLevel);

        fmp.markers.addClickMarker(coord);

        //地图高亮元素
        var target = model.target;
        if (target) {
            if (fmp.globalData.pickModel && fmp.globalData.pickModel.FID != target.FID) {
                fmp.globalData.pickModel.selected = false;
            }
            target.selected = true;
            fmp.globalData.pickModel = target;
        }
        if (fmp.infoTpl) fmp.infoTpl.showPanel(model);
    }

    return {
        create: create,
        searchByParams: searchByParams,
        findModelByFid: findModelByFid,
        mapSelectModel: mapSelectModel,
    }
});





