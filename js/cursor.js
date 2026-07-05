(function () {
	'use strict';

	if (!window.matchMedia('(pointer: fine)').matches) return;

	const CARD_SELECTOR = '.card-link';
	const LERP = 0.18;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const cursor = document.createElement('div');
	cursor.className = 'cursor';
	cursor.setAttribute('aria-hidden', 'true');
	cursor.innerHTML =
		'<div class="cursor-inner">' +
		'<svg class="cursor-arrow" viewBox="0 0 24 24" aria-hidden="true">' +
		'<path d="M7 7h10v10"/>' +
		'<path d="M7 17 17 7"/>' +
		'</svg>' +
		'</div>';

	document.body.append(cursor);
	document.body.classList.add('has-custom-cursor');

	let targetX = window.innerWidth / 2;
	let targetY = window.innerHeight / 2;
	let currentX = targetX;
	let currentY = targetY;
	let visible = false;
	let cardHover = false;
	let rafId = null;

	function setPosition(x, y) {
		cursor.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) translate(-50%, -50%)';
	}

	function tick() {
		if (reducedMotion) {
			currentX = targetX;
			currentY = targetY;
		} else {
			currentX += (targetX - currentX) * LERP;
			currentY += (targetY - currentY) * LERP;
		}

		setPosition(currentX, currentY);
		rafId = requestAnimationFrame(tick);
	}

	function show() {
		if (visible) return;
		visible = true;
		cursor.classList.add('is-visible');
	}

	function hide() {
		visible = false;
		cursor.classList.remove('is-visible');
	}

	function setCardHover(active) {
		cardHover = active;
		cursor.classList.toggle('is-card-hover', active);
	}

	document.addEventListener('mousemove', (event) => {
		targetX = event.clientX;
		targetY = event.clientY;
		show();
	});

	document.addEventListener('mouseleave', hide);
	document.addEventListener('mouseenter', show);

	document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
		card.addEventListener('mouseenter', () => setCardHover(true));
		card.addEventListener('mouseleave', () => setCardHover(false));
	});

	setPosition(currentX, currentY);
	rafId = requestAnimationFrame(tick);

	window.addEventListener('pagehide', () => {
		if (rafId !== null) cancelAnimationFrame(rafId);
	});
})();
