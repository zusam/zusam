(function() {
    "use strict";
    function FastClick(layer, options) {
        var oldOnClick;
        options = options || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = options.touchBoundary || 10;
        this.layer = layer;
        this.tapDelay = options.tapDelay || 200;
        this.tapTimeout = options.tapTimeout || 700;
        if (FastClick.notNeeded(layer)) {
            return;
        }
        function bind(method, context) {
            return function() {
                return method.apply(context, arguments);
            };
        }
        var methods = [ "onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel" ];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }
        if (deviceIsAndroid) {
            layer.addEventListener("mouseover", this.onMouse, true);
            layer.addEventListener("mousedown", this.onMouse, true);
            layer.addEventListener("mouseup", this.onMouse, true);
        }
        layer.addEventListener("click", this.onClick, true);
        layer.addEventListener("touchstart", this.onTouchStart, false);
        layer.addEventListener("touchmove", this.onTouchMove, false);
        layer.addEventListener("touchend", this.onTouchEnd, false);
        layer.addEventListener("touchcancel", this.onTouchCancel, false);
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === "click") {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };
            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === "click") {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }
        if (typeof layer.onclick === "function") {
            oldOnClick = layer.onclick;
            layer.addEventListener("click", function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
    var deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0 && !deviceIsWindowsPhone;
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
    var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf("BB10") > 0;
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "button":
          case "select":
          case "textarea":
            if (target.disabled) {
                return true;
            }
            break;

          case "input":
            if (deviceIsIOS && target.type === "file" || target.disabled) {
                return true;
            }
            break;

          case "label":
          case "iframe":
          case "video":
            return true;
        }
        return /\bneedsclick\b/.test(target.className);
    };
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "textarea":
            return true;

          case "select":
            return !deviceIsAndroid;

          case "input":
            switch (target.type) {
              case "button":
              case "checkbox":
              case "file":
              case "image":
              case "radio":
              case "submit":
                return false;
            }
            return !target.disabled && !target.readOnly;

          default:
            return /\bneedsfocus\b/.test(target.className);
        }
    };
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }
        touch = event.changedTouches[0];
        clickEvent = document.createEvent("MouseEvents");
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };
    FastClick.prototype.determineEventType = function(targetElement) {
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
            return "mousedown";
        }
        return "click";
    };
    FastClick.prototype.focus = function(targetElement) {
        var length;
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time" && targetElement.type !== "month") {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;
        scrollParent = targetElement.fastClickScrollParent;
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }
                parentElement = parentElement.parentElement;
            } while (parentElement);
        }
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }
        return eventTarget;
    };
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;
        if (event.targetTouches.length > 1) {
            return true;
        }
        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];
        if (deviceIsIOS) {
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }
            if (!deviceIsIOS4) {
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }
                this.lastTouchIdentifier = touch.identifier;
                this.updateScrollParent(targetElement);
            }
        }
        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;
        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            event.preventDefault();
        }
        return true;
    };
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;
        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }
        return false;
    };
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }
        return true;
    };
    FastClick.prototype.findControl = function(labelElement) {
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }
        return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
    };
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
        if (!this.trackingClick) {
            return true;
        }
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }
        if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
            return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = event.timeStamp;
        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === "label") {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }
                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {
            if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === "input") {
                this.targetElement = null;
                return false;
            }
            this.focus(targetElement);
            this.sendClick(targetElement, event);
            if (!deviceIsIOS || targetTagName !== "select") {
                this.targetElement = null;
                event.preventDefault();
            }
            return false;
        }
        if (deviceIsIOS && !deviceIsIOS4) {
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }
        return false;
    };
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };
    FastClick.prototype.onMouse = function(event) {
        if (!this.targetElement) {
            return true;
        }
        if (event.forwardedTouchEvent) {
            return true;
        }
        if (!event.cancelable) {
            return true;
        }
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {
                event.propagationStopped = true;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        return true;
    };
    FastClick.prototype.onClick = function(event) {
        var permitted;
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }
        if (event.target.type === "submit" && event.detail === 0) {
            return true;
        }
        permitted = this.onMouse(event);
        if (!permitted) {
            this.targetElement = null;
        }
        return permitted;
    };
    FastClick.prototype.destroy = function() {
        var layer = this.layer;
        if (deviceIsAndroid) {
            layer.removeEventListener("mouseover", this.onMouse, true);
            layer.removeEventListener("mousedown", this.onMouse, true);
            layer.removeEventListener("mouseup", this.onMouse, true);
        }
        layer.removeEventListener("click", this.onClick, true);
        layer.removeEventListener("touchstart", this.onTouchStart, false);
        layer.removeEventListener("touchmove", this.onTouchMove, false);
        layer.removeEventListener("touchend", this.onTouchEnd, false);
        layer.removeEventListener("touchcancel", this.onTouchCancel, false);
    };
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;
        if (typeof window.ontouchstart === "undefined") {
            return true;
        }
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (chromeVersion) {
            if (deviceIsAndroid) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }
        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }
        if (layer.style.msTouchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (firefoxVersion >= 27) {
            metaViewport = document.querySelector("meta[name=viewport]");
            if (metaViewport && (metaViewport.content.indexOf("user-scalable=no") !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }
        if (layer.style.touchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        return false;
    };
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };
    if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
})();

