import { domUtils } from './utils.js';

export function extendDOMAttributes(DOM) {
	const { dasherize, camelize, deserializeValue, setAttr, propMap } = domUtils;

	const css = (el, key, value, important = false) => {
		if (arguments.length >= 3) {
			if (value === null) {
				el.style.removeProperty(dasherize(key));
			} else {
				value = domUtils.maybeAddPx(dasherize(key), value);
				if (important) {
					el.style.setProperty(dasherize(key), value, 'important');
				} else {
					el.style[camelize(key)] = value;
				}
			}
			return;
		}
		return el.style[camelize(key)] || getComputedStyle(el).getPropertyValue(dasherize(key));
	};

	DOM.prototype.css = function(prop, value, important) {
		if (arguments.length >= 2) {
			return this.each(el => css(el, prop, value, important));
		}
		if (!this.elems.length) return null;

		if (typeof prop === 'string') {
			return css(this.elems[0], prop);
		}
		if (Array.isArray(prop)) {
			const result = {};
			prop.forEach(key => {
				result[key] = css(this.elems[0], key);
			});
			return result;
		}
		return null;
	};

	DOM.prototype.data = function(key, value) {
		if (arguments.length >= 1 && key) {
			if (arguments.length === 2) {
				return this.each(el => {
					if (typeof value === 'object' && value !== null) {
						Object.entries(value).forEach(([subKey, subVal]) => {
							el.setAttribute(`data-${dasherize(key + '-' + subKey)}`, subVal);
						});
					} else {
						el.setAttribute(`data-${dasherize(key)}`, value);
					}
				});
			}
			const val = this.elems[0]?.getAttribute?.(`data-${dasherize(key)}`);
			return val !== null ? deserializeValue(val) : undefined;
		}
		const dataset = {};
		const el = this.elems[0];
		if (el && el.dataset) {
			for (const k in el.dataset) {
				dataset[k] = deserializeValue(el.dataset[k]);
			}
		}
		return dataset;
	};

	DOM.prototype.attr = function(name, value) {
		if (arguments.length === 2) {
			return this.each(el => {
				if (el.nodeType === 1) setAttr(el, name, value);
			});
		}
		const el = this.elems[0];
		if (el?.nodeType === 1) {
			return el.getAttribute(name);
		}
		return null;
	};

	DOM.prototype.prop = function(name, value) {
		const propName = propMap[name] || name;
		if (arguments.length === 2) {
			return this.each(el => {
				el[propName] = value;
			});
		}
		const el = this.elems[0];
		return el ? el[propName] : undefined;
	};

	DOM.prototype.tagName = function() {
		return this.elems.length > 0 ? this.elems[0].tagName : null;
	};

	DOM.prototype.val = function(value) {
		if (arguments.length > 0) {
			return this.each(el => el.value = value ?? '');
		}
		return this.elems.length > 0 ? this.elems[0].value : null;
	};

	DOM.prototype.outerHeight = function() {
		const el = this.elems[0];
		if (!el) return 0;
		const style = getComputedStyle(el);
		return el.offsetHeight +
			parseInt(style.marginTop) +
			parseInt(style.marginBottom);
	};

	DOM.prototype.outerWidth = function() {
		const el = this.elems[0];
		if (!el) return 0;
		const style = getComputedStyle(el);
		return el.offsetWidth +
			parseInt(style.marginLeft) +
			parseInt(style.marginRight);
	};
	
	DOM.prototype.addClass = function(className) {
		return this.each(el => el.classList.add(className));
	};

	DOM.prototype.removeClass = function(className) {
		return this.each(el => el.classList.remove(className));
	};

	DOM.prototype.toggleClass = function(className) {
		return this.each(el => el.classList.toggle(className));
	};

	DOM.prototype.replaceClass = function(oldClass, newClass) {
		return this.each(el => el.classList.replace(oldClass, newClass));
	};

	DOM.prototype.hasClass = function(className) {
		return this.elems.length > 0 ? this.elems[0].classList.contains(className) : false;
	};

	DOM.prototype.hasClasses = function(classNames) {
		return this.elems.length > 0 ? classNames.every(className => this.elems[0].classList.contains(className)) : false;
	};

	DOM.prototype.containsClass = function(search) {
		return this.elems.length > 0 ? Array.from(this.elems[0].classList).some(className => className.includes(search)) : false;
	};
}