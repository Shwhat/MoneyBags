// ---------- state changes ----------
let undoStack = [], redoStack = [], dirty = false;
let sel = new Set();          // selected rows in the current view (expense, payment or bill ids)
let anchor = null;            // first row of a shift-click range
const VIEWS = { expenses: 'Expenses', payments: 'Payments', recurring: 'Recurring bills', summary: 'Summary', charts: 'Charts', about: 'About MoneyBags' };
const VIEW = { kind: 'expenses', year: 0, month: 0, prev: 'expenses' };
const FILT = { q: '', cat: '', payer: '', split: '', review: false };
let aboutSlug = '';

function snapshot() { return JSON.stringify(B); }
function restore(json) { B = ensureBook(JSON.parse(json)); }
function pushUndo(snap) { undoStack.push(snap || snapshot()); if (undoStack.length > 150) undoStack.shift(); redoStack = []; }
// commit: every change to the book goes through here, so it can be undone and is saved
function commit(fn, o = {}) {
  if (!canEdit()) { flash(readOnlyReason()); return false; }
  pushUndo(); fn(); markDirty(); render(o); return true;
}
function markDirty() { dirty = true; B.modified = today(); scheduleSave(); }
function undo() { if (!canEdit()) { flash(readOnlyReason()); return; } if (!undoStack.length) { flash('Nothing to undo'); return; } redoStack.push(snapshot()); restore(undoStack.pop()); afterLoadState(); markDirty(); render(); flash('Undo'); }
function redo() { if (!canEdit()) { flash(readOnlyReason()); return; } if (!redoStack.length) { flash('Nothing to redo'); return; } undoStack.push(snapshot()); restore(redoStack.pop()); afterLoadState(); markDirty(); render(); flash('Redo'); }
function afterLoadState() { for (const id of [...sel]) if (!findExpense(id) && !findPayment(id) && !findRecurring(id)) sel.delete(id); }

let flashT;
function flash(m) { $('#st-msg').textContent = m; clearTimeout(flashT); flashT = setTimeout(() => $('#st-msg').textContent = '', 2600); }

// ---------- view and period ----------
function setView(kind) {
  if (!VIEWS[kind]) return;
  if (kind !== VIEW.kind) { sel.clear(); anchor = null; }
  if (kind !== 'about') { VIEW.prev = kind; PREFS.view = kind; savePrefs(); }
  VIEW.kind = kind; render(); $('#work').scrollTop = 0;
}
function setPeriod(year, month) { VIEW.year = year; VIEW.month = month || 0; sel.clear(); render(); }
function stepMonth(k) {
  if (!VIEW.month) { setPeriod(VIEW.year, k > 0 ? 1 : 12); return; }
  const ym = addMonths(`${VIEW.year}-${pad2(VIEW.month)}`, k); setPeriod(+ym.slice(0, 4), +ym.slice(5));
}
function stepYear(k) { setPeriod(VIEW.year + k, VIEW.month); }
const periodLabel = () => VIEW.month ? `${MONTHS[VIEW.month - 1]} ${VIEW.year}` : `All of ${VIEW.year}`;
const curPeriod = () => ({ year: VIEW.year, month: VIEW.month });

// ---------- main render ----------
function render() {
  if (!B) return;
  renderToolbar(); renderViewHead(); renderWork();
  renderYears(); renderTodo(); renderBalance(); renderProps();
  renderStatus(); updateTitle();
}
// renderWork redraws the work area and puts the cursor back where it was (search box, entry row)
function renderWork() {
  const w = $('#work'), a = document.activeElement, keep = a && w.contains(a) && a.id ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null;
  const top = w.scrollTop;
  w.classList.toggle('aboutmode', VIEW.kind === 'about');
  if (VIEW.kind === 'about') renderAbout(w);
  else w.innerHTML = VIEW_RENDER[VIEW.kind]();
  if (VIEW.kind === 'charts') wireCharts();
  w.scrollTop = top;
  if (keep) { const n = document.getElementById(keep.id); if (n) { n.focus(); try { if (keep.s != null) n.setSelectionRange(keep.s, keep.e); } catch (e) {} } }
}
function renderViewHead() {
  const kinds = ['expenses', 'payments', 'recurring', 'summary', 'charts'];
  const per = VIEW.kind !== 'recurring' && VIEW.kind !== 'about';
  let desc = '', where = '';
  if (VIEW.kind === 'expenses') { const l = visibleExpenses(); desc = `${l.length} expense${l.length === 1 ? '' : 's'}`; where = filtersActive() ? 'Filtered' : ''; }
  else if (VIEW.kind === 'payments') { const l = visiblePayments(); desc = `${l.length} settle-up entr${l.length === 1 ? 'y' : 'ies'}`; }
  else if (VIEW.kind === 'recurring') desc = `${B.recurring.length} recurring bill${B.recurring.length === 1 ? '' : 's'}`;
  else if (VIEW.kind === 'summary' || VIEW.kind === 'charts') desc = VIEW.month ? 'One month' : 'Month by month';
  const pos = VIEW.month ? `Month ${VIEW.month} of 12` : `${VIEW.year}`;
  $('#viewhead').innerHTML = (per ? `<button class="phbtn" data-act="prevMonth" title="Previous month (PgUp)">‹</button><button class="phbtn" data-act="nextMonth" title="Next month (PgDn)">›</button>
    <span class="phname">${esc(periodLabel())}</span>` : `<span class="phname">${esc(VIEWS[VIEW.kind])}</span>`) +
    `<div class="seg" role="tablist">${kinds.map((k, i) => `<button type="button" class="${VIEW.kind === k ? 'on' : ''}" data-view="${k}" title="${VIEWS[k]} (Alt+${i + 1})">${VIEWS[k]}</button>`).join('')}</div>
    <span class="phdesc">${esc(desc)}</span><span class="phwhere">${esc(where)}</span>${per ? `<span class="phpos">${esc(pos)}</span>` : ''}`;
}
function renderStatus() {
  $('#st-view').textContent = VIEWS[VIEW.kind] + (VIEW.kind !== 'recurring' && VIEW.kind !== 'about' ? ': ' + periodLabel() : '');
  $('#st-sel').textContent = sel.size ? `${sel.size} selected` : '';
  let t = '';
  if (VIEW.kind === 'expenses') { const l = visibleExpenses(); t = 'Total ' + money(l.reduce((a, e) => a + finalOf(e), 0)); if (sel.size) t = 'Selected ' + money([...sel].map(findExpense).filter(Boolean).reduce((a, e) => a + finalOf(e), 0)) + '  |  ' + t; }
  $('#st-total').textContent = t;
  $('#st-bal').textContent = 'Balance today: ' + netText(balanceNow());
  $('#st-save').textContent = saveStateText();
}
function updateTitle() {
  $('#docname').textContent = `${B.people[0].name} and ${B.people[1].name}  |  ${host.label()}`;
  document.title = `${dirty && !host.has ? '* ' : ''}MoneyBags${DEMO ? ' (demo)' : ''}`;
}
document.addEventListener('click', e => { const v = e.target.closest('[data-view]'); if (v) setView(v.dataset.view); });
