import { domUtils } from './Utils.js';

export function extendDOMEvents(DOM) {
	DOM.prototype.on = function(events, callback, options = false) {
		const list = events.split(/\s+/);
		return this.each(el => list.forEach(e => el.addEventListener(e, callback, options)));
	};

	DOM.prototype.off = function(events, callback) {
		const list = events.split(/\s+/);
		return this.each(el => list.forEach(e => el.removeEventListener(e, callback)));
	};

	DOM.prototype.delegate = function(events, selector, callback, options = false) {
		return this.on(events, function(event) {
			if (event.target && domUtils.matches(event.target, selector)) {
				callback.call(event.target, event);
			}
		}, options);
	};

	DOM.prototype.trigger = function(type, detail = null, bubbles = true, cancelable = true) {
		const evt = detail
			? new CustomEvent(type, { detail, bubbles, cancelable })
			: new Event(type, { bubbles, cancelable });
		return this.each(el => el.dispatchEvent(evt));
	};
	
	DOM.prototype.submit = function() {
		const el = this.elems[0];
		if (el?.tagName === 'FORM') el.submit();
		return this;
	};

	DOM.prototype.focus = function() {
		this.elems[0]?.focus?.();
		return this;
	};
}

