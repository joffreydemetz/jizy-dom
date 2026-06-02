function blockFitWidth(el, params) {
	let margin = params.offset;
	const container = el.closest(".container");
	if (container) {
		margin += parseInt(container.style.paddingLeft) || 0;
	}

	let padding = params.offset;
	if (el.getAttribute('data-nopadding')) {
		padding = null;
	}

	el.style.marginLeft = '-' + margin + 'px';
	el.style.marginRight = '-' + margin + 'px';
	el.style.paddingLeft = padding ? padding + 'px' : null;
	el.style.paddingRight = padding ? padding + 'px' : null;
}

jDOMplugin('blockFitWidth', function (params) {
	params = Object.assign({
		offset: 0
	}, params || {});

	return this.each(function (el) {
		blockFitWidth(el, params);
	});
});
