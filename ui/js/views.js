// ---------- work area views: expenses, payments, recurring bills ----------
const VIEW_RENDER = { expenses: expensesHTML, payments: paymentsHTML, recurring: recurringHTML, summary: summaryHTML, charts: chartsHTML };
const ENTRY = { per: '', date: '', vendor: '', cat: '', payer: '', split: 'Y', amount: '', cash: '', notes: '' };
const PENTRY = { per: '', date: '', from: '', to: '', amount: '', kind: 'payment', notes: '' };

const filtersActive = () => !!(FILT.q || FILT.cat || FILT.payer || FILT.split || FILT.review);
function defaultEntryDate() {
  const t = today();
  if (VIEW.month) return ymOf(t) === `${VIEW.year}-${pad2(VIEW.month)}` ? t : `${VIEW.year}-${pad2(VIEW.month)}-01`;
  return yearOf(t) === VIEW.year ? t : `${VIEW.year}-01-01`;
}
function syncEntry(E) {
  const per = `${VIEW.year}-${VIEW.month}`;
  if (E.per !== per) { E.per = per; E.date = defaultEntryDate(); }
  if (E === ENTRY && !person(E.payer)) E.payer = myPerson();
  if (E === PENTRY) { if (!person(E.from)) { const n = balanceNow(); E.from = n > 0 ? 'p2' : n < 0 ? 'p1' : myPerson(); } if (!person(E.to) || E.to === E.from) E.to = other(E.from); }
}
function visibleExpenses() {
  const q = FILT.q.trim().toLowerCase(), per = curPeriod();
  let l = B.expenses.filter(e => validDate(e.date) ? inPeriod(e.date, per) : true);
  // an expense without a date shows in every period so it can be found and fixed
  if (FILT.cat) l = l.filter(e => FILT.cat === '-' ? !e.category : e.category === FILT.cat);
  if (FILT.payer) l = l.filter(e => e.paidBy === FILT.payer);
  if (FILT.split) l = l.filter(e => FILT.split === '-' ? !e.split : e.split === FILT.split);
  if (FILT.review) l = l.filter(e => problemsOf(e).length);
  if (q) l = l.filter(e => [e.vendor, e.notes, catName(e.category), pname(e.paidBy), e.amount == null ? '' : String(e.amount), money(finalOf(e))].join(' ').toLowerCase().includes(q));
  const s = PREFS.sort && PREFS.sort.key ? PREFS.sort : { key: 'date', dir: 1 };
  const idx = new Map(B.expenses.map((e, i) => [e.id, i]));
  const val = { date: e => e.date || '9999', vendor: e => e.vendor.toLowerCase(), cat: e => catName(e.category).toLowerCase(), payer: e => pname(e.paidBy), split: e => e.split, amount: e => e.amount ?? -1e15, cash: e => e.cashBack ?? 0, final: e => finalOf(e), s1: e => sharesOf(e).p1, s2: e => sharesOf(e).p2, notes: e => e.notes.toLowerCase() }[s.key] || (e => e.date);
  return l.sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === 'number' ? x - y : natCmp(x, y); return (c || idx.get(a.id) - idx.get(b.id)) * (c ? s.dir : 1); });
}
const visiblePayments = () => B.payments.filter(p => validDate(p.date) ? inPeriod(p.date, curPeriod()) : true).sort((a, b) => natCmp(a.date, b.date));
function sortHead(key, label, cls = '') {
  const s = PREFS.sort || { key: 'date', dir: 1 }, on = s.key === key;
  return `<th class="sortable ${cls}" data-sort="${key}" title="Sort by ${esc(label)}">${esc(label)}${on ? `<span class="arrow">${s.dir > 0 ? '▲' : '▼'}</span>` : ''}</th>`;
}
const optHTML = (opts, v) => opts.map(([k, l]) => `<option value="${esc(k)}" ${String(k) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('');
function flagsHTML(e) { const p = problemsOf(e); return p.length ? `<span class="flag" title="${esc(p.map(x => x.text).join('. '))}">Review</span>` : ''; }
const splitPill = s => s === 'Y' ? '<span class="pill y" title="Joint: split 50/50">Y</span>' : s === 'N' ? '<span class="pill n" title="Paid for the other person">N</span>' : '<span class="pill" title="Not set">?</span>';

function expensesHTML() {
  syncEntry(ENTRY);
  const l = visibleExpenses(), sorted = !PREFS.sort || PREFS.sort.key === 'date';
  const [a, b] = B.people;
  const vendors = [...new Set(B.expenses.map(e => e.vendor.trim()).filter(Boolean))].sort(natCmp);
  let rows = '', lastYm = '';
  for (const e of l) {
    if (sorted && !VIEW.month && ymOf(e.date) !== lastYm) { lastYm = ymOf(e.date); rows += `<tr class="monthrow"><td colspan="11">${esc(lastYm ? ymLabel(lastYm) : 'No date')}</td></tr>`; }
    const sh = sharesOf(e);
    rows += `<tr class="row${sel.has(e.id) ? ' on' : ''}" data-row="${e.id}">
      <td>${esc(fmtDate(e.date)) || '<span class="flag">No date</span>'}</td>
      <td title="${esc(e.vendor)}">${esc(e.vendor)}${e.recurring ? ' <span class="pill rec" title="Added by a recurring bill">Bill</span>' : ''}${flagsHTML(e)}</td>
      <td>${esc(catName(e.category))}</td><td>${esc(pname(e.paidBy))}</td><td>${splitPill(e.split)}</td>
      <td class="num">${e.amount == null ? '<span class="flag">Blank</span>' : money(e.amount)}</td><td class="num muted">${money(e.cashBack)}</td>
      <td class="num">${money(finalOf(e))}</td><td class="num muted">${money(sh.p1)}</td><td class="num muted">${money(sh.p2)}</td>
      <td class="muted" title="${esc(e.notes)}">${esc(e.notes)}</td></tr>`;
  }
  const tot = l.reduce((s, e) => { const sh = sharesOf(e); s.f += finalOf(e); s.a += sh.p1; s.b += sh.p2; s.c += e.cashBack || 0; s.m += e.amount || 0; return s; }, { f: 0, a: 0, b: 0, c: 0, m: 0 });
  const ro = !canEdit();
  return `<div class="viewbar">
      <input class="search" id="f-q" placeholder="Search vendor, notes, amount" value="${esc(FILT.q)}" aria-label="Search">
      <select id="f-cat" aria-label="Category filter">${optHTML([['', 'All categories'], ['-', 'No category']].concat(B.categories.map(c => [c.id, c.name])), FILT.cat)}</select>
      <select id="f-payer" aria-label="Paid by filter">${optHTML([['', 'Anyone paid'], ['p1', a.name + ' paid'], ['p2', b.name + ' paid']], FILT.payer)}</select>
      <select id="f-split" aria-label="Split filter">${optHTML([['', 'Joint and not joint'], ['Y', 'Joint (Y)'], ['N', 'For the other person (N)'], ['-', 'Split not set']], FILT.split)}</select>
      <label><input type="checkbox" id="f-review" ${FILT.review ? 'checked' : ''}> Needs review only</label>
      ${filtersActive() ? '<button type="button" class="lnk" data-act="clearFilters">Clear filters</button>' : ''}
      <span class="grow"></span><span class="note" style="margin:0">${l.length} shown</span></div>
    <table class="grid fixed" id="exptable"><colgroup><col style="width:104px"><col><col style="width:100px"><col style="width:78px"><col style="width:46px"><col style="width:86px"><col style="width:72px"><col style="width:84px"><col style="width:86px"><col style="width:86px"><col style="width:120px"></colgroup><thead><tr>${sortHead('date', 'Date')}${sortHead('vendor', 'Vendor')}${sortHead('cat', 'Category')}${sortHead('payer', 'Paid by')}${sortHead('split', 'Split')}${sortHead('amount', 'Amount', 'num')}${sortHead('cash', 'Cash back', 'num')}${sortHead('final', 'Final', 'num')}${sortHead('s1', a.name + "'s share", 'num')}${sortHead('s2', b.name + "'s share", 'num')}${sortHead('notes', 'Notes')}</tr>
    ${ro ? '' : `<tr class="entry" id="entryrow">
      <td><input type="date" id="en-date" value="${esc(ENTRY.date)}" aria-label="Date"></td>
      <td><input id="en-vendor" value="${esc(ENTRY.vendor)}" placeholder="New expense: vendor" list="vendorlist" aria-label="Vendor"><datalist id="vendorlist">${vendors.map(v => `<option value="${esc(v)}">`).join('')}</datalist></td>
      <td><select id="en-cat" aria-label="Category">${optHTML(catOpts(''), ENTRY.cat)}</select></td>
      <td><select id="en-payer" aria-label="Paid by">${optHTML(personOpts(), ENTRY.payer)}</select></td>
      <td><select id="en-split" aria-label="Split">${optHTML([['Y', 'Y'], ['N', 'N']], ENTRY.split)}</select></td>
      <td><input id="en-amount" value="${esc(ENTRY.amount)}" placeholder="0.00" aria-label="Amount" style="text-align:right"></td>
      <td><input id="en-cash" value="${esc(ENTRY.cash)}" placeholder="0.00" aria-label="Cash back" style="text-align:right"></td>
      <td class="hint" colspan="3">Enter adds the expense</td>
      <td><input id="en-notes" value="${esc(ENTRY.notes)}" placeholder="Notes" aria-label="Notes"></td></tr>`}
    </thead><tbody>${rows || `<tr><td colspan="11" class="empty">${B.expenses.length ? 'No expenses match this period and these filters.' : 'No expenses yet. Type one in the row above, or use File > Import from Excel.'}</td></tr>`}</tbody>
    <tfoot><tr><td colspan="5">${l.length} expense${l.length === 1 ? '' : 's'}</td><td class="num">${money(tot.m)}</td><td class="num">${money(tot.c)}</td><td class="num">${money(tot.f)}</td><td class="num">${money(tot.a)}</td><td class="num">${money(tot.b)}</td><td></td></tr></tfoot></table>`;
}

function paymentsHTML() {
  syncEntry(PENTRY);
  const l = visiblePayments(), ro = !canEdit();
  const rows = l.map(p => `<tr class="row${sel.has(p.id) ? ' on' : ''}" data-row="${p.id}"><td>${esc(fmtDate(p.date)) || '<span class="flag">No date</span>'}</td><td>${esc(pname(p.from))}</td><td>${esc(pname(p.to))}</td><td class="num">${money(p.amount)}</td><td>${esc(PAYMENT_KINDS[p.kind])}</td><td class="muted">${esc(pname(p.from))} owes ${esc(pname(p.to))} ${money(p.amount)} less</td><td class="muted" title="${esc(p.notes)}">${esc(p.notes)}</td></tr>`).join('');
  const tot = l.reduce((s, p) => s + (p.amount || 0), 0);
  return `<div class="viewbar"><span class="note" style="margin:0">Payments, credits and adjustments between ${esc(B.people[0].name)} and ${esc(B.people[1].name)}. Each one lowers what the From person owes the To person.</span></div>
    <table class="grid fixed" id="paytable"><colgroup><col style="width:128px"><col style="width:120px"><col style="width:120px"><col style="width:110px"><col style="width:120px"><col style="width:24%"><col></colgroup><thead><tr><th>Date</th><th>From</th><th>To</th><th class="num">Amount</th><th>Kind</th><th>Effect</th><th>Notes</th></tr>
    ${ro ? '' : `<tr class="entry" id="pentryrow"><td><input type="date" id="pe-date" value="${esc(PENTRY.date)}" aria-label="Date"></td>
      <td><select id="pe-from" aria-label="From">${optHTML(personOpts(), PENTRY.from)}</select></td><td><select id="pe-to" aria-label="To">${optHTML(personOpts(), PENTRY.to)}</select></td>
      <td><input id="pe-amount" value="${esc(PENTRY.amount)}" placeholder="0.00" aria-label="Amount" style="text-align:right"></td>
      <td><select id="pe-kind" aria-label="Kind">${optHTML(Object.entries(PAYMENT_KINDS), PENTRY.kind)}</select></td><td class="hint">Enter adds the entry</td>
      <td><input id="pe-notes" value="${esc(PENTRY.notes)}" placeholder="Notes (for example Zelle)" aria-label="Notes"></td></tr>`}
    </thead><tbody>${rows || '<tr><td colspan="7" class="empty">No settle-up entries in this period.</td></tr>'}</tbody>
    <tfoot><tr><td colspan="3">${l.length} entr${l.length === 1 ? 'y' : 'ies'}</td><td class="num">${money(tot)}</td><td colspan="3">Balance today: ${esc(netText(balanceNow()))}</td></tr></tfoot></table>`;
}

function nextBillDate(t) {
  const cur = ymOf(today()); let ym = t.start > cur ? t.start : cur;
  while (B.recurringLog[`${t.id}:${ym}`] && (!t.end || ym <= t.end)) ym = addMonths(ym, 1);
  if (!t.active || (t.end && ym > t.end)) return '';
  return `${ym}-${pad2(t.day)}`;
}
function recurringHTML() {
  const rows = B.recurring.map(t => {
    const n = B.expenses.filter(e => e.recurring === t.id).length, nx = nextBillDate(t);
    return `<tr class="row${sel.has(t.id) ? ' on' : ''}" data-row="${t.id}"><td>${esc(t.name)}${t.active ? '' : ' <span class="pill">Paused</span>'}</td><td class="num">${t.amount == null ? '<span class="muted">Enter each month</span>' : money(t.amount)}</td><td>${esc(pname(t.paidBy))}</td><td>${splitPill(t.split)}</td><td>${esc(catName(t.category))}</td><td class="num">${t.day}</td><td>${esc(ymLabel(t.start))}</td><td>${t.end ? esc(ymLabel(t.end)) : '<span class="muted">No end</span>'}</td><td class="num">${n}</td><td>${nx ? esc(fmtDate(nx)) : '<span class="muted">None</span>'}</td></tr>`;
  }).join('');
  return `<div class="viewbar"><span class="note" style="margin:0">Each recurring bill adds one expense a month, on its day, from its first month through the current month. Bills with no amount are added blank and listed in the To-do panel until the amount is filled in.</span>
    <span class="grow"></span>${canEdit() ? '<button type="button" class="btn" data-act="newRecurring">New recurring bill...</button>' : ''}</div>
    <table class="grid" id="rectable"><thead><tr><th>Bill</th><th class="num">Amount</th><th>Paid by</th><th>Split</th><th>Category</th><th class="num">Day</th><th>Starts</th><th>Ends</th><th class="num">Added</th><th>Next</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="10" class="empty">No recurring bills yet. Use Insert > Recurring bill to add one.</td></tr>'}</tbody></table>`;
}

