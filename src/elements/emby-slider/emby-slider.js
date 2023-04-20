import browser from '../../scripts/browser';
import dom from '../../scripts/dom';
import layoutManager from '../../components/layoutManager';
import keyboardnavigation from '../../scripts/keyboardNavigation';
import './emby-slider.scss';
import 'webcomponents.js/webcomponents-lite';
import '../emby-input/emby-input';

/* eslint-disable indent */

    const EmbySliderPrototype = Object.create(HTMLInputElement.prototype);

    let supportsValueSetOverride = false;

    if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        // descriptor returning null in webos
        if (descriptor && descriptor.configurable) {
            supportsValueSetOverride = true;
        }
    }

    /**
     * Returns slider fraction corresponding to client position.
     *
     * @param {Object} range slider itself
     * @param {number} clientX client X-coordinate
     * @return {number} slider fraction
     */
    function mapClientToFraction(range, clientX) {
        const rect = range.sliderBubbleTrack.getBoundingClientRect();

        let fraction = (clientX - rect.left) / rect.width;

        // Snap to step
        const valueRange = range.max - range.min;
        if (range.step !== 'any' && valueRange !== 0) {
            const step = (range.step || 1) / valueRange;
            fraction = Math.round(fraction / step) * step;
        }

        return Math.min(Math.max(fraction, 0), 1);
    }

    /**
     * Returns slider value corresponding to slider fraction.
     *
     * @param {Object} range slider itself
     * @param {number} fraction slider fraction
     * @return {number} slider value
     */
    function mapFractionToValue(range, fraction) {
        let value = (range.max - range.min) * fraction;

        // Snap to step
        if (range.step !== 'any') {
            const step = range.step || 1;
            value = Math.round(value / step) * step;
        }

        value += parseFloat(range.min);

        return Math.min(Math.max(value, range.min), range.max);
    }

    /**
     * Returns slider fraction corresponding to slider value.
     *
     * @param {Object} range slider itself
     * @param {number} value slider value (snapped to step)
     * @return {number} slider fraction
     */
    function mapValueToFraction(range, value) {
        const valueRange = range.max - range.min;
        const fraction = valueRange !== 0 ? (value - range.min) / valueRange : 0;
        return Math.min(Math.max(fraction, 0), 1);
    }

    /**
     * Updates progress bar.
     *
     * @param {boolean} [isValueSet] update by 'valueset' event or by timer
     */
    function updateValues(isValueSet) {
        // Do not update values by 'valueset' in case of soft-implemented dragging
        if (!!isValueSet && (!!this.keyboardDragging || !!this.touched)) {
            return;
        }

        const range = this;
        const value = range.value;

        // put this on a callback. Doing it within the event sometimes causes the slider to get hung up and not respond
        // Keep only one per slider frame request
        cancelAnimationFrame(range.updateValuesFrame);
        range.updateValuesFrame = requestAnimationFrame(function () {
            const backgroundLower = range.backgroundLower;

            if (backgroundLower) {
                let fraction = (value - range.min) / (range.max - range.min);

                fraction *= 100;
                backgroundLower.style.width = fraction + '%';
            }

            if (range.markerContainerElement) {
                if (!range.triedAddingMarkers) {
                    addMarkers(range);
                }
                updateMarkers(range, value);
            }
        });
    }

    function updateBubble(range, value, bubble) {
        requestAnimationFrame(function () {
            const bubbleTrackRect = range.sliderBubbleTrack.getBoundingClientRect();
            const bubbleRect = bubble.getBoundingClientRect();

            let bubblePos = bubbleTrackRect.width * value / 100;
            bubblePos = Math.min(Math.max(bubblePos, bubbleRect.width / 2), bubbleTrackRect.width - bubbleRect.width / 2);

            bubble.style.left = bubblePos + 'px';

            if (range.getBubbleHtml) {
                value = range.getBubbleHtml(value);
            } else {
                if (range.getBubbleText) {
                    value = range.getBubbleText(value);
                } else {
                    value = mapFractionToValue(range, value / 100).toLocaleString();
                }
                value = '<h1 class="sliderBubbleText">' + value + '</h1>';
            }

            bubble.innerHTML = value;
        });
    }

    function setMarker(range, valueMarker, marker, valueProgress) {
        requestAnimationFrame(function () {
            const bubbleTrackRect = range.sliderBubbleTrack.getBoundingClientRect();
            const markerRect = marker.getBoundingClientRect();

            if (!bubbleTrackRect.width || !markerRect.width) {
                // width is not set, most probably because the OSD is currently hidden
                return;
            }

            let markerPos = (bubbleTrackRect.width * valueMarker / 100) - markerRect.width / 2;
            markerPos = Math.min(Math.max(markerPos, - markerRect.width / 2), bubbleTrackRect.width - markerRect.width / 2);

            marker.style.left = markerPos + 'px';

            if (valueProgress >= valueMarker) {
                marker.classList.remove('unwatched');
                marker.classList.add('watched');
            } else {
                marker.classList.add('unwatched');
                marker.classList.remove('watched');
            }
        });
    }

    function updateMarkers(range, currentValue) {
        if (range.markerInfo && range.markerInfo.length && range.markerElements && range.markerElements.length) {
            for (let i = 0, length = range.markerElements.length; i < length; i++) {
                if (range.markerInfo.length > i) {
                    setMarker(range, mapFractionToValue(range, range.markerInfo[i].progress), range.markerElements[i], currentValue);
                }
            }
        }
    }

    function addMarkers(range) {
        range.markerInfo = [];
        if (range.getMarkerInfo) {
            range.markerInfo = range.getMarkerInfo();
        }

        function getMarkerHtml(markerInfo) {
            let markerTypeSpecificClasses = '';

            if (markerInfo.className === 'chapterMarker') {
                markerTypeSpecificClasses = markerInfo.className;

                if (typeof markerInfo.name === 'string' && markerInfo.name.length) {
                    // limit the class length in case the name contains half a novel
                    markerTypeSpecificClasses = `${markerInfo.className} marker-${markerInfo.name.substring(0, 100).toLowerCase().replace(' ', '-')}`;
                }
            }

            return `<span class="material-icons sliderMarker ${markerTypeSpecificClasses}" aria-hidden="true"></span>`;
        }

        range.markerInfo.forEach(info => {
            range.markerContainerElement.insertAdjacentHTML('beforeend', getMarkerHtml(info));
        });

        range.markerElements = range.markerContainerElement.querySelectorAll('.sliderMarker');
        range.triedAddingMarkers = true;
    }

    EmbySliderPrototype.attachedCallback = function () {
        if (this.getAttribute('data-embyslider') === 'true') {
            return;
        }

        this.setAttribute('data-embyslider', 'true');

        this.classList.add('mdl-slider');
        this.classList.add('mdl-js-slider');

        if (browser.edge) {
            this.classList.add('slider-browser-edge');
        }
        if (!layoutManager.mobile) {
            this.classList.add('mdl-slider-hoverthumb');
        }
        if (layoutManager.tv) {
            this.classList.add('show-focus');
        }

        const topContainer = dom.parentWithClass(this, 'sliderContainer-settings');

        if (topContainer && this.getAttribute('label')) {
            const label = this.ownerDocument.createElement('label');
            label.innerText = this.getAttribute('label');
            label.classList.add('sliderLabel');
            label.htmlFor = this.id;
            topContainer.insertBefore(label, topContainer.firstChild);
        }

        const containerElement = this.parentNode;
        containerElement.classList.add('mdl-slider-container');

        let htmlToInsert = '';

        htmlToInsert += '<div class="mdl-slider-background-flex-container">';
        htmlToInsert += '<div class="mdl-slider-background-flex">';
        htmlToInsert += '<div class="mdl-slider-background-flex-inner">';

        // the more of these, the more ranges we can display
        htmlToInsert += '<div class="mdl-slider-background-upper"></div>';

        htmlToInsert += '<div class="mdl-slider-background-lower"></div>';

        htmlToInsert += '</div>';
        htmlToInsert += '</div>';
        htmlToInsert += '</div>';

        htmlToInsert += '<div class="sliderBubbleTrack"><div class="sliderBubble hide"></div></div>';

        containerElement.insertAdjacentHTML('beforeend', htmlToInsert);

        this.sliderBubbleTrack = containerElement.querySelector('.sliderBubbleTrack');
        this.backgroundLower = containerElement.querySelector('.mdl-slider-background-lower');
        this.backgroundUpper = containerElement.querySelector('.mdl-slider-background-upper');
        const sliderBubble = containerElement.querySelector('.sliderBubble');

        let hasHideBubbleClass = sliderBubble.classList.contains('hide');

        this.markerContainerElement = containerElement.querySelector('.sliderMarkerContainer');

        dom.addEventListener(this, 'input', function () {
            this.dragging = true;

            if (this.dataset.sliderKeepProgress !== 'true') {
                updateValues.call(this);
            }

            const bubbleValue = mapValueToFraction(this, this.value) * 100;
            updateBubble(this, bubbleValue, sliderBubble);

            if (hasHideBubbleClass) {
                sliderBubble.classList.remove('hide');
                hasHideBubbleClass = false;
            }
        }, {
            passive: true
        });

        dom.addEventListener(this, 'change', function () {
            this.dragging = false;

            if (this.dataset.sliderKeepProgress === 'true') {
                updateValues.call(this);
            }

            sliderBubble.classList.add('hide');
            hasHideBubbleClass = true;
        }, {
            passive: true
        });

        /* eslint-disable-next-line compat/compat */
        dom.addEventListener(this, (window.PointerEvent ? 'pointermove' : 'mousemove'), function (e) {
            if (!this.dragging) {
                const bubbleValue = mapClientToFraction(this, e.clientX) * 100;

                updateBubble(this, bubbleValue, sliderBubble);

                if (hasHideBubbleClass) {
                    sliderBubble.classList.remove('hide');
                    hasHideBubbleClass = false;
                }
            }
        }, {
            passive: true
        });

        /* eslint-disable-next-line compat/compat */
        dom.addEventListener(this, (window.PointerEvent ? 'pointerleave' : 'mouseleave'), function () {
            sliderBubble.classList.add('hide');
            hasHideBubbleClass = true;
        }, {
            passive: true
        });

        // HACK: iPhone/iPad do not change input by touch
        if (browser.iOS) {
            dom.addEventListener(this, 'touchstart', function (e) {
                if (e.targetTouches.length !== 1) {
                    return;
                }

                this.touched = true;

                const fraction = mapClientToFraction(this, e.targetTouches[0].clientX);
                this.value = mapFractionToValue(this, fraction);

                this.dispatchEvent(new Event('input', {
                    bubbles: true,
                    cancelable: false
                }));

                // Prevent 'pointermove' and 'click' after 'touch*'
                // FIXME: Still have some 'pointermove' and 'click' that bypass 'touchstart'
                e.preventDefault();
            }, {
                capture: true
            });

            dom.addEventListener(this, 'touchmove', function (e) {
                if (!this.touched || e.targetTouches.length !== 1) {
                    return;
                }

                const fraction = mapClientToFraction(this, e.targetTouches[0].clientX);
                this.value = mapFractionToValue(this, fraction);

                this.dispatchEvent(new Event('input', {
                    bubbles: true,
                    cancelable: false
                }));
            }, {
                passive: true
            });

            dom.addEventListener(this, 'touchend', function () {
                const range = this;

                setTimeout(function () {
                    range.touched = false;

                    range.dispatchEvent(new Event('change', {
                        bubbles: true,
                        cancelable: false
                    }));
                }, 0);
            }, {
                passive: true
            });
        }

        if (supportsValueSetOverride) {
            this.addEventListener('valueset', updateValues.bind(this, true));
        } else {
            startInterval(this);
        }
    };

    /**
     * Keyboard dragging timeout.
     * After this delay "change" event will be fired.
     */
    const KeyboardDraggingTimeout = 1000;

    /**
     * Keyboard dragging timer.
     */
    let keyboardDraggingTimer;

    /**
     * Start keyboard dragging.
     *
     * @param {Object} elem slider itself
     */
    function startKeyboardDragging(elem) {
        elem.keyboardDragging = true;

        clearTimeout(keyboardDraggingTimer);
        keyboardDraggingTimer = setTimeout(function () {
            finishKeyboardDragging(elem);
        }, KeyboardDraggingTimeout);
    }

    /**
     * Finish keyboard dragging.
     *
     * @param {Object} elem slider itself
     */
    function finishKeyboardDragging(elem) {
        clearTimeout(keyboardDraggingTimer);
        keyboardDraggingTimer = undefined;

        elem.keyboardDragging = false;

        const event = new Event('change', {
            bubbles: true,
            cancelable: false
        });
        elem.dispatchEvent(event);
    }

    /**
     * Do step by delta.
     *
     * @param {Object} elem slider itself
     * @param {number} delta step amount
     */
    function stepKeyboard(elem, delta) {
        startKeyboardDragging(elem);

        elem.value = Math.max(elem.min, Math.min(elem.max, parseFloat(elem.value) + delta));

        const event = new Event('input', {
            bubbles: true,
            cancelable: false
        });
        elem.dispatchEvent(event);
    }

    /**
     * Handle KeyDown event
     */
    function onKeyDown(e) {
        switch (keyboardnavigation.getKeyName(e)) {
            case 'ArrowLeft':
            case 'Left':
                stepKeyboard(this, -this.keyboardStepDown || -1);
                e.preventDefault();
                e.stopPropagation();
                break;
            case 'ArrowRight':
            case 'Right':
                stepKeyboard(this, this.keyboardStepUp || 1);
                e.preventDefault();
                e.stopPropagation();
                break;
        }
    }

    /**
     * Enable keyboard dragging.
     */
    EmbySliderPrototype.enableKeyboardDragging = function () {
        if (!this.keyboardDraggingEnabled) {
            this.addEventListener('keydown', onKeyDown);
            this.keyboardDraggingEnabled = true;
        }
    };

    /**
     * Set steps for keyboard input.
     *
     * @param {number} stepDown step to reduce
     * @param {number} stepUp step to increase
     */
    EmbySliderPrototype.setKeyboardSteps = function (stepDown, stepUp) {
        this.keyboardStepDown = stepDown || stepUp || 1;
        this.keyboardStepUp = stepUp || stepDown || 1;
    };

    function setRange(elem, startPercent, endPercent) {
        const style = elem.style;
        style.left = Math.max(startPercent, 0) + '%';

        const widthPercent = endPercent - startPercent;
        style.width = Math.max(Math.min(widthPercent, 100), 0) + '%';
    }

    function mapRangesFromRuntimeToPercent(ranges, runtime) {
        if (!runtime) {
            return [];
        }

        return ranges.map(function (r) {
            return {
                start: (r.start / runtime) * 100,
                end: (r.end / runtime) * 100
            };
        });
    }

    EmbySliderPrototype.setBufferedRanges = function (ranges, runtime, position) {
        const elem = this.backgroundUpper;
        if (!elem) {
            return;
        }

        if (runtime != null) {
            ranges = mapRangesFromRuntimeToPercent(ranges, runtime);

            position = (position / runtime) * 100;
        }

        for (const range of ranges) {
            if (position != null) {
                if (position >= range.end) {
                    continue;
                }
            }

            setRange(elem, range.start, range.end);
            return;
        }

        setRange(elem, 0, 0);
    };

    EmbySliderPrototype.setIsClear = function (isClear) {
        const backgroundLower = this.backgroundLower;
        if (backgroundLower) {
            if (isClear) {
                backgroundLower.classList.add('mdl-slider-background-lower-clear');
            } else {
                backgroundLower.classList.remove('mdl-slider-background-lower-clear');
            }
        }
    };

    function startInterval(range) {
        const interval = range.interval;
        if (interval) {
            clearInterval(interval);
        }
        range.interval = setInterval(updateValues.bind(range, true), 100);
    }

    EmbySliderPrototype.detachedCallback = function () {
        const interval = this.interval;
        if (interval) {
            clearInterval(interval);
        }
        this.interval = null;
        this.backgroundUpper = null;
        this.backgroundLower = null;
    };

    document.registerElement('emby-slider', {
        prototype: EmbySliderPrototype,
        extends: 'input'
    });

/* eslint-enable indent */
