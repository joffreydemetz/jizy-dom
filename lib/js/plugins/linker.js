function linker(el) {
	if (el.getAttribute("data-jizy-linker-done")) {
		return;
	}
	el.setAttribute("data-jizy-linker-done", true);

	const link = el.getAttribute('data-linker');
	if (!link) {
		return;
	}

	el.addEventListener("click", (e) => {
		e.preventDefault();
		document.querySelector("[data-slug='" + link + "']").click();
	});
}

jDOMplugin('linker', function () {
	return this.each(function (el) {
		linker(el);
	});
});
