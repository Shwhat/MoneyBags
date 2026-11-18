// Adding, editing, selecting, filtering and deleting expenses
export const tests = {
  async 'entry row adds an expense and keeps date, payer and split for the next one'(t) {
    await t.open();
    await t.addExpense({ date: '2026-11-03', vendor: 'Safeway', cat: 'Groceries', payer: 'p2', split: 'Y', amount: '42.10' });
    t.eq(await t.eval(() => B.expenses.map(e => [e.date, e.vendor, e.amount, e.paidBy, e.split, catName(e.category)])), [['2026-11-03', 'Safeway', 42.1, 'p2', 'Y', 'Groceries']]);
    t.eq(await t.eval(() => [document.activeElement.id, $('#en-vendor').value, ENTRY.vendor, $('#en-date').value, $('#en-payer').value]), ['en-vendor', '', '', '2026-11-03', 'p2'], 'cursor back in vendor, date and payer kept');
    await t.addExpense({ vendor: 'Pho', amount: '$1,020.50' });
    t.eq(await t.eval(() => B.expenses[1].amount), 1020.5, 'money text is read');
    t.ok((await t.text('#st-msg')).includes('Added Pho'), 'flash confirms');
  },
  async 'entry row checks the amount and the vendor'(t) {
    await t.open();
    await t.addExpense({ vendor: '', amount: '' });
    t.eq(await t.eval(() => B.expenses.length), 0);
    t.ok((await t.text('#st-msg')).includes('Type a vendor'), 'asks for a vendor');
    await t.addExpense({ vendor: 'Bad', amount: 'twelve' });
    t.eq(await t.eval(() => B.expenses.length), 0);
    t.ok((await t.text('#st-msg')).includes('must be a number'));
  },
  async 'a vendor used before brings its category'(t) {
    await t.open();
    await t.addExpense({ vendor: 'Costco', cat: 'Household', amount: '10' });
    await t.page.fill('#en-vendor', 'costco'); await t.page.dispatchEvent('#en-vendor', 'change');
    t.eq(await t.eval(() => catName($('#en-cat').value)), 'Household');
  },
  async 'N key goes to the entry row; escape clears it'(t) {
    await t.open();
    await t.eval(() => document.activeElement.blur());
    await t.key('n');
    t.eq(await t.eval(() => document.activeElement.id), 'en-vendor');
    await t.page.keyboard.type('Draft'); await t.key('Escape');
    t.eq(await t.eval(() => ENTRY.vendor), '');
  },
  async 'click, ctrl+click, shift+click, arrows and select all'(t) {
    await t.open();
    for (const v of ['A1', 'A2', 'A3', 'A4']) await t.addExpense({ date: '2026-11-0' + v[1], vendor: v, amount: '10' });
    await t.eval(() => { sel.clear(); renderSel(); });
    const row = n => `#work tr[data-row]:nth-of-type(${n})`;
    await t.click(row(1)); t.eq(await t.eval(() => sel.size), 1);
    await t.page.click(row(3), { modifiers: ['Shift'] }); t.eq(await t.eval(() => sel.size), 3, 'shift selects a range');
    await t.page.click(row(2), { modifiers: ['Control'] }); t.eq(await t.eval(() => sel.size), 2, 'ctrl removes one');
    await t.click(row(1)); await t.key('ArrowDown'); t.eq(await t.eval(() => findExpense([...sel][0]).vendor), 'A2');
    await t.key('Shift+ArrowDown'); t.eq(await t.eval(() => sel.size), 2);
    await t.key('Control+a'); t.eq(await t.eval(() => sel.size), 4);
    t.eq(await t.eval(() => [...document.querySelectorAll('.rtab')].map(x => x.textContent)), ['Home', 'Data', 'View', 'Help', 'Selection'], 'Selection tab appears');
    t.eq(await t.eval(() => $('.rtab.active').textContent), 'Selection');
  },
  async 'properties panel edits one expense and validates'(t) {
    await t.open();
    await t.addExpense({ date: '2026-11-05', vendor: 'Target', amount: '50' });
    await t.click('#work tr[data-row]');
    await t.page.fill('#props [data-pf="amount"]', '60.25'); await t.page.dispatchEvent('#props [data-pf="amount"]', 'change');
    await t.page.fill('#props [data-pf="cashBack"]', '0.25'); await t.page.dispatchEvent('#props [data-pf="cashBack"]', 'change');
    await t.page.selectOption('#props [data-pf="split"]', 'N');
    t.eq(await t.eval(() => [B.expenses[0].amount, B.expenses[0].cashBack, finalOf(B.expenses[0]), B.expenses[0].split]), [60.25, 0.25, 60, 'N']);
    await t.page.fill('#props [data-pf="amount"]', 'abc'); await t.page.dispatchEvent('#props [data-pf="amount"]', 'change');
    t.eq(await t.eval(() => B.expenses[0].amount), 60.25, 'bad number is refused');
    await t.page.check('#props [data-pf="checkOn"]');
    t.eq(await t.eval(() => problemsOf(B.expenses[0]).map(p => p.code)), ['check']);
  },
  async 'change selected, mark reviewed, needs review'(t) {
    await t.open();
    for (const v of ['X', 'Y']) await t.addExpense({ vendor: v, amount: '5' });
    await t.key('Escape'); await t.eval(() => { sel = new Set(B.expenses.map(e => e.id)); render(); });
    await t.act('bulkEdit'); await t.page.selectOption('#f-category', { label: 'Travel' }); await t.page.selectOption('#f-paidBy', 'p2'); await t.confirm();
    t.eq(await t.eval(() => B.expenses.map(e => [catName(e.category), e.paidBy, e.split])), [['Travel', 'p2', 'Y'], ['Travel', 'p2', 'Y']]);
    await t.act('flagReview'); await t.type('#f-why', 'Receipt missing'); await t.confirm();
    t.eq(await t.eval(() => B.expenses.map(e => e.check)), ['Receipt missing', 'Receipt missing']);
    t.eq(await t.eval(() => PANEL_BADGE.todo), 2);
    await t.act('markReviewed'); t.eq(await t.eval(() => B.expenses.map(e => e.check)), ['', '']);
  },
  async 'filters, search and sort'(t) {
    await t.open();
    await t.addExpense({ date: '2026-11-02', vendor: 'Safeway', cat: 'Groceries', amount: '30' });
    await t.addExpense({ date: '2026-11-01', vendor: 'Pho', cat: 'Food', payer: 'p2', amount: '20' });
    await t.addExpense({ date: '2026-11-03', vendor: 'Gift', cat: 'Other', payer: 'p1', split: 'N', amount: '15' });
    const shown = () => t.eval(() => visibleExpenses().map(e => e.vendor));
    t.eq(await shown(), ['Pho', 'Safeway', 'Gift'], 'date order');
    await t.click('th[data-sort="amount"]'); t.eq(await shown(), ['Gift', 'Pho', 'Safeway']);
    await t.click('th[data-sort="amount"]'); t.eq(await shown(), ['Safeway', 'Pho', 'Gift'], 'second click reverses');
    await t.page.fill('#f-q', 'saf'); t.eq(await shown(), ['Safeway']);
    t.eq(await t.eval(() => document.activeElement.id), 'f-q', 'search keeps the cursor');
    await t.page.fill('#f-q', ''); await t.page.selectOption('#f-payer', 'p2'); t.eq(await shown(), ['Pho']);
    await t.act('clearFilters'); await t.page.selectOption('#f-split', 'N'); t.eq(await shown(), ['Gift']);
    await t.act('clearFilters'); await t.page.selectOption('#f-cat', { label: 'Groceries' }); t.eq(await shown(), ['Safeway']);
  },
  async 'delete asks for several, undo and redo bring it back, duplicate copies'(t) {
    await t.open();
    for (const v of ['One', 'Two']) await t.addExpense({ vendor: v, amount: '7' });
    await t.eval(() => { sel = new Set([B.expenses[0].id]); render(); document.activeElement.blur(); });
    await t.key('Control+d'); t.eq(await t.eval(() => B.expenses.map(e => e.vendor)), ['One', 'Two', 'One']);
    await t.eval(() => { sel = new Set([B.expenses[0].id]); render(); });
    await t.key('Delete'); t.eq(await t.eval(() => B.expenses.length), 2, 'one row deletes at once');
    await t.key('Control+z'); t.eq(await t.eval(() => B.expenses.length), 3);
    await t.key('Control+y'); t.eq(await t.eval(() => B.expenses.length), 2);
    await t.eval(() => { sel = new Set(B.expenses.map(e => e.id)); render(); });
    await t.act('delSel'); await t.page.waitForTimeout(50); t.ok(await t.eval(() => $('#dlg').open), 'asks first');
    await t.confirm(); t.eq(await t.eval(() => B.expenses.length), 0);
  },
  async 'an expense saves in the browser and comes back after a reload'(t) {
    await t.open();
    await t.addExpense({ vendor: 'Kept', amount: '3' });
    await t.page.waitForTimeout(900);
    await t.open();
    t.eq(await t.eval(() => B.expenses.map(e => e.vendor)), ['Kept']);
  },
};
