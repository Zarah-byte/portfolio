/* =========================================================================
   Zarah Yaqub — portfolio app
   Plain ES module, no dependencies. Fetches site.json + manifest.json, loads
   Markdown case studies, and renders the shell + pages via a hash router.
   Add a project: drop content/work/<slug>.md and add the slug to manifest.json.
   ========================================================================= */

/* ---- SVG assets -------------------------------------------------------- */
const LOGO_SVG = `<svg viewBox="0 0 61 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M29.2342 0.17778C29.2478 -0.0162463 29.5138 -0.0681227 29.6019 0.106058L30.7299 2.33605C30.7825 2.44009 30.9168 2.47415 31.0141 2.40814L33.1006 0.993335C33.2635 0.882826 33.4706 1.05467 33.3869 1.23092L32.3149 3.48737C32.2648 3.59264 32.3215 3.717 32.4347 3.75058L34.8619 4.47041C35.0515 4.52664 35.0438 4.7928 34.8513 4.83839L32.3865 5.42215C32.2715 5.44939 32.2078 5.5704 32.2517 5.67828L33.1919 7.99071C33.2654 8.17133 33.0487 8.33138 32.8924 8.21199L30.8908 6.68347C30.7975 6.61216 30.6614 6.6387 30.6029 6.73965L29.3481 8.90336C29.2501 9.07237 28.9876 9.00579 28.9852 8.81132L28.9541 6.32153C28.9527 6.20537 28.8467 6.11745 28.7299 6.13545L26.225 6.52113C26.0293 6.55126 25.9187 6.30818 26.072 6.18507L28.0348 4.60887C28.1264 4.53534 28.1303 4.39917 28.0431 4.32066L26.1743 2.63788C26.0283 2.50644 26.1528 2.26991 26.3464 2.31086L28.8251 2.83517C28.9407 2.85963 29.0516 2.77774 29.0597 2.66185L29.2342 0.17778Z"/><path d="M56.7096 9C56.3616 9 56.2656 8.904 56.2656 8.556V0.444C56.2656 0.0960002 56.3616 0 56.7096 0H58.4136C60.1536 0 60.9456 0.648 60.9456 2.1V2.796C60.9456 3.42 60.7416 3.864 60.3216 4.248C60.2856 4.284 60.2736 4.296 60.2736 4.32C60.2736 4.344 60.2856 4.356 60.3216 4.392C60.7776 4.764 61.0056 5.16 61.0056 5.796V6.96C61.0056 8.352 60.1776 9 58.3536 9H56.7096ZM57.9216 1.896V3.276C57.9216 3.444 57.9696 3.492 58.1376 3.492H58.3896C58.9776 3.492 59.2416 3.288 59.2416 2.76V2.412C59.2416 1.884 58.9776 1.68 58.3896 1.68H58.1376C57.9696 1.68 57.9216 1.728 57.9216 1.896ZM58.4496 7.32C59.0376 7.32 59.3016 7.116 59.3016 6.588V5.904C59.3016 5.376 59.0376 5.172 58.4496 5.172H58.1376C57.9696 5.172 57.9216 5.22 57.9216 5.388V7.104C57.9216 7.272 57.9696 7.32 58.1376 7.32H58.4496Z"/><path d="M53.5801 0.444C53.5801 0.0960002 53.6761 0 54.0241 0H54.7921C55.1401 0 55.2361 0.0960002 55.2361 0.444V6.48C55.2361 8.412 54.6601 9.12 52.9201 9.12C51.1801 9.12 50.6041 8.412 50.6041 6.48V0.444C50.6041 0.0960002 50.7001 0 51.0481 0H51.8161C52.1641 0 52.2601 0.0960002 52.2601 0.444V6.768C52.2601 7.248 52.4641 7.44 52.9201 7.44C53.3641 7.44 53.5801 7.248 53.5801 6.768V0.444Z"/><path d="M47.7823 10.5H47.0863C46.7383 10.5 46.6423 10.404 46.6423 10.056V9.312C46.6423 9.192 46.6183 9.156 46.4623 9.108C45.4663 8.82 45.1183 8.052 45.1183 6.48V2.76C45.1183 0.744 45.6943 0 47.4343 0C49.1743 0 49.7503 0.744 49.7503 2.76V6.48C49.7503 8.052 49.4023 8.82 48.4063 9.108C48.2503 9.156 48.2263 9.192 48.2263 9.312V10.056C48.2263 10.404 48.1303 10.5 47.7823 10.5ZM48.0463 2.352C48.0463 1.872 47.8543 1.68 47.4343 1.68C47.0143 1.68 46.8223 1.872 46.8223 2.352V6.888C46.8223 7.368 47.0143 7.56 47.4343 7.56C47.8543 7.56 48.0463 7.368 48.0463 6.888V2.352Z"/><path d="M41.4392 8.556C41.4392 8.904 41.3432 9 40.9952 9H40.2272C39.8792 9 39.7832 8.904 39.7832 8.556V5.484C39.7832 4.956 39.8072 4.74 39.9512 4.26L41.0432 0.6C41.1872 0.0960002 41.3072 0 41.9312 0H42.3632C42.9872 0 43.1072 0.0960002 43.2512 0.6L44.3432 4.26C44.4872 4.728 44.5112 4.956 44.5112 5.484V8.556C44.5112 8.904 44.4152 9 44.0672 9H43.2992C42.9512 9 42.8552 8.904 42.8552 8.556V6.972C42.8552 6.804 42.8072 6.756 42.6392 6.756H41.6552C41.4872 6.756 41.4392 6.804 41.4392 6.972V8.556ZM42.6752 5.076C42.8072 5.076 42.8792 5.028 42.8792 4.92C42.8792 4.86 42.8672 4.8 42.8552 4.74L42.3032 2.424C42.2792 2.304 42.2552 2.28 42.1472 2.28C42.0392 2.28 42.0152 2.304 41.9912 2.424L41.4392 4.74C41.4272 4.8 41.4152 4.86 41.4152 4.92C41.4152 5.028 41.4872 5.076 41.6192 5.076H42.6752Z"/><path d="M37.724 9H36.98C36.632 9 36.536 8.904 36.536 8.556V6.372C36.536 6.204 36.524 6.12 36.464 5.976L35.312 3.252C35.036 2.616 35 2.304 35 1.392V0.444C35 0.0960002 35.096 0 35.444 0H36.26C36.608 0 36.704 0.0960002 36.704 0.444V1.68C36.704 1.956 36.716 2.112 36.8 2.4L37.208 3.876C37.244 3.996 37.268 4.02 37.352 4.02C37.436 4.02 37.46 3.996 37.496 3.876L37.904 2.4C37.988 2.112 38 1.956 38 1.68V0.444C38 0.0960002 38.096 0 38.444 0H39.26C39.608 0 39.704 0.0960002 39.704 0.444V1.392C39.704 2.304 39.668 2.616 39.392 3.252L38.24 5.976C38.18 6.12 38.168 6.204 38.168 6.372V8.556C38.168 8.904 38.072 9 37.724 9Z"/><path d="M23.5743 8.556V5.316C23.5743 5.148 23.5263 5.1 23.3583 5.1H22.3743C22.2063 5.1 22.1583 5.148 22.1583 5.316V8.556C22.1583 8.904 22.0623 9 21.7143 9H20.9463C20.5983 9 20.5023 8.904 20.5023 8.556V0.444C20.5023 0.0960002 20.5983 0 20.9463 0H21.7143C22.0623 0 22.1583 0.0960002 22.1583 0.444V3.204C22.1583 3.36 22.2063 3.42 22.3743 3.42H23.3583C23.5263 3.42 23.5743 3.36 23.5743 3.204V0.444C23.5743 0.0960002 23.6703 0 24.0183 0H24.7863C25.1343 0 25.2303 0.0960002 25.2303 0.444V8.556C25.2303 8.904 25.1343 9 24.7863 9H24.0183C23.6703 9 23.5743 8.904 23.5743 8.556Z"/><path d="M16.7032 8.556C16.7032 8.904 16.6072 9 16.2592 9H15.4912C15.1432 9 15.0472 8.904 15.0472 8.556V5.484C15.0472 4.956 15.0712 4.74 15.2152 4.26L16.3072 0.6C16.4512 0.0960002 16.5712 0 17.1952 0H17.6272C18.2512 0 18.3712 0.0960002 18.5152 0.6L19.6072 4.26C19.7512 4.728 19.7752 4.956 19.7752 5.484V8.556C19.7752 8.904 19.6792 9 19.3312 9H18.5632C18.2152 9 18.1192 8.904 18.1192 8.556V6.972C18.1192 6.804 18.0712 6.756 17.9032 6.756H16.9192C16.7512 6.756 16.7032 6.804 16.7032 6.972V8.556ZM17.9392 5.076C18.0712 5.076 18.1432 5.028 18.1432 4.92C18.1432 4.86 18.1312 4.8 18.1192 4.74L17.5672 2.424C17.5432 2.304 17.5192 2.28 17.4112 2.28C17.3032 2.28 17.2792 2.304 17.2552 2.424L16.7032 4.74C16.6912 4.8 16.6792 4.86 16.6792 4.92C16.6792 5.028 16.7512 5.076 16.8832 5.076H17.9392Z"/><path d="M12.8031 8.556V7.152C12.8031 6.732 12.7791 6.6 12.5991 6.276L12.3111 5.76C12.1791 5.544 12.1071 5.508 11.8911 5.508H11.6751C11.5071 5.508 11.4591 5.556 11.4591 5.724V8.556C11.4591 8.904 11.3631 9 11.0151 9H10.2471C9.8991 9 9.8031 8.904 9.8031 8.556V0.444C9.8031 0.0960002 9.8991 0 10.2471 0H11.8311C13.6551 0 14.4831 0.624001 14.4831 2.16V3.024C14.4831 3.888 14.3511 4.452 13.8591 4.848C13.7991 4.884 13.7871 4.92 13.7871 4.956C13.7871 4.992 13.7991 5.028 13.8351 5.088L14.1711 5.7C14.4231 6.168 14.4591 6.36 14.4591 6.996V8.556C14.4591 8.904 14.3631 9 14.0151 9H13.2471C12.8991 9 12.8031 8.904 12.8031 8.556ZM11.4591 1.836V3.648C11.4591 3.816 11.5071 3.864 11.6751 3.864H11.9271C12.4911 3.864 12.7791 3.612 12.7791 3.036V2.412C12.7791 1.848 12.5151 1.62 11.9271 1.62H11.6751C11.5071 1.62 11.4591 1.668 11.4591 1.836Z"/><path d="M6.00402 8.556C6.00402 8.904 5.90802 9 5.56002 9H4.79202C4.44402 9 4.34802 8.904 4.34802 8.556V5.484C4.34802 4.956 4.37202 4.74 4.51602 4.26L5.60802 0.6C5.75202 0.0960002 5.87202 0 6.49602 0H6.92802C7.55202 0 7.67202 0.0960002 7.81602 0.6L8.90802 4.26C9.05202 4.728 9.07602 4.956 9.07602 5.484V8.556C9.07602 8.904 8.98002 9 8.63202 9H7.86402C7.51602 9 7.42002 8.904 7.42002 8.556V6.972C7.42002 6.804 7.37202 6.756 7.20402 6.756H6.22002C6.05202 6.756 6.00402 6.804 6.00402 6.972V8.556ZM7.24002 5.076C7.37202 5.076 7.44402 5.028 7.44402 4.92C7.44402 4.86 7.43202 4.8 7.42002 4.74L6.86802 2.424C6.84402 2.304 6.82002 2.28 6.71202 2.28C6.60402 2.28 6.58002 2.304 6.55602 2.424L6.00402 4.74C5.99202 4.8 5.98002 4.86 5.98002 4.92C5.98002 5.028 6.05202 5.076 6.18402 5.076H7.24002Z"/><path d="M0.54 5.208L2.004 3.084C2.232 2.748 2.292 2.604 2.292 2.1V1.836C2.292 1.668 2.244 1.62 2.076 1.62H0.444C0.096 1.62 0 1.524 0 1.176V0.444C0 0.0960002 0.096 0 0.444 0H3.504C3.852 0 3.948 0.0960002 3.948 0.444V2.136C3.948 3 3.852 3.216 3.42 3.84L2.016 5.868C1.728 6.276 1.656 6.42 1.656 6.888V7.164C1.656 7.332 1.704 7.38 1.872 7.38H3.504C3.852 7.38 3.948 7.476 3.948 7.824V8.556C3.948 8.904 3.852 9 3.504 9H0.444C0.096 9 0 8.904 0 8.556V6.96C0 6.048 0.096 5.856 0.54 5.208Z"/></svg>`;

