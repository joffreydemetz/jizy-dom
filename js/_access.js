export function extendDOMAccess(DOM) {

	DOM.prototype.toArray = function() {
		return this.elems;
	};

	DOM.prototype.exists = function() {
		return this.elems.length > 0;
	};

	DOM.prototype.size = function() {
		return this.elems.length;
	};

	DOM.prototype.map = function(callback) {
		const results = [];
		this.elems.forEach((el, i) => {
			const result = callback.call(this, el, i);
			if (result !== false) results.push(result);
		});
		return results;
	};

	DOM.prototype.filter = function(callback) {
		if (typeof callback !== 'function') {
			const selector = callback;
			callback = el => el.matches(selector);
		}
		const filtered = this.elems.filter((el, i) => callback.call(this, el, i) !== false);
		return new DOM(filtered);
	};

	DOM.prototype.not = function(selector) {
		let exclude = [];
		if (typeof selector === 'function') {
			this.each((el, i) => {
				if (!selector.call(el, i)) exclude.push(el);
			});
		} else {
			exclude = new DOM(selector).toArray();
		}
		const result = this.elems.filter(el => !exclude.includes(el));
		return new DOM(result);
	};

	DOM.prototype.get = function(index = 0) {
		const idx = index >= 0 ? index : this.elems.length + index;
		return this.elems[idx] ? new DOM(this.elems[idx]) : this;
	};

	DOM.prototype.getElement = function(tag = 'div') {
		return this.elems[0] || document.createElement(tag);
	};

	DOM.prototype.is = function(selector) {
		const el = this.elems[0];
		if (!el) return false;
		if (selector instanceof HTMLElement) return el === selector;
		if (selector instanceof DOM) return el === selector.getElement();
		if (typeof selector === 'string') {
			if (selector === ':visible') return getComputedStyle(el).display !== 'none';
			if (selector === ':hidden') return getComputedStyle(el).display === 'none';
			return el.matches(selector);
		}
		return false;
	};
}