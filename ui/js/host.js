// ---------- host bridge: MoneyBags server, with a plain browser fallback ----------
// On the server, window.MB_SERVER holds the signed-in user and the book is kept on the server, saved a moment after
// every change. One person edits at a time: the other sees the book read-only until the first is done. Without a
// server (the tests, or the page opened from disk) the book is kept in this browser's storage.
const SERVER = window.MB_SERVER || null;
let DEMO = false;

async function api(method, url, body) {
  const o = { method, headers: { 'X-MoneyBags': '1' } };
  if (body !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = typeof body === 'string' ? body : JSON.stringify(body); }
  const r = await fetch(url, o);
  if (r.status === 401) { location.href = '/login'; throw new Error('You are signed out.'); }
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
  if (!r.ok) { const e = new Error((j && j.error) || 'Server error ' + r.status); e.status = r.status; e.data = j; throw e; }
  return j;
}

const host = {
  has: !!SERVER,
  user: SERVER ? SERVER.user : null,
  rev: 0, readOnly: false, lockedBy: '', beat: 0, saveT: 0, saving: false, error: '', lastSaved: '',
  label() {
    if (DEMO) return 'Demo book, changes are not saved';
    if (this.lockedBy) return `Read-only while ${this.lockedBy} edits`;
    if (!this.has) return 'Kept in this browser';
    return 'Shared book on the server';
  },
  async loadBook() {
    if (!this.has) { let t = ''; try { t = localStorage.getItem('mb:book') || ''; } catch (e) {} return t ? JSON.parse(t) : null; }
    const r = await api('GET', '/api/book'); this.rev = r.book.rev; this.lastSaved = r.book.updated;
    return r.content ? JSON.parse(r.content) : null;
  },
  async start() {
    if (!this.has) return;
    await this.lock(true);
    clearInterval(this.beat); this.beat = setInterval(() => this.lock(false), 45000);
  },
  async lock(first) {
    if (!this.has) return;
    try {
      await api('POST', '/api/book/lock');
      if (this.readOnly) {
        // the other person is done: load what they saved, then allow editing again
        this.readOnly = false; this.lockedBy = '';
        if (!DEMO) { const b = await this.loadBook(); if (b) { B = ensureBook(b); undoStack = []; redoStack = []; } }
        afterLoadState(); render(); flash('You can edit the book again');
      }
      if (this.error) this.saveSoon(0);
    } catch (e) {
      if (e.status === 409 && e.data && e.data.book) {
        const was = this.readOnly; this.readOnly = true; this.lockedBy = e.data.book.lockedBy || 'someone';
        if (first || !was) flash(`Read-only: ${this.lockedBy} is editing the book`);
        if (B) render();
      }
    }
  },
  unlock() {
    clearInterval(this.beat);
    if (!this.has || this.readOnly) return;
    try { fetch('/api/book/unlock', { method: 'POST', headers: { 'X-MoneyBags': '1' }, keepalive: true }); } catch (e) {}
  },
  saveSoon(ms = 700) { clearTimeout(this.saveT); this.saveT = setTimeout(() => this.save(), ms); renderSaveState(); },
  async save() {
    clearTimeout(this.saveT);
    if (DEMO || !dirty) return true;
    if (!this.has) { try { localStorage.setItem('mb:book', snapshot()); dirty = false; this.error = ''; } catch (e) { this.error = 'the browser storage is full'; } renderSaveState(); return !this.error; }
    if (this.readOnly) return false;
    if (this.saving) { this.saveSoon(400); return false; }
    this.saving = true; renderSaveState();
    const content = snapshot();
    try {
      const r = await api('PUT', '/api/book', { rev: this.rev, content });
      this.rev = r.rev; this.lastSaved = r.updated; this.error = '';
      if (snapshot() === content) dirty = false;
    } catch (e) {
      if (e.status === 409 && e.data && e.data.error === 'locked') { this.readOnly = true; this.lockedBy = (e.data.book && e.data.book.lockedBy) || 'someone'; this.error = 'someone else is editing'; render(); }
      else if (e.status === 409) { this.saving = false; await this.conflict(e.data && e.data.book); return false; }
      else this.error = e.message || 'the server could not be reached';
    }
    this.saving = false; renderSaveState(); if (dirty && !this.error && !this.readOnly) this.saveSoon(); return !this.error;
  },
  // someone saved after this book was loaded (only possible if this computer slept past its edit lock)
  async conflict(info) {
    const who = (info && info.updatedByName) || 'Someone';
    const c = await choose('Book changed on the server', `${who} saved the book after you opened it. Keep your version (their latest changes are replaced) or load theirs (your unsaved changes are dropped)?`, [['theirs', 'Load their version'], ['mine', 'Keep my version']]);
    if (c === 'theirs') { const b = await this.loadBook(); B = ensureBook(b || newBook()); dirty = false; undoStack = []; redoStack = []; afterLoadState(); render(); flash('Loaded the latest book'); return; }
    if (c === 'mine') { const r = await api('GET', '/api/book'); this.rev = r.book.rev; this.save(); return; }
    this.error = 'not saved: the book changed on the server'; renderSaveState();
  },
  async readData(n) {
    if (this.has) { try { const r = await fetch('/api/data/' + n); return r.ok ? await r.text() : ''; } catch (e) { return ''; } }
    try { return localStorage.getItem('mb:' + n) || ''; } catch (e) { return ''; }
  },
  async writeData(n, c) {
    if (this.has) { try { await api('PUT', '/api/data/' + n, c); } catch (e) { flash('Could not save ' + n + ': ' + e.message); } return; }
    try { localStorage.setItem('mb:' + n, c); } catch (e) {}
  },
};
function canEdit() { return DEMO || !host.readOnly; }
function readOnlyReason() { return host.lockedBy ? `Read-only: ${host.lockedBy} is editing the book` : 'The book is read-only right now'; }
function scheduleSave() { if (!DEMO) host.saveSoon(); }
function saveNow() { if (DEMO) { flash('The demo book is not saved'); return; } if (!dirty) { flash('All changes are saved'); return; } host.save().then(ok => flash(ok ? 'Saved' : 'Not saved: ' + host.error)); }
function saveStateText() {
  if (DEMO) return 'Demo: not saved';
  if (host.readOnly) return 'Read-only';
  if (host.error) return 'Not saved: ' + host.error;
  if (host.saving) return 'Saving...';
  if (dirty) return 'Changes waiting to save';
  return host.has ? 'All changes saved' : 'Saved in this browser';
}
function renderSaveState() { const el = $('#st-save'); if (el) el.textContent = saveStateText(); }
window.addEventListener('beforeunload', e => { if (dirty && !DEMO && host.has && !host.readOnly) { host.save(); e.preventDefault(); e.returnValue = ''; } });
window.addEventListener('pagehide', () => host.unlock());