// ---------- rows: selection and sorting ----------
function rowIds() { return [...document.querySelectorAll('#work tr[data-row]')].map(r => r.dataset.row); }
$('#work').addEventListener('mousedown', e => {
  const r = e.target.closest('tr[data-row]'); if (!r || e.button !== 0) return;
  const id = r.dataset.row;
  if (e.shiftKey && anchor) { const ids = rowIds(), i = ids.indexOf(anchor), j = ids.indexOf(id); if (i >= 0 && j >= 0) { sel = new Set(ids.slice(Math.min(i, j), Math.max(i, j) + 1)); e.preventDefault(); } }
  else if (e.ctrlKey || e.metaKey) { if (sel.has(id)) sel.delete(id); else sel.add(id); anchor = id; }
  else { sel = new Set([id]); anchor = id; }
  $('#work').focus({ preventScroll: true });
  renderSel();
});
// renderSel: show a new selection without rebuilding the list, so double-clicks and scrolling are kept
function renderSel() {
  document.querySelectorAll('#work tr[data-row]').forEach(r => r.classList.toggle('on', sel.has(r.dataset.row)));
  renderToolbar(); renderProps(); renderStatus();
}
$('#work').addEventListener('dblclick', e => { if (e.target.closest('tr[data-row]')) editSelected(); });
$('#work').addEventListener('click', e => {
  const h = e.target.closest('th[data-sort]'); if (!h) return;
  const k = h.dataset.sort, s = PREFS.sort || { key: 'date', dir: 1 };
  PREFS.sort = { key: k, dir: s.key === k ? -s.dir : 1 }; savePrefs(); renderWork();
});
function moveSel(d, extend) {
  const ids = rowIds(); if (!ids.length) return;
  const cur = anchor && ids.includes(anchor) ? ids.indexOf(anchor) : (d > 0 ? -1 : ids.length);
  const j = Math.max(0, Math.min(ids.length - 1, cur + d)), id = ids[j];
  if (extend) sel.add(id); else sel = new Set([id]);
  anchor = id; renderSel();
  const tr = document.querySelector(`#work tr[data-row="${id}"]`); if (tr) tr.scrollIntoView({ block: 'nearest' });
}
function selAll() { if (!['expenses', 'payments', 'recurring'].includes(VIEW.kind)) return; sel = new Set(rowIds()); renderSel(); flash(`${sel.size} selected`); }

