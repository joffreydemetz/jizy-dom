// picSlider / picViewer — image lightbox for galleries (`[data-gallery]`) and
// single zoomable thumbs. Built on the à-la-carte global `Modalizer`
// (jizy-modalizer v3): the layer's `getElement()` returns a RAW DOM node, so it
// is re-wrapped with `jDOM(...)` to reuse the dom helpers (`.find`/`.css`/
// `.swipe`). Decoupled from the old `JiZy.*` service layer:
//   JiZy.extend     → Object.assign
//   JiZy.MediaQ.xs  → matchMedia
//   JiZy.isFunction → typeof === 'function'
//   JiZy.Modalizer  → Modalizer (global)
// `JiZy.data.get('picViewerTemplate')` is kept (factory core data store).
//
//   jDOM("[data-gallery]").picSlider();
//   jDOM("[data-gallery] figure img").picViewer();
function isXs() {
	return window.matchMedia('(max-width: 575px)').matches;
}

jDOMplugin('picSlider', function (params) {
	var config = Object.assign({
		target: null
	}, params || {});

	var active = false;
	var $elements = [];

	return this.each(function (el) {
		if (el.data("slider-done")) {
			return;
		}

		el.data("slider-done", true);

		var $el = jDOM(el);

		active = $el.find("figure").size() > 1;
		$elements = $el.find("figure");

		if (true === active) {
			var i = 0;
			$elements.each(function (figure) {
				var $pic = jDOM(figure).find("img");
				if (0 === i) {
					$pic.data("slide-prev", $elements.size() - 1);
				}
				else {
					$pic.data("slide-prev", i - 1);
				}
				$pic.data("slide-i", i);
				if ($elements.size() - 1 === i) {
					$pic.data("slide-next", 0);
				}
				else {
					$pic.data("slide-next", i + 1);
				}
				i++;
			});
		}

		$el.on("slider.load", function (e) {
			if (false === active) {
				return;
			}

			var $current = $elements.find("img[data-slide-current='true']");
			var $prev = $elements.find("img[data-slide-i='" + $current.data('slide-prev') + "']");
			var $next = $elements.find("img[data-slide-i='" + $current.data('slide-next') + "']");
			var $layer = jDOM(e.detail.$layer);
			var cb = e.detail.cb;

			var $prevBtn = jDOMcreate('div', { html: '<span class="glyphicons"></span>' }).addClass("prev").on("click", function (e) {
				e.preventDefault();
				cb($prev);
			});
			$layer.find(".big-pic").prepend($prevBtn);

			var $nextBtn = jDOMcreate('div', { html: '<span class="glyphicons"></span>' }).addClass("next").on("click", function (e) {
				e.preventDefault();
				cb($next);
			});
			$layer.find(".big-pic").append($nextBtn);

			$layer.swipe(function (e, swipedir) {
				if ('right' === swipedir) {
					cb($prev);
				}
				else if ('left' === swipedir) {
					cb($next);
				}
			}, function (e) {
				var $target = jDOM(e.target);
				if (false === $target.hasClass("modalizer-close")) {
					$target = jDOM(e.target).closest(".modalizer-close");

					if (!$target.size()) {
						return false;
					}
				}

				if ($target) {
					return true;
				}

				return false;
			}, {
				threshold: 100
			});
		});
	});
});

jDOMplugin('picViewer', function () {
	// NB: don't fold the layer's CSS max-width/height in here — themes set them
	// with calc() (e.g. `calc(100vw - 76px)`), and parseInt("calc(...)") is NaN,
	// which would poison the ratio. The viewport bounds below already cap the size.
	function maxWidth($el) {
		var windowWidth = isXs() ? window.innerWidth : window.innerWidth - 62;
		return Math.min(parseInt($el.find(".big-pic img").prop("naturalWidth")), windowWidth);
	}

	function maxHeight($el) {
		var windowHeight = isXs() ? window.innerHeight : window.innerHeight - 76;
		return Math.min(parseInt($el.find(".big-pic img").prop("naturalHeight")), windowHeight);
	}

	function resizeImg($layer) {
		var w = parseInt($layer.find(".big-pic img").prop("naturalWidth"));
		var h = parseInt($layer.find(".big-pic img").prop("naturalHeight"));
		if (0 === w || 0 === h) {
			setTimeout(function () { resizeImg($layer); }, 1000);
			return;
		}
		var ratio = Math.min(maxWidth($layer) / w, maxHeight($layer) / h);
		$layer.css("width", (w * ratio) + 'px', true);
		$layer.find(".closer").show();
	}

	function display($el, replace) {
		var template = (typeof JiZy !== 'undefined' && JiZy.data) ? JiZy.data.get('picViewerTemplate') : null;
		if (!template || typeof template !== 'function') {
			template = function ($el) {
				return '<div class="big-pic"><figure><img src="' + $el.data("zoom") + '" alt="' + $el.prop("alt") + '" /></figure></div>';
			};
		}

		Modalizer.addLayer('picture', {
			content: template($el),
			ariaTitle: $el.prop("alt"),
			theme: 'pic-viewer',
			middle: true,
			closeIcon: true,
			onShowTimeout: 100,
			onBeforeShow: function (layer) {
				var $layer = jDOM(layer.getElement());
				$layer.find(".closer").hide();
				$layer.css("width", "0", true);
			},
			onUpdate: function (layer) {
				resizeImg(jDOM(layer.getElement()));
			},
			onShow: function (layer) {
				var $layer = jDOM(layer.getElement());
				resizeImg($layer);

				if ($el.closest("[data-gallery]").size() > 0) {
					$el.closest("[data-gallery]").find("figure img").data("slide-current", false);
					$el.data("slide-current", true);
					$el.closest("[data-gallery]").trigger("slider.load", {
						$layer: $layer,
						cb: function ($slide) { display($slide, true); }
					});
				}
			},
			onHide: function (layer) {
				layer.getElement().removeAttribute("style");
			}
		}, replace);
	}

	return this.each(function (el) {
		if (el.data("viewer-done")) {
			return;
		}

		el.data("viewer-done", true);

		var $el = jDOM(el);
		$el.addClass("pic-thumb");

		$el.on("click", function (e) {
			e.preventDefault();
			display($el, false);
		});
	});
});
