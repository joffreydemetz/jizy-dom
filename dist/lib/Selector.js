"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selector = Selector;
function Selector(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  if (!selector) return [];
  if (selector instanceof Element || selector === window || selector.nodeType) {
    return [selector];
  }
  if (selector instanceof NodeList || Array.isArray(selector)) {
    return Array.from(selector);
  }
  if (typeof selector === 'string') {
    return Array.from((context || document).querySelectorAll(selector));
  }
  return [];
}