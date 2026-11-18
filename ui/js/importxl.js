// ---------- import from the old Excel workbooks ----------
// Reads the "Expenses" sheet of each workbook: Vendor, Amount, Date, Who Paid, Joint Expense (Y/N/P/H), Amount Saved,
// Money Back from Credit Card. Rows already in the book are skipped, so importing the same file twice adds nothing.
const CAT_WORDS = [
  ['Utilities', /\b(power|water|internet|electric|garbage|sewer|utility|utilities|phone bill|pse)\b/i],
  ['Groceries', /(safeway|trader jo|h ?mart|publix|costco|fred ?meyer|fredd(y|ie)|qfc|whole foods|winco|grocer|kroger|aldi|market)/i],
  ['Travel', /(hotel|flight|airline|airbnb|rental|ticket|tour|trip|buc+-?ee|gas -|\bgas\b|parking|space center)/i],
  ['Household', /(amazon|vacuum|vaccume|target|home depot|lowe|ikea|kitchenaid|furniture)/i],
  ['Food', /(lunch|dinner|breakfast|food|sushi|pho|ramen|taco|kfc|in ?n ?out|denny|pizza|papa|kura|kbbq|coffee|starbucks|cafe|burger|mcdonald|chipotle|date night|ice cream|winery|restaurant)/i],
];
function guessCategory(vendor) {
  for (const [n, re] of CAT_WORDS) if (re.test(vendor)) { const c = catByName(n); if (c) return c.id; }
  const o = catByName('Other'); return o ? o.id : '';
}
const expKey = e => [e.date, e.vendor.trim().toLowerCase(), e.amount == null ? '' : r2(e.amount).toFixed(2), e.paidBy, e.split].join('|');
function personByLetter(v) {
  v = String(v || '').trim().toLowerCase(); if (!v) return '';
  const p = B.people.find(p => p.short.toLowerCase() === v || p.name.toLowerCase() === v || p.name.toLowerCase().split(' ')[0] === v);
  return p ? p.id : '';
}
function fileWindow(name) {
  const m = String(name).match(/([A-Za-z]{3})[ _-]?(\d{4})\s*-\s*([A-Za-z]{3})[ _-]?(\d{4})/); if (!m) return null;
  const mi = t => MON3.findIndex(x => x.toLowerCase() === t.toLowerCase()) + 1, a = mi(m[1]), b = mi(m[3]);
  if (!a || !b) return null;
  const w = [`${m[2]}-${pad2(a)}`, `${m[4]}-${pad2(b)}`]; return w[0] <= w[1] ? w : null;
}
// parseWorkbookRows: rows from readXlsx -> { items, skipped placeholders, unknown letters }
function parseWorkbookRows(rows, fileName) {
  const norm = s => String(s || '').trim().toLowerCase();
  let h = rows.findIndex(r => r && r.some(c => norm(c) === 'vendor') && r.some(c => norm(c) === 'amount'));
  const col = { vendor: 0, amount: 1, date: 3, who: 4, joint: 5, saved: 6, cash: 7 };
  if (h >= 0) rows[h].forEach((c, i) => {
    const n = norm(c);
    if (n === 'vendor') col.vendor = i; else if (n === 'amount') col.amount = i; else if (n === 'date') col.date = i; else if (n.startsWith('who paid')) col.who = i;
    else if (n.startsWith('joint')) col.joint = i; else if (n.startsWith('amount saved')) col.saved = i; else if (n.startsWith('money back') || n.startsWith('cash back')) col.cash = i;
  });
  const out = { items: [], placeholders: 0, letters: new Set() };
  // a file named like "Expense OCT2025-SEP2026" covers those months; rows dated outside them are flagged, because the
  // old Monthly Expenses sheet grouped rows by month only, so a wrong year went unnoticed there
  const win = fileWindow(fileName);
  for (let r = h + 1; r < rows.length; r++) {
    const row = rows[r] || [], cell = k => String(row[col[k]] ?? '').trim();
    const vendor = cell('vendor'), aRaw = cell('amount');
    if (!vendor && !aRaw) continue;
    const notes = [];
    let amount = aRaw === '' ? null : parseMoney(aRaw); if (Number.isNaN(amount)) { notes.push(`Amount "${aRaw}" could not be read`); amount = null; }
    const dRaw = cell('date'); let date = /^\d+(\.\d+)?$/.test(dRaw) ? excelSerialDate(dRaw) : parseDate(dRaw);
    if (!date) notes.push(dRaw ? `Date in the spreadsheet could not be read ("${dRaw}")` : 'The spreadsheet row has no date');
    const w = cell('who'), paidBy = personByLetter(w); if (w && !paidBy) out.letters.add(w);
    const j = cell('joint').toUpperCase(); let split = j === 'Y' || j === 'N' || j === 'P' ? j : '';
    if (j === 'H') { split = 'Y'; notes.push('Marked H (house) in the spreadsheet, imported as joint'); }
    else if (j && !split) notes.push(`Joint Expense "${cell('joint')}" could not be read`);
    if (amount == null && date && date > today()) { out.placeholders++; continue; }
    if (win && date && (ymOf(date) < win[0] || ymOf(date) > win[1])) notes.push(`Dated outside this workbook's months (${ymLabel(win[0])} to ${ymLabel(win[1])}). Check the year`);
    const num = k => { const v = parseMoney(cell(k)); return v == null || Number.isNaN(v) || v === 0 ? null : v; };
    out.items.push(newExpenseObj({ date, vendor, amount, cashBack: num('cash'), saved: num('saved'), paidBy, split, category: guessCategory(vendor), check: notes.join('. '), source: `${fileName}, row ${r + 1}`, addedBy: 'Excel import' }));
  }
  return out;
}
async function importExcel() {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  if (!B.setup) { flash('Enter the two names first'); setupDlg(); return; }
  const files = await pickLocalFile('.xlsx', true, true); if (!files || !files.length) return;
  const have = new Map(); for (const e of B.expenses) { const k = expKey(e); have.set(k, (have.get(k) || 0) + 1); }
  const results = [];
  for (const f of files) {
    try {
      const rows = await readXlsx(f.content, 'Expenses'), p = parseWorkbookRows(rows, f.path);
      const add = [], dup = [];
      for (const e of p.items) { const k = expKey(e); if (have.get(k) > 0) { have.set(k, have.get(k) - 1); dup.push(e); } else add.push(e); }
      results.push({ name: f.path, add, dup, placeholders: p.placeholders, letters: [...p.letters] });
    } catch (err) { results.push({ name: f.path, error: 'This file could not be read as an Excel workbook (' + err.message + ').' }); }
  }
  importPreview(results);
}
function importPreview(results) {
  const ok = results.filter(r => !r.error), add = ok.flatMap(r => r.add), review = add.filter(e => problemsOf(e).length);
  const letters = [...new Set(ok.flatMap(r => r.letters))];
  const s = statsOf(add, []);
  const body = `<table class="pv"><thead><tr><th>File</th><th class="num">New expenses</th><th class="num">Already in the book</th><th class="num">Blank future rows skipped</th><th class="num">Need review</th></tr></thead><tbody>${results.map(r => r.error ? `<tr><td>${esc(r.name)}</td><td colspan="4">${esc(r.error)}</td></tr>` : `<tr><td>${esc(r.name)}</td><td class="num">${r.add.length}</td><td class="num">${r.dup.length}</td><td class="num">${r.placeholders}</td><td class="num">${r.add.filter(e => problemsOf(e).length).length}</td></tr>`).join('')}</tbody></table>
    ${add.length ? `<div class="note">The new expenses total ${money(s.total)}. On their own they make the balance: ${esc(netText(s.owed))}.</div>` : ''}
    ${letters.length ? `<div class="note">Who Paid letters that match no one: ${esc(letters.join(', '))}. Those rows are imported with Paid by not set. The letters are set in File &gt; Book settings (now ${esc(B.people[0].short)} and ${esc(B.people[1].short)}).</div>` : ''}
    ${review.length ? `<div class="pgrp"><h4>Rows that will need review</h4><table class="pv"><tbody>${review.slice(0, 25).map(e => `<tr><td>${esc(e.vendor)}</td><td>${esc(fmtDate(e.date) || 'no date')}</td><td class="num">${e.amount == null ? 'blank' : money(e.amount)}</td><td>${esc(problemsOf(e).map(p => p.text).join('. '))}</td></tr>`).join('')}</tbody></table>${review.length > 25 ? `<div class="note">and ${review.length - 25} more.</div>` : ''}</div>` : ''}
    <div class="note">Only the Expenses sheet is read. Categories are guessed from the vendor name. Blank rows dated after today are skipped; set those bills up as recurring bills instead. Settle-up payments noted beside the Monthly Expenses sheet are not imported; record them in the Payments view.</div>`;
  if (!add.length) { tell('Import from Excel', body + '<div class="note"><b>Nothing new to import.</b></div>'); $('#dlg').style.width = '720px'; return; }
  dialog('Import from Excel', [], () => {
    commit(() => B.expenses.push(...add));
    const ys = add.filter(e => validDate(e.date)).map(e => e.date).sort(); if (ys.length) { VIEW.year = yearOf(ys[ys.length - 1]); VIEW.month = 0; }
    VIEW.kind = 'expenses'; render();
    flash(`Imported ${add.length} expense${add.length === 1 ? '' : 's'}${review.length ? `, ${review.length} in the To-do panel` : ''}`);
  }, `Import ${add.length} expense${add.length === 1 ? '' : 's'}`, body);
  $('#dlg').style.width = '720px'; $('#dlg').style.maxWidth = '96vw';
}
