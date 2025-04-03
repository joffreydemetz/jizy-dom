export function extendDOMTraversal(DOM) {
	DOM.prototype.parent = function(selector) {
		const parents = this.elems.map(el => el.parentNode).filter(Boolean);
		return selector ? new DOM(parents).filter(selector) : new DOM(parents);
	};

	DOM.prototype.children = function(selector) {
		const all = [];
		this.each(el => all.push(...el.children));
		return selector ? new DOM(all).filter(selector) : new DOM(all);
	};

	DOM.prototype.closest = function(selector) {
		const found = this.elems.map(el => el.closest(selector)).filter(Boolean);
		return new DOM(found);
	};

	DOM.prototype.prev = function(selector) {
		const prev = this.elems.map(el => el.previousElementSibling).filter(Boolean);
		return selector ? new DOM(prev).filter(selector) : new DOM(prev);
	};

	DOM.prototype.next = function(selector) {
		const next = this.elems.map(el => el.nextElementSibling).filter(Boolean);
		return selector ? new DOM(next).filter(selector) : new DOM(next);
	};

	DOM.prototype.first = function(selector) {
		const first = this.elems.map(el => el.firstElementChild).filter(Boolean);
		return selector ? new DOM(first).filter(selector) : new DOM(first);
	};

	DOM.prototype.last = function(selector) {
		const last = this.elems.map(el => el.lastElementChild).filter(Boolean);
		return selector ? new DOM(last).filter(selector) : new DOM(last);
	};
}

