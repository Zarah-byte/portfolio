(function () {
	'use strict';

	// Desktop-only flourish: a labelled illustration trails the cursor while a
	// bold phrase is hovered. Coarse pointers just get the bold black text.
	if (!window.matchMedia('(pointer: fine)').matches) return;

	const targets = document.querySelectorAll('.about-prose [data-hover-image]');
	if (!targets.length) return;

	const LERP = 0.16;
	const OFFSET_X = 28; // trail slightly down-right of the pointer
	const OFFSET_Y = 28;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const media = document.createElement('img');
	media.className = 'about-hover-media';
	media.alt = '';
	media.setAttribute('aria-hidden', 'true');
	media.decoding = 'async';
	document.body.append(media);

	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;
	let active = false;
	let placed = false; // snap to the pointer on first reveal (no fly-in from 0,0)
	let rafId = null;

	function render() {
		if (reducedMotion) {
			currentX = targetX;
			currentY = targetY;
		} else {
			currentX += (targetX - currentX) * LERP;
			currentY += (targetY - currentY) * LERP;
		}

		const scale = active ? 1 : 0.85;
		media.style.transform =
			'translate3d(' + currentX + 'px, ' + currentY + 'px, 0) translate(-50%, -50%) scale(' + scale + ')';

		rafId = requestAnimationFrame(render);
	}

	function moveTo(event) {
		targetX = event.clientX + OFFSET_X;
		targetY = event.clientY + OFFSET_Y;
		if (!placed) {
			currentX = targetX;
			currentY = targetY;
			placed = true;
		}
	}

	targets.forEach((el) => {
		el.addEventListener('pointerenter', (event) => {
			const src = el.getAttribute('data-hover-image');
			if (!src) return;
			if (media.getAttribute('src') !== src) media.src = src;
			active = true;
			placed = false;
			moveTo(event);
			media.classList.add('is-visible');
		});

		el.addEventListener('pointermove', moveTo);

		el.addEventListener('pointerleave', () => {
			active = false;
			media.classList.remove('is-visible');
		});
	});

	rafId = requestAnimationFrame(render);

	window.addEventListener('pagehide', () => {
		if (rafId !== null) cancelAnimationFrame(rafId);
	});
})();
