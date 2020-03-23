define(['dom'], function (dom) {
    'use strict';

    /**
   * Copyright 2012, Digital Fusion
   * Licensed under the MIT license.
   * http://teamdf.com/jquery-plugins/license/
   *
   * @author Sam Sehnert
   * @desc A small plugin that checks whether elements are within
   *       the user visible viewport of a web browser.
   *       only accounts for vertical position, not horizontal.
   */
    function visibleInViewport(elem, partial, thresholdX, thresholdY) {

        thresholdX = thresholdX || 0;
        thresholdY = thresholdY || 0;

        if (!elem.getBoundingClientRect) {
            return true;
        }

        var windowSize = dom.getWindowSize();

        var vpWidth = windowSize.innerWidth;
        var vpHeight = windowSize.innerHeight;

        // Use this native browser method, if available.
        var rec = elem.getBoundingClientRect();
        var tViz = rec.top >= 0 && rec.top < vpHeight + thresholdY;
        var bViz = rec.bottom > 0 && rec.bottom <= vpHeight + thresholdY;
        var lViz = rec.left >= 0 && rec.left < vpWidth + thresholdX;
        var rViz = rec.right > 0 && rec.right <= vpWidth + thresholdX;
        var vVisible = partial ? tViz || bViz : tViz && bViz;
        var hVisible = partial ? lViz || rViz : lViz && rViz;

        return vVisible && hVisible;
    }

    return visibleInViewport;
});
