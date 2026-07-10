(function () {
	'use strict';

	const STAR_SVG = '<svg viewBox="0 0 73 72" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M35.4495 0.665413C35.7639 -0.223309 37.0207 -0.223306 37.3351 0.665416L44.0755 19.7221C44.2587 20.2403 44.8259 20.5134 45.3453 20.3336L64.447 13.7218C65.3378 13.4135 66.1214 14.3961 65.6226 15.196L54.926 32.3475C54.6352 32.8138 54.7753 33.4276 55.2397 33.7216L72.3187 44.5335C73.1151 45.0377 72.8355 46.263 71.8991 46.3717L51.8203 48.7026C51.2744 48.766 50.8819 49.2581 50.9416 49.8045L53.1371 69.8985C53.2395 70.8356 52.1071 71.3809 51.4383 70.7166L37.097 56.4717C36.707 56.0844 36.0776 56.0844 35.6876 56.4717L21.3463 70.7166C20.6775 71.3809 19.5451 70.8356 19.6475 69.8985L21.843 49.8045C21.9027 49.2581 21.5102 48.766 20.9642 48.7026L0.885511 46.3717C-0.0508766 46.263 -0.330547 45.0377 0.465945 44.5334L17.5449 33.7216C18.0093 33.4276 18.1494 32.8138 17.8586 32.3475L7.16203 15.196C6.66319 14.3961 7.44682 13.4135 8.33764 13.7218L27.4393 20.3336C27.9587 20.5134 28.5259 20.2403 28.7091 19.7221L35.4495 0.665413Z"/></svg>';

	const PAGES = [
		{ id: 'work', label: 'Work', href: 'index.html' },
		{ id: 'play', label: 'Archive', href: 'play.html' },
		{ id: 'about', label: 'About', href: 'about.html' },
	];

	const SOCIALS = window.siteSocials;

	const PANEL_ID = 'site-menu-panel';
	let uid = 0;

	function build(current, compact) {
		const prefix = window.sitePrefix ? window.sitePrefix() : '';
		const panelId = PANEL_ID + (uid++ ? '-' + uid : '');

		const header = document.createElement('header');
		header.className = compact ? 'site-menu site-menu--compact' : 'site-menu';

		if (!compact) {
			const wordmark = document.createElement('a');
			wordmark.className = 'site-menu__wordmark';
			wordmark.href = prefix + 'index.html';
			wordmark.setAttribute('aria-label', 'Zarah Yaqub — home');
			wordmark.innerHTML = `<span class="wordmark-star" aria-hidden="true">${STAR_SVG}</span><span class="wordmark-text">Zarah Yaqub</span>`;
			header.append(wordmark);
		}

		// Trigger wraps the toggle + the dropdown panel so the panel can anchor
		// to the toggle's top-right corner.
		const trigger = document.createElement('div');
		trigger.className = 'site-menu__trigger';

		const toggle = document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'site-menu__toggle';
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-controls', panelId);
		toggle.setAttribute('aria-label', 'Open menu');
		toggle.setAttribute('data-cursor-magnetic', '');
		toggle.innerHTML = '<span class="site-menu__toggle-icon" aria-hidden="true"></span>';

		const panel = document.createElement('div');
		panel.className = 'site-menu__panel';
		panel.id = panelId;
		panel.hidden = true;

		// Primary links (Work / Play / About)
		const primary = document.createElement('nav');
		primary.className = 'site-menu__primary';
		primary.setAttribute('aria-label', 'Primary');
		PAGES.forEach((page) => {
			const a = document.createElement('a');
			a.className = 'site-menu__link';
			a.href = prefix + page.href;
			a.textContent = page.label;
			if (page.id === current) a.setAttribute('aria-current', 'page');
			primary.append(a);
		});

		// Secondary links (Resume)
		const secondary = document.createElement('nav');
		secondary.className = 'site-menu__secondary';
		secondary.setAttribute('aria-label', 'Resume');
		const resume = document.createElement('a');
		resume.className = 'site-menu__link-sub';
		resume.href = '/resume/Zarah_Yaqub_Resume.pdf';
		resume.target = '_blank';
		resume.rel = 'noopener noreferrer';
		resume.textContent = 'Resume';
		secondary.append(resume);

		// Socials
		const socials = document.createElement('ul');
		socials.className = 'site-menu__socials';
		SOCIALS.forEach((social) => {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.className = social.chip ? 'site-menu__social site-menu__social--chip' : 'site-menu__social';
			a.setAttribute('data-cursor-magnetic', '');
			a.href = social.href;
			if (social.external) {
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
			}
			a.innerHTML = `<img src="${prefix + social.icon}" alt="" width="28" height="28"><span class="visually-hidden">${social.label}</span>`;
			li.append(a);
			socials.append(li);
		});

		panel.append(primary, secondary, socials);
		trigger.append(toggle, panel);
		header.append(trigger);

		// ---- Behaviour --------------------------------------------------------
		let onDocClick = null;

		const open = () => {
			panel.hidden = false;
			void panel.offsetWidth; // reflow so the transition runs
			panel.classList.add('is-open');
			toggle.classList.add('is-open');
			toggle.setAttribute('aria-expanded', 'true');
			toggle.setAttribute('aria-label', 'Close menu');
			const first = panel.querySelector('a');
			if (first) first.focus();

			onDocClick = (event) => {
				if (!trigger.contains(event.target)) close(false);
			};
			// Defer so the opening click doesn't immediately close it.
			setTimeout(() => document.addEventListener('click', onDocClick), 0);
		};

		const close = (returnFocus) => {
			if (!panel.classList.contains('is-open')) return;
			panel.classList.remove('is-open');
			toggle.classList.remove('is-open');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.setAttribute('aria-label', 'Open menu');
			if (onDocClick) {
				document.removeEventListener('click', onDocClick);
				onDocClick = null;
			}
			const onEnd = () => {
				panel.hidden = true;
				panel.removeEventListener('transitionend', onEnd);
			};
			panel.addEventListener('transitionend', onEnd);
			// Fallback in case transitionend doesn't fire (e.g. reduced motion).
			setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 400);
			if (returnFocus) toggle.focus();
		};

		toggle.addEventListener('click', () => {
			if (panel.classList.contains('is-open')) close(true);
			else open();
		});

		panel.addEventListener('click', (event) => {
			if (event.target.closest('a')) close(false);
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && panel.classList.contains('is-open')) close(true);
		});

		return header;
	}

	document.querySelectorAll('[data-site-menu]').forEach((placeholder) => {
		const compact = placeholder.hasAttribute('data-site-menu-compact');
		const header = build(placeholder.dataset.siteMenu, compact);
		placeholder.replaceWith(header);
	});
})();
