// confirm — wires `[data-confirm]` elements to the global `Modalizer.confirm()`
// (the jizy-modalizer extension). On click it opens a confirmation layer; the OK
// action (a callback, or navigating to the element's href) is handled by
// Modalizer.confirm, which also reads the element's data-confirm* attributes.
//
//   jDOM("[data-confirm]").confirm({ okText: JiZy.translate('CONFIRM'), koText: JiZy.translate('CANCEL') });
function confirm(el, params) {
	if (el.getAttribute("data-jizy-confirm-done")) {
		return;
	}

	el.setAttribute("data-jizy-confirm-done", true);

	el.addEventListener("click", (e) => {
		e.preventDefault();
		if (typeof Modalizer !== 'undefined' && typeof Modalizer.confirm === 'function') {
			Modalizer.confirm(el, params || {});
		}
	});
}

jDOMplugin('confirm', function (params) {
	return this.each(function (el) {
		confirm(el, params);
	});
});
