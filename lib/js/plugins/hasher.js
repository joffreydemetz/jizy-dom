function hasher(el) {
	if (el.getAttr("data-jhasher-done")) {
		return;
	}

	el.setAttr("data-jhasher-done", true);

	const hash = JiZy.Hasher.DomData(el);
	let layer = JiZy.Modalizer.LayerDomData(el);

	if (typeof hash.parser === "function") {
		layer = hash.parser(el, layer);
	}

	el.addEventListener("click", function (e) {
		e.preventDefault();
		this.blur();
		JiZy.Modalizer.loadHash(hash.url, hash, layer);
	});

	el.addEventListener("jizy.hasher.reload", function (e) {
		JiZy.Modalizer.loadHash(hash.url, hash, layer);
	});
}

jDOMplugin('hasher', function (config) {
	return this.each(function (el) {
		hasher(el, config);
	});
});
