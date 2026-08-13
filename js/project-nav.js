(function () {
	'use strict';

	const links = Array.from(document.querySelectorAll('.project-nav__link'));
	if (!links.length) return;

	const sections = links
		.map((link) => ({ link: link, el: document.querySelector(link.getAttribute('href')) }))
		.filter((pair) => pair.el);
	if (!sections.length) return;

	let active = null;
	let queued = false;

	function update() {
		queued = false;
		const viewBottom = window.innerHeight;
		const line = viewBottom / 3;
		let current = sections[0];
		let anyInView = false;

		// A section is in view while its block (this heading → next heading)
		// overlaps the viewport. Several can be lit at once, matching the
		// reference track. aria-current stays on one link for SRs.
		sections.forEach((pair, i) => {
			const top = pair.el.getBoundingClientRect().top;
			const next = sections[i + 1];
			const bottom = next
				? next.el.getBoundingClientRect().top
				: pair.el.getBoundingClientRect().bottom;
			const inView = top < viewBottom && bottom > 0;
			pair.link.classList.toggle('is-in-view', inView);
			if (inView) anyInView = true;
			if (top <= line) current = pair;
		});

		if (!anyInView) {
			const fallback =
				sections[0].el.getBoundingClientRect().top > 0
					? sections[0]
					: sections[sections.length - 1];
			fallback.link.classList.add('is-in-view');
			current = fallback;
		}

		if (current === active) return;
		if (active) active.link.removeAttribute('aria-current');
		current.link.setAttribute('aria-current', 'true');
		active = current;
	}

	function onScroll() {
		if (queued) return;
		queued = true;
		requestAnimationFrame(update);
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	update();
})();
