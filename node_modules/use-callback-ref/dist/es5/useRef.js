"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function useCallbackRef(initialValue, callback) {
    var ref = react_1.useState(function () { return ({
        value: initialValue,
        callback: callback,
        facade: {
            get current() {
                return ref.value;
            },
            set current(value) {
                var last = ref.value;
                if (last !== value) {
                    ref.value = value;
                    ref.callback(value, last);
                }
            }
        }
    }); })[0];
    ref.callback = callback;
    return ref.facade;
}
exports.useCallbackRef = useCallbackRef;
