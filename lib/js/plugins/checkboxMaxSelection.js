function checkboxMaxSelection(el) {
	const max = parseInt(el.getAttribute("data-max-selection"));

	if (!max) {
		return;
	}

	const $checkboxes = Array.from(el.querySelectorAll("input[type='checkbox']"));

	if ($checkboxes.length === 0) {
		return;
	}

	function checkCount($checkboxes) {
		const counter = $checkboxes.filter(checkbox => checkbox.checked).length;
		if (counter >= max) {
			$checkboxes.forEach(checkbox => {
				if (!checkbox.checked) {
					checkbox.disabled = true;
				}
			});
		}
		else {
			$checkboxes.forEach(checkbox => {
				checkbox.disabled = false;
			});
		}
	}

	checkCount($checkboxes);

	$checkboxes.forEach(checkbox => {
		checkbox.addEventListener("click", () => {
			checkCount($checkboxes);
		});
	});
}

jDOMplugin('checkboxMaxSelection', function () {
	return this.each(function (el) {
		checkboxMaxSelection(el);
	});
});
