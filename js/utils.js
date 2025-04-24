export const domUtils = {
	cssNumber: {
		'column-count': 1, 'columns': 1, 'font-weight': 1,
		'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1
	},

	propMap: {
		tabindex: 'tabIndex', readonly: 'readOnly', for: 'htmlFor', class: 'className',
		maxlength: 'maxLength', cellspacing: 'cellSpacing', cellpadding: 'cellPadding',
		rowspan: 'rowSpan', colspan: 'colSpan', usemap: 'useMap',
		frameborder: 'frameBorder', contenteditable: 'contentEditable'
	},

	dasherize: str => str.replace(/([A-Z])/g, '-$1').toLowerCase(),
	camelize: str => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
	matches: (el, selector) =>
		el?.matches?.(selector) || el?.webkitMatchesSelector?.(selector) ||
		el?.mozMatchesSelector?.(selector) || false,
	maybeAddPx: (prop, value) =>
		(typeof value === 'number' && !domUtils.cssNumber[prop]) ? `${value}px` : value,
	setAttr: (el, name, value) => {
		value == null ? el.removeAttribute(name) : el.setAttribute(name, value);
	},
	deserializeValue: value => {
		try {
			if (value === 'true') return true;
			if (value === 'false') return false;
			if (value === 'null') return null;
			if (+value + '' === value) return +value;
			if (/^[\[{]/.test(value)) return JSON.parse(value);
			return value;
		} catch {
			return value;
		}
	}, 
	guessDefaultDisplay : el => {
		const tag = el.tagName.toLowerCase();
		switch (tag) {
			case 'table': return 'table';
			case 'thead': return 'table-header-group';
			case 'tfoot': return 'table-footer-group';
			case 'tr': return 'table-row';
			case 'th':
			case 'td': return 'table-cell';
			case 'span': return 'inline';
			case 'li': return 'list-item';
		}
		return 'block';
	}
};
