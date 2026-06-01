jDOMplugin('picSlider', function(params){
	var config = JiZy.extend({
		target: null
	}, params||{});

	var active=false;
	var current=0;
	var $elements=[];
	var $target=null;

	var slides = false;
	var i=0;
	var $gallery;

	return this.each(function(el){
		if ( el.data("slider-done") ){
			return;
		}

		el.data("slider-done", true);

		var $el = jDOM(el);

		active = $el.find("figure").size() > 1;
		$elements = $el.find("figure");

		if ( true === active ){
			var i=0;
			$elements.each(function(figure){
				var $pic = jDOM(figure).find("img");
				if ( 0 === i ){
					$pic.data("slide-prev", $elements.size()-1);
				}
				else {
					$pic.data("slide-prev", i-1);
				}
				$pic.data("slide-i", i);
				if ( $elements.size() - 1 === i ){
					$pic.data("slide-next", 0);
				}
				else {
					$pic.data("slide-next", i+1);
				}
				i++;
			});
		}

		$el.on("slider.load", function(e){
			if ( false === active ){
				return;
			}

			var $current = $elements.find("img[data-slide-current='true']");
			var $prev = $elements.find("img[data-slide-i='"+$current.data('slide-prev')+"']");
			var $next = $elements.find("img[data-slide-i='"+$current.data('slide-next')+"']");
			var $layer = e.detail.$layer;
			var cb = e.detail.cb;

			var $prevBtn = jDOMcreate('div', { html: '<span class="glyphicons"></span>' }).addClass("prev").on("click", function(e){
				e.preventDefault();
				cb($prev);
			});
			$layer.find(".big-pic").prepend($prevBtn);

			var $nextBtn = jDOMcreate('div', { html: '<span class="glyphicons"></span>' }).addClass("next").on("click", function(e){
				e.preventDefault();
				cb($next);
			});
			$layer.find(".big-pic").append($nextBtn);

			$layer.swipe(function(e, swipedir){
				if ( 'right' === swipedir ){
					cb($prev);
				}
				else if ( 'left' === swipedir ){
					cb($next);
				}
			}, function(e){
				var $target = jDOM(e.target);
				if ( false === $target.hasClass("modalizer-close") ){
					$target = jDOM(e.target).closest(".modalizer-close");

					if ( !$target.size() ){
						return false;
					}
				}

				if ( $target ){
					return true;
				}

				return false;
			}, {
				threshold: 100
			});
		});
	});
});

jDOMplugin('picViewer', function(){
	function maxWidth($el){
		var windowWidth = JiZy.MediaQ.xs() ? window.innerWidth : window.innerWidth - 62;
		return Math.min(parseInt($el.find(".big-pic img").prop("naturalWidth")), parseInt($el.css("max-width")), windowWidth);
	}

	function maxHeight($el){
		var windowHeight = JiZy.MediaQ.xs() ? window.innerHeight : window.innerHeight - 76;
		return Math.min(parseInt($el.find(".big-pic img").prop("naturalHeight")), parseInt($el.css("max-height")), windowHeight);
	}

	function resizeImg($layer){
		var w = parseInt($layer.find(".big-pic img").prop("naturalWidth"));
		var h = parseInt($layer.find(".big-pic img").prop("naturalHeight"));
		if ( 0 === w || 0 === h ){
			setTimeout(function(){ resizeImg($layer); }, 1000);
			return;
		}
		var ratio = Math.min(maxWidth($layer) / w, maxHeight($layer) / h);
		$layer.css("width", (w*ratio)+'px', true);
		$layer.find(".closer").show();
	}

	function display($el, replace){
		var template = JiZy.data.get('picViewerTemplate');
		if ( !template || !JiZy.isFunction(template) ){
			template = function($el){
				return '<div class="big-pic"><figure><img src="'+$el.data("zoom")+'" alt="'+$el.prop("alt")+'" /></figure></div>';
			};
		}

		JiZy.Modalizer.addLayer('picture', {
			content: template($el),
			ariaTitle: $el.prop("alt"),
			theme: 'pic-viewer',
			middle: true,
			nofooter: true,
			noheader: true,
			closeIcon: true,
			onShowTimeout: 100,
			onBeforeShow: function(layer){
				layer.getElement().find(".closer").hide();
				layer.getElement().css("width", "0", true);
			},
			onUpdate: function(layer){
				resizeImg(layer.getElement());
			},
			onShow: function(layer){
				resizeImg(layer.getElement());

				if ( $el.closest("[data-gallery]").size() > 0 ){
					$el.closest("[data-gallery]").find("figure img").data("slide-current", false);
					$el.data("slide-current", true);
					$el.closest("[data-gallery]").trigger("slider.load", {
						$layer: layer.getElement(),
						cb: function($slide){ display($slide, true); }
					});
				}
			},
			onHide: function(layer){
				layer.getElement().prop("style", null);
			}
		}, replace);
	}

	return this.each(function(el){
		if ( el.data("viewer-done") ){
			return;
		}

		el.data("viewer-done", true);

		var $el = jDOM(el);
		$el.addClass("pic-thumb");

		$el.on("click", function(e){
			e.preventDefault();
			display($el, false);
		});
	});
});
