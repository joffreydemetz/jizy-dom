"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DOM: () => DOM,
  Selector: () => Selector,
  default: () => index_default,
  domUtils: () => domUtils
});
module.exports = __toCommonJS(index_exports);

// src/Selector.ts
function Selector(selector, context = document) {
  if (!selector) return [];
  if (selector instanceof Element || selector === window || selector instanceof Node && selector.nodeType) {
    return [selector];
  }
  if (selector instanceof NodeList || Array.isArray(selector)) {
    return Array.from(selector);
  }
  if (typeof selector === "string") {
    return Array.from((context || document).querySelectorAll(selector));
  }
  return [];
}

// src/utils.ts
var domUtils = {
  // Converts camelCase to kebab-case
  dasherize: (str) => str.replace(/([A-Z])/g, "-$1").toLowerCase(),
  // Converts kebab-case to camelCase
  camelize: (str) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
  // Checks if an element matches a selector
  matches: (el, selector) => {
    if (!el || !selector) return false;
    return el.matches(selector);
  },
  // Sets or removes an attribute on an element
  setAttr: (el, name, value) => {
    if (value == null) {
      el.removeAttribute(name);
    } else {
      el.setAttribute(name, value);
    }
  },
  // Deserializes a string value into its appropriate type
  deserializeValue: (value) => {
    try {
      if (value === "true") return true;
      if (value === "false") return false;
      if (value === "null") return null;
      if (!isNaN(+value)) return +value;
      if (/^[\[{]/.test(value)) return JSON.parse(value);
      return value;
    } catch {
      return value;
    }
  },
  // Guesses the default display style for an element based on its tag name
  guessDefaultDisplay: (el) => {
    const tag = el.tagName.toLowerCase();
    switch (tag) {
      case "table":
        return "table";
      case "thead":
        return "table-header-group";
      case "tfoot":
        return "table-footer-group";
      case "tr":
        return "table-row";
      case "th":
      case "td":
        return "table-cell";
      case "span":
        return "inline";
      case "li":
        return "list-item";
      default:
        return "block";
    }
  }
};

// src/Core.ts
var DOM = class _DOM {
  elems;
  constructor(selector, context = document) {
    this.elems = Selector(selector, context);
    this.elems.forEach((el) => this._patchElement(el));
  }
  static instance(selector, context) {
    return new _DOM(selector, context);
  }
  static create(tag, attrs = {}) {
    const el = document.createElement(tag);
    const wrapped = new _DOM([el]);
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
    for (const [key, val] of Object.entries(attrs)) {
      wrapped.attr(key, val);
    }
    return wrapped;
  }
  static plugin(name, fn) {
    _DOM.prototype[name] = fn;
  }
  static propMap = {
    tabindex: "tabIndex",
    readonly: "readOnly",
    for: "htmlFor",
    class: "className",
    maxlength: "maxLength",
    cellspacing: "cellSpacing",
    cellpadding: "cellPadding",
    rowspan: "rowSpan",
    colspan: "colSpan",
    usemap: "useMap",
    frameborder: "frameBorder",
    contenteditable: "contentEditable"
  };
  _patchElement(el) {
    el.data = (key, val) => {
      if (!key) return this._getAllData(el);
      return arguments.length === 2 ? this._setData(el, key, val) : this._getData(el, key);
    };
    el.css = (prop, val, important = false) => arguments.length === 1 ? this._getCss(el, prop) : this._setCss(el, prop, val ?? null, important);
    el.addClass = (cls) => this._class(el, "add", cls);
    el.removeClass = (cls) => this._class(el, "remove", cls);
    el.hasClass = (cls) => el.classList.contains(cls);
    el.hasClasses = (clsList) => clsList.some((cls) => el.classList.contains(cls));
    el.hasAllClasses = (clsList) => clsList.every((cls) => el.classList.contains(cls));
  }
  _getCss(el, prop) {
    return el.style[domUtils.camelize(prop)] || getComputedStyle(el).getPropertyValue(domUtils.dasherize(prop));
  }
  _setCss(el, prop, val, important) {
    if (val === null) {
      el.style.removeProperty(domUtils.dasherize(prop));
    } else if (important) {
      el.style.setProperty(domUtils.dasherize(prop), String(this._maybeAddPx(prop, val)), "important");
    } else {
      el.style[domUtils.camelize(prop)] = String(this._maybeAddPx(prop, val));
    }
  }
  _getData(el, key) {
    const attr = el.getAttribute(`data-${domUtils.dasherize(key)}`);
    return attr !== null ? domUtils.deserializeValue(attr) : void 0;
  }
  _setData(el, key, val) {
    if (typeof val === "object") {
      for (const k in val) this._setData(el, `${key}-${k}`, val[k]);
    } else {
      domUtils.setAttr(el, `data-${domUtils.dasherize(key)}`, val);
    }
  }
  _getAllData(el) {
    const data = {};
    for (const key in el.dataset) {
      data[key] = this._getData(el, key);
    }
    return data;
  }
  _class(el, action, cls) {
    cls.split(" ").forEach((c) => c && el.classList[action](c));
  }
  _maybeAddPx(prop, value) {
    const cssNumber = {
      "column-count": 1,
      "columns": 1,
      "font-weight": 1,
      "line-height": 1,
      "opacity": 1,
      "z-index": 1,
      "zoom": 1
    };
    return typeof value === "number" && !cssNumber[prop] ? `${value}px` : value;
  }
  each(callback) {
    this.elems.forEach((el, i) => callback.call(this, el, i));
    return this;
  }
  toArray() {
    return this.elems;
  }
  exists() {
    return this.elems.length > 0;
  }
  size() {
    return this.elems.length;
  }
  map(callback) {
    const results = [];
    this.elems.forEach((el, i) => {
      const result = callback.call(this, el, i);
      if (result !== false) results.push(result);
    });
    return results;
  }
  filter(callback) {
    if (typeof callback !== "function") {
      const selector = callback;
      callback = (el) => el.matches(selector);
    }
    const filtered = this.elems.filter((el, i) => callback.call(this, el, i) !== false);
    return new _DOM(filtered);
  }
  not(selector) {
    let exclude = [];
    if (typeof selector === "function") {
      this.each((el, i) => {
        if (!selector.call(this, el, i)) exclude.push(el);
      });
    } else {
      exclude = new _DOM(selector).toArray();
    }
    const result = this.elems.filter((el) => !exclude.includes(el));
    return new _DOM(result);
  }
  get(index = 0) {
    const idx = index >= 0 ? index : this.elems.length + index;
    return this.elems[idx] ? new _DOM(this.elems[idx]) : this;
  }
  getElement(tag = "div") {
    return this.elems[0] || document.createElement(tag);
  }
  is(selector) {
    const el = this.elems[0];
    if (!el) return false;
    if (selector instanceof Element) return el === selector;
    if (selector instanceof _DOM) return el === selector.getElement();
    if (typeof selector === "string") {
      if (selector === ":visible") return getComputedStyle(el).display !== "none";
      if (selector === ":hidden") return getComputedStyle(el).display === "none";
      return el.matches(selector);
    }
    return false;
  }
  // attributes
  attr(name, value) {
    if (value === void 0) {
      const el = this.elems.find((el2) => el2 instanceof HTMLElement);
      if (!el) return void 0;
      const propName = _DOM.propMap[name] || name;
      const propValue = el[propName];
      return typeof propValue === "string" ? propValue : el.getAttribute(name) || void 0;
    }
    this.elems.forEach((el) => {
      const propName = _DOM.propMap[name] || name;
      if (value === null) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }
    });
  }
  prop(name, value) {
    if (value === void 0) {
      const el = this.elems.find((el2) => el2 instanceof HTMLElement);
      if (!el) return void 0;
      const propName = _DOM.propMap[name] || name;
      return el[propName];
    }
    this.elems.forEach((el) => {
      const propName = _DOM.propMap[name] || name;
      if (el instanceof HTMLElement && propName in el && !(Object.getOwnPropertyDescriptor(el, propName)?.writable === false)) {
        el[propName] = value;
      }
    });
  }
  css(prop, value, important = false) {
    const { dasherize, camelize } = domUtils;
    const css = (el, key, val, important2 = false) => {
      if (val !== void 0) {
        if (val === null) {
          el.style.removeProperty(dasherize(key));
        } else {
          val = this._maybeAddPx(key, val);
          if (important2) {
            el.style.setProperty(dasherize(key), val, "important");
          } else {
            el.style[camelize(key)] = val;
          }
        }
        return;
      }
      return el.style[camelize(key)] || getComputedStyle(el).getPropertyValue(dasherize(key));
    };
    if (typeof prop === "string" && value !== void 0) {
      this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => css(el, prop, value, important));
      return null;
    }
    if (typeof prop === "string") {
      const el = this.elems.find((el2) => el2 instanceof HTMLElement);
      return el ? css(el, prop) ?? null : null;
    }
    if (Array.isArray(prop)) {
      const el = this.elems.find((el2) => el2 instanceof HTMLElement);
      if (el) {
        const result = {};
        prop.forEach((key) => {
          result[key] = css(el, key);
        });
        return result;
      }
      return null;
    }
    return null;
  }
  data(key, value) {
    const { dasherize, deserializeValue } = domUtils;
    if (key !== void 0) {
      if (value !== void 0) {
        this.elems.filter((el3) => el3 instanceof HTMLElement).forEach((el3) => {
          if (el3 instanceof HTMLElement) {
            if (typeof value === "object" && value !== null) {
              Object.entries(value).forEach(([subKey, subVal]) => {
                el3.setAttribute(`data-${dasherize(`${key}-${subKey}`)}`, subVal);
              });
            } else {
              el3.setAttribute(`data-${dasherize(key)}`, value);
            }
          }
        });
        return;
      }
      const el2 = this.elems.find((el3) => el3 instanceof HTMLElement);
      if (el2) {
        const val = el2.getAttribute(`data-${dasherize(key)}`);
        return val !== null ? deserializeValue(val) : void 0;
      }
      return void 0;
    }
    const dataset = {};
    const el = this.elems.find((el2) => el2 instanceof HTMLElement);
    if (el && el.dataset) {
      for (const k in el.dataset) {
        if (el.dataset[k] !== void 0) {
          dataset[k] = deserializeValue(el.dataset[k]);
        }
      }
    }
    return dataset;
  }
  tagName() {
    return this.elems.length > 0 ? this.elems[0].tagName : null;
  }
  val(value) {
    if (value !== void 0) {
      this.elems.filter(
        (el2) => el2 instanceof HTMLInputElement || el2 instanceof HTMLTextAreaElement || el2 instanceof HTMLSelectElement
      ).forEach((el2) => {
        el2.value = value ?? "";
      });
      return null;
    }
    const el = this.elems.find(
      (el2) => el2 instanceof HTMLInputElement || el2 instanceof HTMLTextAreaElement || el2 instanceof HTMLSelectElement
    );
    return el?.value || null;
  }
  outerHeight() {
    const el = this.elems.find((el2) => el2 instanceof HTMLElement);
    if (!el) return 0;
    const style = getComputedStyle(el);
    return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
  }
  outerWidth() {
    const el = this.elems.find((el2) => el2 instanceof HTMLElement);
    if (!el) return 0;
    const style = getComputedStyle(el);
    return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
  }
  addClass(className) {
    this.elems.forEach((el) => {
      el.classList.add(className);
    });
  }
  removeClass(className) {
    this.elems.forEach((el) => {
      el.classList.remove(className);
    });
  }
  toggleClass(className) {
    this.elems.forEach((el) => {
      el.classList.toggle(className);
    });
  }
  replaceClass(oldClass, newClass) {
    this.elems.forEach((el) => {
      el.classList.replace(oldClass, newClass);
    });
  }
  hasClass(className) {
    return this.elems[0].classList.contains(className);
  }
  hasClasses(classNames) {
    return classNames.every((className) => this.elems[0].classList.contains(className));
  }
  containsClass(search) {
    return Array.from(this.elems[0].classList).some((className) => className.includes(search));
  }
  // contents
  empty() {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.innerHTML = "";
    });
  }
  remove() {
    this.elems.forEach((el) => {
      el.parentElement?.removeChild(el);
    });
  }
  replaceWith(content) {
    this.elems.forEach((el) => {
      if (typeof content === "string") {
        el.outerHTML = content;
      } else {
        el.replaceWith(content);
      }
    });
  }
  wrap(wrapper) {
    this.elems.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.insertBefore(wrapper, el);
        wrapper.appendChild(el);
      }
    });
  }
  insert(newEl, position) {
    const map = {
      before: "beforebegin",
      after: "afterend",
      prepend: "afterbegin",
      append: "beforeend"
    };
    const pos = map[position];
    this.elems.forEach((el) => {
      if (newEl instanceof _DOM) {
        newEl.elems.forEach((child) => el.insertAdjacentElement(pos, child));
      } else if (newEl instanceof Element) {
        el.insertAdjacentElement(pos, newEl);
      } else {
        el.insertAdjacentHTML(pos, newEl);
      }
    });
    return this;
  }
  before(newEl) {
    return this.insert(newEl, "before");
  }
  after(newEl) {
    return this.insert(newEl, "after");
  }
  append(newEl) {
    return this.insert(newEl, "append");
  }
  prepend(newEl) {
    return this.insert(newEl, "prepend");
  }
  // traversal
  parent() {
    const parents = this.elems.map((el) => el.parentElement).filter((el) => el);
    return new _DOM(parents);
  }
  children() {
    const children = [];
    this.elems.forEach((el) => {
      children.push(...Array.from(el.children));
    });
    return new _DOM(children);
  }
  find(selector) {
    const found = [];
    this.elems.forEach((el) => {
      found.push(...Array.from(el.querySelectorAll(selector)));
    });
    return new _DOM(found);
  }
  next() {
    const nextSiblings = this.elems.map((el) => el.nextElementSibling).filter((el) => el);
    return new _DOM(nextSiblings);
  }
  prev() {
    const prevSiblings = this.elems.map((el) => el.previousElementSibling).filter((el) => el);
    return new _DOM(prevSiblings);
  }
  first() {
    const el = this.elems[0];
    return el ? new _DOM(el) : new _DOM([]);
  }
  last() {
    const el = this.elems[this.elems.length - 1];
    return el ? new _DOM(el) : new _DOM([]);
  }
  // manipulations
  html(htmlString) {
    if (arguments.length === 0) {
      const el = this.elems.find((el2) => el2 instanceof HTMLElement);
      return el?.innerHTML || "";
    }
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.innerHTML = htmlString || "";
    });
  }
  text(textString) {
    if (arguments.length === 0) {
      const el = this.elems.find((el2) => el2 instanceof HTMLElement);
      return el?.innerText || "";
    }
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.innerText = textString || "";
    });
  }
  content(textString) {
    if (arguments.length === 0) {
      return this.elems[0]?.textContent || "";
    }
    this.elems.forEach((el) => {
      el.textContent = textString || "";
    });
  }
  show() {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.style.display = el.dataset.originalDisplay || "";
      if (getComputedStyle(el).display === "none") {
        el.style.display = "block";
      }
    });
  }
  hide() {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = getComputedStyle(el).display;
      }
      el.style.display = "none";
    });
  }
  toggle() {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      if (getComputedStyle(el).display === "none") {
        this.show();
      } else {
        this.hide();
      }
    });
  }
  slideDown(duration = 400) {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.style.display = el.dataset.originalDisplay || "block";
      el.style.overflow = "hidden";
      el.style.height = "0";
      el.style.transition = `height ${duration}ms ease`;
      const fullHeight = el.scrollHeight + "px";
      requestAnimationFrame(() => {
        el.style.height = fullHeight;
      });
      setTimeout(() => {
        el.style.height = "";
        el.style.overflow = "";
      }, duration);
    });
  }
  slideUp(duration = 400) {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.style.overflow = "hidden";
      el.style.height = el.scrollHeight + "px";
      el.style.transition = `height ${duration}ms ease`;
      requestAnimationFrame(() => {
        el.style.height = "0";
      });
      setTimeout(() => {
        el.style.display = "none";
        el.style.height = "";
        el.style.overflow = "";
      }, duration);
    });
  }
  slideToggle(duration = 400) {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      if (getComputedStyle(el).display === "none") {
        this.slideDown(duration);
      } else {
        this.slideUp(duration);
      }
    });
  }
  // events
  on(event, handler) {
    this.elems.forEach((el) => {
      el.addEventListener(event, handler);
    });
  }
  off(event, handler) {
    this.elems.forEach((el) => {
      el.removeEventListener(event, handler);
    });
  }
  delegate(event, selector, handler) {
    this.elems.forEach((el) => {
      el.addEventListener(event, (e) => {
        const target = e.target;
        if (target && target.matches(selector)) {
          handler.call(target, e);
        }
      });
    });
  }
  trigger(event) {
    const evt = new Event(event, { bubbles: true, cancelable: true });
    this.elems.forEach((el) => {
      el.dispatchEvent(evt);
    });
  }
  submit() {
    const el = this.elems.find((el2) => el2 instanceof HTMLFormElement);
    if (el) {
      el.submit();
    }
  }
  focus() {
    const el = this.elems.find((el2) => el2 instanceof HTMLElement);
    if (el) {
      el.focus();
    }
  }
  // animations
  fadeIn(duration = 400) {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      el.style.opacity = "0";
      el.style.display = "block";
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        el.style.opacity = progress.toString();
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    });
  }
  fadeOut(duration = 400) {
    this.elems.filter((el) => el instanceof HTMLElement).forEach((el) => {
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        el.style.opacity = (1 - progress).toString();
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.style.display = "none";
        }
      };
      requestAnimationFrame(step);
    });
  }
  // swipe
  onSwipe(callback) {
    this.elems.forEach((el) => {
      let startX = 0, startY = 0, endX = 0, endY = 0;
      el.addEventListener("touchstart", (e) => {
        const touchEvent = e;
        startX = touchEvent.touches[0].clientX;
        startY = touchEvent.touches[0].clientY;
      });
      el.addEventListener("touchend", (e) => {
        const touchEvent = e;
        endX = touchEvent.changedTouches[0].clientX;
        endY = touchEvent.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
          callback(diffX > 0 ? "right" : "left");
        } else {
          callback(diffY > 0 ? "down" : "up");
        }
      });
    });
  }
  // misc
  serialize() {
    const el = this.elems.find((el2) => el2 instanceof HTMLFormElement);
    if (!el) return "";
    const formData = new FormData(el);
    return Array.from(formData.entries()).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
  }
  clone() {
    const clones = this.elems.map((el) => el.cloneNode(true));
    return new _DOM(clones);
  }
  matchesAny(selector) {
    return this.elems.some((el) => el.matches(selector));
  }
  index() {
    const el = this.elems[0];
    if (!el || !el.parentElement) return -1;
    return Array.from(el.parentElement.children).indexOf(el);
  }
  isEmpty() {
    const el = this.elems[0];
    return el ? el.childNodes.length === 0 : true;
  }
  closest(selector) {
    const el = this.elems[0];
    const closestEl = el?.closest(selector);
    return closestEl ? new _DOM(closestEl) : new _DOM([]);
  }
  offset() {
    const el = this.elems.find((el2) => el2 instanceof HTMLElement);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }
  position() {
    const el = this.elems.find((el2) => el2 instanceof HTMLElement);
    if (!el) return null;
    const offsetParent = el.offsetParent;
    const offset = this.offset();
    const parentOffset = offsetParent ? new _DOM(offsetParent).offset() : { top: 0, left: 0 };
    return {
      top: (offset?.top || 0) - (parentOffset?.top || 0) - parseInt(getComputedStyle(el).marginTop),
      left: (offset?.left || 0) - (parentOffset?.left || 0) - parseInt(getComputedStyle(el).marginLeft)
    };
  }
  scrollIntoView(options) {
    const el = this.elems[0];
    if (el) {
      el.scrollIntoView(options);
    }
  }
  scrollTop(value) {
    const el = this.elems[0];
    if (!el) return 0;
    if (value !== void 0) {
      if (el instanceof HTMLElement) {
        el.scrollTop = value;
      } else if (el === document.documentElement || el === document.body) {
        window.scrollTo({ top: value });
      }
    } else {
      return el instanceof HTMLElement ? el.scrollTop : window.pageYOffset;
    }
  }
  scrollLeft(value) {
    const el = this.elems[0];
    if (!el) return 0;
    if (value !== void 0) {
      if (el instanceof HTMLElement) {
        el.scrollLeft = value;
      } else if (el === document.documentElement || el === document.body) {
        window.scrollTo({ left: value });
      }
    } else {
      return el instanceof HTMLElement ? el.scrollLeft : window.pageXOffset;
    }
  }
};

// src/index.ts
var index_default = DOM;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DOM,
  Selector,
  domUtils
});
