// ---------- adding and changing entries ----------
const who = () => host.user ? host.user.name : '';
function newExpenseObj(o) {
  return Object.assign({ id: uid(), date: today(), vendor: '', amount: null, cashBack: null, saved: null, paidBy: myPerson(), split: 'Y', category: '', notes: '', check: '', added: today(), addedBy: who() }, o);
}
function newExpense() {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  if (VIEW.kind !== 'expenses') setView('expenses');
  const v = $('#en-vendor'); if (v) { v.focus(); v.select(); v.scrollIntoView({ block: 'nearest' }); }
}
function addFromEntry() {
  const amount = parseMoney(ENTRY.amount), cash = parseMoney(ENTRY.cash), vendor = ENTRY.vendor.trim();
  if (!vendor && amount == null) { flash('Type a vendor or an amount first'); $('#en-vendor').focus(); return; }
  if (Number.isNaN(amount)) { flash('The amount must be a number, like 12.50'); $('#en-amount').focus(); return; }
  if (Number.isNaN(cash)) { flash('Cash back must be a number, like 1.25'); $('#en-cash').focus(); return; }
  if (!validDate(ENTRY.date)) { flash('Enter a date for the expense'); $('#en-date').focus(); return; }
  const e = newExpenseObj({ date: ENTRY.date, vendor, amount, cashBack: cash, paidBy: ENTRY.payer, split: ENTRY.split, category: ENTRY.cat, notes: ENTRY.notes.trim() });
  if (document.activeElement) document.activeElement.blur(); // let the field finish its own change before the row is cleared
  if (!commit(() => B.expenses.push(e))) return;
  Object.assign(ENTRY, { vendor: '', amount: '', cash: '', notes: '', cat: '' });
  sel = new Set([e.id]); anchor = e.id;
  // the new expense may be outside the period on screen
  if (!inPeriod(e.date, curPeriod())) { VIEW.year = yearOf(e.date); VIEW.month = VIEW.month ? monthOf(e.date) : 0; ENTRY.per = ''; }
  render();
  const v = $('#en-vendor'); if (v) v.focus();
  flash(`Added ${vendor || 'expense'} ${amount == null ? '(no amount yet)' : money(amount)}`);
}
function addPaymentFromEntry() {
  const amount = parseMoney(PENTRY.amount);
  if (amount == null || Number.isNaN(amount) || amount <= 0) { flash('Enter an amount above zero, like 250.00'); $('#pe-amount').focus(); return; }
  if (!validDate(PENTRY.date)) { flash('Enter a date'); $('#pe-date').focus(); return; }
  if (PENTRY.from === PENTRY.to) { flash('From and To must be different people'); return; }
  const p = { id: uid(), date: PENTRY.date, from: PENTRY.from, to: PENTRY.to, amount, kind: PENTRY.kind, notes: PENTRY.notes.trim(), added: today(), addedBy: who() };
  if (document.activeElement) document.activeElement.blur();
  if (!commit(() => B.payments.push(p))) return;
  Object.assign(PENTRY, { amount: '', notes: '' });
  render(); const a = $('#pe-amount'); if (a) a.focus();
  flash(`Recorded ${money(amount)} from ${pname(p.from)} to ${pname(p.to)}`);
}
function paymentDlg(pre = {}) {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  const n = balanceNow(), from = pre.from || (n > 0 ? 'p2' : n < 0 ? 'p1' : myPerson());
  dialog('Settle-up payment', [['date', 'Date', pre.date || today(), 'date'], ['from', 'From', from, 'select', personOpts()], ['to', 'To', pre.to || other(from), 'select', personOpts()], ['amount', 'Amount', pre.amount ? r2(pre.amount).toFixed(2) : ''], ['kind', 'Kind', pre.kind || 'payment', 'select', Object.entries(PAYMENT_KINDS)], ['notes', 'Notes', pre.notes || '']], v => {
    const amount = parseMoney(v.amount);
    if (amount == null || Number.isNaN(amount) || amount <= 0) { flash('Enter an amount above zero, like 250.00'); return false; }
    if (!validDate(v.date)) { flash('Enter a date'); return false; }
    if (v.from === v.to) { flash('From and To must be different people'); return false; }
    commit(() => B.payments.push({ id: uid(), date: v.date, from: v.from, to: v.to, amount, kind: v.kind, notes: v.notes, added: today(), addedBy: who() }));
    flash(`Recorded ${money(amount)} from ${pname(v.from)} to ${pname(v.to)}. ${netText(balanceNow())}`);
  }, 'Record', `<div class="note">The entry lowers what From owes To. Balance today: ${esc(netText(n))}. Payment, Credit and Adjustment all work the same way; the kind is a label for your records.</div>`);
}

