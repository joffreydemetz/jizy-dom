import { domUtils } from './Utils.js';

export function extendDOMMisc(DOM) {
	DOM.prototype.toggle = function() {
		return this.each(el => {
			const display = domUtils.guessDefaultDisplay(el);
			if (!el.dataset.cssInitialDisplay) {
				el.dataset.cssInitialDisplay = display;
			}
			el.style.display = (el.style.display === 'none' || getComputedStyle(el).display === 'none')
				? el.dataset.cssInitialDisplay
				: 'none';
		});
	};

	DOM.prototype.show = function() {
		return this.each(el => {
			const display = domUtils.guessDefaultDisplay(el);
			if (!el.dataset.cssInitialDisplay) {
				el.dataset.cssInitialDisplay = display;
			}
			el.style.display = el.dataset.cssInitialDisplay;
		});
	};

	DOM.prototype.hide = function() {
		return this.each(el => {
			if (!el.dataset.cssInitialDisplay) {
				el.dataset.cssInitialDisplay = domUtils.guessDefaultDisplay(el);
			}
			el.style.display = 'none';
		});
	};

	DOM.prototype.offset = function() {
		if (!this.elems.length) return { top: 0, left: 0 };
		const rect = this.elems[0].getBoundingClientRect();
		return {
			top: rect.top + window.pageYOffset,
			left: rect.left + window.pageXOffset
		};
	};

	DOM.prototype.scrollTop = function(position) {
		if (arguments.length > 0) {
			return this.each(el => {
				el.style.scrollBehavior = 'smooth';
				el.scrollTop = position || 0;
			});
		}
		return this.elems[0]?.scrollTop || 0;
	};

	DOM.prototype.serialize = function() {
		if (!this.elems.length || !(this.elems[0] instanceof HTMLFormElement)) return '';
		const formData = new FormData(this.elems[0]);
		return new URLSearchParams(formData).toString();
	};
}