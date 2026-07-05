(function () {
	'use strict';

	const PAGES = [
		{ id: 'work', label: 'Work', href: 'index.html' },
		{ id: 'play', label: 'Play', href: 'play.html' },
		{ id: 'about', label: 'About', href: 'about.html' },
	];

	const RESUME_ARROW = '<svg class="resume-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

	function buildNav(current) {
		const prefix = window.sitePrefix ? window.sitePrefix() : '';
		const nav = document.createElement('nav');
		nav.className = 'nav-bar';
		nav.setAttribute('aria-label', 'Site');

		const navId = 'nav-links';

		const toggle = document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'nav-toggle';
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-controls', navId);
		toggle.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"><span></span></span><span class="nav-toggle-label">Menu</span>';
		toggle.addEventListener('click', () => {
			const isOpen = nav.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
			toggle.querySelector('.nav-toggle-label').textContent = isOpen ? 'Close' : 'Menu';
		});
		nav.append(toggle);

		const ul = document.createElement('ul');
		ul.className = 'nav-links';
		ul.id = navId;

		PAGES.forEach((page) => {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = prefix + page.href;
			a.textContent = page.label;
			if (page.id === current) a.setAttribute('aria-current', 'page');
			li.append(a);
			ul.append(li);
		});

		const resumeLi = document.createElement('li');
		const resumeA = document.createElement('a');
		resumeA.className = 'nav-resume';
		resumeA.href = '/resume/';
		resumeA.target = '_blank';
		resumeA.rel = 'noopener noreferrer';
		resumeA.innerHTML = `Resume${RESUME_ARROW}`;
		resumeLi.append(resumeA);
		ul.append(resumeLi);

		nav.append(ul);

		const closeMenu = () => {
			nav.classList.remove('is-open');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.querySelector('.nav-toggle-label').textContent = 'Menu';
		};

		ul.addEventListener('click', (event) => {
			if (event.target.closest('a')) closeMenu();
		});

		window.addEventListener('resize', () => {
			if (window.innerWidth > 768) closeMenu();
		});

		return nav;
	}

	document.querySelectorAll('[data-site-nav]').forEach((placeholder) => {
		const nav = buildNav(placeholder.dataset.siteNav);
		placeholder.replaceWith(nav);
	});
})();
