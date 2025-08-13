const isAncestor = 'compareDocumentPosition' in document.documentElement ? function (element, container) {
    return (container.compareDocumentPosition(element) & 16) == 16;
} : function (element, container) {
    container = container == document || container == window ? document.documentElement : container;
    return container !== element && container.contains(element);
}

function toArray(ar) {
    return [].slice.call(ar, 0);
}

function isNode(el) {
    let t;
    return el && typeof el === 'object' && (t = el.nodeType) && (t == 1 || t == 9);
}

function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
}

function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) {
        arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i]);
    }
    return r;
}

function normalizeRoot(root) {
    if (!root) return document;
    if (typeof root == 'string') return Selector(root)[0];
    if (!root.nodeType && arrayLike(root)) return root[0];
    return root;
}

/**
* @param {string|Array.<Element>|Element|Node} selector
* @param {string|Array.<Element>|Element|Node=} opt_root
* @return {Array.<Element>}
*/
function Selector(selector, opt_root) {
    const root = normalizeRoot(opt_root);
    let m;

    if (!root || !selector) {
        return [];
    }
    if (selector === window || isNode(selector)) {
        return !opt_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : [];
    }

    if (selector && arrayLike(selector)) {
        return flatten(selector);
    }

    if (document.getElementsByClassName && selector == 'string' && (m = selector.match(/^\.([\w\-]+)$/))) {
        return toArray((root).getElementsByClassName(m[1]));
    }

    // using duck typing for 'a' window or 'a' document (not 'the' window || document)
    if (selector && (selector.document || (selector.nodeType && selector.nodeType == 9))) {
        return !opt_root ? [selector] : [];
    }

    return toArray((root).querySelectorAll(selector))
}

export default Selector;