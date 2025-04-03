"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMMisc = extendDOMMisc;
var _utils = require("./utils.js");
function extendDOMMisc(DOM) {
  DOM.prototype.toggle = function () {
    return this.each(function (el) {
      var display = _utils.domUtils.guessDefaultDisplay(el);
      if (!el.dataset.cssInitialDisplay) {
        el.dataset.cssInitialDisplay = display;
      }
      el.style.display = el.style.display === 'none' || getComputedStyle(el).display === 'none' ? el.dataset.cssInitialDisplay : 'none';
    });
  };
  DOM.prototype.show = function () {
    return this.each(function (el) {
      var display = _utils.domUtils.guessDefaultDisplay(el);
      if (!el.dataset.cssInitialDisplay) {
        el.dataset.cssInitialDisplay = display;
      }
      el.style.display = el.dataset.cssInitialDisplay;
    });
  };
  DOM.prototype.hide = function () {
    return this.each(function (el) {
      if (!el.dataset.cssInitialDisplay) {
        el.dataset.cssInitialDisplay = _utils.domUtils.guessDefaultDisplay(el);
      }
      el.style.display = 'none';
    });
  };
  DOM.prototype.offset = function () {
    if (!this.elems.length) return {
      top: 0,
      left: 0
    };
    var rect = this.elems[0].getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  };
  DOM.prototype.scrollTop = function (position) {
    var _this$elems$;
    if (arguments.length > 0) {
      return this.each(function (el) {
        el.style.scrollBehavior = 'smooth';
        el.scrollTop = position || 0;
      });
    }
    return ((_this$elems$ = this.elems[0]) === null || _this$elems$ === void 0 ? void 0 : _this$elems$.scrollTop) || 0;
  };
  DOM.prototype.serialize = function () {
    if (!this.elems.length || !(this.elems[0] instanceof HTMLFormElement)) return '';
    var formData = new FormData(this.elems[0]);
    return new URLSearchParams(formData).toString();
  };
}