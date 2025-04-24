export const domUtils = {
    // Converts camelCase to kebab-case
    dasherize: (str: string): string => str.replace(/([A-Z])/g, '-$1').toLowerCase(),

    // Converts kebab-case to camelCase
    camelize: (str: string): string => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),

    // Checks if an element matches a selector
    matches: (el: Element, selector: string): boolean => {
        if (!el || !selector) return false;
        return el.matches(selector);
    },

    // Sets or removes an attribute on an element
    setAttr: (el: Element, name: string, value: string | null): void => {
        if (value == null) {
            el.removeAttribute(name);
        } else {
            el.setAttribute(name, value);
        }
    },

    // Deserializes a string value into its appropriate type
    deserializeValue: (value: string): any => {
        try {
            if (value === 'true') return true;
            if (value === 'false') return false;
            if (value === 'null') return null;
            if (!isNaN(+value)) return +value;
            if (/^[\[{]/.test(value)) return JSON.parse(value);
            return value;
        } catch {
            return value;
        }
    },

    // Guesses the default display style for an element based on its tag name
    guessDefaultDisplay: (el: Element): string => {
        const tag = el.tagName.toLowerCase();
        switch (tag) {
            case 'table': return 'table';
            case 'thead': return 'table-header-group';
            case 'tfoot': return 'table-footer-group';
            case 'tr': return 'table-row';
            case 'th':
            case 'td': return 'table-cell';
            case 'span': return 'inline';
            case 'li': return 'list-item';
            default: return 'block';
        }
    }
};