(function () {
	'use strict';

	const rail = document.querySelector('[data-home-rail]');
	if (!rail) return;

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	function atStart() {
		return rail.scrollLeft <= 1;
	}

	function atEnd() {
		return rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
	}

	function hasOverflow() {
		return rail.scrollWidth > rail.clientWidth + 1;
	}

	rail.addEventListener(
		'wheel',
		function (event) {
			if (prefersReducedMotion.matches || !hasOverflow()) return;

			const dominantY = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
			if (!dominantY || event.deltaY === 0) return;

			const scrollingDown = event.deltaY > 0;
			const scrollingUp = event.deltaY < 0;

			// Let the page scroll normally when the rail is already at an edge
			// and the user keeps scrolling in that direction.
			if ((scrollingDown && atEnd()) || (scrollingUp && atStart())) return;

			event.preventDefault();
			rail.scrollLeft += event.deltaY;
		},
		{ passive: false }
	);
})();
