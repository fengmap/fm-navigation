/**
 * [event 点击事件处理]
 */
/**
 * 处理地图区域的点击事件
 */
fmp.events = {
	create: function() {
		var isTouched = false;
		var _id = null;
		//preTouchedTime = 0;

		var mousedownfun = function(event) {
			if (fmp.globalData.isNaving) {
				//preTouchedTime = new Date().getTime();
				isTouched = true;
			} else {
				isTouched = false;
			}
		};
		var mouseupfun = function(event) {
			if (fmp.globalData.isNaving) {
				isTouched = false;
			} else {
				isTouched = true;
			}
			//preTouchedTime = new Date().getTime();
			// console.log('mouse up');
		};

		var mousemovefun = function(event) {
			if (fmp.globalData.isNaving) {
				//preTouchedTime = new Date().getTime();
				isTouched = true;
			} else {
				isTouched = false;
			}
		};

		//绑定click事件
		var bindMapClickEvent_ = function() {
			document.getElementById('fengMap').addEventListener('mousedown', mousedownfun);
			document.getElementById('fengMap').addEventListener('mousemove', mousemovefun);
			document.getElementById('fengMap').addEventListener('mouseup', mouseupfun);
			document.getElementById('fengMap').addEventListener('touchstart', mousedownfun);
			document.getElementById('fengMap').addEventListener('touchmove', mousemovefun);
			document.getElementById('fengMap').addEventListener('touchend', mouseupfun);
		}

		return {
			bindMapClickEvent: bindMapClickEvent_,
			//preTouchedTime: preTouchedTime,
			isTouched: isTouched
		}
	}
};