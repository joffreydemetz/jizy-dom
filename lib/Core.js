import { domUtils } from './Utils.js';
import { Selector } from './Selector.js';

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
