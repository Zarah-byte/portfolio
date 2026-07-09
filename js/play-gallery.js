(function () {
	'use strict';

	const MANIFEST_URL = `${window.sitePrefix ? window.sitePrefix() : ''}content/play/manifest.json`;
	const EXPAND_MS = 500;
	const COPY_DELAY_MS = 120;
	const SWAP_MS = 200;

	const gallery = document.getElementById('play-gallery');
	if (!gallery) return;

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let items = [];
	const cardById = new Map();
	let activeIndex = -1;
	let lastFocus = null;
	let activeCard = null;
	let isAnimating = false;
	let proxy = null;
	let openTimer = null;

	const modal = createModal();

	function shuffle(list) {
		const copy = [...list];
		for (let i = copy.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function createModal() {
		const root = document.createElement('div');
		root.className = 'play-modal';
		root.hidden = true;
		root.innerHTML = `
			<button type="button" class="play-modal__backdrop" aria-label="Close"></button>
			<button type="button" class="play-modal__nav play-modal__nav--prev" aria-label="Previous project">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M15 6l-6 6 6 6"/>
				</svg>
			</button>
			<button type="button" class="play-modal__nav play-modal__nav--next" aria-label="Next project">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M9 6l6 6-6 6"/>
				</svg>
			</button>
			<div class="play-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="play-modal-title" tabindex="-1">
				<button type="button" class="play-modal__close" aria-label="Close">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path d="M6 6l12 12M18 6 6 18"/>
					</svg>
				</button>
				<div class="play-modal__layout">
					<div class="play-modal__media"></div>
					<div class="play-modal__copy">
						<div class="play-modal__meta" hidden></div>
						<h2 class="play-modal__title" id="play-modal-title"></h2>
						<div class="play-modal__desc"></div>
						<a class="play-modal__link">
							<span class="play-modal__link-text"></span>
							<svg class="play-modal__link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<path d="M7 17 17 7"/>
								<path d="M8 7h9v9"/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		`;

		document.body.append(root);

		const prev = root.querySelector('.play-modal__nav--prev');
		const next = root.querySelector('.play-modal__nav--next');

		root.querySelector('.play-modal__backdrop').addEventListener('click', closeModal);
		root.querySelector('.play-modal__close').addEventListener('click', closeModal);
		prev.addEventListener('click', () => goPrev());
		next.addEventListener('click', () => goNext());
		document.addEventListener('keydown', onKeydown);

		return {
			root,
			prev,
			next,
			meta: root.querySelector('.play-modal__meta'),
			title: root.querySelector('.play-modal__title'),
			desc: root.querySelector('.play-modal__desc'),
			link: root.querySelector('.play-modal__link'),
			linkText: root.querySelector('.play-modal__link-text'),
			media: root.querySelector('.play-modal__media'),
			copy: root.querySelector('.play-modal__copy'),
			dialog: root.querySelector('.play-modal__dialog'),
		};
	}

	function onKeydown(event) {
		if (modal.root.hidden) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			closeModal();
			return;
		}
		if (items.length <= 1) return;
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goPrev();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			goNext();
		}
	}

	function getMediaRect(container) {
		return container.getBoundingClientRect();
	}

	function isRectInViewport(rect) {
		return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
	}

	function applyRect(el, rect) {
		el.style.top = `${rect.top}px`;
		el.style.left = `${rect.left}px`;
		el.style.width = `${rect.width}px`;
		el.style.height = `${rect.height}px`;
	}

	function getRadius(el) {
		return getComputedStyle(el).borderRadius;
	}

	function applyFrame(el, rect, radius) {
		applyRect(el, rect);
		if (radius) el.style.borderRadius = radius;
	}

	function removeProxy() {
		if (proxy) {
			proxy.remove();
			proxy = null;
		}
	}

	function clearOpenTimer() {
		if (openTimer) {
			clearTimeout(openTimer);
			openTimer = null;
		}
	}

	function createProxy(sourceEl) {
		const node = document.createElement('div');
		node.className = 'play-modal__proxy';
		node.setAttribute('aria-hidden', 'true');

		const media = sourceEl.classList?.contains('play-card__media')
			? sourceEl.querySelector('img, video, iframe') || sourceEl
			: sourceEl;
		const visual = media.cloneNode(true);
		if (visual.tagName === 'IMG') {
			visual.removeAttribute('loading');
		}
		node.append(visual);
		document.body.append(node);
		return node;
	}

	function animateRect(el, from, to, fromRadius, toRadius, duration) {
		return new Promise((resolve) => {
			let settled = false;

			const finish = () => {
				if (settled) return;
				settled = true;
				el.removeEventListener('transitionend', onTransitionEnd);
				resolve();
			};

			const onTransitionEnd = (event) => {
				if (event.target !== el) return;
				finish();
			};

			applyFrame(el, from, fromRadius);
			el.style.transition = 'none';
			el.offsetHeight;

			el.style.transition = [
				`top ${duration}ms var(--ease-base)`,
				`left ${duration}ms var(--ease-base)`,
				`width ${duration}ms var(--ease-base)`,
				`height ${duration}ms var(--ease-base)`,
				`border-radius ${duration}ms var(--ease-base)`,
			].join(', ');

			el.addEventListener('transitionend', onTransitionEnd);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => applyFrame(el, to, toRadius));
			});

			window.setTimeout(finish, duration + 80);
		});
	}

	function setCardActive(card, active) {
		if (!card) return;
		card.classList.toggle('is-active', active);
	}

	function resetModalState() {
		modal.root.classList.remove('is-opening', 'is-open', 'is-closing');
		modal.dialog.classList.remove('play-modal__dialog--preparing');
		modal.copy.classList.remove('is-revealed', 'is-swapping');
	}

	function updateNavVisibility() {
		const showNav = items.length > 1 && !modal.root.hidden;
		modal.prev.hidden = !showNav;
		modal.next.hidden = !showNav;
	}

	function isExternalLink(href) {
		return /^https?:\/\//i.test(href) || href.startsWith('//');
	}

	function setLinkAttributes(linkEl, href) {
		if (isExternalLink(href)) {
			linkEl.target = '_blank';
			linkEl.rel = 'noopener noreferrer';
		} else {
			linkEl.removeAttribute('target');
			linkEl.removeAttribute('rel');
		}
	}

	function createImage(src, alt, className) {
		const img = document.createElement('img');
		img.src = src;
		img.alt = alt || '';
		img.loading = 'lazy';
		img.decoding = 'async';
		img.className = className || 'play-card__img';
		return img;
	}

	function createFileVideo(src, { controls = false, className = '' } = {}) {
		const video = document.createElement('video');
		video.src = src;
		video.muted = true;
		video.playsInline = true;
		video.preload = 'metadata';
		if (className) video.className = className;
		if (controls) {
			video.controls = true;
			video.autoplay = true;
		} else {
			video.autoplay = true;
			video.loop = true;
		}
		return video;
	}

	function createEmbed(src, title, className, { allowAutoplay = true } = {}) {
		const iframe = document.createElement('iframe');
		iframe.src = src;
		iframe.className = className || 'play-card__embed';
		iframe.allow = allowAutoplay
			? 'autoplay; fullscreen; picture-in-picture'
			: 'fullscreen; picture-in-picture';
		iframe.referrerPolicy = 'strict-origin-when-cross-origin';
		iframe.loading = 'lazy';
		iframe.title = title || 'Play gallery video';
		return iframe;
	}

	function createMediaElement(item, { modal = false } = {}) {
		if (item.type === 'image') {
			return createImage(
				modal ? item.modalSrc || item.src : item.src,
				item.alt || item.title || '',
				modal ? 'play-modal__img' : 'play-card__img',
			);
		}

		if (item.type === 'video') {
			const src = modal ? item.modalSrc || item.src : item.src;
			if (item.kind === 'embed') {
				return createEmbed(
					src,
					item.title || item.id,
					modal ? 'play-modal__embed' : 'play-card__embed',
					{ allowAutoplay: !modal },
				);
			}
			return createFileVideo(src, {
				controls: modal,
				className: modal ? 'play-modal__video' : '',
			});
		}

		const placeholder = document.createElement('div');
		placeholder.className = 'play-card__placeholder';
		placeholder.setAttribute('aria-hidden', 'true');
		return placeholder;
	}

	function hasCopy(item) {
		return Boolean(item.title || item.description || item.link);
	}

	function populateModal(item) {
		const showCopy = hasCopy(item);
		modal.copy.hidden = !showCopy;
		modal.dialog.classList.toggle('play-modal__dialog--media-only', !showCopy);
		modal.meta.hidden = true;

		modal.title.textContent = item.title || item.id;
		modal.title.hidden = !item.title;

		modal.desc.textContent = item.description || '';
		modal.desc.hidden = !item.description;

		if (item.link) {
			modal.link.href = item.link;
			setLinkAttributes(modal.link, item.link);
			modal.linkText.textContent = item.linkLabel || 'See it live';
			modal.link.hidden = false;
		} else {
			modal.link.hidden = true;
		}

		modal.media.replaceChildren(createMediaElement(item, { modal: true }));
	}

	function getItemAt(index) {
		const len = items.length;
		if (len === 0) return null;
		return items[((index % len) + len) % len];
	}

	function syncActiveCard() {
		const item = getItemAt(activeIndex);
		activeCard = item ? cardById.get(item.id) || null : null;
	}

	function goToItem(index, { animate = true } = {}) {
		if (items.length === 0 || modal.root.hidden) return;
		if (isAnimating) return;

		const nextIndex = ((index % items.length) + items.length) % items.length;
		if (nextIndex === activeIndex && modal.root.classList.contains('is-open')) return;

		const item = items[nextIndex];
		activeIndex = nextIndex;
		syncActiveCard();

		if (!animate || prefersReducedMotion) {
			populateModal(item);
			modal.copy.classList.add('is-revealed');
			return;
		}

		modal.copy.classList.remove('is-revealed');
		modal.copy.classList.add('is-swapping');

		window.setTimeout(() => {
			populateModal(item);
			modal.copy.classList.remove('is-swapping');
			modal.copy.classList.add('is-revealed');
		}, SWAP_MS);
	}

	function goPrev() {
		if (items.length <= 1) return;
		goToItem(activeIndex - 1);
	}

	function goNext() {
		if (items.length <= 1) return;
		goToItem(activeIndex + 1);
	}

	function revealModal() {
		removeProxy();
		modal.dialog.classList.remove('play-modal__dialog--preparing');
		modal.root.classList.remove('is-opening');
		modal.root.classList.add('is-open');
		updateNavVisibility();
		modal.dialog.focus();

		clearOpenTimer();
		openTimer = window.setTimeout(() => {
			modal.copy.classList.add('is-revealed');
			openTimer = null;
		}, COPY_DELAY_MS);
	}

	function openModalInstant(item, card) {
		activeIndex = items.indexOf(item);
		activeCard = card;
		lastFocus = document.activeElement;
		populateModal(item);
		modal.root.hidden = false;
		document.body.classList.add('play-modal-open');
		modal.root.classList.add('is-open');
		updateNavVisibility();
		modal.copy.classList.add('is-revealed');
		modal.dialog.focus();
	}

	async function openModalAnimated(item, card) {
		activeIndex = items.indexOf(item);
		activeCard = card;
		lastFocus = document.activeElement;
		isAnimating = true;

		const sourceMedia = card.querySelector('.play-card__media');
		const fromRect = getMediaRect(sourceMedia);

		modal.root.hidden = false;
		document.body.classList.add('play-modal-open');
		resetModalState();
		modal.root.classList.add('is-opening');
		modal.dialog.classList.add('play-modal__dialog--preparing');

		populateModal(item);
		const targetVisual = modal.media.querySelector('img, video, iframe') || modal.media;
		const toRect = getMediaRect(modal.media);
		const fromRadius = getRadius(sourceMedia);
		const toRadius = getRadius(targetVisual);

		setCardActive(card, true);
		proxy = createProxy(sourceMedia);
		applyFrame(proxy, fromRect, fromRadius);

		modal.root.classList.add('is-open');
		updateNavVisibility();

		await animateRect(proxy, fromRect, toRect, fromRadius, toRadius, EXPAND_MS);

		isAnimating = false;
		setCardActive(card, false);
		revealModal();
	}

	function openModal(item, card) {
		if (isAnimating) return;

		if (prefersReducedMotion) {
			openModalInstant(item, card);
			return;
		}

		openModalAnimated(item, card).catch((error) => {
			console.error(error);
			isAnimating = false;
			removeProxy();
			setCardActive(activeCard, false);
			revealModal();
		});
	}

	function finalizeClose() {
		clearOpenTimer();
		removeProxy();
		resetModalState();
		setCardActive(activeCard, false);

		modal.root.hidden = true;
		document.body.classList.remove('play-modal-open');
		modal.media.replaceChildren();
		activeCard = null;
		activeIndex = -1;
		isAnimating = false;
		updateNavVisibility();

		if (lastFocus && typeof lastFocus.focus === 'function') {
			lastFocus.focus();
		}
	}

	function closeModalInstant() {
		finalizeClose();
	}

	async function closeModalAnimated() {
		if (isAnimating) {
			clearOpenTimer();
			removeProxy();
			isAnimating = false;
		}

		const card = activeCard;
		const cardMedia = card?.querySelector('.play-card__media');
		const canReverse = cardMedia && isRectInViewport(getMediaRect(cardMedia));

		modal.copy.classList.remove('is-revealed', 'is-swapping');
		modal.dialog.classList.add('play-modal__dialog--preparing');
		modal.root.classList.add('is-closing');

		if (!canReverse) {
			isAnimating = true;
			await new Promise((resolve) => window.setTimeout(resolve, EXPAND_MS));
			isAnimating = false;
			finalizeClose();
			return;
		}

		isAnimating = true;

		const fromRect = getMediaRect(modal.media);
		const toRect = getMediaRect(cardMedia);
		const sourceVisual = modal.media.querySelector('img, video, iframe') || cardMedia;
		const fromRadius = getRadius(sourceVisual);
		const toRadius = getRadius(cardMedia);

		setCardActive(card, true);
		proxy = createProxy(sourceVisual);
		applyFrame(proxy, fromRect, fromRadius);

		await animateRect(proxy, fromRect, toRect, fromRadius, toRadius, EXPAND_MS);

		isAnimating = false;
		finalizeClose();
	}

	function closeModal() {
		if (modal.root.hidden) return;

		if (prefersReducedMotion) {
			closeModalInstant();
			return;
		}

		closeModalAnimated().catch((error) => {
			console.error(error);
			finalizeClose();
		});
	}

	function buildGallery(manifestItems) {
		items = shuffle(manifestItems);
		cardById.clear();
		const fragment = document.createDocumentFragment();

		items.forEach((item) => {
			const card = document.createElement('button');
			card.type = 'button';
			card.className = 'play-card';
			if (item.type === 'video') card.classList.add('play-card--video');
			card.setAttribute('aria-label', item.title || item.id);
			card.dataset.playId = item.id;

			const mediaWrap = document.createElement('div');
			mediaWrap.className = 'play-card__media';
			mediaWrap.append(createMediaElement(item));

			card.append(mediaWrap);
			card.addEventListener('click', () => openModal(item, card));
			cardById.set(item.id, card);
			fragment.append(card);
		});

		gallery.replaceChildren(fragment);
		updateNavVisibility();
	}

	fetch(MANIFEST_URL)
		.then((response) => {
			if (!response.ok) throw new Error(`Failed to load ${MANIFEST_URL}`);
			return response.json();
		})
		.then((data) => buildGallery(data.items || []))
		.catch((error) => {
			console.error(error);
			gallery.replaceChildren();
		});
})();
