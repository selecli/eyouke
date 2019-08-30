!function (window) {

	/* 设计图文档宽度 */
	var docWidth = 750;

	var doc = window.document,
		docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

	var recalc = (function refreshRem() {
		var clientWidth = docEl.getBoundingClientRect().width;

		/* 8.55：小于320px不再缩小，11.2：大于420px不再放大 */
		docEl.style.fontSize = Math.max(Math.min(20 * (clientWidth / docWidth), 11.2), 8.55) * 5 + 'px';

		return refreshRem;
	})();

	/* 添加倍屏标识，安卓倍屏为1 */
	docEl.setAttribute('data-dpr', window.navigator.appVersion.match(/iphone/gi) ? window.devicePixelRatio : 1);

	if (/iP(hone|od|ad)/.test(window.navigator.userAgent)) {
		/* 添加IOS标识 */
		doc.documentElement.classList.add('ios');
		/* IOS8以上给html添加hairline样式，以便特殊处理 */
		if (parseInt(window.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)[1], 10) >= 8)
			doc.documentElement.classList.add('hairline');
	}

	if (!doc.addEventListener) return;
	window.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);

	window.document.addEventListener('touchstart', function () {}, false);

	Date.prototype.Format = function (fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}
}(window);
