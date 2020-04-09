"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = require("prop-types");

var constants = _interopRequireWildcard(require("focus-lock/constants"));

var _useCallbackRef = require("use-callback-ref");

var _FocusGuard = require("./FocusGuard");

var _medium = require("./medium");

var emptyArray = [];

var FocusLock = _react.default.forwardRef(function (props, parentRef) {
  var _objectSpread2;

  var _useState = (0, _react.useState)(),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      realObserved = _useState2[0],
      setObserved = _useState2[1];

  var observed = (0, _react.useRef)();
  var isActive = (0, _react.useRef)(false);
  var originalFocusedElement = (0, _react.useRef)(null);
  var children = props.children,
      disabled = props.disabled,
      noFocusGuards = props.noFocusGuards,
      persistentFocus = props.persistentFocus,
      autoFocus = props.autoFocus,
      allowTextSelection = props.allowTextSelection,
      group = props.group,
      className = props.className,
      whiteList = props.whiteList,
      _props$shards = props.shards,
      shards = _props$shards === void 0 ? emptyArray : _props$shards,
      _props$as = props.as,
      Container = _props$as === void 0 ? 'div' : _props$as,
      _props$lockProps = props.lockProps,
      containerProps = _props$lockProps === void 0 ? {} : _props$lockProps,
      SideCar = props.sideCar,
      shouldReturnFocus = props.returnFocus,
      onActivationCallback = props.onActivation,
      onDeactivationCallback = props.onDeactivation;

  var _useState3 = (0, _react.useState)({}),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 1),
      id = _useState4[0]; // SIDE EFFECT CALLBACKS


  var onActivation = (0, _react.useCallback)(function () {
    originalFocusedElement.current = originalFocusedElement.current || document && document.activeElement;

    if (observed.current && onActivationCallback) {
      onActivationCallback(observed.current);
    }

    isActive.current = true;
  }, [onActivationCallback]);
  var onDeactivation = (0, _react.useCallback)(function () {
    isActive.current = false;

    if (onDeactivationCallback) {
      onDeactivationCallback(observed.current);
    }
  }, [onDeactivationCallback]);
  var returnFocus = (0, _react.useCallback)(function (allowDefer) {
    var current = originalFocusedElement.current;

    if (Boolean(shouldReturnFocus) && current && current.focus) {
      var focusOptions = (0, _typeof2.default)(shouldReturnFocus) === 'object' ? shouldReturnFocus : undefined;
      originalFocusedElement.current = null;

      if (allowDefer) {
        // React might return focus after update
        // it's safer to defer the action
        Promise.resolve().then(function () {
          return current.focus(focusOptions);
        });
      } else {
        current.focus(focusOptions);
      }
    }
  }, [shouldReturnFocus]); // MEDIUM CALLBACKS

  var onFocus = (0, _react.useCallback)(function (event) {
    if (isActive.current) {
      _medium.mediumFocus.useMedium(event);
    }
  }, []);
  var onBlur = _medium.mediumBlur.useMedium; // REF PROPAGATION
  // not using real refs due to race conditions

  var setObserveNode = (0, _react.useCallback)(function (newObserved) {
    if (observed.current !== newObserved) {
      observed.current = newObserved;
      setObserved(newObserved);
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    if (typeof allowTextSelection !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('React-Focus-Lock: allowTextSelection is deprecated and enabled by default');
    }

    _react.default.useEffect(function () {
      if (!observed.current) {
        // eslint-disable-next-line no-console
        console.error('FocusLock: could not obtain ref to internal node');
      }
    }, []);
  }

  var lockProps = (0, _objectSpread3.default)((_objectSpread2 = {}, (0, _defineProperty2.default)(_objectSpread2, constants.FOCUS_DISABLED, disabled && 'disabled'), (0, _defineProperty2.default)(_objectSpread2, constants.FOCUS_GROUP, group), _objectSpread2), containerProps);
  var hasLeadingGuards = noFocusGuards !== true;
  var hasTailingGuards = hasLeadingGuards && noFocusGuards !== 'tail';
  var mergedRef = (0, _useCallbackRef.useMergeRefs)([parentRef, setObserveNode]);
  return _react.default.createElement(_react.default.Fragment, null, hasLeadingGuards && [_react.default.createElement("div", {
    key: "guard-first",
    "data-focus-guard": true,
    tabIndex: disabled ? -1 : 0,
    style: _FocusGuard.hiddenGuard
  }), // nearest focus guard
  _react.default.createElement("div", {
    key: "guard-nearest",
    "data-focus-guard": true,
    tabIndex: disabled ? -1 : 1,
    style: _FocusGuard.hiddenGuard
  })], !disabled && _react.default.createElement(SideCar, {
    id: id,
    sideCar: _medium.mediumSidecar,
    observed: realObserved,
    disabled: disabled,
    persistentFocus: persistentFocus,
    autoFocus: autoFocus,
    whiteList: whiteList,
    shards: shards,
    onActivation: onActivation,
    onDeactivation: onDeactivation,
    returnFocus: returnFocus
  }), _react.default.createElement(Container, (0, _extends2.default)({
    ref: mergedRef
  }, lockProps, {
    className: className,
    onBlur: onBlur,
    onFocus: onFocus
  }), children), hasTailingGuards && _react.default.createElement("div", {
    "data-focus-guard": true,
    tabIndex: disabled ? -1 : 0,
    style: _FocusGuard.hiddenGuard
  }));
});

FocusLock.propTypes = process.env.NODE_ENV !== "production" ? {
  children: _propTypes.node,
  disabled: _propTypes.bool,
  returnFocus: (0, _propTypes.oneOfType)([_propTypes.bool, _propTypes.object]),
  noFocusGuards: _propTypes.bool,
  allowTextSelection: _propTypes.bool,
  autoFocus: _propTypes.bool,
  persistentFocus: _propTypes.bool,
  group: _propTypes.string,
  className: _propTypes.string,
  whiteList: _propTypes.func,
  shards: (0, _propTypes.arrayOf)(_propTypes.any),
  as: (0, _propTypes.oneOfType)([_propTypes.string, _propTypes.func, _propTypes.object]),
  lockProps: _propTypes.object,
  onActivation: _propTypes.func,
  onDeactivation: _propTypes.func,
  sideCar: _propTypes.any.isRequired
} : {};
FocusLock.defaultProps = {
  children: undefined,
  disabled: false,
  returnFocus: false,
  noFocusGuards: false,
  autoFocus: true,
  persistentFocus: false,
  allowTextSelection: undefined,
  group: undefined,
  className: undefined,
  whiteList: undefined,
  shards: undefined,
  as: 'div',
  lockProps: {},
  onActivation: undefined,
  onDeactivation: undefined
};
var _default = FocusLock;
exports.default = _default;