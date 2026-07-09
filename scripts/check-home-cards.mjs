#!/usr/bin/env node
/**
 * Assert uniform work-card dimensions and no horizontal overflow on the homepage.
 * Usage: node scripts/check-home-cards.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://localhost:9321';
const VIEWPORTS = [
	{ name: '390', width: 390, height: 844 },
	{ name: '768', width: 768, height: 1024 },
	{ name: '1440', width: 1440, height: 900 },
];

function fail(message) {
	console.error(`FAIL: ${message}`);
	process.exitCode = 1;
}

async function checkViewport(page, vp) {
	await page.setViewportSize({ width: vp.width, height: vp.height });
	await page.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
	await page.waitForTimeout(1200);

	const result = await page.evaluate(() => {
		const media = [...document.querySelectorAll('.card-media')];
		const sizes = media.map((el) => ({ w: el.offsetWidth, h: el.offsetHeight }));
		const widths = sizes.map((s) => s.w);
		const heights = sizes.map((s) => s.h);
		const allSameWidth = widths.every((w) => w === widths[0]);
		const allSameHeight = heights.every((h) => h === heights[0]);
		const root = document.documentElement;
		const overflow = root.scrollWidth > root.clientWidth + 1;
		const toggle = document.querySelector('.site-menu__toggle');
		const toggleVisible = toggle ? toggle.offsetParent !== null : false;
		const hero = document.querySelector('.hero-intro');
		const firstCard = document.querySelector('.card-media');
		const heroRect = hero?.getBoundingClientRect();
		const cardRect = firstCard?.getBoundingClientRect();
		const scrollCue = document.querySelector('.scroll-cue');
		const scrollCueOverflow = scrollCue
			? scrollCue.scrollWidth > scrollCue.clientWidth + 1
			: false;

		return {
			count: media.length,
			sizes,
			allSameWidth,
			allSameHeight,
			overflow,
			scrollWidth: root.scrollWidth,
			clientWidth: root.clientWidth,
			toggleVisible,
			heroVisible: heroRect ? heroRect.bottom > 0 : false,
			cardVisible: cardRect ? cardRect.top < window.innerHeight : false,
			scrollCueOverflow,
		};
	});

	console.log(`\n[${vp.name}px] cards=${result.count} sizes=${JSON.stringify(result.sizes)}`);

	if (result.count < 4) {
		fail(`${vp.name}px: expected 4 cards, found ${result.count}`);
	}
	if (!result.allSameWidth) {
		fail(`${vp.name}px: card widths differ — ${JSON.stringify(result.sizes)}`);
	}
	if (!result.allSameHeight) {
		fail(`${vp.name}px: card heights differ — ${JSON.stringify(result.sizes)}`);
	}
	if (result.overflow) {
		fail(`${vp.name}px: horizontal overflow (scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth})`);
	}
	if (vp.name === '390' && !result.toggleVisible) {
		fail(`${vp.name}px: site menu toggle not visible`);
	}
	if (!result.heroVisible || !result.cardVisible) {
		fail(`${vp.name}px: hero or first card not visible in viewport`);
	}
	if (result.scrollCueOverflow) {
		fail(`${vp.name}px: scroll-cue pill overflows its box`);
	}

	if (
		result.count >= 4 &&
		result.allSameWidth &&
		result.allSameHeight &&
		!result.overflow &&
		result.heroVisible &&
		result.cardVisible &&
		(vp.name !== '390' || result.toggleVisible) &&
		!result.scrollCueOverflow
	) {
		console.log(`PASS ${vp.name}px`);
	}
}

async function main() {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	for (const vp of VIEWPORTS) {
		await checkViewport(page, vp);
	}

	await browser.close();

	if (process.exitCode) {
		console.error('\nCard sizing / responsiveness checks failed.');
		process.exit(process.exitCode);
	}

	console.log('\nAll card sizing / responsiveness checks passed.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
