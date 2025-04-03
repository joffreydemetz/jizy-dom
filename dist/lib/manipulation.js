"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMManipulation = extendDOMManipulation;
function extendDOMManipulation(DOM, Selector) {
  DOM.prototype.insert = function (newEl, position) {
    var map = {
      before: 'beforebegin',
      after: 'afterend',
      prepend: 'afterbegin',
      append: 'beforeend'
    };
    position = map[position] || position;
    return this.each(function (el) {
      if (newEl instanceof DOM) {
        newEl.each(function (child) {
          return el.insertAdjacentElement(position, child);
        });
      } else if (newEl instanceof Element) {
        el.insertAdjacentElement(position, newEl);
      } else {
        el.insertAdjacentHTML(position, newEl);
      }
    });
  };
  DOM.prototype.before = function (newEl) {
    return this.insert(newEl, 'before');
  };
  DOM.prototype.after = function (newEl) {
    return this.insert(newEl, 'after');
  };
  DOM.prototype.append = function (newEl) {
    return this.insert(newEl, 'append');
  };
  DOM.prototype.prepend = function (newEl) {
    return this.insert(newEl, 'prepend');
  };
  DOM.prototype.replaceWith = function (newEl) {
    this.insert(newEl, 'before');
    this.remove();
    return this;
  };
  DOM.prototype.remove = function () {
    return this.each(function (el) {
      var _el$parentNode;
      return (_el$parentNode = el.parentNode) === null || _el$parentNode === void 0 ? void 0 : _el$parentNode.removeChild(el);
    });
  };
  DOM.prototype.wrap = function (wrapper) {
    return this.each(function (el) {
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    });
  };
}