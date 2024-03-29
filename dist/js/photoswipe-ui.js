/*! PhotoSwipe Default UI - 4.1.1 - 2015-12-24
 * http://photoswipe.com
 * Copyright (c) 2015 Dmitry Semenov; */
/**
 *
 * UI on top of main sliding area (caption, arrows, close button, etc.).
 * Built just using public methods/properties of PhotoSwipe.
 *
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.PhotoSwipeUI_Default = factory();
	}
})(this, function () {

	'use strict';


	var PhotoSwipeUI_Default = function (pswp, framework) {

		var ui = this;
		var _overlayUIUpdated = false,
			_controlsVisible = true,
			_controls,
			_captionContainer,
			_fakeCaptionContainer,
			_indexIndicator,
			_isIdle,
			_listen,

			_loadingIndicator,
			_loadingIndicatorHidden,
			_loadingIndicatorTimeout,

			_galleryHasOneSlide,

			_options,
			_defaultUIOptions = {
				barsSize: {top: 44, bottom: 'auto'},
				closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'],
				timeToIdle: 4000,
				timeToIdleOutside: 1000,
				loadingIndicatorDelay: 1000, // 2s

				addCaptionHTMLFn: function (item, captionEl /*, isFake */) {
					if (!item.title) {
						captionEl.children[0].innerHTML = '';
						return false;
					}
					captionEl.children[0].innerHTML = item.title;
					return true;
				},

				closeEl: true,
				captionEl: true,
				fullscreenEl: true,
				zoomEl: true,
				shareEl: true,
				counterEl: true,
				arrowEl: true,
				preloaderEl: true,

				tapToClose: false,
				tapToToggleControls: true,

				clickToCloseNonZoomable: true,

				indexIndicatorSep: ' / ',
				fitControlsWidth: 1200

			},
			_blockControlsTap,
			_blockControlsTapTimeout;


		var _onControlsTap = function (e) {
				if (_blockControlsTap) {
					return true;
				}


				e = e || window.event;

				if (_options.timeToIdle && _options.mouseUsed && !_isIdle) {
					// reset idle timer
					_onIdleMouseMove();
				}


				var target = e.target || e.srcElement,
					uiElement,
					clickedClass = target.getAttribute('class') || '',
					found;

				for (var i = 0; i < _uiElements.length; i++) {
					uiElement = _uiElements[i];
					if (uiElement.onTap && clickedClass.indexOf('pswp__' + uiElement.name) > -1) {
						uiElement.onTap();
						found = true;

					}
				}

				if (found) {
					if (e.stopPropagation) {
						e.stopPropagation();
					}
					_blockControlsTap = true;

					// Some versions of Android don't prevent ghost click event
					// when preventDefault() was called on touchstart and/or touchend.
					//
					// This happens on v4.3, 4.2, 4.1,
					// older versions strangely work correctly,
					// but just in case we add delay on all of them)
					var tapDelay = framework.features.isOldAndroid ? 600 : 30;
					_blockControlsTapTimeout = setTimeout(function () {
						_blockControlsTap = false;
					}, tapDelay);
				}

			},
			_fitControlsInViewport = function () {
				return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > _options.fitControlsWidth;
			},
			_togglePswpClass = function (el, cName, add) {
				framework[(add ? 'add' : 'remove') + 'Class'](el, 'pswp__' + cName);
			},

		// add class when there is just one item in the gallery
		// (by default it hides left/right arrows and 1ofX counter)
			_countNumItems = function () {
				var hasOneSlide = (_options.getNumItemsFn() === 1);

				if (hasOneSlide !== _galleryHasOneSlide) {
					_togglePswpClass(_controls, 'ui--one-slide', hasOneSlide);
					_galleryHasOneSlide = hasOneSlide;
				}
			},

			_hasCloseClass = function (target) {
				for (var i = 0; i < _options.closeElClasses.length; i++) {
					if (framework.hasClass(target, 'pswp__' + _options.closeElClasses[i])) {
						return true;
					}
				}
			},
			_idleInterval,
			_idleTimer,
			_idleIncrement = 0,
			_onIdleMouseMove = function () {
				clearTimeout(_idleTimer);
				_idleIncrement = 0;
				if (_isIdle) {
					ui.setIdle(false);
				}
			},
			_onMouseLeaveWindow = function (e) {
				e = e ? e : window.event;
				var from = e.relatedTarget || e.toElement;
				if (!from || from.nodeName === 'HTML') {
					clearTimeout(_idleTimer);
					_idleTimer = setTimeout(function () {
						ui.setIdle(true);
					}, _options.timeToIdleOutside);
				}
			},
			_setupLoadingIndicator = function () {
				// Setup loading indicator
				if (_options.preloaderEl) {

					_toggleLoadingIndicator(true);

					_listen('beforeChange', function () {

						clearTimeout(_loadingIndicatorTimeout);

						// display loading indicator with delay
						_loadingIndicatorTimeout = setTimeout(function () {

							if (pswp.currItem && pswp.currItem.loading) {

								if (!pswp.allowProgressiveImg() || (pswp.currItem.img && !pswp.currItem.img.naturalWidth)) {
									// show preloader if progressive loading is not enabled,
									// or image width is not defined yet (because of slow connection)
									_toggleLoadingIndicator(false);
									// items-controller.js function allowProgressiveImg
								}

							} else {
								_toggleLoadingIndicator(true); // hide preloader
							}

						}, _options.loadingIndicatorDelay);

					});
					_listen('imageLoadComplete', function (index, item) {
						if (pswp.currItem === item) {
							_toggleLoadingIndicator(true);
						}
					});

				}
			},
			_toggleLoadingIndicator = function (hide) {
				if (_loadingIndicatorHidden !== hide) {
					_togglePswpClass(_loadingIndicator, 'preloader--active', !hide);
					_loadingIndicatorHidden = hide;
				}
			},
			_applyNavBarGaps = function (item) {
				var gap = item.vGap;

				if (_fitControlsInViewport()) {

					var bars = _options.barsSize;
					if (_options.captionEl && bars.bottom === 'auto') {
						if (!_fakeCaptionContainer) {
							_fakeCaptionContainer = framework.createEl('pswp__caption pswp__caption--fake');
							_fakeCaptionContainer.appendChild(framework.createEl('pswp__caption__center'));
							_controls.insertBefore(_fakeCaptionContainer, _captionContainer);
							framework.addClass(_controls, 'pswp__ui--fit');
						}
						if (_options.addCaptionHTMLFn(item, _fakeCaptionContainer, true)) {

							var captionSize = _fakeCaptionContainer.clientHeight;
							gap.bottom = parseInt(captionSize, 10) || 44;
						} else {
							gap.bottom = bars.top; // if no caption, set size of bottom gap to size of top
						}
					} else {
						gap.bottom = bars.bottom === 'auto' ? 0 : bars.bottom;
					}

					// height of top bar is static, no need to calculate it
					gap.top = bars.top;
				} else {
					gap.top = gap.bottom = 0;
				}
			},
			_setupIdle = function () {
				// Hide controls when mouse is used
				if (_options.timeToIdle) {
					_listen('mouseUsed', function () {

						framework.bind(document, 'mousemove', _onIdleMouseMove);
						framework.bind(document, 'mouseout', _onMouseLeaveWindow);

						_idleInterval = setInterval(function () {
							_idleIncrement++;
							if (_idleIncrement === 2) {
								ui.setIdle(true);
							}
						}, _options.timeToIdle / 2);
					});
				}
			},
			_setupHidingControlsDuringGestures = function () {

				// Hide controls on vertical drag
				_listen('onVerticalDrag', function (now) {
					if (_controlsVisible && now < 0.95) {
						ui.hideControls();
					} else if (!_controlsVisible && now >= 0.95) {
						ui.showControls();
					}
				});

				// Hide controls when pinching to close
				var pinchControlsHidden;
				_listen('onPinchClose', function (now) {
					if (_controlsVisible && now < 0.9) {
						ui.hideControls();
						pinchControlsHidden = true;
					} else if (pinchControlsHidden && !_controlsVisible && now > 0.9) {
						ui.showControls();
					}
				});

				_listen('zoomGestureEnded', function () {
					pinchControlsHidden = false;
					if (pinchControlsHidden && !_controlsVisible) {
						ui.showControls();
					}
				});

			};


		var _uiElements = [
			{
				name: 'caption',
				option: 'captionEl',
				onInit: function (el) {
					_captionContainer = el;
				}
			},
			{
				name: 'counter',
				option: 'counterEl',
				onInit: function (el) {
					_indexIndicator = el;
				}
			},
			{
				name: 'button--close',
				option: 'closeEl',
				onTap: pswp.close
			},
			{
				name: 'preloader',
				option: 'preloaderEl',
				onInit: function (el) {
					_loadingIndicator = el;
				}
			}

		];

		var _setupUIElements = function () {
			var item,
				classAttr,
				uiElement;

			var loopThroughChildElements = function (sChildren) {
				if (!sChildren) {
					return;
				}

				var l = sChildren.length;
				for (var i = 0; i < l; i++) {
					item = sChildren[i];
					classAttr = item.className;

					for (var a = 0; a < _uiElements.length; a++) {
						uiElement = _uiElements[a];

						if (classAttr.indexOf('pswp__' + uiElement.name) > -1) {

							if (_options[uiElement.option]) { // if element is not disabled from options

								framework.removeClass(item, 'pswp__element--disabled');
								if (uiElement.onInit) {
									uiElement.onInit(item);
								}

								//item.style.display = 'block';
							} else {
								framework.addClass(item, 'pswp__element--disabled');
								//item.style.display = 'none';
							}
						}
					}
				}
			};
			loopThroughChildElements(_controls.children);

			var topBar = framework.getChildByClass(_controls, 'pswp__top-bar');
			if (topBar) {
				loopThroughChildElements(topBar.children);
			}
		};

		ui.init = function () {

			// extend options
			framework.extend(pswp.options, _defaultUIOptions, true);

			// create local link for fast access
			_options = pswp.options;

			// find pswp__ui element
			_controls = framework.getChildByClass(pswp.scrollWrap, 'pswp__ui');

			// create local link
			_listen = pswp.listen;


			_setupHidingControlsDuringGestures();

			// update controls when slides change
			_listen('beforeChange', ui.update);

			// toggle zoom on double-tap
			_listen('doubleTap', function (point) {
				var initialZoomLevel = pswp.currItem.initialZoomLevel;
				if (pswp.getZoomLevel() !== initialZoomLevel) {
					pswp.zoomTo(initialZoomLevel, point, 333);
				} else {
					pswp.zoomTo(_options.getDoubleTapZoom(false, pswp.currItem), point, 333);
				}
			});

			// Allow text selection in caption
			_listen('preventDragEvent', function (e, isDown, preventObj) {
				var t = e.target || e.srcElement;
				if (
					t &&
					t.getAttribute('class') && e.type.indexOf('mouse') > -1 &&
					( t.getAttribute('class').indexOf('__caption') > 0 || (/(SMALL|STRONG|EM)/i).test(t.tagName) )
				) {
					preventObj.prevent = false;
				}
			});

			// bind events for UI
			_listen('bindEvents', function () {
				framework.bind(_controls, 'pswpTap click', _onControlsTap);
				framework.bind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);

			});

			// unbind events for UI
			_listen('unbindEvents', function () {
				if (_idleInterval) {
					clearInterval(_idleInterval);
				}
				framework.unbind(document, 'mouseout', _onMouseLeaveWindow);
				framework.unbind(document, 'mousemove', _onIdleMouseMove);
				framework.unbind(_controls, 'pswpTap click', _onControlsTap);
				framework.unbind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);
				framework.unbind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);

			});


			// clean up things when gallery is destroyed
			_listen('destroy', function () {
				if (_options.captionEl) {
					if (_fakeCaptionContainer) {
						_controls.removeChild(_fakeCaptionContainer);
					}
					framework.removeClass(_captionContainer, 'pswp__caption--empty');
				}

				framework.removeClass(_controls, 'pswp__ui--over-close');
				framework.addClass(_controls, 'pswp__ui--hidden');
				ui.setIdle(false);
			});


			if (!_options.showAnimationDuration) {
				framework.removeClass(_controls, 'pswp__ui--hidden');
			}
			_listen('initialZoomIn', function () {
				if (_options.showAnimationDuration) {
					framework.removeClass(_controls, 'pswp__ui--hidden');
				}
			});
			_listen('initialZoomOut', function () {
				framework.addClass(_controls, 'pswp__ui--hidden');
			});

			_listen('parseVerticalMargin', _applyNavBarGaps);

			_setupUIElements();

			_countNumItems();

			_setupIdle();

			_setupLoadingIndicator();
		};

		ui.setIdle = function (isIdle) {
			_isIdle = isIdle;
			_togglePswpClass(_controls, 'ui--idle', isIdle);
		};

		ui.update = function () {
			// Don't update UI if it's hidden
			if (_controlsVisible && pswp.currItem) {

				ui.updateIndexIndicator();

				if (_options.captionEl) {
					_options.addCaptionHTMLFn(pswp.currItem, _captionContainer);

					_togglePswpClass(_captionContainer, 'caption--empty', !pswp.currItem.title);
				}

				_overlayUIUpdated = true;

			} else {
				_overlayUIUpdated = false;
			}


			_countNumItems();
		};

		ui.updateIndexIndicator = function () {
			if (_options.counterEl) {
				_indexIndicator.innerHTML = (pswp.getCurrentIndex() + 1) +
					_options.indexIndicatorSep +
					_options.getNumItemsFn();
			}
		};

		ui.onGlobalTap = function (e) {
			e = e || window.event;
			var target = e.target || e.srcElement;

			if (_blockControlsTap) {
				return;
			}

			// tap anywhere (except buttons) to toggle visibility of controls
			if (_options.tapToToggleControls) {
				if (_controlsVisible) {
					ui.hideControls();
				} else {
					ui.showControls();
				}
			}

			// tap to close gallery
			if (_options.tapToClose && (framework.hasClass(target, 'pswp__img') || _hasCloseClass(target))) {
				pswp.close();
				return;
			}
		};

		ui.hideControls = function() {
			framework.addClass(_controls,'pswp__ui--hidden');
			_controlsVisible = false;
		};

		ui.showControls = function() {
			_controlsVisible = true;
			if(!_overlayUIUpdated) {
				ui.update();
			}
			framework.removeClass(_controls,'pswp__ui--hidden');
		};
	};
	return PhotoSwipeUI_Default;


});
