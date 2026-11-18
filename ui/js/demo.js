// ---------- demo book ----------
// Help > Open the demo book shows a made-up book that uses every feature. Nothing in it is saved, and closing it
// returns to the real book exactly as it was. tests/suites/05-demo.mjs checks that the demo covers every feature.
let REAL = null;
function buildDemo() {
  const b = ensureBook(newBook()); const t = today(), y = yearOf(t), m = monthOf(t);
  b.setup = true; b.people = [{ id: 'p1', name: 'Sam', short: 'S' }, { id: 'p2', name: 'Riley', short: 'R' }];
  const c = n => b.categories.find(x => x.name === n).id;
  const day = (mo, d) => { const ym = addMonths(`${y}-${pad2(m)}`, mo); return `${ym}-${pad2(Math.min(d, daysIn(+ym.slice(0, 4), +ym.slice(5))))}`; };
  const E = (mo, d, vendor, amount, paidBy, split, cat, o = {}) => b.expenses.push(Object.assign({ id: uid(), date: day(mo, d), vendor, amount: amount == null ? null : r2(amount), cashBack: null, saved: null, paidBy, split, category: c(cat), notes: '', check: '', added: t, addedBy: 'Demo' }, o));
  E(-13, 4, 'Safeway', 142.18, 'p1', 'Y', 'Groceries');
  E(-13, 19, 'Concert tickets', 160, 'p2', 'Y', 'Other');
  for (let k = -5; k <= 0; k++) {
    E(k, 2, 'Trader Joes', 96.4 + k * 3, k % 2 ? 'p1' : 'p2', 'Y', 'Groceries');
    E(k, 9, 'Pho', 41.5, 'p2', 'Y', 'Food');
    E(k, 15, 'Costco', 212.75 - k * 5, 'p1', 'Y', 'Groceries', { cashBack: 4.25, saved: 18 });
    E(k, 22, 'Date night', 78 + k, 'p1', 'Y', 'Food');
  }
  E(-4, 11, 'Hotel, coast trip', 389, 'p2', 'Y', 'Travel', { notes: 'Two nights' });
  E(-3, 6, 'Robot vacuum', 329.99, 'p1', 'Y', 'Household', { cashBack: 16.5 });
  E(-2, 12, "Riley's car insurance", 140, 'p1', 'N', 'Other', { notes: 'Sam paid it for Riley' });
  E(-1, 18, "Sam's phone repair", 89, 'p2', 'N', 'Other');
  E(0, 3, 'Farmers market', 36, 'p2', '', 'Groceries');
  E(0, 5, 'Hardware store', 64.2, 'p1', 'Y', 'Household', { check: 'Was this for the shared garden? Check the receipt.' });
  b.recurring.push({ id: 'demopower', name: 'Power', amount: null, paidBy: 'p1', split: 'Y', category: c('Utilities'), day: 1, start: addMonths(`${y}-${pad2(m)}`, -5), end: '', active: true, notes: 'Amount changes every month' });
  b.recurring.push({ id: 'demonet', name: 'Internet', amount: 85, paidBy: 'p2', split: 'Y', category: c('Utilities'), day: 1, start: addMonths(`${y}-${pad2(m)}`, -5), end: '', active: true, notes: '' });
  B = b; addDueBills();
  // the power bills from earlier months have their amounts filled in; this month's is still blank
  b.expenses.filter(e => e.recurring === 'demopower' && ymOf(e.date) < ymOf(t)).forEach((e, i) => { e.amount = r2(118 + i * 9.4); });
  b.payments.push({ id: uid(), date: day(-3, 28), from: 'p2', to: 'p1', amount: 250, kind: 'payment', notes: 'Zelle', added: t, addedBy: 'Demo' });
  b.payments.push({ id: uid(), date: day(-1, 27), from: 'p1', to: 'p2', amount: 40, kind: 'credit', notes: 'Riley sold Sam\'s old bike', added: t, addedBy: 'Demo' });
  b.payments.push({ id: uid(), date: day(-13, 1), from: 'p2', to: 'p1', amount: 12.5, kind: 'adjustment', notes: 'Opening balance from the old spreadsheet', added: t, addedBy: 'Demo' });
  return b;
}
async function toggleDemo() {
  if (DEMO) {
    DEMO = false; B = REAL.B; undoStack = REAL.undo; redoStack = REAL.redo; dirty = REAL.dirty; REAL = null;
    sel.clear(); Object.assign(FILT, { q: '', cat: '', payer: '', split: '', review: false }); VIEW.year = yearOf(today()); VIEW.month = monthOf(today());
    render(); flash('Closed the demo book'); return;
  }
  if (dirty && host.has && !host.readOnly) await host.save();
  REAL = { B, undo: undoStack, redo: redoStack, dirty };
  DEMO = true; undoStack = []; redoStack = []; dirty = false; sel.clear();
  Object.assign(FILT, { q: '', cat: '', payer: '', split: '', review: false });
  buildDemo(); VIEW.year = yearOf(today()); VIEW.month = monthOf(today());
  render(); flash('Demo book opened. Changes are not saved. Help > Close the demo book returns to your book.');
}
