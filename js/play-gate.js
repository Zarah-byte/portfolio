// Client-side gate for the archive page. This obscures the archive from casual
// visitors; it is NOT real security — the gallery content is still fetchable by
// anyone who reads the page source or network traffic. A static host has no
// server to enforce a real password.
//
// To set your own password, replace ARCHIVE_HASH with the SHA-256 of it:
//   printf '%s' 'your-password' | shasum -a 256
// (current value is the hash of "changeme")

const ARCHIVE_HASH = '057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86';

async function sha256(text) {
	const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const form = document.getElementById('archive-gate-form');
const input = document.getElementById('archive-gate-input');
const error = document.getElementById('archive-gate-error');

form?.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (await sha256(input.value) === ARCHIVE_HASH) {
		localStorage.setItem('archive-unlocked', '1');
		document.documentElement.classList.remove('archive-locked');
	} else {
		error.hidden = false;
		input.value = '';
		input.focus();
	}
});
