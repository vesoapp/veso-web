"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function refToCallback(ref) {
    return function (newValue) {
        if (typeof ref === 'function') {
            ref(newValue);
        }
        else if (ref != null) {
            ref.current = newValue;
        }
    };
}
exports.refToCallback = refToCallback;
var weakMem = new WeakMap();
var weakMemoize = function (ref) {
    if (weakMem.has(ref)) {
        return weakMem.get(ref);
    }
    var cb = refToCallback(ref);
    weakMem.set(ref, cb);
    return cb;
};
function useRefToCallback(ref) {
    return weakMemoize(ref);
}
exports.useRefToCallback = useRefToCallback;
