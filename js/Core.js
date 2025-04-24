import { domUtils } from '../utils.js';
import { Selector } from '../Selector.js';

export class DOM {
	constructor(selector, context = document) {
		this.elems = Selector(selector, context);
		this.elems.forEach(el => this._patchElement(el));
	}

	_patchElement(el) {
		el.data = (key, val) => {
			if (!key) return this._getAllData(el);
			return arguments.length === 2 ? this._setData(el, key, val) : this._getData(el, key);
		};

		el.css = (prop, val, important = false) =>
			arguments.length === 1 ? this._getCss(el, prop) : this._setCss(el, prop, val, important);

		el.addClass = cls => this._class(el, 'add', cls);
		el.removeClass = cls => this._class(el, 'remove', cls);
		el.hasClass = cls => el.classList.contains(cls);
		el.hasClasses = clsList => clsList.some(cls => el.classList.contains(cls));
		el.hasAllClasses = clsList => clsList.every(cls => el.classList.contains(cls));
	}

	_getCss(el, prop) {
		return el.style[domUtils.camelize(prop)] || getComputedStyle(el).getPropertyValue(domUtils.dasherize(prop));
	}

	_setCss(el, prop, val, important) {
		if (val === null) el.style.removeProperty(domUtils.dasherize(prop));
		else if (important) el.style.setProperty(domUtils.dasherize(prop), domUtils.maybeAddPx(prop, val), 'important');
		else el.style[domUtils.camelize(prop)] = domUtils.maybeAddPx(prop, val);
	}

	_getData(el, key) {
		const attr = el.getAttribute(`data-${domUtils.dasherize(key)}`);
		return attr !== null ? domUtils.deserializeValue(attr) : undefined;
	}

	_setData(el, key, val) {
		if (typeof val === 'object') {
			for (const k in val) this._setData(el, `${key}-${k}`, val[k]);
		} else {
			domUtils.setAttr(el, `data-${domUtils.dasherize(key)}`, val);
		}
	}

	_getAllData(el) {
		const data = {};
		for (const key in el.dataset) data[key] = this._getData(el, key);
		return data;
	}

	_class(el, action, cls) {
		cls.split(' ').forEach(c => c && el.classList[action](c));
	}

	each(callback) {
		this.elems.forEach((el, i) => callback.call(this, el, i));
		return this;
	}
}

// access

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

// attributes 

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

// traversal 

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

DOM.prototype.find = function(selector) {
	let elems = [];
	this.each(el => {
		let found = Selector(selector, el);
		if (found && found.length) elems.push(...found);
	});
	return new DOM(elems);
};

// events

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

// contents 

DOM.prototype.text = function(value) {
	if (arguments.length > 0) {
		return this.each(el => el.innerText = value);
	}
	return this.elems.length > 0 ? this.elems[0].innerText : null;
};

DOM.prototype.html = function(value) {
	if (arguments.length > 0) {
		return this.each(el => el.innerHTML = value);
	}
	return this.elems.length > 0 ? this.elems[0].innerHTML : null;
};

DOM.prototype.content = function(value) {
	if (arguments.length > 0) {
		return this.each(el => el.textContent = value);
	}
	return this.elems.length > 0 ? this.elems[0].textContent : null;
};

// animations 

DOM.prototype.slideDown = function(speed = 300, easing = 'ease', delay = 0, display = 'block') {
	return this.each(el => slide(el, 'down', speed, easing, delay, display));
};

DOM.prototype.slideUp = function(speed = 300, easing = 'ease', delay = 0) {
	return this.each(el => slide(el, 'up', speed, easing, delay));
};

DOM.prototype.slideToggle = function(speed = 300, easing = 'ease', delay = 0, display = 'block') {
	return this.each(el => {
		const isHidden = getComputedStyle(el).display === 'none';
		return slide(el, isHidden ? 'down' : 'up', speed, easing, delay, display);
	});
};

// misc 

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

// manipulation 

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

// swipe

DOM.prototype.swipe = function(callback, ignore = () => false, opts = {}) {
	const config = {
		threshold: 20,
		restraint: 100,
		allowedTime: 300,
		scrolling: false,
		...opts
	};

	return this.each(el => {
		let startX, startY, startTime;

		const handleStart = e => {
			if (ignore(e)) return;
			const touch = e.changedTouches[0];
			startX = touch.pageX;
			startY = touch.pageY;
			startTime = Date.now();
			if (!config.scrolling) e.preventDefault();
		};

		const handleMove = e => {
			if (!config.scrolling) e.preventDefault();
		};

		const handleEnd = e => {
			if (ignore(e)) return;
			const touch = e.changedTouches[0];
			const distX = touch.pageX - startX;
			const distY = touch.pageY - startY;
			const elapsed = Date.now() - startTime;

			let swipedir = 'none';

			if (elapsed <= config.allowedTime) {
				if (Math.abs(distX) >= config.threshold && Math.abs(distY) <= config.restraint) {
					swipedir = distX < 0 ? 'left' : 'right';
				} else if (Math.abs(distY) >= config.threshold && Math.abs(distX) <= config.restraint) {
					swipedir = distY < 0 ? 'up' : 'down';
				}
			}

			if (swipedir !== 'none') callback(e, swipedir);
		};

		el.addEventListener('touchstart', handleStart, { passive: true });
		el.addEventListener('touchmove', handleMove, { passive: true });
		el.addEventListener('touchend', handleEnd, { passive: true });
	});
};