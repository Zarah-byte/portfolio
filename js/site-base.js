(function () {
	'use strict';

	/** Root-relative prefix for pages one level deep (e.g. /projects/). */
	window.sitePrefix = function sitePrefix() {
		return location.pathname.includes('/projects/') ? '../' : '';
	};

	/** Shared by the header menu (js/site-menu.js) and the footer (js/site-footer.js). */
	window.siteSocials = [
		{ id: 'email', label: 'Email', href: 'mailto:zarahyaqubdesign@gmail.com', icon: 'assets/icons/email-rounded.svg', external: false },
		{ id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/zarahbydesign', icon: 'assets/icons/linkedin-svgrepo-com 1.svg', external: true },
		{ id: 'github', label: 'GitHub', href: 'https://github.com/Zarah-byte', icon: 'assets/icons/github-rounded-svgrepo-com 1.svg', external: true },
	];
})();
