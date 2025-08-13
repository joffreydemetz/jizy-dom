import Selector from "./selector";

function extend(...args) {
    let deep = false;
    let i = 0;
    let extended = {};

    if (typeof args[0] === 'boolean') {
        deep = args[0];
        i = 1;
    }

    const isObject = obj => obj && Object.prototype.toString.call(obj) === '[object Object]';

    const merge = (obj) => {
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (deep && isObject(obj[prop])) {
                    extended[prop] = extend(true, extended[prop] || {}, obj[prop]);
                } else if (obj[prop] !== undefined) {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    for (; i < args.length; i++) {
        if (args[i]) merge(args[i]);
    }

    return extended;
}

const stylePropertyInPxRE = /^(?:(width|height|top|right|bottom|left|margin|padding)|((min|max)(Width|Height))|((margin|padding)(Top|Right|Bottom|Left)))$/;

const cssNumber = {
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
};

const propMap = {
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
};

const supportsPassiveEvents = (() => {
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassive = true;
            }
        });
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
    } catch (e) { }
    return supportsPassive;
})();

// const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

function dasherize(camelCase) {
    return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase();
}
function camelize(hyphenCase) {
    return hyphenCase.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
function matches(element, selector) {
    return !!(selector && element && element.nodeType === 1 && element.matches(selector));
}
function deserializeValue(value) {
    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    try {
        return value ?
            value == "true" ||
            (value == "false" ? false :
                value == "null" ? null :
                    +value + "" == value ? +value :
                        /^[\[\{]/.test(value) ? JSON.parse(value) :
                            value)
            : value;
    } catch (e) {
        return value;
    }
}
function filtered(nodes, selector) {
    return selector == null ? new DOM(nodes) : (new DOM(nodes)).filter(selector);
}
function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
}
/*function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)] && stylePropertyInPxRE.test(camelize(name))) ? value + "px" : value;
}*/
function guessDefaultDisplay(el) {
    if (el.data('cssInitialDisplay')) {
        return el.data('cssInitialDisplay');
    }

    if (el.css('display') && 'none' !== el.css('display')) {
        return el.css('display');
    }

    switch (el.tagName.toLowerCase()) {
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

function hasClasses(element, classNames) {
    for (var i in classNames) {
        if (true === element.classList.contains(classNames[i])) {
            return true;
        }
    }
    return false;
}
function hasAllClasses(element, classNames) {
    for (var i in classNames) {
        if (false === element.classList.contains(classNames[i])) {
            return false;
        }
    }
    return true;
}

function css(element, key, value, priority) {
    if (2 in arguments) {
        if (null === value) {
            element.style.removeProperty(dasherize(key));
            return;
        }

        if (typeof value == "number" && !cssNumber[dasherize(name)] && stylePropertyInPxRE.test(camelize(name))) {
            value += "px";
        }

        if (priority) {
            element.style.setProperty(dasherize(key), value, 'important');
        }
        else {
            element.style[camelize(key)] = value;
        }
        return;
    }

    return element.style[camelize(key)] || getComputedStyle(element, null).getPropertyValue(dasherize(key));
}

function data(element, name, value) {
    if (1 === arguments.length) {
        const d = {};
        for (let key in element.dataset) {
            d[key] = data(element, key);
        }
        return d;
    }

    const attrName = 'data-' + dasherize(name);

    if (2 in arguments) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            for (let attrKey in value) {
                data(element, name + '-' + attrKey, value[attrKey]);
            }
        }
        else {
            setAttribute(element, attrName, value);
        }

        return;
    }

    value = element.getAttribute(attrName);
    return value !== null ? deserializeValue(value) : undefined;
}

function classList(element, method, className) {
    const classNames = className.split(' ');
    return element.classList[method].apply(element.classList, classNames);
}

async function slide(element, config) {
    const slideSpeed = config.slideSpeed;
    const direction = config.direction;
    const easing = config.easing;
    const _delay = config.delay;
    const delay = _delay === void 0 ? 0 : _delay;
    const _visibleDisplayValue = config.visibleDisplayValue;
    const visibleDisplayValue = _visibleDisplayValue === void 0 ? 'block' : _visibleDisplayValue;
    const domSliderId = element.dataset.domSliderId || (Date.now() * Math.random()).toFixed(0);

    if (!element.dataset.domSliderId) {
        element.dataset.domSliderId = domSliderId;
    }

    const computedStyle = window.getComputedStyle(element);
    const isDisplayNoneByDefault = computedStyle.getPropertyValue('display') === 'none';
    const slideDirection = direction || (isDisplayNoneByDefault || element.classList.contains('slider-hidden') ? 'down' : 'up');
    const speed = slideSpeed ? slideSpeed : slideSpeed === 0 ? 0 : 300;
    const boxSizing = computedStyle.getPropertyValue('box-sizing');
    const paddingTop = parseInt(computedStyle.getPropertyValue('padding-top').split('px')[0]);
    const paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom').split('px')[0]);
    let contentHeight = Math.max(element.scrollHeight - paddingTop - paddingBottom, 0);

    if (boxSizing === 'border-box') {
        contentHeight = Math.max(element.scrollHeight, 0);
    }

    if (element.dataset.sliding) {
        return Promise.resolve(element);
    }

    if (slideDirection === 'down' && !isDisplayNoneByDefault && !element.classList.contains('slider-hidden')) {
        return Promise.resolve(element);
    }

    if (slideDirection === 'up' && element.classList.contains('slider-hidden')) {
        return Promise.resolve(element);
    }

    element.dataset.sliding = true;
    element.setAttribute('aria-hidden', slideDirection === 'down' ? 'false' : 'true');

    if (slideDirection === 'down' && isDisplayNoneByDefault) {
        element.classList.add('slider-hidden');
        element.style.display = visibleDisplayValue;
        contentHeight = element.scrollHeight;
    } // a fixed height is required in order to animate the height

    element.style.height = "".concat(contentHeight, "px");
    element.style.transition = "all ".concat(speed, "ms ").concat(easing || '');
    element.style.overflow = 'hidden';

    await new Promise((resolve) => {
        setTimeout(() => {
            if (!element.classList.contains('slider-hidden')) {
                setTimeout(() => { element.style.display = 'none'; }, 300);
            }
            element.classList.toggle('slider-hidden');
            resolve();
        }, +delay > 20 ? +delay : 20);
    });

    return await new Promise((resolve_1) => {
        setTimeout(() => {
            element.style.removeProperty('height');
            element.style.removeProperty('transition');
            element.style.removeProperty('overflow');
            element.removeAttribute('data-sliding');
            resolve_1(element);
        }, speed);
    });
}

class DOM {
    constructor(selector, parent) {
        parent = parent || document;

        if (selector instanceof DOM) {
            return selector;
        }

        if (parent instanceof DOM) {
            return parent.find(selector);
        }

        this.elems = Selector(selector, parent);

        for (let i = 0; i < this.elems.length; i++) {
            this.elems[i].data = (key, value) => {
                if (0 in arguments && key) {
                    if (1 in arguments) {
                        data(this, key, value);
                        return this;
                    }

                    return data(this, key);
                }

                return data(this);
            };

            this.elems[i].css = (key, value, priority) => {
                return 1 in arguments ? css(this, key, value, priority || false) : css(this, key);
            };

            this.elems[i].addClass = (className) => {
                return classList(this, 'add', className);
            };

            this.elems[i].removeClass = (className) => {
                return classList(this, 'remove', className);
            };

            this.elems[i].hasClass = (className) => {
                return classList(this, 'contains', className);
            };

            this.elems[i].hasClasses = (classNames) => {
                return hasClasses(this, classNames);
            };

            this.elems[i].hasAllClasses = (classNames) => {
                return hasAllClasses(this, classNames);
            };
        }

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
    each(callback) {
        for (let i = 0, n = this.elems.length; i < n; i++) {
            callback.call(this, this.elems[i], i);
        }
        return this;
    }
    map(callback) {
        const results = [];
        for (let i = 0, n = this.elems.length; i < n; i++) {
            const result = callback.call(this, this.elems[i], i);
            if (false !== result) {
                results.push(result);
            }
        }
        return results;
    }
    filter(callback) {
        if (typeof callback !== 'function') {
            const selector = callback;
            callback = (el) => { return matches(el, selector) ? el : false; };
        }

        const results = [];
        for (let i = 0, n = this.elems.length; i < n; i++) {
            const result = callback.call(this, this.elems[i], i);
            if (false !== result) {
                results.push(result);
            }
        }

        return new DOM(results);
    }
    not(selector) {
        const nodes = [];
        if (typeof selector === 'function' && selector.call !== undefined) {
            this.each(function (el, i) {
                if (false === selector.call(el, i)) {
                    nodes.push(el);
                }
            });
        }
        else {
            const excludes = [];
            if (typeof selector == 'string') {
                excludes = this.filter(selector);
            }
            else {
                excludes = new DOM(selector);
            }
            if (excludes instanceof DOM) {
                excludes = excludes.elems;
            }
            this.each(function (el, i) {
                if (excludes.indexOf(el) < 0) {
                    nodes.push(el);
                }
            });
        }

        return new DOM(nodes);
    }
    get(index) {
        index = index || 0;
        const idx = index >= 0 ? index : this.elems.length + index;
        if (typeof this.elems[idx] !== 'undefined') {
            return new DOM(this.elems[idx]);
        }
        return this;
    }
    getElement(tag) {
        if (0 in this.elems) {
            return this.elems[0];
        }
        return document.createElement(tag || 'div');
    }
    is(selector) {
        if (selector instanceof HTMLElement) {
            return selector === this.getElement();
        }
        if (selector instanceof DOM) {
            return selector.getElement() === this.getElement();
        }

        if (0 in this.elems && typeof selector === 'string') {
            if (':visible' === selector) {
                return 'none' !== this.elems[0].css("display");
            }
            else if (':hidden' === selector) {
                return 'none' === this.elems[0].css("display");
            }
            else {
                return matches(this.elems[0], selector);
            }
        }

        return false;
    }
    find(selector) {
        const selectors = selector.trim().split(/,\s*/);
        const elems = [];

        this.each(function (el) {
            for (let i = 0, n = selectors.length; i < n; i++) {
                const levelOneSelector = selectors[i].match(/^>\s*(.+)$/);
                const pseudoSelector = selectors[i].match(/^\:(first|last)/);
                if (levelOneSelector) {
                    // get all matching whatever's after '>' 
                    const children = Selector(levelOneSelector[1], el);
                    if (children) {
                        for (const child in el.childNodes) {
                            // add if level 1 child
                            if (matches(el.childNodes[child], levelOneSelector[1])) {
                                elems = elems.concat(el.childNodes[child]);
                            }
                        }
                    }
                }
                else {
                    const elFound = Selector(selectors[i], el);
                    if (elFound) {
                        elems = elems.concat(elFound);
                    }
                }
            }
        });

        return new DOM(elems);
    }
    insert(newEl, position) {
        if ('before' === position) {
            position = 'beforebegin';
        }
        if ('after' === position) {
            position = 'afterend';
        }
        if ('prepend' === position) {
            position = 'afterbegin';
        }
        if ('append' === position) {
            position = 'beforeend';
        }

        return this.each((el) => {
            if (newEl instanceof DOM) {
                newEl.each((newElItem) => {
                    el.insertAdjacentElement(position, newElItem);
                });
            }
            else if (newEl instanceof Element) {
                el.insertAdjacentElement(position, newEl);
            }
            else {
                el.insertAdjacentHTML(position, newEl);
            }
        });
    }
    before(newEl) {
        return this.insert(newEl, 'before');
    }
    after(newEl) {
        return this.insert(newEl, 'after');
    }
    append(newEl) {
        return this.insert(newEl, 'append');
    }
    prepend(newEl) {
        return this.insert(newEl, 'prepend');
    }
    replaceWith(newEl) {
        this.insert(newEl, 'before');
        this.remove();
        return this;
    }
    remove() {
        return this.each((el) => {
            return el.parentNode.removeChild(el);
        });
    }
    parent(selector) {
        const elems = [];

        this.each((el) => {
            const elFound = el.parentNode;
            if (elFound) {
                elems = elems.concat(elFound);
            }
        });

        return filtered(elems, selector || null);
    }
    children(selector) {
        const elems = [];

        this.each((el) => {
            const children = el.childNodes;
            if (children) {
                elems = elems.concat(children);
            }
        });

        return filtered(elems, selector || null);
    }
    closest(selector) {
        const elems = [];

        this.each((el) => {
            const elFound = el.closest(selector);
            if (elFound) {
                elems = elems.concat(elFound);
            }
        });

        return new DOM(elems);
    }
    prev(selector) {
        const elems = [];

        this.each((el) => {
            const prev = el.previousElementSibling;
            if (prev) {
                elems = elems.concat(prev);
            }
        });

        return filtered(elems, selector || null);
    }
    next(selector) {
        const elems = [];

        this.each((el) => {
            const next = el.nextElementSibling;
            if (next) {
                elems = elems.concat(next);
            }
        });

        return filtered(elems, selector || null);
    }
    first(selector) {
        const elems = [];

        this.each((el) => {
            const first = el.firstElementChild;
            if (first) {
                elems = elems.concat(first);
            }
        });

        return filtered(elems, selector || null);
    }
    last(selector) {
        const elems = [];

        this.each((el) => {
            const last = el.lastElementChild;
            if (last) {
                elems = elems.concat(last);
            }
        });

        return filtered(elems, selector || null);
    }
    wrap(wrapper) {
        this.each((el) => {
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        });

        return this;
    }
    // EVENTS
    on(events, listener, options) {
        options = options || false;

        events.split(' ').forEach((event) => {
            this.each((el) => {
                el.addEventListener(event, listener, options);
            });
        });

        return this;
    }
    delegate(events, selector, listener, options) {
        options = options || false;

        return this.on(events, (event) => {
            // console.log(event.target);
            if ((new DOM(event.target)).is(selector)) {
                listener(...arguments);
            }
        }, options);
    }
    off(events, listener) {
        events.split(' ').forEach((event) => {
            this.each((el) => {
                el.removeEventListener(event, listener);
            });
        });

        return this;
    }
    submit() {
        if (0 in this.elems && this.elems[0] instanceof HTMLFormElement) {
            this.elems[0].submit();
        }
        return this;
    }
    focus() {
        if (0 in this.elems) {
            this.elems[0].focus();
        }
        return this;
    }
    trigger(eventName, eventData, bubbles, cancellable) {
        if (arguments.length < 4) {
            cancellable = true;
        }

        if (arguments.length < 3) {
            bubbles = false;
        }

        if (arguments.length < 2) {
            eventData = null;
        }

        let event;
        if (eventData) {
            event = new CustomEvent(eventName, { bubbles: bubbles, cancellable: cancellable, detail: eventData });
        }
        else {
            event = new Event(eventName, { bubbles: bubbles, cancellable: cancellable });
        }

        return this.each((el) => {
            el.dispatchEvent(event);
        });
    }
    swipe(swipeCallback, ignoreCallback, params) {
        return this.each((el) => {
            let swipedir, startX, startY, distX, distY, elapsedTime, startTime,
                // tap=false,
                handleSwipe = swipeCallback || function (e, swipedir) { }, handleIgnore = ignoreCallback || function (e) { return false; }, config = extend({
                    scrolling: false, // can scroll

                    // tapping: false,   // can tap
                    threshold: 10, // required min distance traveled to be considered swipe
                    restraint: 100, // maximum distance allowed at the same time in perpendicular direction
                    allowedTime: 300 // maximum time allowed to travel that distance
                }, params || {});

            el.addEventListener('touchstart', (e) => {
                if (false === handleIgnore(e)) {
                    const touchobj = e.changedTouches[0];
                    swipedir = 'none';
                    // dist = 0;
                    startX = touchobj.pageX;
                    startY = touchobj.pageY;
                    startTime = new Date().getTime(); // record time when finger first makes contact with surface

                    !supportsPassiveEvents ? e.preventDefault() : null;
                }
            }, supportsPassiveEvents ? { passive: true } : undefined);

            el.addEventListener('touchmove', (e) => {
                if (false === handleIgnore(e)) {
                    // console.log('touchmove');
                    // console.log('handleIgnore: false');
                    if (false === config.scrolling) {
                        // console.log('no scrolling');
                        !supportsPassiveEvents ? e.preventDefault() : null; // prevent scrolling when inside DIV
                    }
                }
            }, supportsPassiveEvents ? { passive: true } : undefined);

            el.addEventListener('touchend', (e) => {
                if (false === handleIgnore(e)) {
                    const touchobj = e.changedTouches[0];
                    distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
                    distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
                    elapsedTime = new Date().getTime() - startTime; // get time elapsed

                    if (elapsedTime <= config.allowedTime) { // first condition for swipe met
                        if (Math.abs(distX) >= config.threshold && Math.abs(distY) <= config.restraint) { // 2nd condition for horizontal swipe met
                            swipedir = (distX < 0) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
                        }
                        else if (Math.abs(distY) >= config.threshold && Math.abs(distX) <= config.restraint) { // 2nd condition for vertical swipe met
                            swipedir = (distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
                        }
                    }

                    !supportsPassiveEvents ? e.preventDefault() : null;
                    handleSwipe(e, swipedir);
                }
            }, supportsPassiveEvents ? { passive: true } : undefined);

            return this;
        });
    }
    // CONTENT 
    text(text) {
        if (0 in arguments) {
            return this.each((el) => { el.innerText = text; });
        }
        return 0 in this.elems ? this.elems[0].innerText : null;
    }
    html(html) {
        if (0 in arguments) {
            return this.each((el) => { el.innerHTML = html; });
        }
        return 0 in this.elems ? this.elems[0].innerHTML : null;
    }
    content(content) {
        if (0 in arguments) {
            return this.each((el) => { el.innerContent = content; });
        }
        return 0 in this.elems ? this.elems[0].innerContent : null;
    }
    // CSS 
    addClass(className) {
        return this.each((el) => { el.addClass(className); });
    }
    removeClass(className) {
        return this.each((el) => { el.removeClass(className); });
    }
    toggleClass(className) {
        return this.each((el) => { el.classList.toggle(className); });
    }
    replaceClass(oldClass, newClass) {
        return this.each((el) => { el.classList.replace(oldClass, newClass); });
    }
    hasClass(className) {
        if (0 in this.elems) {
            return this.elems[0].classList.contains(className);
        }

        return false;
    }
    hasClasses(classNames) {
        return 0 in this.elems ? this.elems[0].hasClasses(classNames) : false;
    }
    hasAllClasses(classNames) {
        return 0 in this.elems ? this.elems[0].hasAllClasses(classNames) : false;
    }
    containsClass(search) {
        if (0 in this.elems) {
            var classes = this.elems[0].classList;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].indexOf(search) > -1) {
                    return true;
                }
            }
        }

        return false;
    }
    toggle() {
        return this.each((el) => {
            const display = guessDefaultDisplay(el);
            if (!el.data('cssInitialDisplay')) {
                el.data('cssInitialDisplay', display);
            }
            'none' === el.css("display") ? (el.style.display = 'block') : (el.style.display = 'none');
        });
    }
    show() {
        return this.each((el) => {
            const display = guessDefaultDisplay(el);
            if (!el.data('cssInitialDisplay')) {
                el.data('cssInitialDisplay', display);
            }
            el.style.display = display;
        });
    }
    hide() {
        return this.each((el) => {
            if (!el.data('cssInitialDisplay')) {
                el.data('cssInitialDisplay', guessDefaultDisplay(el));
            }
            el.style.display = 'none';
        });
    }
    offset() {
        if (0 === this.elems.length) {
            return { top: 0, left: 0 };
        }

        const rect = this.elems[0].getBoundingClientRect();

        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }
    // FORM
    serialize() {
        if (!(0 in this.elems)) {
            return '';
        }

        const data = new FormData(this.elems[0]);
        const query = new URLSearchParams(data).toString();
        return query;
    }
    // SHORTHANDS 
    css(property, value, important) {
        if (1 in arguments) {
            return this.each((el) => {
                css(el, property, value, important || false);
            });
        }

        if (0 in this.elems) {
            if (typeof property === 'string') {
                return css(this.elems[0], property);
            }

            const props = {};

            if (Array.isArray(property)) {
                const el = this.elems[0];
                property.forEach((prop) => {
                    props[prop] = css(el, prop);
                });
            }

            return props;
        }

        return null;
    }
    data(key, value) {
        if (0 in arguments && key) {
            if (1 in arguments) {
                return this.each((el) => {
                    data(el, key, value);
                });
            }

            return 0 in this.elems ? data(this.elems[0], key) : undefined;
        }

        return 0 in this.elems ? data(this.elems[0]) : {};
    }
    attr(name, value) {
        if (1 in arguments) {
            return this.each((el) => {
                if (el.nodeType !== 1) return;
                setAttribute(el, name, value);
            });
        }

        let result = null;
        if (0 in this.elems && this.elems[0].nodeType == 1) {
            result = this.elems[0].getAttribute(name);
        }

        return result;
    }
    prop(name, value) {
        name = propMap[name] || name;

        if (1 in arguments) {
            return this.each((el) => {
                el[name] = value;
            });
        }

        let result = null;
        if (0 in this.elems) {
            result = this.elems[0][name];
        }
        return result;
    }
    tagName(uppercase) {
        let tagName = 0 in this.elems ? this.elems[0].tagName : null;
        if (tagName) {
            tagName = tagName.toLowerCase();
            if (uppercase) {
                tagName = tagName.toUpperCase();
            }
        }
        return tagName;
    }
    val(value) {
        if (0 in arguments) {
            if (value == null) {
                value = '';
            }

            return this.each((el) => {
                el.value = value;
            });
        }

        if (0 in this.elems) {
            return this.elems[0].value;
        }

        return null;
    }
    outerHeight() {
        let height = 0;

        if (0 in this.elems) {
            height += parseInt(this.elems[0].css("height"));
            height += parseInt(this.elems[0].css("padding-top"));
            height += parseInt(this.elems[0].css("padding-bottom"));
            height += parseInt(this.elems[0].css("margin-top"));
            height += parseInt(this.elems[0].css("margin-bottom"));
        }

        return height;
    }
    outerWidth() {
        let width = 0;

        if (0 in this.elems) {
            width += parseInt(this.elems[0].css("width"));
            width += parseInt(this.elems[0].css("padding-left"));
            width += parseInt(this.elems[0].css("padding-right"));
            width += parseInt(this.elems[0].css("margin-left"));
            width += parseInt(this.elems[0].css("margin-right"));
        }

        return width;
    }

    // ANIMATION
    slideDown(speed, easing, delay, display) {
        if (!window.Promise) {
            return this.show();
        }

        speed = speed || 500;
        easing = easing || 'cubic-bezier(0.25, 0.1, 0.44, 1.4)';
        delay = delay || 200;

        return this.each((el) => {
            return slide(el, {
                direction: 'down',
                slideSpeed: speed,
                easing: easing,
                delay: delay,
                visibleDisplayValue: display || guessDefaultDisplay(el)
            });
        });
    }
    slideUp(speed, easing, delay) {
        if (!window.Promise) {
            return this.hide();
        }

        speed = speed || 500;
        easing = easing || 'cubic-bezier(0.25, 0.1, 0.44, 1.4)';
        delay = delay || 200;

        return this.each((el) => {
            return slide(el, {
                direction: 'up',
                slideSpeed: speed,
                easing: easing,
                delay: delay
            });
        });
    }
    slideToggle(speed, easing, delay, display) {
        if (!window.Promise) {
            return this.toggle();
        }

        speed = speed || 500;
        easing = easing || 'cubic-bezier(0.25, 0.1, 0.44, 1.4)';
        delay = delay || 200;

        return this.each((el) => {
            return slide(el, {
                slideSpeed: speed,
                easing: easing,
                delay: delay,
                visibleDisplayValue: display || guessDefaultDisplay(el)
            });
        });
    }
    scrollTop(position) {
        if (0 in arguments) {
            return this.each((el) => {
                el.style.scrollBehavior = 'smooth';
                el.scrollTop = position || 0;
            });
        }

        return 0 in this.elems ? this.elems[0].scrollTop : 0;
    }
};

export default DOM;