// ---------- recurring bills ----------
function recurringDlg(t) {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  const isNew = !t; t = t || { name: '', amount: null, paidBy: myPerson(), split: 'Y', category: '', day: 1, start: ymOf(today()), end: '', active: true, notes: '' };
  dialog(isNew ? 'New recurring bill' : 'Recurring bill', [['name', 'Bill name', t.name], ['amount', 'Amount (blank: enter each month)', t.amount == null ? '' : t.amount.toFixed(2)], ['paidBy', 'Paid by', t.paidBy, 'select', personOpts()], ['split', 'Split', t.split, 'select', splitOpts().filter(o => o[0])], ['category', 'Category', t.category, 'select', catOpts()], ['day', 'Day of the month (1 to 28)', String(t.day), 'number'], ['start', 'First month', t.start, 'month'], ['end', 'Last month (blank: no end)', t.end, 'month'], ['active', 'Active', t.active, 'check'], ['notes', 'Notes', t.notes]], v => {
    const amount = parseMoney(v.amount), day = parseInt(v.day, 10);
    if (!v.name) { flash('Give the bill a name, like Power'); return false; }
    if (Number.isNaN(amount)) { flash('The amount must be a number, or blank'); return false; }
    if (!(day >= 1 && day <= 28)) { flash('The day must be from 1 to 28'); return false; }
    if (!/^\d{4}-\d{2}$/.test(v.start)) { flash('Choose the first month'); return false; }
    if (v.end && (!/^\d{4}-\d{2}$/.test(v.end) || v.end < v.start)) { flash('The last month must be on or after the first month'); return false; }
    const o = { name: v.name, amount, paidBy: v.paidBy, split: v.split, category: v.category, day, start: v.start, end: v.end, active: v.active, notes: v.notes };
    let added = 0;
    commit(() => { if (isNew) { t = Object.assign({ id: uid() }, o); B.recurring.push(t); } else Object.assign(t, o); added = addDueBills(); });
    if (isNew && VIEW.kind === 'recurring') { sel = new Set([t.id]); render(); }
    flash(`${isNew ? 'Added' : 'Saved'} ${v.name}${added ? `. ${added} expense${added === 1 ? '' : 's'} added` : ''}`);
  }, isNew ? 'Add bill' : 'Save', '<div class="note">One expense is added for every month from the first month through the current month, on the chosen day. Future months are added when they arrive. An expense deleted from the list is not added again.</div>');
}
// addDueBills: run inside a commit. Adds every missing monthly expense up to the current month; returns how many.
function addDueBills() {
  const cur = ymOf(today()); let n = 0;
  for (const t of B.recurring) {
    if (!t.active || !/^\d{4}-\d{2}$/.test(t.start || '')) continue;
    for (let ym = t.start; ym <= cur && (!t.end || ym <= t.end); ym = addMonths(ym, 1)) {
      const key = `${t.id}:${ym}`; if (B.recurringLog[key]) continue;
      B.recurringLog[key] = today();
      B.expenses.push(newExpenseObj({ date: `${ym}-${pad2(t.day)}`, vendor: t.name, amount: t.amount, paidBy: t.paidBy, split: t.split, category: t.category, notes: t.notes, recurring: t.id, addedBy: 'Recurring bill' }));
      n++;
    }
  }
  return n;
}
function dueBillCount() { let n = 0; const cur = ymOf(today()); for (const t of B.recurring) if (t.active && /^\d{4}-\d{2}$/.test(t.start || '')) for (let ym = t.start; ym <= cur && (!t.end || ym <= t.end); ym = addMonths(ym, 1)) if (!B.recurringLog[`${t.id}:${ym}`]) n++; return n; }
function runRecurring() {
  if (!canEdit() || !B || !dueBillCount()) return;
  let n = 0; commit(() => { n = addDueBills(); }); if (n) flash(`Added ${n} recurring bill${n === 1 ? '' : 's'} for this month`);
}

