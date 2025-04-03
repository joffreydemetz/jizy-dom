"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendDOMAnimations = extendDOMAnimations;
function slide(el, direction) {
  var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 300;
  var easing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'ease';
  var delay = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var display = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'block';
  return new Promise(function (resolve) {
    if (el.dataset.sliding) return resolve(el);
    el.dataset.sliding = true;
    var isDown = direction === 'down';
    if (isDown && getComputedStyle(el).display !== 'none') {
      delete el.dataset.sliding;
      return resolve(el);
    }
    var fullHeight = el.scrollHeight;
    if (isDown) {
      el.style.display = display;
      el.style.overflow = 'hidden';
      el.style.height = '0px';
      el.offsetHeight;
    }
    requestAnimationFrame(function () {
      el.style.transition = "height ".concat(speed, "ms ").concat(easing);
      el.style.height = isDown ? "".concat(fullHeight, "px") : '0px';
      setTimeout(function () {
        el.style.removeProperty('transition');
        el.style.removeProperty('height');
        el.style.removeProperty('overflow');
        if (!isDown) el.style.display = 'none';
        delete el.dataset.sliding;
        resolve(el);
      }, speed + delay);
    });
  });
}
function extendDOMAnimations(DOM) {
  DOM.prototype.slideDown = function () {
    var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 300;
    var easing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ease';
    var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var display = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'block';
    return this.each(function (el) {
      return slide(el, 'down', speed, easing, delay, display);
    });
  };
  DOM.prototype.slideUp = function () {
    var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 300;
    var easing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ease';
    var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return this.each(function (el) {
      return slide(el, 'up', speed, easing, delay);
    });
  };
  DOM.prototype.slideToggle = function () {
    var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 300;
    var easing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ease';
    var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var display = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'block';
    return this.each(function (el) {
      var isHidden = getComputedStyle(el).display === 'none';
      return slide(el, isHidden ? 'down' : 'up', speed, easing, delay, display);
    });
  };
}