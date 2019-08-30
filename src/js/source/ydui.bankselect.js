/**
 * BankSelect Plugin
 */
!function (window) {
	"use strict";

	var $body = $(window.document.body);

	function BankSelect(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, BankSelect.DEFAULTS, options || {});
		this.init();
	}

	BankSelect.DEFAULTS = {
		url: '/',
		data: {},
		provance: '',
		city: '',
		area: ''
	};

	BankSelect.prototype.init = function () {
		var _this = this,
			options = _this.options;

		if (typeof BANK_CITYS == 'undefined') {
			console.error('请在ydui.js前引入ydui.citys.js。下载地址：http://cityselect.ydui.org');
			return;
		}

		_this.citys = BANK_CITYS;

		_this.createDOM();

		_this.defaultSet = {
			provance: options.provance,
			city: options.city,
			area: options.area
		};
	};


	BankSelect.prototype.open = function (arg) {
		var _this = this;
		_this.options.data = $.extend({}, _this.options.data, arg || {});
		$body.append(_this.$mask);

		// 防止火狐浏览器文本框丑丑的一坨小水滴
		YDUI.device.isMozilla && _this.$element.blur();

		_this.$mask.on('click.ydui.cityselect.mask', function () {
			_this.close();
		});

		var $cityElement = _this.$cityElement,
			defaultSet = _this.defaultSet;

		$cityElement.find('.cityselect-content').removeClass('cityselect-move-animate').css('transform', 'translate(0, 0)');

		_this.loadProvance();

		if (defaultSet.provance) {
			_this.setNavTxt(0, defaultSet.provance);
		} else {
			$cityElement.find('.cityselect-nav a').eq(0).addClass('crt').html('请选择');
		}

		if (defaultSet.city) {
			_this.loadCity();
			_this.setNavTxt(1, defaultSet.city)
		}

		if (defaultSet.area) {
			_this.loadArea(function () {
				_this.ForwardView(false, 1);
				_this.setNavTxt(2, defaultSet.area);
				if (defaultSet.bank) {
					_this.loadBank();
					_this.ForwardView(false, 2, 75);
					_this.setNavTxt(3, defaultSet.bank);
				}
			});
		}
		$cityElement.addClass('brouce-in');
	};

	BankSelect.prototype.close = function () {
		var _this = this;

		_this.$mask.remove();
		_this.$cityElement.removeClass('brouce-in').find('.cityselect-nav a').removeClass('crt').html('');
		_this.$itemBox.html('');
	};

	BankSelect.prototype.createDOM = function () {
		var _this = this;

		_this.$mask = $('<div class="mask-black"></div>');

		_this.$cityElement = $('' +
			'<div class="m-cityselect">' +
			'    <div class="cityselect-header">' +
			'        <p class="cityselect-title">请选择支行</p>' +
			'        <div class="cityselect-nav">' +
			'            <a href="javascript:;" ></a>' +
			'            <a href="javascript:;"></a>' +
			'            <a href="javascript:;"></a>' +
			'            <a href="javascript:;"></a>' +
			'        </div>' +
			'    </div>' +
			'    <ul class="cityselect-content">' +
			'        <li class="cityselect-item">' +
			'            <div class="cityselect-item-box"></div>' +
			'        </li>' +
			'        <li class="cityselect-item">' +
			'            <div class="cityselect-item-box"></div>' +
			'        </li>' +
			'        <li class="cityselect-item">' +
			'            <div class="cityselect-item-box"></div>' +
			'        </li>' +
			'        <li class="cityselect-item full-width">' +
			'            <div class="cityselect-item-box"></div>' +
			'        </li>' +
			'    </ul>' +
			'</div>');

		$body.append(_this.$cityElement);

		_this.$itemBox = _this.$cityElement.find('.cityselect-item-box');

		_this.$cityElement.on('click.ydui.cityselect', '.cityselect-nav a', function () {
			var $this = $(this);

			$this.addClass('crt').siblings().removeClass('crt');

			$this.index() < 3 ? _this.backOffView($this.index()) : _this.ForwardView(true, $this.index());
		});
	};

	BankSelect.prototype.setNavTxt = function (index, txt) {

		var $nav = this.$cityElement.find('.cityselect-nav a');

		index < 3 && $nav.removeClass('crt');

		$nav.eq(index).html(txt);
		$nav.eq(index + 1).addClass('crt').html('请选择');
		$nav.eq(index + 2).removeClass('crt').html('');
		$nav.eq(index + 3).removeClass('crt').html('');
	};

	BankSelect.prototype.backOffView = function (index) {
		this.$cityElement.find('.cityselect-content').removeClass('cityselect-next')
			.addClass('cityselect-move-animate').css('transform', 'translate(-' + index * 50 + '%, 0)');
	};

	BankSelect.prototype.ForwardView = function (animate, index, step) {
		step = step || 50;
		this.$cityElement.find('.cityselect-content').removeClass('cityselect-move-animate cityselect-prev')
			.addClass((animate ? 'cityselect-move-animate' : '')).css('transform', 'translate(-' + index * step + '%, 0)');
	};

	BankSelect.prototype.bindItemEvent = function () {
		var _this = this,
			$cityElement = _this.$cityElement;

		$cityElement.on('click.ydui.cityselect', '.cityselect-item-box a', function () {
			var $this = $(this);

			if ($this.hasClass('crt'))return;
			$this.addClass('crt').siblings().removeClass('crt');

			var tag = $this.data('tag');

			_this.setNavTxt(tag, $this.text());

			var $nav = $cityElement.find('.cityselect-nav a'),
				defaultSet = _this.defaultSet;

			if (tag == 0) {

				_this.loadCity();
				$cityElement.find('.cityselect-item-box').eq(1).find('a').removeClass('crt');

			} else if (tag == 1) {

				_this.loadArea(function () {
					_this.ForwardView(true, 1);
					$cityElement.find('.cityselect-item-box').eq(2).find('a').removeClass('crt');
				});

			} else if (tag == 2) {

				_this.loadBank();
				_this.ForwardView(true, 2, 75);
				$cityElement.find('.cityselect-item-box').eq(3).find('a').removeClass('crt');
			} else {

				defaultSet.provance = $nav.eq(0).html();
				defaultSet.city = $nav.eq(1).html();
				defaultSet.area = $nav.eq(2).html();
				defaultSet.bank = $nav.eq(3).html();

				_this.returnValue();
			}
		});
	};

	BankSelect.prototype.returnValue = function () {
		var _this = this,
			defaultSet = _this.defaultSet;

		_this.$element.trigger($.Event('done.ydui.cityselect', {
			provance: defaultSet.provance,
			city: defaultSet.city,
			area: defaultSet.area,
			bank: defaultSet.bank
		}));

		_this.close();
	};

	BankSelect.prototype.scrollPosition = function (index) {

		var _this = this,
			$itemBox = _this.$itemBox.eq(index),
			itemHeight = $itemBox.find('a.crt').height(),
			itemBoxHeight = $itemBox.parent().height();

		$itemBox.parent().animate({
			scrollTop: $itemBox.find('a.crt').index() * itemHeight - itemBoxHeight / 3
		}, 0, function () {
			_this.bindItemEvent();
		});
	};

	BankSelect.prototype.fillItems = function (index, arr) {
		var _this = this;

		_this.$itemBox.eq(index).html(arr).parent().animate({scrollTop: 0}, 10);

		_this.scrollPosition(index);
	};

	BankSelect.prototype.loadProvance = function () {
		var _this = this;

		var arr = [];
		$.each(_this.citys, function (k, v) {
			arr.push($('<a class="' + (v.n == _this.defaultSet.provance ? 'crt' : '') + '" href="javascript:;"><span>' + v.n + '</span></a>').data({
				citys: v.c,
				tag: 0
			}));
		});
		_this.fillItems(0, arr);
	};

	BankSelect.prototype.loadCity = function () {
		var _this = this;

		var cityData = _this.$itemBox.eq(0).find('a.crt').data('citys');

		var arr = [];
		$.each(cityData, function (k, v) {
			arr.push($('<a class="' + (v == _this.defaultSet.city ? 'crt' : '') + '" href="javascript:;"><span>' + v + '</span></a>').data({tag: 1}));
		});
		_this.fillItems(1, arr);
	};

	BankSelect.prototype.loadArea = function (callback) {
		var _this = this;
		// var areaData = [{
		// 	"n": "北京",
		// 	"b": ["朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区朝阳区", "密云区"]
		// }, {
		// 	"n": "天津",
		// 	"b": ["东丽区", "和平区"]
		// }];
		// var arr = [];
		// $.each(areaData, function (k, v) {
		// 	arr.push($('<a class="' + (v.n == _this.defaultSet.area ? 'crt' : '') + '" href="javascript:;"><span>' + v.n + '</span></a>').data({
		// 		banks: v.b,
		// 		tag: 2
		// 	}));
		// });
		// _this.fillItems(2, arr);
		// callback && callback();
		// return false;
		window.YDUI.dialog.loading.open('区域加载中...');
		$.ajax({
			type: 'POST',
			url: _this.options.url,
			data: $.extend({}, _this.options.data, {
				'province': _this.$itemBox.eq(0).find('a.crt').text(),
				'city': _this.$itemBox.eq(1).find('a.crt').text()
			}),
			dataType: 'json',
			success: function (areaData) {
				window.YDUI.dialog.loading.close();
				var arr = [];
				$.each(areaData, function (k, v) {
					arr.push($('<a class="' + (v.n == _this.defaultSet.area ? 'crt' : '') + '" href="javascript:;"><span>' + v.n + '</span></a>').data({
						banks: v.b,
						tag: 2
					}));
				});
				_this.fillItems(2, arr);
				callback && callback();
			},
			error: function () {
				window.YDUI.dialog.loading.close();
				window.YDUI.dialog.toast('请求失败', 'error', 1500);
			}
		});

	};
	BankSelect.prototype.loadBank = function () {
		var _this = this;

		var bankData = _this.$itemBox.eq(2).find('a.crt').data('banks');

		var arr = [];
		$.each(bankData, function (k, v) {
			arr.push($('<a class="' + (v == _this.defaultSet.bank ? 'crt' : '') + '" href="javascript:;"><span>' + v + '</span></a>').data({tag: 3}));
		});
		_this.fillItems(3, arr);
	};
	function Plugin(option) {
		var args = Array.prototype.slice.call(arguments, 1);

		return this.each(function () {
			var $this = $(this),
				citySelect = $this.data('ydui.cityselect');

			if (!citySelect) {
				$this.data('ydui.cityselect', (citySelect = new BankSelect(this, option)));
			}

			if (typeof option == 'string') {
				citySelect[option] && citySelect[option].apply(citySelect, args);
			}
		});
	}

	$.fn.bankSelect = Plugin;

}(window);
