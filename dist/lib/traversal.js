"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMTraversal = extendDOMTraversal;
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function extendDOMTraversal(DOM) {
  DOM.prototype.parent = function (selector) {
    var parents = this.elems.map(function (el) {
      return el.parentNode;
    }).filter(Boolean);
    return selector ? new DOM(parents).filter(selector) : new DOM(parents);
  };
  DOM.prototype.children = function (selector) {
    var all = [];
    this.each(function (el) {
      return all.push.apply(all, _toConsumableArray(el.children));
    });
    return selector ? new DOM(all).filter(selector) : new DOM(all);
  };
  DOM.prototype.closest = function (selector) {
    var found = this.elems.map(function (el) {
      return el.closest(selector);
    }).filter(Boolean);
    return new DOM(found);
  };
  DOM.prototype.prev = function (selector) {
    var prev = this.elems.map(function (el) {
      return el.previousElementSibling;
    }).filter(Boolean);
    return selector ? new DOM(prev).filter(selector) : new DOM(prev);
  };
  DOM.prototype.next = function (selector) {
    var next = this.elems.map(function (el) {
      return el.nextElementSibling;
    }).filter(Boolean);
    return selector ? new DOM(next).filter(selector) : new DOM(next);
  };
  DOM.prototype.first = function (selector) {
    var first = this.elems.map(function (el) {
      return el.firstElementChild;
    }).filter(Boolean);
    return selector ? new DOM(first).filter(selector) : new DOM(first);
  };
  DOM.prototype.last = function (selector) {
    var last = this.elems.map(function (el) {
      return el.lastElementChild;
    }).filter(Boolean);
    return selector ? new DOM(last).filter(selector) : new DOM(last);
  };
  DOM.prototype.find = function (selector) {
    var elems = [];
    this.each(function (el) {
      var found = Selector(selector, el);
      if (found && found.length) elems.push.apply(elems, _toConsumableArray(found));
    });
    return new DOM(elems);
  };
}