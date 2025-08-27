import Selector from './js/selector.js';
import DOM from './js/dom.js';

const jDOM = function (selector, parent) {
    return new DOM(selector, parent);
};

const jDOMplugin = function (name, fn) {
    DOM[name] = fn;
};

const jDOMcreate = function (tagName, attrs) {
    const el = document.createElement(tagName);

    if (attrs) {
        if (attrs.className) {
            el.classList.add(attrs.className);
            delete attrs.className;
        }

        if (attrs.text) {
            el.innerText = attrs.text;
            delete attrs.text;
        }

        if (attrs.html) {
            el.innerHTML = attrs.html;
            delete attrs.html;
        }

        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                el.setAttribute(key, attrs[key]);
            }
        }
    }

    return new DOM(el);
};

export {
    Selector,
    DOM,
    jDOM,
    jDOMplugin,
    jDOMcreate
};
