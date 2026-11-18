// ---------- exports, backups and restore ----------
const csvCell = v => { const s = v == null ? '' : String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const toCSV = rows => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
const num2 = v => v == null ? '' : r2(v);
const stamp = () => today();
function expenseColumns() {
  const [a, b] = B.people;
  return [['Date', e => e.date], ['Vendor', e => e.vendor], ['Category', e => catName(e.category)], ['Paid by', e => pname(e.paidBy) === '?' ? '' : pname(e.paidBy)], ['Joint (Y/N)', e => e.split], ['Amount', e => num2(e.amount)], ['Cash back', e => num2(e.cashBack)], ['Amount saved', e => num2(e.saved)], ['Final total', e => r2(finalOf(e))], [a.name + "'s share", e => r2(sharesOf(e).p1)], [b.name + "'s share", e => r2(sharesOf(e).p2)], ['Notes', e => e.notes], ['Needs review', e => problemsOf(e).map(p => p.text).join('. ')], ['Recurring bill', e => { const t = e.recurring && findRecurring(e.recurring); return t ? t.name : ''; }], ['Added', e => e.added || ''], ['Added by', e => e.addedBy || '']];
}
const PAY_COLS = () => [['Date', p => p.date], ['From', p => pname(p.from)], ['To', p => pname(p.to)], ['Amount', p => r2(p.amount)], ['Kind', p => PAYMENT_KINDS[p.kind]], ['Notes', p => p.notes]];
const sortByDate = l => [...l].sort((x, y) => natCmp(x.date || '9999', y.date || '9999'));
async function exportCSV() {
  const c = await choose('Export expenses (CSV)', `Export the ${visibleExpenses().length} expenses shown (${periodLabel()}${filtersActive() ? ', filtered' : ''}) or all ${B.expenses.length} expenses in the book?`, [['all', 'All expenses'], ['shown', 'Expenses shown']]);
  if (!c) return;
  const l = c === 'shown' ? visibleExpenses() : sortByDate(B.expenses), cols = expenseColumns();
  const name = `moneybags-expenses-${c === 'shown' ? (VIEW.month ? `${VIEW.year}-${pad2(VIEW.month)}` : VIEW.year) : 'all'}.csv`;
  download(name, toCSV([cols.map(x => x[0])].concat(l.map(e => cols.map(x => x[1](e))))), 'text/csv');
  flash(`Exported ${l.length} expenses to ${name}`);
}
function exportPaymentsCSV() {
  const cols = PAY_COLS(), l = sortByDate(B.payments), name = `moneybags-payments-${stamp()}.csv`;
  download(name, toCSV([cols.map(x => x[0])].concat(l.map(p => cols.map(x => x[1](p))))), 'text/csv');
  flash(`Exported ${l.length} settle-up entries to ${name}`);
}
function summaryRows(year) {
  const [a, b] = B.people, T = yearTable(year), net = v => Math.abs(v) < 0.005 ? 'All square' : netText(v);
  const head = ['Month', 'Joint spending', a.name + ' paid (joint)', b.name + ' paid (joint)', `${a.name} paid for ${b.name}`, `${b.name} paid for ${a.name}`, a.name + "'s share", b.name + "'s share", 'Settle-up', 'Net for the month', 'Balance at month end'];
  const row = (l, s, end) => [l, r2(s.joint), r2(s.jointBy.p1), r2(s.jointBy.p2), r2(s.forOther.p1), r2(s.forOther.p2), r2(s.share.p1), r2(s.share.p2), r2(s.paysFrom.p1 + s.paysFrom.p2), net(s.net), net(end)];
  return [head].concat(T.rows.map(r => row(r.label, r.s, r.end)), [row(String(year), T.total, T.end)], [[], ['Carried in from ' + (year - 1), '', '', '', '', '', '', '', '', '', net(T.start)]]);
}
function exportExcel() {
  const ec = expenseColumns(), pc = PAY_COLS();
  const sheets = [
    { name: 'Expenses', rows: [ec.map(x => x[0])].concat(sortByDate(B.expenses).map(e => ec.map(x => x[1](e)))), widths: [11, 30, 14, 10, 10, 11, 10, 12, 11, 12, 12, 30, 30, 18, 11, 14] },
    { name: 'Payments', rows: [pc.map(x => x[0])].concat(sortByDate(B.payments).map(p => pc.map(x => x[1](p)))), widths: [11, 12, 12, 11, 12, 30] },
    ...bookYears().slice().reverse().map(y => ({ name: 'Summary ' + y, rows: summaryRows(y), widths: [12, 14, 16, 16, 18, 18, 14, 14, 11, 24, 24] })),
    { name: 'Recurring bills', rows: [['Bill', 'Amount', 'Paid by', 'Joint (Y/N)', 'Category', 'Day', 'First month', 'Last month', 'Active', 'Notes']].concat(B.recurring.map(t => [t.name, num2(t.amount), pname(t.paidBy), t.split, catName(t.category), t.day, t.start, t.end, t.active ? 'Yes' : 'No', t.notes])), widths: [24, 10, 10, 10, 14, 6, 11, 11, 7, 30] },
    { name: 'Categories', rows: [['Category', 'Expenses', 'Total']].concat(B.categories.map(c => { const l = B.expenses.filter(e => e.category === c.id); return [c.name, l.length, r2(l.reduce((s, e) => s + finalOf(e), 0))]; })), widths: [18, 10, 12] },
  ];
  const name = `moneybags-${stamp()}.xlsx`;
  download(name, buildXlsx(sheets), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  flash('Exported ' + name);
}
function backupJSON() { return JSON.stringify({ app: 'MoneyBags', format: BOOK_FORMAT, version: APP_VERSION, exported: new Date().toISOString(), book: B }, null, 1); }
function downloadBackup() { const n = `moneybags-backup-${stamp()}.json`; download(n, backupJSON()); flash('Downloaded ' + n); }
function bookFromBackup(text) {
  let o; try { o = JSON.parse(text); } catch (e) { return null; }
  const b = o && o.book ? o.book : o;
  return b && Array.isArray(b.expenses) && Array.isArray(b.people) ? ensureBook(b) : null;
}
async function replaceBook(b, from) {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  if (!await ask('Restore', `Replace the whole book with ${from}? It has ${b.expenses.length} expenses and ${b.payments.length} settle-up entries; the book now has ${B.expenses.length} and ${B.payments.length}. Undo can reverse this until the page is closed.`, 'Replace the book')) return;
  commit(() => { B = b; }); sel.clear(); render(); flash('Book restored from ' + from);
}
async function restoreBackup() {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  const f = await pickLocalFile('.json', false); if (!f) return;
  const b = bookFromBackup(f.content); if (!b) { tell('Restore', 'That file is not a MoneyBags backup.'); return; }
  replaceBook(b, 'the backup file ' + f.path);
}
async function restoreServerBackup() {
  if (!host.has) { flash('Server backups exist on the server version only'); return; }
  if (!canEdit()) { flash(readOnlyReason()); return; }
  let days; try { days = await api('GET', '/api/backups'); } catch (e) { tell('Server backups', esc(e.message)); return; }
  if (!days.length) { tell('Server backups', 'There are no server backups yet. The server keeps one copy of the book for each day it is saved.'); return; }
  dialog('Server backups', [], null, 'Close', `<div class="note">The server keeps the last save of each day for the last 60 days.</div><table class="pv"><tbody>${days.map(d => `<tr><td>${esc(fmtDate(d))}</td><td style="text-align:right"><button type="button" class="btn small" data-day="${esc(d)}">Restore...</button></td></tr>`).join('')}</tbody></table>`);
  $('#dlgbody').onclick = async e => {
    const btn = e.target.closest('[data-day]'); if (!btn) return;
    try { const t = await (await fetch('/api/backups/' + btn.dataset.day)).text(); const b = bookFromBackup(t); $('#dlg').close('cancel'); if (b) replaceBook(b, 'the server backup of ' + fmtDate(btn.dataset.day)); }
    catch (err) { flash('Could not read that backup: ' + err.message); }
  };
}
