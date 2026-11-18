// The demo book uses every feature, so the guide's examples and the screens can be checked against it
export const tests = {
  async 'demo covers every feature'(t) {
    await t.open(); await t.act('demo');
    const c = await t.eval(() => ({
      joint: B.expenses.some(e => e.split === 'Y'), forOther: B.expenses.filter(e => e.split === 'N').map(e => e.paidBy).sort(), unsplit: B.expenses.some(e => !e.split),
      cash: B.expenses.some(e => e.cashBack), saved: B.expenses.some(e => e.saved), notes: B.expenses.some(e => e.notes), check: B.expenses.some(e => e.check),
      blankBill: B.expenses.some(e => e.recurring && e.amount == null), fixedBill: B.recurring.some(t => t.amount != null), kinds: [...new Set(B.payments.map(p => p.kind))].sort(),
      years: bookYears().length, cats: new Set(B.expenses.map(e => e.category)).size, future: B.expenses.some(e => e.date > today()), todo: todoItems().length,
    }));
    t.eq(c, { joint: true, forOther: ['p1', 'p2'], unsplit: true, cash: true, saved: true, notes: true, check: true, blankBill: true, fixedBill: true, kinds: ['adjustment', 'credit', 'payment'], years: 2, cats: 6, future: true, todo: 3 });
  },
  async 'every view draws the demo without errors'(t) {
    await t.open(); await t.act('demo');
    for (const v of ['viewExpenses', 'viewPayments', 'viewRecurring', 'viewSummary', 'viewCharts']) { await t.act(v); await t.act('wholeYear'); }
    await t.act('themeDark'); await t.act('viewCharts');
    t.ok(await t.eval(() => document.querySelectorAll('#work svg').length === 3));
  },
};
