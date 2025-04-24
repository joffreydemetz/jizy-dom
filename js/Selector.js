export function Selector(selector, context = document) {
	if (!selector) return [];

	if (selector instanceof Element || selector === window || selector.nodeType) {
		return [selector];
	}

	if (selector instanceof NodeList || Array.isArray(selector)) {
		return Array.from(selector);
	}

	if (typeof selector === 'string') {
		return Array.from((context || document).querySelectorAll(selector));
	}

	return [];
}

