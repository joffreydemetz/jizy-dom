"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMAttributes = extendDOMAttributes;
var _utils = require("./utils.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function extendDOMAttributes(DOM) {
  var _arguments = arguments;
  var dasherize = _utils.domUtils.dasherize,
    camelize = _utils.domUtils.camelize,
    deserializeValue = _utils.domUtils.deserializeValue,
    setAttr = _utils.domUtils.setAttr,
    propMap = _utils.domUtils.propMap;
  var css = function css(el, key, value) {
    var important = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (_arguments.length >= 3) {
      if (value === null) {
        el.style.removeProperty(dasherize(key));
      } else {
        value = _utils.domUtils.maybeAddPx(dasherize(key), value);
        if (important) {
          el.style.setProperty(dasherize(key), value, 'important');
        } else {
          el.style[camelize(key)] = value;
        }
      }
      return;
    }
    return el.style[camelize(key)] || getComputedStyle(el).getPropertyValue(dasherize(key));
  };
  DOM.prototype.css = function (prop, value, important) {
    var _this = this;
    if (arguments.length >= 2) {
      return this.each(function (el) {
        return css(el, prop, value, important);
      });
    }
    if (!this.elems.length) return null;
    if (typeof prop === 'string') {
      return css(this.elems[0], prop);
    }
    if (Array.isArray(prop)) {
      var result = {};
      prop.forEach(function (key) {
        result[key] = css(_this.elems[0], key);
      });
      return result;
    }
    return null;
  };
  DOM.prototype.data = function (key, value) {
    if (arguments.length >= 1 && key) {
      var _this$elems$, _this$elems$$getAttri;
      if (arguments.length === 2) {
        return this.each(function (el) {
          if (_typeof(value) === 'object' && value !== null) {
            Object.entries(value).forEach(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                subKey = _ref2[0],
                subVal = _ref2[1];
              el.setAttribute("data-".concat(dasherize(key + '-' + subKey)), subVal);
            });
          } else {
            el.setAttribute("data-".concat(dasherize(key)), value);
          }
        });
      }
      var val = (_this$elems$ = this.elems[0]) === null || _this$elems$ === void 0 || (_this$elems$$getAttri = _this$elems$.getAttribute) === null || _this$elems$$getAttri === void 0 ? void 0 : _this$elems$$getAttri.call(_this$elems$, "data-".concat(dasherize(key)));
      return val !== null ? deserializeValue(val) : undefined;
    }
    var dataset = {};
    var el = this.elems[0];
    if (el && el.dataset) {
      for (var k in el.dataset) {
        dataset[k] = deserializeValue(el.dataset[k]);
      }
    }
    return dataset;
  };
  DOM.prototype.attr = function (name, value) {
    if (arguments.length === 2) {
      return this.each(function (el) {
        if (el.nodeType === 1) setAttr(el, name, value);
      });
    }
    var el = this.elems[0];
    if ((el === null || el === void 0 ? void 0 : el.nodeType) === 1) {
      return el.getAttribute(name);
    }
    return null;
  };
  DOM.prototype.prop = function (name, value) {
    var propName = propMap[name] || name;
    if (arguments.length === 2) {
      return this.each(function (el) {
        el[propName] = value;
      });
    }
    var el = this.elems[0];
    return el ? el[propName] : undefined;
  };
  DOM.prototype.tagName = function () {
    return this.elems.length > 0 ? this.elems[0].tagName : null;
  };
  DOM.prototype.val = function (value) {
    if (arguments.length > 0) {
      return this.each(function (el) {
        return el.value = value !== null && value !== void 0 ? value : '';
      });
    }
    return this.elems.length > 0 ? this.elems[0].value : null;
  };
  DOM.prototype.outerHeight = function () {
    var el = this.elems[0];
    if (!el) return 0;
    var style = getComputedStyle(el);
    return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
  };
  DOM.prototype.outerWidth = function () {
    var el = this.elems[0];
    if (!el) return 0;
    var style = getComputedStyle(el);
    return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
  };
  DOM.prototype.addClass = function (className) {
    return this.each(function (el) {
      return el.classList.add(className);
    });
  };
  DOM.prototype.removeClass = function (className) {
    return this.each(function (el) {
      return el.classList.remove(className);
    });
  };
  DOM.prototype.toggleClass = function (className) {
    return this.each(function (el) {
      return el.classList.toggle(className);
    });
  };
  DOM.prototype.replaceClass = function (oldClass, newClass) {
    return this.each(function (el) {
      return el.classList.replace(oldClass, newClass);
    });
  };
  DOM.prototype.hasClass = function (className) {
    return this.elems.length > 0 ? this.elems[0].classList.contains(className) : false;
  };
  DOM.prototype.hasClasses = function (classNames) {
    var _this2 = this;
    return this.elems.length > 0 ? classNames.every(function (className) {
      return _this2.elems[0].classList.contains(className);
    }) : false;
  };
  DOM.prototype.containsClass = function (search) {
    return this.elems.length > 0 ? Array.from(this.elems[0].classList).some(function (className) {
      return className.includes(search);
    }) : false;
  };
}