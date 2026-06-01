function limitLinkText(el, params) {
	if (el.getAttribute("data-limit-link-text")) {
		return;
	}

	el.setAttribute("data-limit-link-text", true);

	if (el.innerText === el.getAttribute("href")) {
		let limit = parseInt(el.getAttribute("data-maxlength"));
		if (!limit) {
			limit = params.maxLength;
		}

		let text = el.innerText;
		if (text.length > limit) {
			text = text.substr(0, limit) + '...';
		}
		el.innerText = text;
	}
}

jDOMplugin('limitLinkText', function (params) {
	params = Object.assign({
		maxLength: 47
	}, params || {});

	return this.each(function (el) {
		limitLinkText(el, params);
	});
});
