// Recurring bills
export const tests = {
  async 'a new bill fills in every month from its first month through this month'(t) {
    await t.open({ today: '2026-11-17' });
    await t.act('newRecurring');
    await t.type('#f-name', 'Internet'); await t.type('#f-amount', '185'); await t.page.selectOption('#f-category', { label: 'Utilities' });
    await t.type('#f-start', '2026-09'); await t.confirm();
    t.eq(await t.eval(() => B.expenses.map(e => [e.date, e.vendor, e.amount, catName(e.category), !!e.recurring])), [['2026-09-01', 'Internet', 185, 'Utilities', true], ['2026-10-01', 'Internet', 185, 'Utilities', true], ['2026-11-01', 'Internet', 185, 'Utilities', true]]);
    t.ok((await t.text('#st-msg')).includes('3 expenses added'));
  },
  async 'a bill with no amount is added blank and lands in the To-do panel'(t) {
    await t.open({ today: '2026-11-17' });
    await t.act('newRecurring'); await t.type('#f-name', 'Power'); await t.type('#f-start', '2026-11'); await t.type('#f-day', '5'); await t.confirm();
    t.eq(await t.eval(() => B.expenses.map(e => [e.date, e.amount])), [['2026-11-05', null]]);
    t.eq(await t.eval(() => PANEL_BADGE.todo), 1);
    t.ok((await t.text('#tab-todo')).includes('Amount is blank'));
  },
  async 'deleted bills stay deleted; new months arrive; last month stops it'(t) {
    await t.open({ today: '2026-11-17' });
    await t.eval(() => { commit(() => { B.recurring.push({ id: 'r1', name: 'Gym', amount: 30, paidBy: 'p1', split: 'N', category: '', day: 3, start: '2026-10', end: '2026-12', active: true, notes: '' }); addDueBills(); }); });
    t.eq(await t.eval(() => B.expenses.length), 2);
    await t.eval(() => { commit(() => { B.expenses.shift(); }); runRecurring(); });
    t.eq(await t.eval(() => B.expenses.length), 1, 'a deleted month is not added again');
    await t.eval(() => { TODAY_OVERRIDE = '2027-02-02'; runRecurring(); });
    t.eq(await t.eval(() => B.expenses.map(e => e.date)), ['2026-11-03', '2026-12-03'], 'stops after the last month');
  },
  async 'paused bills add nothing; the list shows the next date'(t) {
    await t.open({ today: '2026-11-17' });
    await t.eval(() => { commit(() => { B.recurring.push({ id: 'r1', name: 'Water', amount: 100, paidBy: 'p2', split: 'Y', category: '', day: 1, start: '2027-01', end: '', active: true, notes: '' }, { id: 'r2', name: 'Paused', amount: 5, paidBy: 'p2', split: 'Y', category: '', day: 1, start: '2026-01', end: '', active: false, notes: '' }); addDueBills(); }); setView('recurring'); });
    t.eq(await t.eval(() => B.expenses.length), 0);
    const rows = await t.eval(() => [...document.querySelectorAll('#rectable tbody tr')].map(r => [...r.children].map(c => c.textContent.trim())));
    t.eq(rows[0][9], 'Jan 1, 2027'); t.eq(rows[1][0], 'Paused Paused'); t.eq(rows[1][9], 'None');
  },
  async 'properties panel edits a bill; delete asks first and keeps added expenses'(t) {
    await t.open({ today: '2026-11-17' });
    await t.eval(() => { commit(() => { B.recurring.push({ id: 'r1', name: 'Water', amount: 100, paidBy: 'p2', split: 'Y', category: '', day: 1, start: '2026-11', end: '', active: true, notes: '' }); addDueBills(); }); setView('recurring'); });
    await t.click('#rectable tr[data-row]');
    await t.page.fill('#props [data-pf="amount"]', '110'); await t.page.dispatchEvent('#props [data-pf="amount"]', 'change');
    await t.page.fill('#props [data-pf="start"]', '2026-09'); await t.page.dispatchEvent('#props [data-pf="start"]', 'change');
    t.eq(await t.eval(() => B.expenses.map(e => [e.date, e.amount]).sort()), [['2026-09-01', 110], ['2026-10-01', 110], ['2026-11-01', 100]]);
    await t.act('delSel'); await t.page.waitForTimeout(50); await t.confirm();
    t.eq(await t.eval(() => [B.recurring.length, B.expenses.length, Object.keys(B.recurringLog).length]), [0, 3, 0]);
  },
};
