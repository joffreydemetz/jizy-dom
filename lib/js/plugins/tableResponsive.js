function tableResponsive(el) {
	if (el.getAttribute("data-tblresp-done")) {
		return;
	}

	el.setAttribute("data-tblresp-done", true);

	const wrapper = document.createElement('div');
	wrapper.classList.add('table-responsive');

	el.parentNode.insertBefore(wrapper, el);
	wrapper.appendChild(el);
}

jDOMplugin('tableResponsive', function () {
	return this.each(function (el) {
		tableResponsive(el);
	});
});
