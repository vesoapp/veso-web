define(["browser", "dom", "css!./navdrawer", "scrollStyles"], function(browser, dom) {
    "use strict";
    return function(options) {
        function getTouches(e) {
            return e.changedTouches || e.targetTouches || e.touches;
        }

        function onMenuTouchStart(e) {
            options.target.classList.remove("transition");
            var touches = getTouches(e);
            var touch = touches[0] || {};

            menuTouchStartX = touch.clientX;
            menuTouchStartY = touch.clientY;
            menuTouchStartTime = (new Date).getTime();
        }

        function setVelocity(deltaX) {
            var time = (new Date).getTime() - (menuTouchStartTime || 0);
            velocity = Math.abs(deltaX) / time;
        }

        function onMenuTouchMove(e) {
            var isOpen = self.visible,
                touches = getTouches(e),
                touch = touches[0] || {},
                endX = touch.clientX || 0,
                endY = touch.clientY || 0,
                deltaX = endX - (menuTouchStartX || 0),
                deltaY = endY - (menuTouchStartY || 0);
            setVelocity(deltaX), isOpen && 1 !== dragMode && deltaX > 0 && (dragMode = 2), 0 === dragMode && (!isOpen || Math.abs(deltaX) >= 10) && Math.abs(deltaY) < 5 ? (dragMode = 1, scrollContainer.addEventListener("scroll", disableEvent), self.showMask()) : 0 === dragMode && Math.abs(deltaY) >= 5 && (dragMode = 2), 1 === dragMode && (newPos = currentPos + deltaX, self.changeMenuPos())
        }

        function onMenuTouchEnd(e) {
            options.target.classList.add("transition");
            scrollContainer.removeEventListener("scroll", disableEvent);
            dragMode = 0;

            var touches = getTouches(e),
                touch = touches[0] || {},
                endX = touch.clientX || 0,
                endY = touch.clientY || 0,
                deltaX = endX - (menuTouchStartX || 0),
                deltaY = endY - (menuTouchStartY || 0);

            currentPos = deltaX;
            self.checkMenuState(deltaX, deltaY);
        }

        function onEdgeTouchStart(e) {
            if (isPeeking) {
                onMenuTouchMove(e);
            } else {
                if (((getTouches(e)[0] || {}).clientX || 0) <= options.handleSize) {
                    isPeeking = true;
                    if (e.type === "touchstart") {
                        dom.removeEventListener(edgeContainer, "touchmove", onEdgeTouchMove, {});
                        dom.addEventListener(edgeContainer, "touchmove", onEdgeTouchMove, {});
                    }
                    onMenuTouchStart(e);
                }
            }
        }

        function onEdgeTouchMove(e) {
            e.preventDefault();
            e.stopPropagation();

            onEdgeTouchStart(e);
        }

        function onEdgeTouchEnd(e) {
            isPeeking && (isPeeking = !1, dom.removeEventListener(edgeContainer, "touchmove", onEdgeTouchMove, {}), onMenuTouchEnd(e))
        }

        function disableEvent(e) {
            e.preventDefault(), e.stopPropagation()
        }

        function onBackgroundTouchStart(e) {
            var touches = getTouches(e),
                touch = touches[0] || {};
            backgroundTouchStartX = touch.clientX, backgroundTouchStartTime = (new Date).getTime()
        }

        function onBackgroundTouchMove(e) {
            var touches = getTouches(e),
                touch = touches[0] || {},
                endX = touch.clientX || 0;
            if (endX <= options.width && self.isVisible) {
                countStart++;
                var deltaX = endX - (backgroundTouchStartX || 0);
                if (1 === countStart && (startPoint = deltaX), deltaX < 0 && 2 !== dragMode) {
                    dragMode = 1, newPos = deltaX - startPoint + options.width, self.changeMenuPos();
                    var time = (new Date).getTime() - (backgroundTouchStartTime || 0);
                    velocity = Math.abs(deltaX) / time
                }
            }
            e.preventDefault(), e.stopPropagation()
        }

        function onBackgroundTouchEnd(e) {
            var touches = getTouches(e),
                touch = touches[0] || {},
                endX = touch.clientX || 0,
                deltaX = endX - (backgroundTouchStartX || 0);
            self.checkMenuState(deltaX), countStart = 0
        }

        function onMaskTransitionEnd() {
            var classList = mask.classList;
            classList.contains("backdrop") || classList.add("hide")
        }
        var self, defaults, mask, newPos = 0,
            currentPos = 0,
            startPoint = 0,
            countStart = 0,
            velocity = 0;
        options.target.classList.add("transition");
        var dragMode = 0,
            scrollContainer = options.target.querySelector(".mainDrawer-scrollContainer");
        scrollContainer.classList.add("scrollY");
        var TouchMenuLA = function() {
            self = this, defaults = {
                width: 260,
                handleSize: 10,
                disableMask: !1,
                maxMaskOpacity: .5
            }, this.isVisible = !1, this.initialize()
        };
        TouchMenuLA.prototype.initElements = function() {
            options.target.classList.add("touch-menu-la"), options.target.style.width = options.width + "px", options.target.style.left = -options.width + "px", options.disableMask || (mask = document.createElement("div"), mask.className = "tmla-mask hide", document.body.appendChild(mask), dom.addEventListener(mask, dom.whichTransitionEvent(), onMaskTransitionEnd, {
                passive: !0
            }))
        };
        var menuTouchStartX, menuTouchStartY, menuTouchStartTime, edgeContainer = document.querySelector(".mainDrawerHandle"),
            isPeeking = !1;
        TouchMenuLA.prototype.animateToPosition = function(pos) {
            requestAnimationFrame(function() {
                options.target.style.transform = pos ? "translateX(" + pos + "px)" : "none"
            })
        }, TouchMenuLA.prototype.changeMenuPos = function() {
            newPos <= options.width && this.animateToPosition(newPos)
        }, TouchMenuLA.prototype.clickMaskClose = function() {
            mask.addEventListener("click", function() {
                self.close()
            })
        }, TouchMenuLA.prototype.checkMenuState = function(deltaX, deltaY) {
            velocity >= .4 ? deltaX >= 0 || Math.abs(deltaY || 0) >= 70 ? self.open() : self.close() : newPos >= 100 ? self.open() : newPos && self.close()
        }, TouchMenuLA.prototype.open = function() {
            this.animateToPosition(options.width), currentPos = options.width, this.isVisible = !0, options.target.classList.add("drawer-open"), self.showMask(), self.invoke(options.onChange)
        }, TouchMenuLA.prototype.close = function() {
            this.animateToPosition(0), currentPos = 0, self.isVisible = !1, options.target.classList.remove("drawer-open"), self.hideMask(), self.invoke(options.onChange)
        }, TouchMenuLA.prototype.toggle = function() {
            self.isVisible ? self.close() : self.open()
        };
        var backgroundTouchStartX, backgroundTouchStartTime;
        TouchMenuLA.prototype.showMask = function() {
            mask.classList.remove("hide"), mask.offsetWidth, mask.classList.add("backdrop")
        }, TouchMenuLA.prototype.hideMask = function() {
            mask.classList.remove("backdrop")
        }, TouchMenuLA.prototype.invoke = function(fn) {
            fn && fn.apply(self)
        };
        var _edgeSwipeEnabled;
        return TouchMenuLA.prototype.setEdgeSwipeEnabled = function(enabled) {
            options.disableEdgeSwipe || browser.touch && (enabled ? _edgeSwipeEnabled || (_edgeSwipeEnabled = !0, dom.addEventListener(edgeContainer, "touchstart", onEdgeTouchStart, {
                passive: !0
            }), dom.addEventListener(edgeContainer, "touchend", onEdgeTouchEnd, {
                passive: !0
            }), dom.addEventListener(edgeContainer, "touchcancel", onEdgeTouchEnd, {
                passive: !0
            })) : _edgeSwipeEnabled && (_edgeSwipeEnabled = !1, dom.removeEventListener(edgeContainer, "touchstart", onEdgeTouchStart, {
                passive: !0
            }), dom.removeEventListener(edgeContainer, "touchend", onEdgeTouchEnd, {
                passive: !0
            }), dom.removeEventListener(edgeContainer, "touchcancel", onEdgeTouchEnd, {
                passive: !0
            })))
        }, TouchMenuLA.prototype.initialize = function() {
            options = Object.assign(defaults, options || {}), browser.edge && (options.disableEdgeSwipe = !0), self.initElements(), browser.touch && (dom.addEventListener(options.target, "touchstart", onMenuTouchStart, {
                passive: !0
            }), dom.addEventListener(options.target, "touchmove", onMenuTouchMove, {
                passive: !0
            }), dom.addEventListener(options.target, "touchend", onMenuTouchEnd, {
                passive: !0
            }), dom.addEventListener(options.target, "touchcancel", onMenuTouchEnd, {
                passive: !0
            }), dom.addEventListener(mask, "touchstart", onBackgroundTouchStart, {
                passive: !0
            }), dom.addEventListener(mask, "touchmove", onBackgroundTouchMove, {}), dom.addEventListener(mask, "touchend", onBackgroundTouchEnd, {
                passive: !0
            }), dom.addEventListener(mask, "touchcancel", onBackgroundTouchEnd, {
                passive: !0
            })), self.clickMaskClose()
        }, new TouchMenuLA
    }
});