const ICONS = {
  mail: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H9V9Z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* ---- Tiny helpers ------------------------------------------------------ */
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inline = (s = "") =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}
const fetchJSON = (url) => fetchText(url).then(JSON.parse);

/* Parse `--- frontmatter ---` + Markdown body. */
function parseDoc(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (!key || key.startsWith("#")) continue;
    if (val.startsWith("[")) {
      try { val = JSON.parse(val); } catch { /* keep string */ }
    } else if (/^-?\d+(\.\d+)?$/.test(val)) {
      val = Number(val);
    } else if (val === "true" || val === "false") {
      val = val === "true";
    } else {
      val = val.replace(/^["']|["']$/g, "");
    }
    data[key] = val;
  }
  return { data, body: m[2].trim() };
}

/* Render the Markdown subset used by case studies: ## headings, paragraphs,
   - lists, > quotes, **bold**, *italic*. */
function renderMarkdown(body) {
  if (!body) return "";
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((block) => {
      const b = block.trim();
      if (!b) return "";
      if (b.startsWith("## ")) return `<h2>${inline(b.slice(3))}</h2>`;
      if (b.startsWith("# ")) return `<h2>${inline(b.slice(2))}</h2>`;
      if (b.startsWith("> ")) return `<blockquote><p>${inline(b.slice(2))}</p></blockquote>`;
      if (/^[-*] /.test(b)) {
        const items = b.split(/\r?\n/).map((l) => `<li>${inline(l.replace(/^[-*] /, ""))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(b.replace(/\r?\n/g, " "))}</p>`;
    })
    .join("");
}

/* ---- Data layer -------------------------------------------------------- */
let SITE = null;
let MANIFEST = null;
const workCache = new Map(); // slug -> { data, body }

let WORK_INDEX = null; // sorted work entries, loaded once
async function getWork() {
  if (!WORK_INDEX) WORK_INDEX = await loadCollection("work");
  return WORK_INDEX;
}

async function loadCollection(kind) {
  const slugs = MANIFEST[kind] || [];
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      if (kind === "work" && workCache.has(slug)) return workCache.get(slug);
      const doc = parseDoc(await fetchText(`content/${kind}/${slug}.md`));
      const entry = { slug, ...doc };
      if (kind === "work") workCache.set(slug, entry);
      return entry;
    })
  );
  return entries
    .filter((e) => !e.data.draft)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

/* ---- Shared fragments -------------------------------------------------- */
const socialsHTML = (extraClass = "") =>
  `<div class="socials ${extraClass}">` +
  SITE.socials
    .map((s) => {
      const ext = s.href.startsWith("http");
      return `<a class="social" href="${esc(s.href)}" aria-label="${esc(s.label)}"${
        ext ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${ICONS[s.icon] || ""}</a>`;
    })
    .join("") +
  `</div>`;

function sidebarHTML(section, work = []) {
  const logo =
    section === "home"
      ? `<span class="logo" aria-label="${esc(SITE.name)}">${LOGO_SVG}</span>`
      : `<a class="logo" href="#/" aria-label="${esc(SITE.name)} — home">${LOGO_SVG}</a>`;
  const nav = SITE.nav
    .map(
      (n) =>
        `<a href="#/${n.route}"${section === n.route ? ' class="is-active"' : ""}>${esc(n.label)}</a>`
    )
    .join("");
  const selectedWork = work.length
    ? `<div class="side-block">
        <p class="side-head mono">Selected work</p>
        <ul class="side-list">
          ${work
            .map(
              (e) =>
                `<li><a href="#/work/${e.slug}"><span class="side-yr mono">${esc(
                  e.data.year
                )}</span> ${esc(e.data.eyebrow)}</a></li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";
  return `
    <aside class="sidebar">
      ${logo}
      <p class="sidebar-bio"><strong>${esc(SITE.role)}</strong> ${esc(
        SITE.bioLead.replace(new RegExp("^" + SITE.role + "\\s*", "i"), "")
      )}</p>
      <nav class="sidebar-nav" aria-label="Primary">${nav}</nav>
      ${selectedWork}
      <p class="side-memo mono">↳ More work available on request — <a href="mailto:${esc(
        SITE.email
      )}">say hello</a>.</p>
      <div class="sidebar-foot">
        ${socialsHTML()}
        <p class="sidebar-meta mono">
          <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a><br />
          ${esc(SITE.location)} · from ${esc(SITE.from)}
        </p>
      </div>
    </aside>`;
}

/* Top utility bar with an availability status + live world clocks for
   Zarah's two home cities. */
const CLOCKS = [
  ["NYC", "America/New_York"],
  ["KHI", "Asia/Karachi"],
];
function utilBarHTML() {
  const clocks = CLOCKS.map(
    ([code, tz]) =>
      `<span class="clock"><b>${code}</b><time data-tz="${tz}">--:--:--</time></span>`
  ).join("");
  return `<div class="util-bar">
      <span class="util-status mono"><span class="dot"></span> Open for new work</span>
      <span class="util-clocks mono">${clocks}</span>
    </div>`;
}
let clockTimer = null;
function startClocks() {
  if (clockTimer) clearInterval(clockTimer);
  const els = [...document.querySelectorAll("time[data-tz]")];
  if (!els.length) return;
  const tick = () => {
    const now = new Date();
    els.forEach((el) => {
      el.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: el.dataset.tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
    });
  };
  tick();
  clockTimer = setInterval(tick, 1000);
}

const footerHTML = () => `
  <footer class="site-footer">
    <p class="footer-cta display">Let's build something<span class="spark">✳</span></p>
    <a class="footer-cta--link" href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>
    <div class="footer-meta">
      <span class="mono">© ${new Date().getFullYear()} ${esc(SITE.name)} — ${esc(SITE.alias)}</span>
      <span class="mono">${esc(SITE.location)} · from ${esc(SITE.from)}</span>
    </div>
  </footer>`;

const marqueeHTML = () => {
  const items = SITE.marquee
    .map((w) => `<span class="marquee__item">${esc(w)}<span class="spark">✳</span></span>`)
    .join("");
  const track = `<div class="marquee__track">${items}</div>`;
  return `<div class="bleed"><div class="marquee" aria-hidden="true">${track}${track}</div></div>`;
};

const num = (i) => String(i).padStart(2, "0");

/* ---- Views ------------------------------------------------------------- */
function viewHome(work) {
  const items = work
    .map(
      (e, i) => `
      <article class="stream-item" data-reveal>
        <p class="stream-cap">
          <span class="stream-name">${esc(e.data.eyebrow)}</span> — ${esc(e.data.caption)}
          <a class="stream-link" href="#/work/${e.slug}">Full case study ${ICONS.arrow}</a>
        </p>
        <a class="work-media is-stream" href="#/work/${e.slug}" aria-label="${esc(e.data.eyebrow)}">
          <span class="work-num display">${num(i + 1)}</span>
          <ul class="tags work-tags">
            <li class="tag tag--year">${esc(e.data.year)}</li>
            ${(e.data.tags || []).map((t) => `<li class="tag">${esc(t)}</li>`).join("")}
          </ul>
          <span class="work-arrow">${ICONS.arrow}</span>
        </a>
      </article>`
    )
    .join("");
  return `
    <section class="works">
      <div class="works-head">
        <h2 class="mono">Workstream</h2>
        <span class="mono">${num(work.length)} projects · most recent first</span>
      </div>
      <p class="stream-intro">Selected product and brand work — the latest first. Each entry opens a full case study.</p>
      <div class="stream">${items}</div>
    </section>`;
}

function viewWorkIndex(work) {
  const rows = work
    .map(
      (e, i) => `
      <a class="index-row" href="#/work/${e.slug}" data-reveal>
        <span class="index-num mono">${num(i + 1)}</span>
        <span class="index-name display">${esc(e.data.eyebrow)}</span>
        <span class="index-disc mono">${esc(e.data.discipline)}</span>
        <span class="index-year mono">${esc(e.data.year)}</span>
        <span class="index-arrow">${ICONS.arrow}</span>
      </a>`
    )
    .join("");
  return `
    <section class="page-head">
      <p class="mono kicker">Index</p>
      <h1 class="page-title display">Work</h1>
      <p class="lead page-intro">Selected product and brand work — from thesis explorations to shipped products. Each project is a full case study.</p>
    </section>
    <section>
      <div class="index-list">${rows}</div>
      <p class="index-note mono">More work available on request — <a href="mailto:${esc(SITE.email)}">say hello</a>.</p>
    </section>`;
}

function viewCase(slug, work) {
  const idx = work.findIndex((e) => e.slug === slug);
  if (idx === -1) return viewNotFound();
  const e = work[idx];
  const next = work[(idx + 1) % work.length];
  const d = e.data;
  const facts = [
    ["Role", d.role],
    ["Timeline", d.timeline],
    ["Team", d.team],
    ["Year", d.year],
  ]
    .map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join("");
  const quote = d.quote
    ? `<blockquote class="case-quote display"><p>“${esc(d.quote)}”</p>${
        d.quoteBy ? `<cite class="mono">— ${esc(d.quoteBy)}</cite>` : ""
      }</blockquote>`
    : "";
  return `
    <article class="case">
      <header class="case-hero">
        <p class="case-eyebrow mono"><span class="spark">✳</span> ${esc(d.eyebrow)} · ${esc(d.year)}</p>
        <h1 class="case-title display">${esc(d.title)}</h1>
        <p class="lead case-lead" data-reveal>${esc(d.lead)}</p>
      </header>
      <div class="case-media bleed" data-reveal></div>
      <div class="case-body">
        <dl class="case-facts" data-reveal>${facts}</dl>
        <div class="case-prose" data-reveal>${renderMarkdown(e.body)}</div>
        ${quote}
      </div>
      <a class="case-next" href="#/work/${next.slug}" data-reveal>
        <span class="mono">Next project</span>
        <span class="case-next-name display">${esc(next.data.eyebrow)}</span>
        <span class="case-next-arrow">${ICONS.arrow}</span>
      </a>
    </article>`;
}

async function viewPlay() {
  const play = await loadCollection("play");
  const cards = play
    .map(
      (e) => `
      <article class="play-card" data-reveal>
        <div class="play-media"></div>
        <div class="play-meta">
          <h2 class="play-title display">${esc(e.data.title)}</h2>
          <p class="play-note">${esc(e.data.note)}</p>
          <p class="play-tags mono"><span class="play-tag">${esc(e.data.tag)}</span> · ${esc(e.data.year)}</p>
        </div>
      </article>`
    )
    .join("");
  return `
    <section class="page-head">
      <p class="mono kicker">Off the clock</p>
      <h1 class="page-title display">Play</h1>
      <p class="lead page-intro">Experiments, side quests, and things made for the joy of making — type, motion, tools, and the occasional half-finished idea.</p>
    </section>
    <section>
      <div class="play-grid">${cards}</div>
      <p class="play-foot mono">Follow along — new experiments land here first.</p>
    </section>`;
}

function viewAbout() {
  const howIWork = [
    ["Start with the problem.", "I dig into the real job to be done before opening a canvas."],
    ["Design the system, not the screen.", "Brand, type, color, and components as one coherent kit."],
    ["Build to learn.", "I prototype in code so decisions are grounded in something real."],
    ["Make it legible.", "The best interface answers its main question at a glance."],
  ];
  const services = [
    "Brand identity & visual systems",
    "Product & interface design",
    "Design systems & component libraries",
    "Prototyping & front-end handoff",
  ];
  const experience = [
    ["MPS, Communication Design", "Parsons School of Design", "2023 – 2025"],
    ["Brand & Product Designer", "Freelance / Zarah by Design", "2021 – now"],
  ];
  return `
    <section class="page-head">
      <p class="mono kicker">About</p>
      <h1 class="about-head display">Designer, maker, and perpetual student of good systems.</h1>
    </section>
    <section class="about-intro" data-reveal>
      <div class="about-lead"><p class="lead">I'm Zarah — a Brand &amp; Product Designer who likes the messy middle: the space between a rough idea and a working thing. I care about clarity, craft, and designs that hold up long after the pitch is over.</p></div>
      <div class="about-bg"><p>Raised in Karachi and now based in New York, I recently completed the MPS in Communication Design at Parsons School of Design. Moving between two very different design cultures taught me to strip an idea to what actually matters — and to sweat the details that make it feel human.</p></div>
    </section>
    <section class="about-cols">
      <div class="about-col" data-reveal>
        <h2 class="mono col-head">How I work</h2>
        <ul class="how-list">${howIWork.map(([t, d]) => `<li><span class="how-t">${esc(t)}</span><span class="how-d">${esc(d)}</span></li>`).join("")}</ul>
      </div>
      <div class="about-col" data-reveal>
        <h2 class="mono col-head">What I do</h2>
        <ul class="svc-list">${services.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>
    </section>
    <section class="about-exp" data-reveal>
      <h2 class="mono col-head">Experience</h2>
      <ul class="exp-list">${experience.map(([r, w, wh]) => `<li class="exp-row"><span class="exp-role display">${esc(r)}</span><span class="exp-where">${esc(w)}</span><span class="exp-when mono">${esc(wh)}</span></li>`).join("")}</ul>
    </section>`;
}

const viewNotFound = () =>
  `<section class="page-head"><p class="mono kicker">404</p><h1 class="page-title display">Not found</h1><p class="lead page-intro">That page doesn't exist. <a href="#/" style="text-decoration:underline">Head home</a>.</p></section>`;

/* ---- Router ------------------------------------------------------------ */
const shell = document.getElementById("shell");
let revealObserver = null;

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);
  return { section: parts[0] || "home", slug: parts[1] || null };
}

