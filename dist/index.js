"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DOM", {
  enumerable: true,
  get: function get() {
    return _Core.DOM;
  }
});
Object.defineProperty(exports, "Selector", {
  enumerable: true,
  get: function get() {
    return _Selector.Selector;
  }
});
exports["default"] = void 0;
Object.defineProperty(exports, "domUtils", {
  enumerable: true,
  get: function get() {
    return _utils.domUtils;
  }
});
Object.defineProperty(exports, "extendDOMAccess", {
  enumerable: true,
  get: function get() {
    return _access.extendDOMAccess;
  }
});
Object.defineProperty(exports, "extendDOMAnimations", {
  enumerable: true,
  get: function get() {
    return _animations.extendDOMAnimations;
  }
});
Object.defineProperty(exports, "extendDOMAttributes", {
  enumerable: true,
  get: function get() {
    return _attributes.extendDOMAttributes;
  }
});
Object.defineProperty(exports, "extendDOMContents", {
  enumerable: true,
  get: function get() {
    return _contents.extendDOMContents;
  }
});
Object.defineProperty(exports, "extendDOMEvents", {
  enumerable: true,
  get: function get() {
    return _events.extendDOMEvents;
  }
});
Object.defineProperty(exports, "extendDOMManipulation", {
  enumerable: true,
  get: function get() {
    return _manipulation.extendDOMManipulation;
  }
});
Object.defineProperty(exports, "extendDOMMisc", {
  enumerable: true,
  get: function get() {
    return _misc.extendDOMMisc;
  }
});
Object.defineProperty(exports, "extendDOMSwipe", {
  enumerable: true,
  get: function get() {
    return _swipe.extendDOMSwipe;
  }
});
Object.defineProperty(exports, "extendDOMTraversal", {
  enumerable: true,
  get: function get() {
    return _traversal.extendDOMTraversal;
  }
});
exports.jDOMplugin = exports.jDOMcreate = exports.jDOM = void 0;
var _Selector = require("./lib/Selector.js");
var _Core = require("./lib/Core.js");
var _utils = require("./lib/utils.js");
var _attributes = require("./lib/attributes.js");
var _manipulation = require("./lib/manipulation.js");
var _access = require("./lib/access.js");
var _traversal = require("./lib/traversal.js");
var _contents = require("./lib/contents.js");
var _events = require("./lib/events.js");
var _animations = require("./lib/animations.js");
var _swipe = require("./lib/swipe.js");
var _misc = require("./lib/misc.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var jDOM = exports.jDOM = function jDOM(selector, context) {
  return new _Core.DOM(selector, context);
};
var jDOMplugin = exports.jDOMplugin = function jDOMplugin(name, fn) {
  _Core.DOM.prototype[name] = fn;
};
var jDOMcreate = exports.jDOMcreate = function jDOMcreate(tag) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var el = document.createElement(tag);
  var wrapped = new _Core.DOM([el]);
  if (attrs.className) {
    wrapped.addClass(attrs.className);
    delete attrs.className;
  }
  if (attrs.text) {
    wrapped.text(attrs.text);
    delete attrs.text;
  }
  if (attrs.html) {
    wrapped.html(attrs.html);
    delete attrs.html;
  }
  for (var _i = 0, _Object$entries = Object.entries(attrs); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      key = _Object$entries$_i[0],
      val = _Object$entries$_i[1];
    wrapped.attr(key, val);
  }
  return wrapped;
};
var _default = exports["default"] = _Core.DOM;