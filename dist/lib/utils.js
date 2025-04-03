"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.domUtils = void 0;
var domUtils = exports.domUtils = {
  cssNumber: {
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
  },
  propMap: {
    tabindex: 'tabIndex',
    readonly: 'readOnly',
    "for": 'htmlFor',
    "class": 'className',
    maxlength: 'maxLength',
    cellspacing: 'cellSpacing',
    cellpadding: 'cellPadding',
    rowspan: 'rowSpan',
    colspan: 'colSpan',
    usemap: 'useMap',
    frameborder: 'frameBorder',
    contenteditable: 'contentEditable'
  },
  dasherize: function dasherize(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  },
  camelize: function camelize(str) {
    return str.replace(/-([a-z])/g, function (_, c) {
      return c.toUpperCase();
    });
  },
  matches: function matches(el, selector) {
    var _el$matches, _el$webkitMatchesSele, _el$mozMatchesSelecto;
    return (el === null || el === void 0 || (_el$matches = el.matches) === null || _el$matches === void 0 ? void 0 : _el$matches.call(el, selector)) || (el === null || el === void 0 || (_el$webkitMatchesSele = el.webkitMatchesSelector) === null || _el$webkitMatchesSele === void 0 ? void 0 : _el$webkitMatchesSele.call(el, selector)) || (el === null || el === void 0 || (_el$mozMatchesSelecto = el.mozMatchesSelector) === null || _el$mozMatchesSelecto === void 0 ? void 0 : _el$mozMatchesSelecto.call(el, selector)) || false;
  },
  maybeAddPx: function maybeAddPx(prop, value) {
    return typeof value === 'number' && !domUtils.cssNumber[prop] ? "".concat(value, "px") : value;
  },
  setAttr: function setAttr(el, name, value) {
    value == null ? el.removeAttribute(name) : el.setAttribute(name, value);
  },
  deserializeValue: function deserializeValue(value) {
    try {
      if (value === 'true') return true;
      if (value === 'false') return false;
      if (value === 'null') return null;
      if (+value + '' === value) return +value;
      if (/^[\[{]/.test(value)) return JSON.parse(value);
      return value;
    } catch (_unused) {
      return value;
    }
  },
  guessDefaultDisplay: function guessDefaultDisplay(el) {
    var tag = el.tagName.toLowerCase();
    switch (tag) {
      case 'table':
        return 'table';
      case 'thead':
        return 'table-header-group';
      case 'tfoot':
        return 'table-footer-group';
      case 'tr':
        return 'table-row';
      case 'th':
      case 'td':
        return 'table-cell';
      case 'span':
        return 'inline';
      case 'li':
        return 'list-item';
    }
    return 'block';
  }
};