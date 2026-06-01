function toggler(el) {
	if (el.getAttribute("data-toggler-done")) {
		return;
	}
	el.setAttribute("data-toggler-done", true);
	if (!el.getAttribute("data-toggler")) {
		return;
	}

	el.addEventListener("click", (e) => {
		e.preventDefault();
		document.querySelector(el.getAttribute("data-toggler"))?.classList.toggle("active");
		el.blur();
	});
}

jDOMplugin('toggler', function () {
	return this.each(function (el) {
		toggler(el);
	});
});
