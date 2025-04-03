import { Selector } from './lib/Selector.js';
import { DOM } from './lib/Core.js';
import { domUtils } from './lib/Utils.js';
import { extendDOMAttributes } from './lib/attributes.js';
import { extendDOMManipulation } from './lib/manipulation.js';
import { extendDOMAccess } from './lib/access.js';
import { extendDOMTraversal } from './lib/traversal.js';
import { extendDOMContents } from './lib/contents.js';
import { extendDOMEvents } from './lib/events.js';
import { extendDOMAnimations } from './lib/animations.js';
import { extendDOMSwipe } from './lib/swipe.js';
import { extendDOMMisc } from './lib/misc.js';

const jDOM = function(selector, context) {
	return new DOM(selector, context);
};

const jDOMplugin = function(name, fn) {
	DOM.prototype[name] = fn;
};

const jDOMcreate = function(tag, attrs = {}) {
	const el = document.createElement(tag);
	const wrapped = new DOM([el]);

	if (attrs.className) {
		wrapped.addClass(attrs.className);
		delete attrs.className;
	}

	if (attrs.text) {
		wrapped.text(attrs.text);
		delete attrs.text;
	}

	if (attrs.html) {
		wrapped.html(attrs.html);
		delete attrs.html;
	}

	for (const [key, val] of Object.entries(attrs)) {
		wrapped.attr(key, val);
	}

	return wrapped;
};
const JiZyDOM = {
    jDOM, 
    Selector, 
    domUtils, 
    DOM,
    jDOM,
    jDOMplugin,
    jDOMcreate,
    extendDOMAttributes, extendDOMManipulation, extendDOMAccess, 
    extendDOMTraversal, extendDOMContents, extendDOMEvents, 
    extendDOMAnimations, extendDOMSwipe, extendDOMMisc 
};

export  default JiZyDOM;

