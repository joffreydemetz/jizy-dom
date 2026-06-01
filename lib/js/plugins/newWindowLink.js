function newWindowLink(el, params) {
	if (el.getAttribute("data-newwindow-done")) {
		return;
	}
	el.setAttribute("data-newwindow-done", true);

	if (el.classList.contains("notip") || el.classList.contains("no-icon")) {
		return;
	}

	let tip = '';
	if (el.getAttribute("data-tip")) {
		tip = el.getAttribute("data-tip");
	}
	else if (el.title) {
		tip = el.title;
	}
	else {
		tip = JiZy.translate('NEW_WINDOW');
	}

	el.classList.add("jtip");
	el.setAttribute("data-tip", tip);
	el.setAttribute("data-jtip-position", el.getAttribute("data-placement") || params.placement);
	el.addEventListener("click", (e) => {
		e.preventDefault();
		el.blur();
	});
	el.tooltip({
		content: tip
	});
}

jDOMplugin('newWindowLink', function (params) {
	params = Object.assign({
		placement: 'top',
	}, params || {});

	return this.each(function (el) {
		newWindowLink(el, params);
	});
});
