// picviewer — wires [data-zoom] thumbnails (and [data-gallery] containers) to the
// global Modalizer.picviewer() lightbox (the optional jizy-modalizer plugin). Thin
// proxy: it gathers the image(s) — the whole gallery when the thumb sits inside a
// [data-gallery], otherwise just the one — and hands them to Modalizer.picviewer,
// which builds the layer, the pure-CSS arrows and the prev/next + keyboard + swipe
// navigation. All styling and behaviour live in the modalizer plugin (js + css);
// this file is the optional DOM glue (native DOM + the Modalizer global, no JiZy.*).
//
//   jDOM("img[data-zoom]").picViewer();
//   jDOM("[data-gallery]").picSlider();
function pvGalleryImages(el) {
	var gallery = el.closest ? el.closest('[data-gallery]') : null;
	if (gallery) {
		return Array.prototype.slice.call(gallery.querySelectorAll('img[data-zoom]'));
	}
	return [el];
}

function pvBind(el) {
	if (!el || el.getAttribute('data-jizy-viewer-done')) {
		return;
	}
	el.setAttribute('data-jizy-viewer-done', true);
	if (el.classList) {
		el.classList.add('pic-thumb');
	}

	el.addEventListener('click', function (e) {
		e.preventDefault();
		if (typeof Modalizer === 'undefined' || typeof Modalizer.picviewer !== 'function') {
			return;
		}
		var imgs = pvGalleryImages(el);
		var index = imgs.indexOf(el);
		Modalizer.picviewer(imgs, index < 0 ? 0 : index);
	});
}

jDOMplugin('picViewer', function () {
	return this.each(function (el) {
		pvBind(el);
	});
});

jDOMplugin('picSlider', function () {
	// Gallery container: wire each of its [data-zoom] thumbs. The prev/next slider
	// itself is provided by Modalizer.picviewer (it detects the gallery from the
	// clicked thumb), so there is nothing else to set up here.
	return this.each(function (el) {
		var thumbs = el.querySelectorAll ? el.querySelectorAll('img[data-zoom]') : [];
		for (var i = 0; i < thumbs.length; i++) {
			pvBind(thumbs[i]);
		}
	});
});