// ---------- selection commands ----------
const selExpenses = () => [...sel].map(findExpense).filter(Boolean);
function needSel(what = 'rows') { if (!sel.size) { flash(`Select ${what} first`); return false; } return true; }
function dupSel() {
  if (!needSel()) return;
  if (VIEW.kind === 'expenses') {
    const copies = selExpenses().map(e => Object.assign(clone(e), { id: uid(), check: '', recurring: undefined, added: today(), addedBy: who() }));
    if (commit(() => B.expenses.push(...copies))) { sel = new Set(copies.map(c => c.id)); render(); flash(`Duplicated ${copies.length} expense${copies.length === 1 ? '' : 's'}`); }
  } else if (VIEW.kind === 'payments') {
    const copies = [...sel].map(findPayment).filter(Boolean).map(p => Object.assign(clone(p), { id: uid(), added: today(), addedBy: who() }));
    if (commit(() => B.payments.push(...copies))) { sel = new Set(copies.map(c => c.id)); render(); flash(`Duplicated ${copies.length} entr${copies.length === 1 ? 'y' : 'ies'}`); }
  } else flash('Duplicate works on expenses and payments');
}
async function delSel() {
  if (!needSel()) return;
  if (!canEdit()) { flash(readOnlyReason()); return; }
  const ids = new Set(sel);
  if (VIEW.kind === 'recurring') {
    const ts = [...ids].map(findRecurring).filter(Boolean);
    if (!await ask('Delete recurring bill', `Delete ${ts.length === 1 ? 'the recurring bill ' + ts[0].name : ts.length + ' recurring bills'}? Expenses already added stay in the list.`, 'Delete')) return;
    sel.clear(); commit(() => { B.recurring = B.recurring.filter(t => !ids.has(t.id)); for (const k of Object.keys(B.recurringLog)) if (ids.has(k.split(':')[0])) delete B.recurringLog[k]; });
  } else {
    const list = VIEW.kind === 'payments' ? 'payments' : 'expenses', n = B[list].filter(x => ids.has(x.id)).length;
    if (!n) return;
    if (n > 1 && !await ask('Delete', `Delete ${n} ${list === 'payments' ? 'settle-up entries' : 'expenses'}?`, 'Delete')) return;
    sel.clear(); commit(() => { B[list] = B[list].filter(x => !ids.has(x.id)); });
    flash(`Deleted ${n} ${list === 'payments' ? (n === 1 ? 'entry' : 'entries') : (n === 1 ? 'expense' : 'expenses')}. Ctrl+Z brings ${n === 1 ? 'it' : 'them'} back.`);
  }
  sel.clear(); render();
}
function bulkEdit() {
  if (VIEW.kind !== 'expenses' || !needSel('expenses')) return;
  const n = selExpenses().length, keep = [['__keep', '(keep as is)']];
  dialog(`Change ${n} expense${n === 1 ? '' : 's'}`, [['category', 'Category', '__keep', 'select', keep.concat(catOpts())], ['paidBy', 'Paid by', '__keep', 'select', keep.concat(personOpts())], ['split', 'Split', '__keep', 'select', keep.concat(splitOpts().filter(o => o[0]))]], v => {
    commit(() => { for (const e of selExpenses()) for (const k of ['category', 'paidBy', 'split']) if (v[k] !== '__keep') e[k] = v[k]; });
    flash(`Changed ${n} expense${n === 1 ? '' : 's'}`);
  }, 'Change');
}
function markReviewed() {
  if (VIEW.kind !== 'expenses' || !needSel('expenses')) return;
  const l = selExpenses().filter(e => e.check); if (!l.length) { flash('None of the selected expenses is marked as needs review'); return; }
  commit(() => { for (const e of l) e.check = ''; }); flash(`Marked ${l.length} reviewed`);
}
function flagReview() {
  if (VIEW.kind !== 'expenses' || !needSel('expenses')) return;
  const l = selExpenses();
  dialog('Needs review', [['why', 'Reason', l.length === 1 && l[0].check ? l[0].check : 'Check this expense']], v => {
    if (!v.why) { flash('Type a short reason'); return false; }
    commit(() => { for (const e of l) e.check = v.why; }); flash(`Marked ${l.length} as needs review`);
  }, 'Mark', '<div class="note">The reason shows in the To-do panel until someone marks the expense reviewed.</div>');
}
function findFocus() { if (VIEW.kind !== 'expenses') setView('expenses'); const q = $('#f-q'); if (q) { q.focus(); q.select(); } }
function clearFilters() { Object.assign(FILT, { q: '', cat: '', payer: '', split: '', review: false }); render(); flash('Filters cleared'); }
function newCategory() {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  dialog('New category', [['name', 'Category name', '']], v => {
    if (!v.name) { flash('Type a name'); return false; }
    if (catByName(v.name)) { flash('That category already exists'); return false; }
    commit(() => B.categories.push({ id: 'c' + uid(), name: v.name })); flash('Added category ' + v.name);
  }, 'Add');
}
function editSelected() {
  if (!sel.size) return;
  if (VIEW.kind === 'recurring' && sel.size === 1) { recurringDlg(findRecurring([...sel][0])); return; }
  showPanel('props'); renderProps();
  const f = $('#props input:not([type=checkbox]), #props select'); if (f) { f.focus(); if (f.select) f.select(); }
}

