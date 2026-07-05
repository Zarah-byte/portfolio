(function () {
	'use strict';

	/** Root-relative prefix for pages one level deep (e.g. /projects/). */
	window.sitePrefix = function sitePrefix() {
		return location.pathname.includes('/projects/') ? '../' : '';
	};
})();
