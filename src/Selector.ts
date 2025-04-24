export function Selector(
    selector: string | Element | Window | Node | NodeList | Array<Element>,
    context: Document | Element = document
): Array<Element | Window | Node> {
    // Return an empty array if no selector is provided
    if (!selector) return [];

    // If the selector is an Element, Window, or Node, return it as an array
    if (
        selector instanceof Element ||
        selector === window ||
        (selector instanceof Node && selector.nodeType)
    ) {
        return [selector];
    }

    // If the selector is a NodeList or an array of Elements, convert it to an array
    if (selector instanceof NodeList || Array.isArray(selector)) {
        return Array.from(selector);
    }

    // If the selector is a string, use querySelectorAll to find matching elements
    if (typeof selector === 'string') {
        return Array.from((context || document).querySelectorAll(selector));
    }

    // Return an empty array for unsupported selector types
    return [];
}