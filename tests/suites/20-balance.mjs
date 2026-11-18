// The money math: shares, the balance, the monthly table, settle-up entries
const book = () => {
  const E = (date, vendor, amount, paidBy, split, cashBack = null) => ({ id: uid(), date, vendor, amount, cashBack, saved: null, paidBy, split, category: '', notes: '', check: '' });
  B.expenses = [
    // October 2025 of the old spreadsheet, shortened: Devon paid 2041.14 joint, Alex 584.55 joint
    E('2025-10-01', 'Power Oct', 2041.14, 'p1', 'Y'), E('2025-10-11', 'Lunch', 584.55, 'p2', 'Y'),
    // November: Alex paid Devon's insurance (N), Devon paid joint with cash back
    E('2025-11-01', 'Devon insurance', 280, 'p2', 'N'), E('2025-11-05', 'Safeway', 100.5, 'p1', 'Y', 0.5),
    E('2025-11-07', 'No split yet', 40, 'p1', ''), E('2025-12-31', 'Future', 10, 'p1', 'Y'),
  ];
  B.payments = [{ id: uid(), date: '2025-11-20', from: 'p2', to: 'p1', amount: 700, kind: 'payment', notes: '' }];
  render();
};
export const tests = {
  async 'joint splits in half, N belongs to the other person, cash back comes off'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    t.eq(await t.eval(() => B.expenses.map(e => [finalOf(e), sharesOf(e).p1, sharesOf(e).p2, r2(owedOf(e))])), [
      [2041.14, 1020.57, 1020.57, 1020.57], [584.55, 292.275, 292.275, -292.28], [280, 280, 0, -280], [100, 50, 50, 50], [40, 40, 0, 0], [10, 5, 5, 5]]);
  },
  async 'October matches the old Monthly Expenses sheet (Alex owes Devon 728.29)'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    const s = await t.eval(() => { const s = periodStats({ year: 2025, month: 10 }); return [r2(s.joint), r2(s.jointBy.p1), r2(s.jointBy.p2), r2(s.net), netText(s.net)]; });
    t.eq(s, [2625.69, 2041.14, 584.55, 728.29, 'Alex owes Devon $728.29']);
  },
  async 'balance today ignores later entries and counts payments'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    // 728.29 (Oct) - 280 (N) + 50 (Nov joint) - 700 (Alex paid Devon) = -201.71
    t.eq(await t.eval(() => [balanceNow(), netText(balanceNow()), balanceThrough('2025-12-31')]), [-201.71, 'Devon owes Alex $201.71', -196.71]);
    t.ok((await t.text('#st-bal')).includes('Devon owes Alex $201.71'), 'status bar shows the balance');
    t.ok((await t.text('#tab-balance')).includes('Entries dated after today change this to'), 'balance panel notes future entries');
  },
  async 'summary table: months, totals, carried-in balance'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    await t.eval(() => { VIEW.year = 2025; VIEW.month = 0; setView('summary'); });
    const rows = await t.eval(() => [...document.querySelectorAll('#sumtable tbody tr')].map(r => [...r.children].map(c => c.textContent.trim())));
    t.eq(rows[9], ['October', '$2,625.69', '$2,041.14', '$584.55', '-', '-', '-', '-', '$1,312.85', '$1,312.85', '-', 'Alex owes $728.29', 'Alex owes $728.29']);
    t.eq(rows[10], ['November', '$100.00', '$100.00', '-', '-', '$280.00', '-', '-', '$370.00', '$50.00', '$700.00', 'Devon owes $930.00', 'Devon owes $201.71']);
    t.eq(rows[12][0], '2025'); t.eq(rows[12][1], '$2,735.69');
    t.ok((await t.text('#work')).includes('Carried in from 2024: All square'));
    t.ok((await t.text('#work')).includes('has no split set yet'), 'notes unsplit spending');
  },
  async 'settle-up payment from the balance panel'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    await t.click('[data-settle]'); await t.page.waitForTimeout(50);
    t.eq(await t.eval(() => [$('#f-from').value, $('#f-to').value, $('#f-amount').value]), ['p1', 'p2', '201.71']);
    await t.confirm();
    t.eq(await t.eval(() => netText(balanceNow())), 'All square');
  },
  async 'payments view entry row, swapping from and to, kinds'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    await t.act('viewPayments');
    await t.page.fill('#pe-date', '2025-11-25'); await t.page.selectOption('#pe-from', 'p1');
    t.eq(await t.eval(() => $('#pe-to').value), 'p2', 'To follows From');
    await t.page.fill('#pe-amount', '1.71'); await t.page.selectOption('#pe-kind', 'credit'); await t.page.fill('#pe-notes', 'Cash'); await t.page.focus('#pe-amount'); await t.key('Enter');
    t.eq(await t.eval(() => B.payments.map(p => [p.from, p.to, p.amount, p.kind, p.notes])), [['p2', 'p1', 700, 'payment', ''], ['p1', 'p2', 1.71, 'credit', 'Cash']]);
    t.eq(await t.eval(() => balanceNow()), -200);
    await t.page.fill('#pe-amount', '-5'); await t.page.focus('#pe-amount'); await t.key('Enter');
    t.eq(await t.eval(() => B.payments.length), 2, 'negative amounts are refused');
  },
  async 'P key opens the settle-up dialog and checks the amount'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book); await t.eval(() => document.activeElement.blur());
    await t.key('p'); await t.page.waitForFunction(() => $('#dlg').open);
    await t.type('#f-amount', 'abc'); await t.click('#dlgbtns .primary'); await t.page.waitForTimeout(100); await t.page.waitForFunction(() => $('#dlg').open);
    t.eq(await t.eval(() => $('#f-amount').value), 'abc', 'dialog opens again with what was typed');
    await t.type('#f-amount', '10'); await t.confirm();
    t.eq(await t.eval(() => B.payments.length), 2);
  },
  async 'personal (P) counts for the payer and never moves the balance'(t) {
    await t.open({ today: '2025-11-30' }); await t.eval(book);
    const before = await t.eval(() => balanceNow());
    await t.eval(() => commit(() => B.expenses.push(newExpenseObj({ date: '2025-11-10', vendor: 'Haircut', amount: 45, cashBack: 5, paidBy: 'p2', split: 'P' }))));
    t.eq(await t.eval(() => { const e = B.expenses[B.expenses.length - 1]; return [sharesOf(e), owedOf(e), problemsOf(e).length]; }), [{ p1: 0, p2: 40 }, 0, 0]);
    t.eq(await t.eval(() => balanceNow()), before, 'balance unchanged');
    t.eq(await t.eval(() => { const s = periodStats({ year: 2025, month: 11 }); return [s.personal.p1, s.personal.p2, r2(s.share.p2), r2(s.joint)]; }), [0, 40, 90, 100.5 - 0.5]);
    await t.eval(() => { VIEW.year = 2025; VIEW.month = 11; setView('summary'); });
    const nov = await t.eval(() => [...document.querySelectorAll('#sumtable tbody tr')][10].children[7].textContent);
    t.eq(nov, '$40.00', "Alex personal column");
    t.ok((await t.text('#tab-balance')).includes('Alex personal$40.00'));
    await t.eval(() => setView('expenses')); await t.page.selectOption('#f-split', 'P');
    t.eq(await t.eval(() => visibleExpenses().map(e => e.vendor)), ['Haircut']);
    t.ok(await t.eval(() => !!document.querySelector('#exptable .pill.p')), 'P pill shows');
  },
  async 'net text and money formatting'(t) {
    await t.open();
    t.eq(await t.eval(() => [money(1234.5), money(-3), money(null), parseMoney('(12.00)'), parseMoney('$1,000'), parseMoney(''), Number.isNaN(parseMoney('x')), netText(0.004), netText(-5, true)]), ['$1,234.50', '-$3.00', '', -12, 1000, null, true, 'All square', 'Devon owes $5.00']);
    t.eq(await t.eval(() => [parseDate('3/7/2026'), parseDate('2026-2-30'), parseDate('Nov 3, 2026'), excelSerialDate(46022), excelSerialDate('6686173')]), ['2026-03-07', '', '2026-11-03', '2025-12-31', '']);
  },
};