function download(name, content, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}
function pickLocalFile(accept, binary, multiple) {
  return new Promise(res => {
    // the input stays in the page until it is used; a detached input can be discarded before it reports the file
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiple; i.style.display = 'none'; document.body.appendChild(i);
    i.addEventListener('cancel', () => { i.remove(); res(null); });
    i.onchange = async () => {
      const fs = [...i.files]; i.remove(); if (!fs.length) return res(null);
      const out = await Promise.all(fs.map(async f => ({ path: f.name, content: binary ? new Uint8Array(await f.arrayBuffer()) : await f.text() })));
      res(multiple ? out : out[0]);
    };
    i.click();
  });
}

// ---------- small promise dialogs ----------
// choose: a message with extra buttons besides Cancel; resolves with the button's value, or '' for Cancel
function choose(title, text, buttons) {
  return new Promise(res => {
    dialog(title, [], () => {}, 'OK', `<div class="note" style="max-width:440px;font-size:12.5px;color:var(--text)">${esc(text)}</div>`);
    const dlg = $('#dlg'); let v = '';
    $('#dlgbtns').innerHTML = '<button type="button" class="btn" data-v="">Cancel</button>' + buttons.map(([k, l], i) => `<button type="button" class="btn${i === buttons.length - 1 ? ' primary' : ''}" data-v="${esc(k)}">${esc(l)}</button>`).join('');
    $('#dlgbtns').onclick = e => { const b = e.target.closest('button'); if (!b) return; v = b.dataset.v; dlg.close('cancel'); };
    dlg.onclose = () => { $('#dlgbtns').onclick = null; res(v); };
    const p = $('#dlgbtns .primary'); if (p) p.focus();
  });
}
// ask: a plain question with Cancel and one main button; resolves true or false
async function ask(title, text, okLabel = 'OK') { return (await choose(title, text, [['ok', okLabel]])) === 'ok'; }
// tell: a message with a Close button
function tell(title, html) { dialog(title, [], null, 'Close', `<div style="max-width:520px">${html}</div>`); }

// ---------- server features: account ----------
function changePassword() {
  if (!host.has) { flash('Passwords are used on the server version only'); return; }
  dialog('Change password', [['old', 'Current password', '', 'password'], ['nw', 'New password', '', 'password'], ['nw2', 'Repeat new password', '', 'password']], v => {
    if (v.nw.length < 8) { flash('Passwords need at least 8 characters.'); return false; }
    if (v.nw !== v.nw2) { flash('The new passwords do not match.'); return false; }
    api('POST', '/api/password', { old: v.old, new: v.nw }).then(() => flash('Password changed. Other devices are signed out.')).catch(e => tell('Change password', esc(e.message)));
  }, 'Change');
}
async function signOut() {
  if (!host.has) return;
  if (dirty && !DEMO) await host.save();
  host.unlock();
  try { await api('POST', '/api/logout'); } catch (e) {}
  location.replace('/login');
}
if (SERVER) {
  const m = document.createElement('div'); m.className = 'menu'; m.dataset.menu = 'account'; m.id = 'acct'; m.textContent = SERVER.user.name; m.title = 'Signed in as ' + SERVER.user.name;
  const d = document.getElementById('docname'); if (d) d.after(m);
}
