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
		// The last section whose top has crossed a third of the viewport wins.
		// Above the first crossing, the first link stays lit so one is always active.
		const line = window.innerHeight / 3;
		let current = sections[0];
		for (const pair of sections) {
			if (pair.el.getBoundingClientRect().top <= line) current = pair;
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