// ---------- filters and the entry rows ----------
$('#work').addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'f-q') { FILT.q = t.value; sel.clear(); renderWork(); renderViewHead(); renderStatus(); return; }
  const en = t.id.match(/^en-(\w+)$/); if (en) { ENTRY[en[1] === 'cat' ? 'cat' : en[1]] = t.value; return; }
  const pe = t.id.match(/^pe-(\w+)$/); if (pe) PENTRY[pe[1]] = t.value;
});
$('#work').addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'f-cat' || t.id === 'f-payer' || t.id === 'f-split') { FILT[t.id.slice(2)] = t.value; sel.clear(); render(); return; }
  if (t.id === 'f-review') { FILT.review = t.checked; sel.clear(); render(); return; }
  if (t.id === 'en-vendor') {
    // a vendor used before brings its last category along
    if (!t.isConnected) return;
    const v = t.value.trim().toLowerCase();
    if (v && !ENTRY.cat) { const prev = [...B.expenses].reverse().find(x => x.vendor.trim().toLowerCase() === v && x.category); if (prev) { ENTRY.cat = prev.category; $('#en-cat').value = prev.category; } }
    return;
  }
  if (t.id === 'pe-from') { PENTRY.from = t.value; if (PENTRY.to === t.value) { PENTRY.to = other(t.value); $('#pe-to').value = PENTRY.to; } }
  if (t.id === 'pe-to') { PENTRY.to = t.value; if (PENTRY.from === t.value) { PENTRY.from = other(t.value); $('#pe-from').value = PENTRY.from; } }
});
$('#work').addEventListener('keydown', e => {
  const t = e.target;
  if (t.closest && t.closest('#entryrow')) {
    if (e.key === 'Enter') { e.preventDefault(); if (t.id === 'en-vendor') t.dispatchEvent(new Event('change', { bubbles: true })); addFromEntry(); }
    else if (e.key === 'Escape') { e.preventDefault(); t.blur(); Object.assign(ENTRY, { vendor: '', amount: '', cash: '', notes: '', cat: '' }); renderWork(); }
    return;
  }
  if (t.closest && t.closest('#pentryrow')) {
    if (e.key === 'Enter') { e.preventDefault(); addPaymentFromEntry(); }
    else if (e.key === 'Escape') { e.preventDefault(); t.blur(); Object.assign(PENTRY, { amount: '', notes: '' }); renderWork(); }
    return;
  }
  if (t.id === 'f-q' && e.key === 'Escape') { FILT.q = ''; render(); }
});

