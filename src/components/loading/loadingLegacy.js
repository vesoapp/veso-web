define(['require', 'css!./loadingLegacy'], function (require) {
    'use strict';

    var loadingElem;

    return {
        show: function () {
            var elem = loadingElem;
            if (!elem) {
                elem = document.createElement("img");
                elem.src = require.toUrl('.').split('?')[0] + '/loader.gif';

                loadingElem = elem;
                elem.classList.add('loading-spinner');

                document.body.appendChild(elem);
            }

            elem.classList.remove('hide');
        },
        hide: function () {
            var elem = loadingElem;
            if (elem) {
                elem.classList.add('hide');
            }
        }
    };
});
