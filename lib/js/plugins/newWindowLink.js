function newWindowLink(el, params) {
	if (el.getAttribute("data-newwindow-done")) {
		return;
	}
	el.setAttribute("data-newwindow-done", true);

	if (el.classList.contains("notip") || el.classList.contains("no-icon")) {
		return;
	}

	const tip = el.getAttribute("data-tip") || el.title || JiZy.translate('NEW_WINDOW');

	// Mark as a tooltip trigger via `data-tip` (the shared front layer's delegated
	// jizy-tooltip handler reads it on hover). Do NOT add a `.jtip` class — in
	// jizy-tooltip v2 `.jtip` is the hidden tooltip CONTAINER (opacity:0;
	// position:absolute), which would hide the link. Drop the native title too.
	el.setAttribute("data-tip", tip);
	el.removeAttribute("title");
	el.setAttribute("data-tip-position", el.getAttribute("data-placement") || params.placement);
	// The link is a real external link (selector is a[target='_blank']); let the
	// browser open it natively. Just drop focus so the outline doesn't linger.
	el.addEventListener("click", () => {
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