// ---------- Properties panel ----------
function prow(label, html) { return `<div class="prow"><label>${esc(label)}</label>${html}</div>`; }
const pin = (f, v, attrs = '') => `<input data-pf="${f}" value="${esc(v ?? '')}" ${attrs} ${canEdit() ? '' : 'disabled'}>`;
const psel = (f, opts, v) => `<select data-pf="${f}" ${canEdit() ? '' : 'disabled'}>${optHTML(opts, v)}</select>`;
function renderProps() {
  const el = $('#props'); if (!el) return;
  const ids = [...sel];
  const l = VIEW.kind === 'expenses' ? ids.map(findExpense).filter(Boolean) : [];
  if (l.length) {
    if (l.length === 1) {
      const e = l[0], sh = sharesOf(e), ow = owedOf(e), t = e.recurring && findRecurring(e.recurring);
      el.innerHTML = `<div class="ident">${esc(e.vendor || '(no vendor)')}</div><div class="sub">${esc(fmtDate(e.date) || 'No date')}, ${e.amount == null ? 'no amount yet' : money(finalOf(e))}</div>
        <div class="pgrp"><h4>Expense</h4>${prow('Date', pin('date', e.date, 'type="date"'))}${prow('Vendor', pin('vendor', e.vendor))}${prow('Amount', pin('amount', e.amount == null ? '' : e.amount.toFixed(2), 'placeholder="blank"'))}${prow('Cash back', pin('cashBack', e.cashBack == null ? '' : e.cashBack.toFixed(2), 'placeholder="0.00"'))}${prow('Amount saved', pin('saved', e.saved == null ? '' : e.saved.toFixed(2), 'placeholder="0.00"'))}${prow('Category', psel('category', catOpts(), e.category))}${prow('Notes', `<textarea data-pf="notes" ${canEdit() ? '' : 'disabled'}>${esc(e.notes)}</textarea>`)}</div>
        <div class="pgrp"><h4>Split</h4>${prow('Paid by', psel('paidBy', [['', 'Not set']].concat(personOpts()), e.paidBy))}${prow('Split', psel('split', splitOpts(), e.split))}
          ${prow('Final total', `<span>${money(finalOf(e))}</span>`)}${prow(B.people[0].name + "'s share", `<span>${money(sh.p1)}</span>`)}${prow(B.people[1].name + "'s share", `<span>${money(sh.p2)}</span>`)}
          ${prow('Balance effect', `<span>${ow ? esc(`${pname(ow > 0 ? 'p2' : 'p1')} owes ${pname(ow > 0 ? 'p1' : 'p2')} ${money(Math.abs(ow))}`) : 'None'}</span>`)}</div>
        <div class="pgrp"><h4>Review</h4>${prow('Needs review', `<input type="checkbox" data-pf="checkOn" ${e.check ? 'checked' : ''} ${canEdit() ? '' : 'disabled'}>`)}${e.check ? prow('Reason', pin('check', e.check)) : ''}
          ${problemsOf(e).filter(p => p.code !== 'check').map(p => `<div class="note">${esc(p.text)}.</div>`).join('')}</div>
        <div class="pgrp"><h4>Record</h4>${prow('Added', `<span>${esc(fmtDate(e.added) || 'Unknown')}${e.addedBy ? ' by ' + esc(e.addedBy) : ''}</span>`)}${t ? prow('Recurring bill', `<a href="#" class="lnk" data-editbill="${t.id}">${esc(t.name)}</a>`) : ''}${e.source ? prow('Imported from', `<span title="${esc(e.source)}">${esc(e.source)}</span>`) : ''}</div>`;
      return;
    }
    const tot = l.reduce((s, e) => s + finalOf(e), 0), keep = [['__keep', '(mixed)']];
    const same = k => l.every(e => e[k] === l[0][k]) ? l[0][k] : '__keep';
    el.innerHTML = `<div class="ident">${l.length} expenses</div><div class="sub">Total ${money(tot)}</div><div class="pgrp"><h4>Change all selected</h4>${prow('Category', psel('category', keep.concat(catOpts()), same('category')))}${prow('Paid by', psel('paidBy', keep.concat(personOpts()), same('paidBy')))}${prow('Split', psel('split', keep.concat(splitOpts().filter(o => o[0])), same('split')))}</div><div class="note">A change here applies to every selected expense.</div>`;
    return;
  }
  if (VIEW.kind === 'payments' && ids.length === 1 && findPayment(ids[0])) {
    const p = findPayment(ids[0]);
    el.innerHTML = `<div class="ident">${esc(PAYMENT_KINDS[p.kind])} of ${money(p.amount)}</div><div class="sub">${esc(fmtDate(p.date))}, ${esc(pname(p.from))} to ${esc(pname(p.to))}</div>
      <div class="pgrp"><h4>Settle-up entry</h4>${prow('Date', pin('date', p.date, 'type="date"'))}${prow('From', psel('from', personOpts(), p.from))}${prow('To', psel('to', personOpts(), p.to))}${prow('Amount', pin('amount', (p.amount || 0).toFixed(2)))}${prow('Kind', psel('kind', Object.entries(PAYMENT_KINDS), p.kind))}${prow('Notes', `<textarea data-pf="notes" ${canEdit() ? '' : 'disabled'}>${esc(p.notes)}</textarea>`)}</div>
      <div class="note">${esc(pname(p.from))} owes ${esc(pname(p.to))} ${money(p.amount)} less because of this entry.</div>`;
    return;
  }
  if (VIEW.kind === 'recurring' && ids.length === 1 && findRecurring(ids[0])) {
    const t = findRecurring(ids[0]), n = B.expenses.filter(e => e.recurring === t.id).length;
    el.innerHTML = `<div class="ident">${esc(t.name)}</div><div class="sub">${t.amount == null ? 'Amount entered each month' : money(t.amount) + ' a month'}, day ${t.day}</div>
      <div class="pgrp"><h4>Recurring bill</h4>${prow('Bill name', pin('name', t.name))}${prow('Amount', pin('amount', t.amount == null ? '' : t.amount.toFixed(2), 'placeholder="enter each month"'))}${prow('Paid by', psel('paidBy', personOpts(), t.paidBy))}${prow('Split', psel('split', splitOpts().filter(o => o[0]), t.split))}${prow('Category', psel('category', catOpts(), t.category))}${prow('Day', pin('day', t.day, 'type="number" min="1" max="28"'))}${prow('First month', pin('start', t.start, 'type="month"'))}${prow('Last month', pin('end', t.end, 'type="month"'))}${prow('Active', `<input type="checkbox" data-pf="active" ${t.active ? 'checked' : ''} ${canEdit() ? '' : 'disabled'}>`)}${prow('Notes', pin('notes', t.notes))}</div>
      <div class="note">${n} expense${n === 1 ? '' : 's'} added so far. Next: ${esc(fmtDate(nextBillDate(t)) || 'none')}. Changes apply to months added from now on; expenses already added keep their values.</div>`;
    return;
  }
  el.innerHTML = `<div class="note" style="margin:4px 0 0">${VIEW.kind === 'expenses' || VIEW.kind === 'payments' || VIEW.kind === 'recurring' ? 'Select a row to see and change it here. Select several expenses to change them together.' : 'The Properties panel shows the selected row in the Expenses, Payments and Recurring bills views.'}</div>`;
}
$('#props').addEventListener('click', e => { const b = e.target.closest('[data-editbill]'); if (b) { e.preventDefault(); setView('recurring'); sel = new Set([b.dataset.editbill]); render(); } });
$('#props').addEventListener('change', e => {
  const f = e.target.dataset.pf; if (!f) return;
  const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value.trim();
  const ids = [...sel];
  const bad = msg => { flash(msg); renderProps(); };
  if (VIEW.kind === 'expenses') {
    const l = ids.map(findExpense).filter(Boolean); if (!l.length) return;
    if (l.length > 1) { if (val === '__keep') return; commit(() => { for (const x of l) x[f] = val; }); flash(`Changed ${l.length} expenses`); return; }
    const x = l[0];
    if (f === 'amount' || f === 'cashBack' || f === 'saved') { const n = parseMoney(val); if (Number.isNaN(n)) return bad('Enter a number, like 12.50, or leave it blank'); commit(() => { x[f] = n; }); return; }
    if (f === 'date') { if (!validDate(val)) return bad('Enter a full date'); commit(() => { x.date = val; }); return; }
    if (f === 'checkOn') { commit(() => { x.check = val ? (x.check || 'Check this expense') : ''; }); return; }
    if (f === 'check') { commit(() => { x.check = val; }); return; }
    commit(() => { x[f] = val; });
  } else if (VIEW.kind === 'payments') {
    const p = findPayment(ids[0]); if (!p) return;
    if (f === 'amount') { const n = parseMoney(val); if (n == null || Number.isNaN(n) || n <= 0) return bad('Enter an amount above zero'); commit(() => { p.amount = n; }); return; }
    if (f === 'date') { if (!validDate(val)) return bad('Enter a full date'); commit(() => { p.date = val; }); return; }
    if ((f === 'from' || f === 'to') && val === p[f === 'from' ? 'to' : 'from']) { commit(() => { p[f === 'from' ? 'to' : 'from'] = p[f]; p[f] = val; }); return; }
    commit(() => { p[f] = val; });
  } else if (VIEW.kind === 'recurring') {
    const t = findRecurring(ids[0]); if (!t) return;
    if (f === 'amount') { const n = parseMoney(val); if (Number.isNaN(n)) return bad('Enter a number, or leave it blank'); commit(() => { t.amount = n; }); return; }
    if (f === 'day') { const d = parseInt(val, 10); if (!(d >= 1 && d <= 28)) return bad('The day must be from 1 to 28'); commit(() => { t.day = d; }); return; }
    if (f === 'name' && !val) return bad('The bill needs a name');
    if (f === 'start' && !/^\d{4}-\d{2}$/.test(val)) return bad('Choose the first month');
    if (f === 'end' && val && val < t.start) return bad('The last month must be on or after the first month');
    let n = 0; commit(() => { t[f] = val; n = addDueBills(); }); if (n) flash(`Added ${n} expense${n === 1 ? '' : 's'} for this bill`);
  }
});
