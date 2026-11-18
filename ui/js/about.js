// ---------- About MoneyBags: the built-in guide ----------
// The pages come from ui/about/*.md and are bundled into ABOUT_PAGES when the page is assembled, so the guide works
// offline. The guide opens in the work area. Links to /about/slug switch pages; the address #about or #about/slug
// (or /about and /about/slug on the server) opens the guide.
const mdInline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => /^\/about\//.test(u) ? `<a href="#about/${u.slice(7)}" data-about="${u.slice(7)}">${t}</a>` : `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
function mdRender(src) {
  const L = src.replace(/\r/g, '').split('\n'), out = []; let i = 0;
  const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    if (/^```/.test(l)) { const code = []; i++; while (i < L.length && !/^```/.test(L[i])) code.push(L[i++]); i++; out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); continue; }
    const h = l.match(/^(#{1,4}) (.+)$/); if (h) { out.push(`<h${h[1].length}>${mdInline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^\|/.test(l) && /^\|[\s:|-]+\|?\s*$/.test(L[i + 1] || '')) {
      const head = cells(l); i += 2; const rows = [];
      while (i < L.length && /^\|/.test(L[i])) rows.push(cells(L[i++]));
      out.push(`<table><thead><tr>${head.map(c => `<th>${mdInline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${mdInline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue;
    }
    const li = l.match(/^(\s*)([-*]|\d+\.) (.+)$/);
    if (li) {
      const ord = /\d/.test(li[2]), items = [];
      while (i < L.length) { const m = L[i].match(/^\s*([-*]|\d+\.) (.+)$/); if (!m) break; items.push(m[2]); i++; }
      out.push(`<${ord ? 'ol' : 'ul'}>${items.map(t => `<li>${mdInline(t)}</li>`).join('')}</${ord ? 'ol' : 'ul'}>`); continue;
    }
    const para = []; while (i < L.length && L[i].trim() && !/^(#{1,4} |\||```|\s*([-*]|\d+\.) )/.test(L[i])) para.push(L[i++]);
    out.push(`<p>${mdInline(para.join(' '))}</p>`);
  }
  return out.join('');
}
function about(slug) { aboutSlug = slug || ''; if (VIEW.kind !== 'about') VIEW.prev = VIEW.kind; VIEW.kind = 'about'; sel.clear(); render(); $('#work').scrollTop = 0; }
function closeAbout() { if (location.hash.startsWith('#about')) try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} setView(VIEW.prev && VIEW.prev !== 'about' ? VIEW.prev : 'expenses'); }
function renderAbout(w) {
  const i = aboutSlug ? ABOUT_PAGES.findIndex(p => p.slug === aboutSlug) : 0;
  const head = `<div class="abhead"><b>About MoneyBags</b><span class="note">Version ${esc(APP_VERSION)}</span><button type="button" class="btn small abclose" data-abclose="1">Close (Esc)</button></div>`;
  if (i < 0) { w.innerHTML = head + `<article class="abpage"><h1>Page not found</h1><p>There is no guide page called "${esc(aboutSlug)}".</p><p><a href="#about/overview" data-about="overview">Go to the Overview</a></p></article>`; return; }
  const p = ABOUT_PAGES[i], prev = ABOUT_PAGES[i - 1], next = ABOUT_PAGES[i + 1];
  w.innerHTML = head + `<div class="about"><nav class="abtoc">${ABOUT_PAGES.map((q, k) => `<a href="#about/${q.slug}" data-about="${q.slug}" class="${k === i ? 'on' : ''}">${esc(q.title)}</a>`).join('')}</nav>
    <select class="abselect" aria-label="About page">${ABOUT_PAGES.map((q, k) => `<option value="${q.slug}" ${k === i ? 'selected' : ''}>${esc(q.title)}</option>`).join('')}</select>
    <article class="abpage">${mdRender(p.body)}<div class="abpager">${prev ? `<a href="#about/${prev.slug}" data-about="${prev.slug}">Previous: ${esc(prev.title)}</a>` : ''}<span style="flex:1"></span>${next ? `<a href="#about/${next.slug}" data-about="${next.slug}">Next: ${esc(next.title)}</a>` : ''}</div></article></div>`;
}
$('#work').addEventListener('click', e => {
  if (e.target.closest('[data-abclose]')) { closeAbout(); return; }
  const a = e.target.closest('[data-about]'); if (!a || VIEW.kind !== 'about') return;
  e.preventDefault(); aboutSlug = a.dataset.about; renderWork(); $('#work').scrollTop = 0;
});
$('#work').addEventListener('change', e => { if (e.target.classList.contains('abselect')) { aboutSlug = e.target.value; renderWork(); $('#work').scrollTop = 0; } });
window.addEventListener('hashchange', () => { if (/^#about(\/|$)/.test(location.hash)) about(location.hash.slice(7)); });
