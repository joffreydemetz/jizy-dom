function slide(el, direction, speed = 300, easing = 'ease', delay = 0, display = 'block') {
	return new Promise(resolve => {
		if (el.dataset.sliding) return resolve(el);
		el.dataset.sliding = true;

		const isDown = direction === 'down';
		if (isDown && getComputedStyle(el).display !== 'none') {
			delete el.dataset.sliding;
			return resolve(el);
		}

		const fullHeight = el.scrollHeight;

		if (isDown) {
			el.style.display = display;
			el.style.overflow = 'hidden';
			el.style.height = '0px';
			el.offsetHeight;
		}

		requestAnimationFrame(() => {
			el.style.transition = `height ${speed}ms ${easing}`;
			el.style.height = isDown ? `${fullHeight}px` : '0px';

			setTimeout(() => {
				el.style.removeProperty('transition');
				el.style.removeProperty('height');
				el.style.removeProperty('overflow');
				if (!isDown) el.style.display = 'none';
				delete el.dataset.sliding;
				resolve(el);
			}, speed + delay);
		});
	});
}

export function extendDOMAnimations(DOM) {
	DOM.prototype.slideDown = function(speed = 300, easing = 'ease', delay = 0, display = 'block') {
		return this.each(el => slide(el, 'down', speed, easing, delay, display));
	};

	DOM.prototype.slideUp = function(speed = 300, easing = 'ease', delay = 0) {
		return this.each(el => slide(el, 'up', speed, easing, delay));
	};

	DOM.prototype.slideToggle = function(speed = 300, easing = 'ease', delay = 0, display = 'block') {
		return this.each(el => {
			const isHidden = getComputedStyle(el).display === 'none';
			return slide(el, isHidden ? 'down' : 'up', speed, easing, delay, display);
		});
	};
}

