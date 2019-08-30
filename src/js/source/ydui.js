/**
 * ydui main
 */
!function (window) {
	"use strict";

	var doc = window.document,
		ydui = {};

	/**
	 * 直接绑定FastClick
	 */
	$(window).on('load', function () {
		typeof FastClick == 'function' && FastClick.attach(doc.body);
	});

	var util = ydui.util = {
		/**
		 * 检测手机号码
		 * @param str
		 */
		isPhoneNumber: function (str) {
			return !!str.match(/^(13[0-9]|(14[5|7])|15([0-3]|[5-9])|17[678]|18[0-9])[0-9]{8}$/);
		},
		/**
		 * Ajax封装
		 * @param option
		 */
		ajax: function (option) {
			var defaults = {
				type: 'POST',
				url: '',
				data: '',
				dataType: 'json',
				success: function () {
				},
				error: function () {
					window.YDUI.dialog.loading.close();
					window.YDUI.dialog.toast('请求失败', 'error', 1500);
				}
			};
			$.ajax($.extend({}, defaults, option));
		},

		/**
		 * 获取selector下的json对象
		 * @param selector
		 * @param json
		 */
		getJsonData: function (selector, json) {
			var o = {};
			$(selector + ' [parameter]').each(function () {
				var $this = $(this);
				o[$this.attr('parameter')] = $.trim($this.val() || $this.text());
			});
			return $.extend({}, o, json || {});
		},
		/**
		 * 格式化参数
		 * @param string
		 */
		parseOptions: function (string) {
			if ($.isPlainObject(string)) {
				return string;
			}

			var start = (string ? string.indexOf('{') : -1),
				options = {};

			if (start != -1) {
				try {
					options = (new Function('', 'var json = ' + string.substr(start) + '; return JSON.parse(JSON.stringify(json));'))();
				} catch (e) {
				}
			}
			return options;
		},
		/**
		 * 页面滚动方法【移动端】
		 * @type {{lock, unlock}}
		 * lock：禁止页面滚动, unlock：释放页面滚动
		 */
		pageScroll: function () {
			var fn = function (e) {
				e.preventDefault();
				e.stopPropagation();
			};
			var islock = false;

			return {
				lock: function () {
					if (islock)return;
					islock = true;
					doc.addEventListener('touchmove', fn);
				},
				unlock: function () {
					islock = false;
					doc.removeEventListener('touchmove', fn);
				}
			};
		}(),
		/**
		 * 本地存储
		 */
		localStorage: function () {
			return storage(window.localStorage);
		}(),
		/**
		 * Session存储
		 */
		sessionStorage: function () {
			return storage(window.sessionStorage);
		}(),
		/**
		 * 序列化
		 * @param value
		 * @returns {string}
		 */
		serialize: function (value) {
			if (typeof value === 'string') return value;
			return JSON.stringify(value);
		},
		/**
		 * 反序列化
		 * @param value
		 * @returns {*}
		 */
		deserialize: function (value) {
			if (typeof value !== 'string') return undefined;
			try {
				return JSON.parse(value);
			} catch (e) {
				return value || undefined;
			}
		}
	};

	/**
	 * HTML5存储
	 */
	function storage(ls) {
		return {
			set: function (key, value) {
				ls.setItem(key, util.serialize(value));
			},
			get: function (key) {
				return util.deserialize(ls.getItem(key));
			},
			remove: function (key) {
				ls.removeItem(key);
			},
			clear: function () {
				ls.clear();
			}
		};
	}

	/**
	 * 判断css3动画是否执行完毕
	 * @git http://blog.alexmaccaw.com/css-transitions
	 * @param duration
	 */
	$.fn.emulateTransitionEnd = function (duration) {
		var called = false,
			$el = this;

		$(this).one('webkitTransitionEnd', function () {
			called = true;
		});

		var callback = function () {
			if (!called) $($el).trigger('webkitTransitionEnd');
		};

		setTimeout(callback, duration);
	};

	if (typeof define === 'function') {
		define(ydui);
	} else {
		window.YDUI = ydui;
	}

}(window);
