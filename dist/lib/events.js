"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMEvents = extendDOMEvents;
var _utils = require("./utils.js");
function extendDOMEvents(DOM) {
  DOM.prototype.on = function (events, callback) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var list = events.split(/\s+/);
    return this.each(function (el) {
      return list.forEach(function (e) {
        return el.addEventListener(e, callback, options);
      });
    });
  };
  DOM.prototype.off = function (events, callback) {
    var list = events.split(/\s+/);
    return this.each(function (el) {
      return list.forEach(function (e) {
        return el.removeEventListener(e, callback);
      });
    });
  };
  DOM.prototype.delegate = function (events, selector, callback) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return this.on(events, function (event) {
      if (event.target && _utils.domUtils.matches(event.target, selector)) {
        callback.call(event.target, event);
      }
    }, options);
  };
  DOM.prototype.trigger = function (type) {
    var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var evt = detail ? new CustomEvent(type, {
      detail: detail,
      bubbles: bubbles,
      cancelable: cancelable
    }) : new Event(type, {
      bubbles: bubbles,
      cancelable: cancelable
    });
    return this.each(function (el) {
      return el.dispatchEvent(evt);
    });
  };
  DOM.prototype.submit = function () {
    var el = this.elems[0];
    if ((el === null || el === void 0 ? void 0 : el.tagName) === 'FORM') el.submit();
    return this;
  };
  DOM.prototype.focus = function () {
    var _this$elems$, _this$elems$$focus;
    (_this$elems$ = this.elems[0]) === null || _this$elems$ === void 0 || (_this$elems$$focus = _this$elems$.focus) === null || _this$elems$$focus === void 0 || _this$elems$$focus.call(_this$elems$);
    return this;
  };
}