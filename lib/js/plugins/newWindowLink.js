function newWindowLink(el, params) {
	if (el.getAttribute("data-newwindow-done")) {
		return;
	}
	el.setAttribute("data-newwindow-done", true);

	if (el.classList.contains("notip") || el.classList.contains("no-icon")) {
		return;
	}

	const tip = el.getAttribute("data-tip") || el.title || JiZy.translate('NEW_WINDOW');

	// Mark as a tooltip trigger; the shared front layer's delegated jizy-tooltip
	// handler shows it on hover. The old `.tooltip()` jDOM plugin no longer
	// exists. Drop the native title so it doesn't double up.
	el.classList.add("jtip");
	el.setAttribute("data-tip", tip);
	el.removeAttribute("title");
	el.setAttribute("data-tip-position", el.getAttribute("data-placement") || params.placement);
	el.addEventListener("click", (e) => {
		e.preventDefault();
		el.blur();
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
