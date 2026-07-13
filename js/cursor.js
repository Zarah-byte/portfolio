(function () {
	'use strict';

	if (!window.matchMedia('(pointer: fine)').matches) return;

	// Elements the cursor should react to. Classification happens in
	// resolveVariant(); anything matching here is considered interactive.
	const INTERACTIVE =
		'a, button, [role="button"], input, textarea, select, label, ' +
		'.card-link, .play-card, [data-cursor]';
	const CARD_SELECTOR = '.card-link, .play-card';
	const ICON_SELECTOR = '.site-menu__toggle, .site-menu__social';

	const LERP = 0.18;
	const MAGNET_STRENGTH = 0.35; // 0 = no pull, 1 = snap to element centre
	const VARIANT_CLASSES = ['cursor--link', 'cursor--icon', 'cursor--card'];
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
		'<span class="cursor-label" aria-hidden="true">View<br>Project</span>' +
		'</div>';

	document.body.append(cursor);
	document.body.classList.add('has-custom-cursor');

	const labelEl = cursor.querySelector('.cursor-label');
	const DEFAULT_CARD_LABEL = 'View<br>Project';

	let targetX = window.innerWidth / 2;
	let targetY = window.innerHeight / 2;
	let currentX = targetX;
	let currentY = targetY;
	let visible = false;
	let currentVariant = '';
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

	function setVariant(variant) {
		if (variant === currentVariant) return;
		currentVariant = variant;
		cursor.classList.remove(...VARIANT_CLASSES);
		if (variant) cursor.classList.add('cursor--' + variant);
	}

	// Map an interactive element to a cursor look. An explicit data-cursor
	// attribute always wins so any element can opt into a specific variant.
	function classify(el) {
		if (el.dataset.cursor) return el.dataset.cursor;
		if (el.matches(CARD_SELECTOR)) return 'card';
		if (el.matches(ICON_SELECTOR)) return 'icon';
		return 'link';
	}

	document.addEventListener('mousemove', (event) => {
		const el = event.target;
		const target = el && el.closest ? el.closest(INTERACTIVE) : null;
		const variant = target ? classify(target) : '';

		setVariant(variant);

		if (variant === 'card' && labelEl) {
			const custom = target.getAttribute('data-cursor-label');
			labelEl.innerHTML = custom || DEFAULT_CARD_LABEL;
		}

		let x = event.clientX;
		let y = event.clientY;

		// Magnetic pull: ease the cursor toward the element centre so it
		// "locks on" to opted-in targets (data-cursor-magnetic).
		if (target && !reducedMotion) {
			const magnet = target.closest('[data-cursor-magnetic]');
			if (magnet) {
				const rect = magnet.getBoundingClientRect();
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;
				x += (cx - x) * MAGNET_STRENGTH;
				y += (cy - y) * MAGNET_STRENGTH;
			}
		}

		targetX = x;
		targetY = y;
		show();
	});

	document.addEventListener('mouseleave', hide);
	document.addEventListener('mouseenter', show);

	document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
	document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));

	setPosition(currentX, currentY);
	rafId = requestAnimationFrame(tick);

	window.addEventListener('pagehide', () => {
		if (rafId !== null) cancelAnimationFrame(rafId);
	});
})();