// ---------- panels: years, to-do, balance ----------
function renderYears() {
  const el = $('#tab-years'); if (!el) return;
  const t = today();
  el.innerHTML = '<div class="navbtns"><button type="button" class="btn small" data-act="thisMonth">This month</button><button type="button" class="btn small" data-act="wholeYear">Whole year</button></div>' + bookYears().map(y => {
    const open = PREFS.yearsOpen[y] ?? (y === VIEW.year), st = periodStats({ year: y, month: 0 });
    let s = `<div class="yr${VIEW.year === y && !VIEW.month ? ' active' : ''}" data-year="${y}"><span class="caret" data-ytoggle="${y}">${open ? '▼' : '▶'}</span>${y}<span class="r">${money(st.total)}</span></div>`;
    if (open) for (let m = 1; m <= 12; m++) {
      const ms = periodStats({ year: y, month: m }), now = `${y}-${pad2(m)}` === ymOf(t);
      s += `<div class="mo${VIEW.year === y && VIEW.month === m ? ' active' : ''}" data-year="${y}" data-month="${m}" title="${MONTHS[m - 1]} ${y}: ${ms.count} expenses, net ${esc(netText(ms.net))}">${MONTHS[m - 1]}${now ? ' <span class="badge">now</span>' : ''}<span class="r">${ms.count ? money(ms.total) : ''}</span><span class="c">${ms.count || ''}</span></div>`;
    }
    return s;
  }).join('');
}
$('#tab-years').addEventListener('click', e => {
  const tg = e.target.closest('[data-ytoggle]');
  if (tg) { const y = +tg.dataset.ytoggle; PREFS.yearsOpen[y] = !(PREFS.yearsOpen[y] ?? (y === VIEW.year)); savePrefs(); renderYears(); return; }
  const r = e.target.closest('[data-year]'); if (!r) return;
  if (VIEW.kind === 'recurring' || VIEW.kind === 'about') VIEW.kind = VIEW.prev === 'recurring' ? 'expenses' : VIEW.prev;
  setPeriod(+r.dataset.year, +(r.dataset.month || 0));
});
function todoItems() {
  const out = [];
  for (const e of B.expenses) for (const p of problemsOf(e)) out.push({ e, p });
  return out.sort((a, b) => natCmp(a.e.date || '0', b.e.date || '0'));
}
function renderTodo() {
  const el = $('#tab-todo'); if (!el) return;
  const items = todoItems(), n = new Set(items.map(i => i.e.id)).size;
  PANEL_BADGE.todo = n || '';
  document.querySelectorAll('.tab[data-dtab="todo"]').forEach(t => { t.innerHTML = panelLabel('todo') + (t.classList.contains('active') ? '<span class="tabx" data-dclose="todo" title="Close panel">×</span>' : ''); });
  if (!items.length) { el.innerHTML = '<div class="note" style="padding:8px 10px">Nothing needs a look. Expenses appear here when the amount is blank, the date is missing, joint or not is not set, who paid is not set, or someone marks them as needs review.</div>'; return; }
  el.innerHTML = `<div class="note" style="padding:2px 10px 6px">${n} expense${n === 1 ? '' : 's'} need${n === 1 ? 's' : ''} a look.</div>` + items.map(({ e, p }) => `<div class="td"><div class="td-body"><div class="td-text"><b>${esc(p.text)}</b></div>
    <div class="td-meta">${esc(e.vendor || '(no vendor)')}, ${esc(fmtDate(e.date) || 'no date')}, ${e.amount == null ? 'no amount' : money(e.amount)} <a data-todogo="${e.id}">Show</a>${p.code === 'check' && canEdit() ? ` <a data-tododone="${e.id}">Done</a>` : ''}</div></div></div>`).join('');
}
$('#tab-todo').addEventListener('click', e => {
  const g = e.target.closest('[data-todogo]'); if (g) { showExpense(g.dataset.todogo); return; }
  const d = e.target.closest('[data-tododone]'); if (d) { const x = findExpense(d.dataset.tododone); if (x) { commit(() => { x.check = ''; }); flash('Marked reviewed'); } }
});
function showExpense(id) {
  const e = findExpense(id); if (!e) return;
  Object.assign(FILT, { q: '', cat: '', payer: '', split: '', review: false });
  if (validDate(e.date)) { VIEW.year = yearOf(e.date); VIEW.month = monthOf(e.date); }
  VIEW.kind = 'expenses'; sel = new Set([id]); anchor = id; render();
  const tr = document.querySelector(`#work tr[data-row="${id}"]`); if (tr) tr.scrollIntoView({ block: 'center' });
}
function renderBalance() {
  const el = $('#tab-balance'); if (!el) return;
  const n = balanceNow(), per = curPeriod(), s = periodStats(per), endBal = balanceThrough(periodEnd(per)), all = balanceThrough('9999-12-31');
  const [a, b] = B.people;
  el.innerHTML = `<div class="balbig"><div class="note" style="margin:0">Balance today</div><div class="amt">${n ? money(Math.abs(n)) : '$0.00'}</div><div class="who owe">${esc(netText(n))}</div></div>
    ${Math.abs(n) >= 0.005 && canEdit() ? `<div class="navbtns"><button type="button" class="btn small" data-settle="1">Record settle-up payment...</button></div>` : ''}
    ${Math.abs(all - n) >= 0.005 ? `<div class="note" style="padding:0 12px">Entries dated after today change this to: ${esc(netText(all))}.</div>` : ''}
    <div class="kvh">${esc(periodLabel())}</div><div class="kv">
      <span>Joint spending</span><span>${money(s.joint)}</span>
      <span>${esc(a.name)} paid (joint)</span><span>${money(s.jointBy.p1)}</span>
      <span>${esc(b.name)} paid (joint)</span><span>${money(s.jointBy.p2)}</span>
      <span>${esc(a.name)} paid for ${esc(b.name)}</span><span>${money(s.forOther.p1)}</span>
      <span>${esc(b.name)} paid for ${esc(a.name)}</span><span>${money(s.forOther.p2)}</span>
      <span>${esc(a.name)}'s share</span><span>${money(s.share.p1)}</span>
      <span>${esc(b.name)}'s share</span><span>${money(s.share.p2)}</span>
      <span>Settle-up entries</span><span>${money(s.paysFrom.p1 + s.paysFrom.p2)}</span>
      <span>Net for the period</span><span>${esc(netText(s.net, true))}</span>
      <span>Balance at the end</span><span>${esc(netText(endBal, true))}</span></div>`;
}
$('#tab-balance').addEventListener('click', e => { if (e.target.closest('[data-settle]')) { const n = balanceNow(); paymentDlg({ from: n > 0 ? 'p2' : 'p1', to: n > 0 ? 'p1' : 'p2', amount: Math.abs(n) }); } });
