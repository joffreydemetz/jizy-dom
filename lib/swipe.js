export function extendDOMSwipe(DOM) {
	DOM.prototype.swipe = function(callback, ignore = () => false, opts = {}) {
		const config = {
			threshold: 20,
			restraint: 100,
			allowedTime: 300,
			scrolling: false,
			...opts
		};

		return this.each(el => {
			let startX, startY, startTime;

			const handleStart = e => {
				if (ignore(e)) return;
				const touch = e.changedTouches[0];
				startX = touch.pageX;
				startY = touch.pageY;
				startTime = Date.now();
				if (!config.scrolling) e.preventDefault();
			};

			const handleMove = e => {
				if (!config.scrolling) e.preventDefault();
			};

			const handleEnd = e => {
				if (ignore(e)) return;
				const touch = e.changedTouches[0];
				const distX = touch.pageX - startX;
				const distY = touch.pageY - startY;
				const elapsed = Date.now() - startTime;

				let swipedir = 'none';

				if (elapsed <= config.allowedTime) {
					if (Math.abs(distX) >= config.threshold && Math.abs(distY) <= config.restraint) {
						swipedir = distX < 0 ? 'left' : 'right';
					} else if (Math.abs(distY) >= config.threshold && Math.abs(distX) <= config.restraint) {
						swipedir = distY < 0 ? 'up' : 'down';
					}
				}

				if (swipedir !== 'none') callback(e, swipedir);
			};

			el.addEventListener('touchstart', handleStart, { passive: true });
			el.addEventListener('touchmove', handleMove, { passive: true });
			el.addEventListener('touchend', handleEnd, { passive: true });
		});
	};
}
