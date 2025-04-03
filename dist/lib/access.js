"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMAccess = extendDOMAccess;
function extendDOMAccess(DOM) {
  DOM.prototype.toArray = function () {
    return this.elems;
  };
  DOM.prototype.exists = function () {
    return this.elems.length > 0;
  };
  DOM.prototype.size = function () {
    return this.elems.length;
  };
  DOM.prototype.map = function (callback) {
    var _this = this;
    var results = [];
    this.elems.forEach(function (el, i) {
      var result = callback.call(_this, el, i);
      if (result !== false) results.push(result);
    });
    return results;
  };
  DOM.prototype.filter = function (callback) {
    var _this2 = this;
    if (typeof callback !== 'function') {
      var selector = callback;
      callback = function callback(el) {
        return el.matches(selector);
      };
    }
    var filtered = this.elems.filter(function (el, i) {
      return callback.call(_this2, el, i) !== false;
    });
    return new DOM(filtered);
  };
  DOM.prototype.not = function (selector) {
    var exclude = [];
    if (typeof selector === 'function') {
      this.each(function (el, i) {
        if (!selector.call(el, i)) exclude.push(el);
      });
    } else {
      exclude = new DOM(selector).toArray();
    }
    var result = this.elems.filter(function (el) {
      return !exclude.includes(el);
    });
    return new DOM(result);
  };
  DOM.prototype.get = function () {
    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var idx = index >= 0 ? index : this.elems.length + index;
    return this.elems[idx] ? new DOM(this.elems[idx]) : this;
  };
  DOM.prototype.getElement = function () {
    var tag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
    return this.elems[0] || document.createElement(tag);
  };
  DOM.prototype.is = function (selector) {
    var el = this.elems[0];
    if (!el) return false;
    if (selector instanceof HTMLElement) return el === selector;
    if (selector instanceof DOM) return el === selector.getElement();
    if (typeof selector === 'string') {
      if (selector === ':visible') return getComputedStyle(el).display !== 'none';
      if (selector === ':hidden') return getComputedStyle(el).display === 'none';
      return el.matches(selector);
    }
    return false;
  };
}