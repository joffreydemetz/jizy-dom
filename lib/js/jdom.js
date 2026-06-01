import DOM from './dom.js';

// jDOM machinery, decoupled from any JiZy global.
// (The old JiZy.dom / JiZy.qsa / JiZy.qs namespace is dropped — use jDOM(selector) instead.)

export function jDOM(selector, parent) {
    return new DOM(selector, parent);
}

export function jDOMplugin(name, fn) {
    DOM.prototype[name] = fn;
}

export function jDOMcreate(tagName, attrs) {
    const el = new DOM([document.createElement(tagName)]);

    if (attrs) {
        if (attrs.className) {
            el.addClass(attrs.className);
            delete attrs.className;
        }
        if (attrs.text) {
            el.text(attrs.text);
            delete attrs.text;
        }
        if (attrs.html) {
            el.html(attrs.html);
            delete attrs.html;
        }
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                el.attr(key, attrs[key]);
            }
        }
    }

    return el;
}

if (typeof window !== 'undefined') {
    window.jDOM = jDOM;
    window.jDOMplugin = jDOMplugin;
    window.jDOMcreate = jDOMcreate;
}
