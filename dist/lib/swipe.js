"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMSwipe = extendDOMSwipe;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function extendDOMSwipe(DOM) {
  DOM.prototype.swipe = function (callback) {
    var ignore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
      return false;
    };
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var config = _objectSpread({
      threshold: 20,
      restraint: 100,
      allowedTime: 300,
      scrolling: false
    }, opts);
    return this.each(function (el) {
      var startX, startY, startTime;
      var handleStart = function handleStart(e) {
        if (ignore(e)) return;
        var touch = e.changedTouches[0];
        startX = touch.pageX;
        startY = touch.pageY;
        startTime = Date.now();
        if (!config.scrolling) e.preventDefault();
      };
      var handleMove = function handleMove(e) {
        if (!config.scrolling) e.preventDefault();
      };
      var handleEnd = function handleEnd(e) {
        if (ignore(e)) return;
        var touch = e.changedTouches[0];
        var distX = touch.pageX - startX;
        var distY = touch.pageY - startY;
        var elapsed = Date.now() - startTime;
        var swipedir = 'none';
        if (elapsed <= config.allowedTime) {
          if (Math.abs(distX) >= config.threshold && Math.abs(distY) <= config.restraint) {
            swipedir = distX < 0 ? 'left' : 'right';
          } else if (Math.abs(distY) >= config.threshold && Math.abs(distX) <= config.restraint) {
            swipedir = distY < 0 ? 'up' : 'down';
          }
        }
        if (swipedir !== 'none') callback(e, swipedir);
      };
      el.addEventListener('touchstart', handleStart, {
        passive: true
      });
      el.addEventListener('touchmove', handleMove, {
        passive: true
      });
      el.addEventListener('touchend', handleEnd, {
        passive: true
      });
    });
  };
}