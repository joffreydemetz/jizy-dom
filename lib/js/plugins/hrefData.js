function hrefData(el) {
	if (el.getAttribute("data-jizy-href-done")) {
		return;
	}

	el.setAttribute("data-jizy-href-done", true);

	const href = el.getAttribute('data-href');
	if (!href) {
		return;
	}

	el.addEventListener("click", (e) => {
		e.preventDefault();
		window.location.href = href;
	});
}

jDOMplugin('hrefData', function () {
	return this.each(function (el) {
		hrefData(el);
	});
});
