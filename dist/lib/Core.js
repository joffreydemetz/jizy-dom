"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DOM = void 0;
var _utils = require("./utils.js");
var _Selector = require("./Selector.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var DOM = exports.DOM = /*#__PURE__*/function () {
  function DOM(selector) {
    var _this = this;
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    _classCallCheck(this, DOM);
    this.elems = (0, _Selector.Selector)(selector, context);
    this.elems.forEach(function (el) {
      return _this._patchElement(el);
    });
  }
  return _createClass(DOM, [{
    key: "_patchElement",
    value: function _patchElement(el) {
      var _arguments = arguments,
        _this2 = this;
      el.data = function (key, val) {
        if (!key) return _this2._getAllData(el);
        return _arguments.length === 2 ? _this2._setData(el, key, val) : _this2._getData(el, key);
      };
      el.css = function (prop, val) {
        var important = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        return _arguments.length === 1 ? _this2._getCss(el, prop) : _this2._setCss(el, prop, val, important);
      };
      el.addClass = function (cls) {
        return _this2._class(el, 'add', cls);
      };
      el.removeClass = function (cls) {
        return _this2._class(el, 'remove', cls);
      };
      el.hasClass = function (cls) {
        return el.classList.contains(cls);
      };
      el.hasClasses = function (clsList) {
        return clsList.some(function (cls) {
          return el.classList.contains(cls);
        });
      };
      el.hasAllClasses = function (clsList) {
        return clsList.every(function (cls) {
          return el.classList.contains(cls);
        });
      };
    }
  }, {
    key: "_getCss",
    value: function _getCss(el, prop) {
      return el.style[_utils.domUtils.camelize(prop)] || getComputedStyle(el).getPropertyValue(_utils.domUtils.dasherize(prop));
    }
  }, {
    key: "_setCss",
    value: function _setCss(el, prop, val, important) {
      if (val === null) el.style.removeProperty(_utils.domUtils.dasherize(prop));else if (important) el.style.setProperty(_utils.domUtils.dasherize(prop), _utils.domUtils.maybeAddPx(prop, val), 'important');else el.style[_utils.domUtils.camelize(prop)] = _utils.domUtils.maybeAddPx(prop, val);
    }
  }, {
    key: "_getData",
    value: function _getData(el, key) {
      var attr = el.getAttribute("data-".concat(_utils.domUtils.dasherize(key)));
      return attr !== null ? _utils.domUtils.deserializeValue(attr) : undefined;
    }
  }, {
    key: "_setData",
    value: function _setData(el, key, val) {
      if (_typeof(val) === 'object') {
        for (var k in val) this._setData(el, "".concat(key, "-").concat(k), val[k]);
      } else {
        _utils.domUtils.setAttr(el, "data-".concat(_utils.domUtils.dasherize(key)), val);
      }
    }
  }, {
    key: "_getAllData",
    value: function _getAllData(el) {
      var data = {};
      for (var key in el.dataset) data[key] = this._getData(el, key);
      return data;
    }
  }, {
    key: "_class",
    value: function _class(el, action, cls) {
      cls.split(' ').forEach(function (c) {
        return c && el.classList[action](c);
      });
    }
  }, {
    key: "each",
    value: function each(callback) {
      var _this3 = this;
      this.elems.forEach(function (el, i) {
        return callback.call(_this3, el, i);
      });
      return this;
    }
  }]);
}();