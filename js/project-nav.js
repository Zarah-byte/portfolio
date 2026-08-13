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
		const line = window.innerHeight / 3;
		let current = sections[0];

		// Last section whose top has crossed the upper third of the viewport.
		for (let i = 0; i < sections.length; i++) {
			if (sections[i].el.getBoundingClientRect().top <= line) {
				current = sections[i];
			}
		}

		// Before the first section → first link; past the last → last link.
		const firstTop = sections[0].el.getBoundingClientRect().top;
		const lastBottom = sections[sections.length - 1].el.getBoundingClientRect().bottom;
		if (firstTop > line) {
			current = sections[0];
		} else if (lastBottom < 0) {
			current = sections[sections.length - 1];
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
