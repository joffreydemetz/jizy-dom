jDOMplugin('accordion', function (params) {
	params = Object.assign({
		offset: 0,
		tag: 'h2'
	}, params || {});

	function getScrollOffset(offset) {
		if (jDOM("body > main .page-contents").offset().top) {
			offset += parseInt(jDOM(".page-contents").css("padding-top"));
		}
		if (jDOM("body > header").exists()) {
			offset += jDOM("body > header").outerHeight();
		}
		else if (jDOM("body > nav").exists()) {
			offset += jDOM("body > nav").outerHeight();
		}
		return offset;
	}

	return this.each(function (el) {
		var $el = jDOM(el);

		if (el.data("accordion")) {
			return;
		}
		el.data("accordion", true);

		var $triggers = $el.find("> " + params.tag);
		var $boxes = $el.find("> div");

		$triggers.each(function (el) {
			var $trigger = jDOM(el);
			var $box = $trigger.next("div");

			$trigger.find("a").on("click", function (e) {
				e.preventDefault();

				if ($trigger.hasClass("active")) {
					$trigger.removeClass("active");
					$box.slideUp();
					return;
				}

				$triggers.removeClass("active");

				$boxes.map(function (el) {
					if ('none' !== el.css("display")) {
						jDOM(el).slideUp();
					}
				});

				$trigger.addClass("active");

				$box.slideDown();

				if (document.body.classList.contains("modalizer-open")) {
					jDOM(".modalizer").scrollTop(0);
				}
				else {
					jDOM("body").scrollTop($el.offset().top - getScrollOffset(params.offset));
				}
			});
		});

		if (el.data("open")) {
			$el.find("> " + params.tag + ":first-of-type")
				.addClass("active")
				.next("div")
				.slideDown();
		}
	});
});
