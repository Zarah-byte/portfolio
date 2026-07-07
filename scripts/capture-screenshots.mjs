#!/usr/bin/env node
/**
 * Capture responsive screenshots at phone / tablet / desktop widths.
 * Usage: node scripts/capture-screenshots.mjs <before|after> [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const phase = process.argv[2] || 'before';
const baseUrl = process.argv[3] || 'http://localhost:9321';

const VIEWPORTS = [
	{ name: '390', width: 390, height: 844 },
	{ name: '768', width: 768, height: 1024 },
	{ name: '1440', width: 1440, height: 900 },
];

const PAGES = [
	{ slug: 'home', path: '/index.html' },
	{ slug: 'about', path: '/about.html' },
	{ slug: 'play', path: '/play.html' },
	{ slug: 'iris', path: '/projects/iris.html' },
];

const outDir = path.join(ROOT, 'screenshots', phase);

async function capture(page, filePath) {
	await page.screenshot({ path: filePath, fullPage: true });
}

async function main() {
	await mkdir(outDir, { recursive: true });

	const browser = await chromium.launch();
	const context = await browser.newContext();

	for (const vp of VIEWPORTS) {
		const page = await context.newPage();
		await page.setViewportSize({ width: vp.width, height: vp.height });

		for (const pg of PAGES) {
			const url = `${baseUrl}${pg.path}`;
			await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
			await page.waitForTimeout(1500);
			await page.waitForTimeout(500);

			const file = path.join(outDir, `${pg.slug}-${vp.name}.png`);
			await capture(page, file);
			console.log(`Saved ${file}`);

			// Menu open on phone only
			if (vp.name === '390') {
				const toggle = page.locator('.site-menu__toggle');
				if (await toggle.count()) {
					await toggle.click();
					await page.waitForTimeout(600);
					const menuFile = path.join(outDir, `${pg.slug}-${vp.name}-menu-open.png`);
					await capture(page, menuFile);
					console.log(`Saved ${menuFile}`);
					await toggle.click();
					await page.waitForTimeout(300);
				}
			}
		}

		// Play modal on phone + tablet
		if (vp.name === '390' || vp.name === '768') {
			await page.goto(`${baseUrl}/play.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
			await page.waitForTimeout(1500);
			const card = page.locator('.play-card').first();
			if (await card.count()) {
				await card.click();
				await page.waitForTimeout(800);
				const modalFile = path.join(outDir, `play-modal-${vp.name}.png`);
				await capture(page, modalFile);
				console.log(`Saved ${modalFile}`);
			}
		}

		await page.close();
	}

	await browser.close();
	console.log(`Done — ${phase} screenshots in ${outDir}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
