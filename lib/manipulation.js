export function extendDOMManipulation(DOM, Selector) {
	DOM.prototype.insert = function(newEl, position) {
		const map = {
			before: 'beforebegin',
			after: 'afterend',
			prepend: 'afterbegin',
			append: 'beforeend'
		};
		position = map[position] || position;

		return this.each(el => {
			if (newEl instanceof DOM) {
				newEl.each(child => el.insertAdjacentElement(position, child));
			} else if (newEl instanceof Element) {
				el.insertAdjacentElement(position, newEl);
			} else {
				el.insertAdjacentHTML(position, newEl);
			}
		});
	};

	DOM.prototype.before = function(newEl) { return this.insert(newEl, 'before'); };
	DOM.prototype.after = function(newEl) { return this.insert(newEl, 'after'); };
	DOM.prototype.append = function(newEl) { return this.insert(newEl, 'append'); };
	DOM.prototype.prepend = function(newEl) { return this.insert(newEl, 'prepend'); };

	DOM.prototype.replaceWith = function(newEl) {
		this.insert(newEl, 'before');
		this.remove();
		return this;
	};

	DOM.prototype.remove = function() {
		return this.each(el => el.parentNode?.removeChild(el));
	};

	DOM.prototype.wrap = function(wrapper) {
		return this.each(el => {
			el.parentNode.insertBefore(wrapper, el);
			wrapper.appendChild(el);
		});
	};

	DOM.prototype.find = function(selector) {
		let elems = [];
		this.each(el => {
			let found = Selector(selector, el);
			if (found && found.length) elems.push(...found);
		});
		return new DOM(elems);
	};
}