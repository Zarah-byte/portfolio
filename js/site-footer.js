(function () {
	'use strict';

	/** Design order, left to right — differs from the menu's ordering. */
	const SOCIAL_ORDER = ['email', 'github', 'linkedin'];

	const nyc = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	});

	function build() {
		const socials = window.siteSocials || [];

		const footer = document.createElement('footer');
		footer.className = 'site-footer';

		const copy = document.createElement('p');
		copy.className = 'site-footer__copy';
		copy.innerHTML = '&copy; 2026 Zarah Yaqub';

		const clock = document.createElement('p');
		clock.className = 'site-footer__time';
		const time = document.createElement('time');
		clock.append(time, document.createTextNode(' NYC TIME'));

		const list = document.createElement('ul');
		list.className = 'site-footer__socials';
		SOCIAL_ORDER.forEach((id) => {
			const social = socials.find((s) => s.id === id);
			if (!social) return;

			const a = document.createElement('a');
			a.className = 'site-footer__social site-footer__social--' + id;
			a.href = social.href;
			a.setAttribute('data-cursor-magnetic', '');
			if (social.external) {
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
			}
			a.innerHTML = `<span class="visually-hidden">${social.label}</span>`;

			const li = document.createElement('li');
			li.append(a);
			list.append(li);
		});

		// Résumé sits with the socials so "see her résumé / reach out" is one
		// click from every page, not only the About page.
		const resume = document.createElement('a');
		resume.className = 'site-footer__resume';
		resume.href = '/resume/Zarah_Yaqub_Resume.pdf';
		resume.target = '_blank';
		resume.rel = 'noopener noreferrer';
		resume.setAttribute('data-cursor-magnetic', '');
		resume.textContent = 'Résumé';

		const end = document.createElement('div');
		end.className = 'site-footer__end';
		end.append(resume, list);

		footer.append(copy, clock, end);

		const tick = () => {
			const now = new Date();
			time.textContent = nyc.format(now);
			time.dateTime = now.toISOString();
		};
		tick();
		setInterval(tick, 30000);

		return footer;
	}

	document.querySelectorAll('[data-site-footer]').forEach((placeholder) => {
		placeholder.replaceWith(build());
	});
})();
