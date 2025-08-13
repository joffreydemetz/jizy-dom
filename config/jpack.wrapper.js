/*! DOM v@VERSION | @DATE | [@BUNDLE] */
(function (global) {
    "use strict";

    if (typeof global !== "object" || !global || !global.document) {
        throw new Error("DOM requires a window with a document");
    }

    if (typeof global.DOM !== "undefined") {
        throw new Error("DOM is already defined");
    }

    // @CODE

    global.DOM = DOM;

})(typeof window !== "undefined" ? window : this);