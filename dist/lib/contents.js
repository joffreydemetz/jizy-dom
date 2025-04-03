"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMContents = extendDOMContents;
function extendDOMContents(DOM) {
  DOM.prototype.text = function (value) {
    if (arguments.length > 0) {
      return this.each(function (el) {
        return el.innerText = value;
      });
    }
    return this.elems.length > 0 ? this.elems[0].innerText : null;
  };
  DOM.prototype.html = function (value) {
    if (arguments.length > 0) {
      return this.each(function (el) {
        return el.innerHTML = value;
      });
    }
    return this.elems.length > 0 ? this.elems[0].innerHTML : null;
  };
  DOM.prototype.content = function (value) {
    if (arguments.length > 0) {
      return this.each(function (el) {
        return el.textContent = value;
      });
    }
    return this.elems.length > 0 ? this.elems[0].textContent : null;
  };
}