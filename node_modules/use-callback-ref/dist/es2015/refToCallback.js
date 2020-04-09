export function refToCallback(ref) {
    return function (newValue) {
        if (typeof ref === 'function') {
            ref(newValue);
        }
        else if (ref != null) {
            ref.current = newValue;
        }
    };
}
var weakMem = new WeakMap();
var weakMemoize = function (ref) {
    if (weakMem.has(ref)) {
        return weakMem.get(ref);
    }
    var cb = refToCallback(ref);
    weakMem.set(ref, cb);
    return cb;
};
export function useRefToCallback(ref) {
    return weakMemoize(ref);
}