function setupReveal() {
  if (revealObserver) revealObserver.disconnect();
  const items = shell.querySelectorAll("[data-reveal]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );
  items.forEach((el) => revealObserver.observe(el));
}

async function render() {
  const { section, slug } = parseRoute();
  const sectionForNav = ["work", "play", "about"].includes(section) ? section : "home";

  // Paint the shell + a loading state immediately for perceived speed.
  shell.innerHTML =
    sidebarHTML(sectionForNav) +
    `<div class="content">${utilBarHTML()}<main><p class="view-status">Loading…</p></main></div>`;
  startClocks();

  let work = [];
  try {
    work = await getWork();
  } catch (err) {
    console.error(err);
  }

  let html;
  try {
    if (section === "home") html = viewHome(work);
    else if (section === "work" && slug) html = viewCase(slug, work);
    else if (section === "work") html = viewWorkIndex(work);
    else if (section === "play") html = await viewPlay();
    else if (section === "about") html = viewAbout();
    else html = viewNotFound();
  } catch (err) {
    console.error(err);
    html = `<section class="page-head"><p class="mono kicker">Error</p><h1 class="page-title display">Couldn't load</h1><p class="lead page-intro">${esc(
      err.message
    )}</p></section>`;
  }

  // Repaint with data-aware sidebar (selected-work list) + the view.
  shell.innerHTML =
    sidebarHTML(sectionForNav, work) +
    `<div class="content">${utilBarHTML()}<main>${html}</main>${footerHTML()}</div>`;
  document.title =
    section === "home"
      ? `${SITE.name} · ${SITE.role}`
      : `${section[0].toUpperCase() + section.slice(1)} — ${SITE.name}`;
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  startClocks();
  setupReveal();
}

/* ---- Boot -------------------------------------------------------------- */
async function boot() {
  try {
    [SITE, MANIFEST] = await Promise.all([
      fetchJSON("content/site.json"),
      fetchJSON("content/manifest.json"),
    ]);
  } catch (err) {
    shell.innerHTML = `<div class="content"><p class="view-status">Couldn't load site config (${esc(
      err.message
    )}). If you opened this file directly, run it through a local server.</p></div>`;
    return;
  }
  window.addEventListener("hashchange", render);
  render();
}

boot();