(function(factory) {
    if (typeof define === "function" && define.amd) {
        return define([ "jquery" ], function($) {
            return factory($, window, document);
        });
    } else if (typeof exports === "object") {
        return module.exports = factory(require("jquery"), window, document);
    } else {
        return factory(jQuery, window, document);
    }
})(function($, window, document) {
    "use strict";
    var BROWSER_IS_IE7, BROWSER_SCROLLBAR_WIDTH, DOMSCROLL, DOWN, DRAG, ENTER, KEYDOWN, KEYUP, MOUSEDOWN, MOUSEENTER, MOUSEMOVE, MOUSEUP, MOUSEWHEEL, NanoScroll, PANEDOWN, RESIZE, SCROLL, SCROLLBAR, TOUCHMOVE, UP, WHEEL, cAF, defaults, getBrowserScrollbarWidth, hasTransform, isFFWithBuggyScrollbar, rAF, transform, _elementStyle, _prefixStyle, _vendor;
    defaults = {
        paneClass: "nano-pane",
        sliderClass: "nano-slider",
        contentClass: "nano-content",
        enabledClass: "has-scrollbar",
        flashedClass: "flashed",
        activeClass: "active",
        iOSNativeScrolling: false,
        preventPageScrolling: false,
        disableResize: false,
        alwaysVisible: false,
        flashDelay: 1500,
        sliderMinHeight: 20,
        sliderMaxHeight: null,
        documentContext: null,
        windowContext: null
    };
    SCROLLBAR = "scrollbar";
    SCROLL = "scroll";
    MOUSEDOWN = "mousedown";
    MOUSEENTER = "mouseenter";
    MOUSEMOVE = "mousemove";
    MOUSEWHEEL = "mousewheel";
    MOUSEUP = "mouseup";
    RESIZE = "resize";
    DRAG = "drag";
    ENTER = "enter";
    UP = "up";
    PANEDOWN = "panedown";
    DOMSCROLL = "DOMMouseScroll";
    DOWN = "down";
    WHEEL = "wheel";
    KEYDOWN = "keydown";
    KEYUP = "keyup";
    TOUCHMOVE = "touchmove";
    BROWSER_IS_IE7 = window.navigator.appName === "Microsoft Internet Explorer" && /msie 7./i.test(window.navigator.appVersion) && window.ActiveXObject;
    BROWSER_SCROLLBAR_WIDTH = null;
    rAF = window.requestAnimationFrame;
    cAF = window.cancelAnimationFrame;
    _elementStyle = document.createElement("div").style;
    _vendor = function() {
        var i, transform, vendor, vendors, _i, _len;
        vendors = [ "t", "webkitT", "MozT", "msT", "OT" ];
        for (i = _i = 0, _len = vendors.length; _i < _len; i = ++_i) {
            vendor = vendors[i];
            transform = vendors[i] + "ransform";
            if (transform in _elementStyle) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }
        return false;
    }();
    _prefixStyle = function(style) {
        if (_vendor === false) {
            return false;
        }
        if (_vendor === "") {
            return style;
        }
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    };
    transform = _prefixStyle("transform");
    hasTransform = transform !== false;
    getBrowserScrollbarWidth = function() {
        var outer, outerStyle, scrollbarWidth;
        outer = document.createElement("div");
        outerStyle = outer.style;
        outerStyle.position = "absolute";
        outerStyle.width = "100px";
        outerStyle.height = "100px";
        outerStyle.overflow = SCROLL;
        outerStyle.top = "-9999px";
        document.body.appendChild(outer);
        scrollbarWidth = outer.offsetWidth - outer.clientWidth;
        document.body.removeChild(outer);
        return scrollbarWidth;
    };
    isFFWithBuggyScrollbar = function() {
        var isOSXFF, ua, version;
        ua = window.navigator.userAgent;
        isOSXFF = /(?=.+Mac OS X)(?=.+Firefox)/.test(ua);
        if (!isOSXFF) {
            return false;
        }
        version = /Firefox\/\d{2}\./.exec(ua);
        if (version) {
            version = version[0].replace(/\D+/g, "");
        }
        return isOSXFF && +version > 23;
    };
    NanoScroll = function() {
        function NanoScroll(el, options) {
            this.el = el;
            this.options = options;
            BROWSER_SCROLLBAR_WIDTH || (BROWSER_SCROLLBAR_WIDTH = getBrowserScrollbarWidth());
            this.$el = $(this.el);
            this.doc = $(this.options.documentContext || document);
            this.win = $(this.options.windowContext || window);
            this.body = this.doc.find("body");
            this.$content = this.$el.children("." + this.options.contentClass);
            this.$content.attr("tabindex", this.options.tabIndex || 0);
            this.content = this.$content[0];
            this.previousPosition = 0;
            if (this.options.iOSNativeScrolling && this.el.style.WebkitOverflowScrolling != null) {
                this.nativeScrolling();
            } else {
                this.generate();
            }
            this.createEvents();
            this.addEvents();
            this.reset();
        }
        NanoScroll.prototype.preventScrolling = function(e, direction) {
            if (!this.isActive) {
                return;
            }
            if (e.type === DOMSCROLL) {
                if (direction === DOWN && e.originalEvent.detail > 0 || direction === UP && e.originalEvent.detail < 0) {
                    e.preventDefault();
                }
            } else if (e.type === MOUSEWHEEL) {
                if (!e.originalEvent || !e.originalEvent.wheelDelta) {
                    return;
                }
                if (direction === DOWN && e.originalEvent.wheelDelta < 0 || direction === UP && e.originalEvent.wheelDelta > 0) {
                    e.preventDefault();
                }
            }
        };
        NanoScroll.prototype.nativeScrolling = function() {
            this.$content.css({
                WebkitOverflowScrolling: "touch"
            });
            this.iOSNativeScrolling = true;
            this.isActive = true;
        };
        NanoScroll.prototype.updateScrollValues = function() {
            var content, direction;
            content = this.content;
            this.maxScrollTop = content.scrollHeight - content.clientHeight;
            this.prevScrollTop = this.contentScrollTop || 0;
            this.contentScrollTop = content.scrollTop;
            direction = this.contentScrollTop > this.previousPosition ? "down" : this.contentScrollTop < this.previousPosition ? "up" : "same";
            this.previousPosition = this.contentScrollTop;
            if (direction !== "same") {
                this.$el.trigger("update", {
                    position: this.contentScrollTop,
                    maximum: this.maxScrollTop,
                    direction: direction
                });
            }
            if (!this.iOSNativeScrolling) {
                this.maxSliderTop = this.paneHeight - this.sliderHeight;
                this.sliderTop = this.maxScrollTop === 0 ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop;
            }
        };
        NanoScroll.prototype.setOnScrollStyles = function() {
            var cssValue;
            if (hasTransform) {
                cssValue = {};
                cssValue[transform] = "translate(0, " + this.sliderTop + "px)";
            } else {
                cssValue = {
                    top: this.sliderTop
                };
            }
            if (rAF) {
                if (cAF && this.scrollRAF) {
                    cAF(this.scrollRAF);
                }
                this.scrollRAF = rAF(function(_this) {
                    return function() {
                        _this.scrollRAF = null;
                        return _this.slider.css(cssValue);
                    };
                }(this));
            } else {
                this.slider.css(cssValue);
            }
        };
        NanoScroll.prototype.createEvents = function() {
            this.events = {
                down: function(_this) {
                    return function(e) {
                        _this.isBeingDragged = true;
                        _this.offsetY = e.pageY - _this.slider.offset().top;
                        if (!_this.slider.is(e.target)) {
                            _this.offsetY = 0;
                        }
                        _this.pane.addClass(_this.options.activeClass);
                        _this.doc.bind(MOUSEMOVE, _this.events[DRAG]).bind(MOUSEUP, _this.events[UP]);
                        _this.body.bind(MOUSEENTER, _this.events[ENTER]);
                        return false;
                    };
                }(this),
                drag: function(_this) {
                    return function(e) {
                        _this.sliderY = e.pageY - _this.$el.offset().top - _this.paneTop - (_this.offsetY || _this.sliderHeight * .5);
                        _this.scroll();
                        if (_this.contentScrollTop >= _this.maxScrollTop && _this.prevScrollTop !== _this.maxScrollTop) {
                            _this.$el.trigger("scrollend");
                        } else if (_this.contentScrollTop === 0 && _this.prevScrollTop !== 0) {
                            _this.$el.trigger("scrolltop");
                        }
                        return false;
                    };
                }(this),
                up: function(_this) {
                    return function(e) {
                        _this.isBeingDragged = false;
                        _this.pane.removeClass(_this.options.activeClass);
                        _this.doc.unbind(MOUSEMOVE, _this.events[DRAG]).unbind(MOUSEUP, _this.events[UP]);
                        _this.body.unbind(MOUSEENTER, _this.events[ENTER]);
                        return false;
                    };
                }(this),
                resize: function(_this) {
                    return function(e) {
                        _this.reset();
                    };
                }(this),
                panedown: function(_this) {
                    return function(e) {
                        _this.sliderY = (e.offsetY || e.originalEvent.layerY) - _this.sliderHeight * .5;
                        _this.scroll();
                        _this.events.down(e);
                        return false;
                    };
                }(this),
                scroll: function(_this) {
                    return function(e) {
                        _this.updateScrollValues();
                        if (_this.isBeingDragged) {
                            return;
                        }
                        if (!_this.iOSNativeScrolling) {
                            _this.sliderY = _this.sliderTop;
                            _this.setOnScrollStyles();
                        }
                        if (e == null) {
                            return;
                        }
                        if (_this.contentScrollTop >= _this.maxScrollTop) {
                            if (_this.options.preventPageScrolling) {
                                _this.preventScrolling(e, DOWN);
                            }
                            if (_this.prevScrollTop !== _this.maxScrollTop) {
                                _this.$el.trigger("scrollend");
                            }
                        } else if (_this.contentScrollTop === 0) {
                            if (_this.options.preventPageScrolling) {
                                _this.preventScrolling(e, UP);
                            }
                            if (_this.prevScrollTop !== 0) {
                                _this.$el.trigger("scrolltop");
                            }
                        }
                    };
                }(this),
                wheel: function(_this) {
                    return function(e) {
                        var delta;
                        if (e == null) {
                            return;
                        }
                        delta = e.delta || e.wheelDelta || e.originalEvent && e.originalEvent.wheelDelta || -e.detail || e.originalEvent && -e.originalEvent.detail;
                        if (delta) {
                            _this.sliderY += -delta / 3;
                        }
                        _this.scroll();
                        return false;
                    };
                }(this),
                enter: function(_this) {
                    return function(e) {
                        var _ref;
                        if (!_this.isBeingDragged) {
                            return;
                        }
                        if ((e.buttons || e.which) !== 1) {
                            return (_ref = _this.events)[UP].apply(_ref, arguments);
                        }
                    };
                }(this)
            };
        };
        NanoScroll.prototype.addEvents = function() {
            var events;
            this.removeEvents();
            events = this.events;
            if (!this.options.disableResize) {
                this.win.bind(RESIZE, events[RESIZE]);
            }
            if (!this.iOSNativeScrolling) {
                this.slider.bind(MOUSEDOWN, events[DOWN]);
                this.pane.bind(MOUSEDOWN, events[PANEDOWN]).bind("" + MOUSEWHEEL + " " + DOMSCROLL, events[WHEEL]);
            }
            this.$content.bind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]);
        };
        NanoScroll.prototype.removeEvents = function() {
            var events;
            events = this.events;
            this.win.unbind(RESIZE, events[RESIZE]);
            if (!this.iOSNativeScrolling) {
                this.slider.unbind();
                this.pane.unbind();
            }
            this.$content.unbind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]);
        };
        NanoScroll.prototype.generate = function() {
            var contentClass, cssRule, currentPadding, options, pane, paneClass, sliderClass;
            options = this.options;
            paneClass = options.paneClass, sliderClass = options.sliderClass, contentClass = options.contentClass;
            if (!(pane = this.$el.children("." + paneClass)).length && !pane.children("." + sliderClass).length) {
                this.$el.append('<div class="' + paneClass + '"><div class="' + sliderClass + '" /></div>');
            }
            this.pane = this.$el.children("." + paneClass);
            this.slider = this.pane.find("." + sliderClass);
            if (BROWSER_SCROLLBAR_WIDTH === 0 && isFFWithBuggyScrollbar()) {
                currentPadding = window.getComputedStyle(this.content, null).getPropertyValue("padding-right").replace(/[^0-9.]+/g, "");
                cssRule = {
                    right: -14,
                    paddingRight: +currentPadding + 14
                };
            } else if (BROWSER_SCROLLBAR_WIDTH) {
                cssRule = {
                    right: -BROWSER_SCROLLBAR_WIDTH
                };
                this.$el.addClass(options.enabledClass);
            }
            if (cssRule != null) {
                this.$content.css(cssRule);
            }
            return this;
        };
        NanoScroll.prototype.restore = function() {
            this.stopped = false;
            if (!this.iOSNativeScrolling) {
                this.pane.show();
            }
            this.addEvents();
        };
        NanoScroll.prototype.reset = function() {
            var content, contentHeight, contentPosition, contentStyle, contentStyleOverflowY, paneBottom, paneHeight, paneOuterHeight, paneTop, parentMaxHeight, right, sliderHeight;
            if (this.iOSNativeScrolling) {
                this.contentHeight = this.content.scrollHeight;
                return;
            }
            if (!this.$el.find("." + this.options.paneClass).length) {
                this.generate().stop();
            }
            if (this.stopped) {
                this.restore();
            }
            content = this.content;
            contentStyle = content.style;
            contentStyleOverflowY = contentStyle.overflowY;
            if (BROWSER_IS_IE7) {
                this.$content.css({
                    height: this.$content.height()
                });
            }
            contentHeight = content.scrollHeight + BROWSER_SCROLLBAR_WIDTH;
            parentMaxHeight = parseInt(this.$el.css("max-height"), 10);
            if (parentMaxHeight > 0) {
                this.$el.height("");
                this.$el.height(content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight);
            }
            paneHeight = this.pane.outerHeight(false);
            paneTop = parseInt(this.pane.css("top"), 10);
            paneBottom = parseInt(this.pane.css("bottom"), 10);
            paneOuterHeight = paneHeight + paneTop + paneBottom;
            sliderHeight = Math.round(paneOuterHeight / contentHeight * paneHeight);
            if (sliderHeight < this.options.sliderMinHeight) {
                sliderHeight = this.options.sliderMinHeight;
            } else if (this.options.sliderMaxHeight != null && sliderHeight > this.options.sliderMaxHeight) {
                sliderHeight = this.options.sliderMaxHeight;
            }
            if (contentStyleOverflowY === SCROLL && contentStyle.overflowX !== SCROLL) {
                sliderHeight += BROWSER_SCROLLBAR_WIDTH;
            }
            this.maxSliderTop = paneOuterHeight - sliderHeight;
            this.contentHeight = contentHeight;
            this.paneHeight = paneHeight;
            this.paneOuterHeight = paneOuterHeight;
            this.sliderHeight = sliderHeight;
            this.paneTop = paneTop;
            this.slider.height(sliderHeight);
            this.events.scroll();
            this.pane.show();
            this.isActive = true;
            if (content.scrollHeight === content.clientHeight || this.pane.outerHeight(true) >= content.scrollHeight && contentStyleOverflowY !== SCROLL) {
                this.pane.hide();
                this.isActive = false;
            } else if (this.el.clientHeight === content.scrollHeight && contentStyleOverflowY === SCROLL) {
                this.slider.hide();
            } else {
                this.slider.show();
            }
            this.pane.css({
                opacity: this.options.alwaysVisible ? 1 : "",
                visibility: this.options.alwaysVisible ? "visible" : ""
            });
            contentPosition = this.$content.css("position");
            if (contentPosition === "static" || contentPosition === "relative") {
                right = parseInt(this.$content.css("right"), 10);
                if (right) {
                    this.$content.css({
                        right: "",
                        marginRight: right
                    });
                }
            }
            return this;
        };
        NanoScroll.prototype.scroll = function() {
            if (!this.isActive) {
                return;
            }
            this.sliderY = Math.max(0, this.sliderY);
            this.sliderY = Math.min(this.maxSliderTop, this.sliderY);
            this.$content.scrollTop(this.maxScrollTop * this.sliderY / this.maxSliderTop);
            if (!this.iOSNativeScrolling) {
                this.updateScrollValues();
                this.setOnScrollStyles();
            }
            return this;
        };
        NanoScroll.prototype.scrollBottom = function(offsetY) {
            if (!this.isActive) {
                return;
            }
            this.$content.scrollTop(this.contentHeight - this.$content.height() - offsetY).trigger(MOUSEWHEEL);
            this.stop().restore();
            return this;
        };
        NanoScroll.prototype.scrollTop = function(offsetY) {
            if (!this.isActive) {
                return;
            }
            this.$content.scrollTop(+offsetY).trigger(MOUSEWHEEL);
            this.stop().restore();
            return this;
        };
        NanoScroll.prototype.scrollTo = function(node) {
            if (!this.isActive) {
                return;
            }
            this.scrollTop(this.$el.find(node).get(0).offsetTop);
            return this;
        };
        NanoScroll.prototype.stop = function() {
            if (cAF && this.scrollRAF) {
                cAF(this.scrollRAF);
                this.scrollRAF = null;
            }
            this.stopped = true;
            this.removeEvents();
            if (!this.iOSNativeScrolling) {
                this.pane.hide();
            }
            return this;
        };
        NanoScroll.prototype.destroy = function() {
            if (!this.stopped) {
                this.stop();
            }
            if (!this.iOSNativeScrolling && this.pane.length) {
                this.pane.remove();
            }
            if (BROWSER_IS_IE7) {
                this.$content.height("");
            }
            this.$content.removeAttr("tabindex");
            if (this.$el.hasClass(this.options.enabledClass)) {
                this.$el.removeClass(this.options.enabledClass);
                this.$content.css({
                    right: ""
                });
            }
            return this;
        };
        NanoScroll.prototype.flash = function() {
            if (this.iOSNativeScrolling) {
                return;
            }
            if (!this.isActive) {
                return;
            }
            this.reset();
            this.pane.addClass(this.options.flashedClass);
            setTimeout(function(_this) {
                return function() {
                    _this.pane.removeClass(_this.options.flashedClass);
                };
            }(this), this.options.flashDelay);
            return this;
        };
        return NanoScroll;
    }();
    $.fn.nanoScroller = function(settings) {
        return this.each(function() {
            var options, scrollbar;
            if (!(scrollbar = this.nanoscroller)) {
                options = $.extend({}, defaults, settings);
                this.nanoscroller = scrollbar = new NanoScroll(this, options);
            }
            if (settings && typeof settings === "object") {
                $.extend(scrollbar.options, settings);
                if (settings.scrollBottom != null) {
                    return scrollbar.scrollBottom(settings.scrollBottom);
                }
                if (settings.scrollTop != null) {
                    return scrollbar.scrollTop(settings.scrollTop);
                }
                if (settings.scrollTo) {
                    return scrollbar.scrollTo(settings.scrollTo);
                }
                if (settings.scroll === "bottom") {
                    return scrollbar.scrollBottom(0);
                }
                if (settings.scroll === "top") {
                    return scrollbar.scrollTop(0);
                }
                if (settings.scroll && settings.scroll instanceof $) {
                    return scrollbar.scrollTo(settings.scroll);
                }
                if (settings.stop) {
                    return scrollbar.stop();
                }
                if (settings.destroy) {
                    return scrollbar.destroy();
                }
                if (settings.flash) {
                    return scrollbar.flash();
                }
            }
            return scrollbar.reset();
        });
    };
    $.fn.nanoScroller.Constructor = NanoScroll;
});
