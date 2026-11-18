// Importing the old Excel workbooks (tests/fixtures/expenses-sample.xlsx is made-up data in the same layout)
const FIX = 'tests/fixtures/expenses-sample.xlsx';
export const tests = {
  async 'import asks for the names first'(t) {
    await t.open({ setup: false });
    t.ok(await t.eval(() => $('#dlg').open && $('#dlgtitle').textContent === 'Set up MoneyBags'), 'first run asks for the two names');
    await t.eval(() => $('#dlg').close('cancel'));
    await t.act('importExcel'); await t.page.waitForTimeout(50);
    t.eq(await t.eval(() => $('#dlgtitle').textContent), 'Set up MoneyBags');
    await t.type('#f-a', 'Devon'); await t.type('#f-b', 'Alex'); await t.confirm();
    t.eq(await t.eval(() => B.people.map(p => [p.name, p.short])), [['Devon', 'D'], ['Alex', 'A']]);
  },
  async 'preview counts, then import reads every column'(t) {
    await t.open({ today: '2026-11-17' });
    await t.withFiles([FIX], 'importExcel');
    const pv = await t.eval(() => [...document.querySelectorAll('#dlgbody table.pv')[0].querySelectorAll('tbody td')].map(c => c.textContent));
    t.eq(pv, ['expenses-sample.xlsx', '12', '0', '1', '5']);
    t.ok((await t.text('#dlgbody')).includes('Who Paid letters that match no one: Z'));
    await t.confirm();
    const got = await t.eval(() => B.expenses.map(e => [e.vendor, e.amount, e.date, e.paidBy, e.split, e.saved, e.cashBack, catName(e.category), e.check]));
    t.eq(got[0], ['Power Oct', 168.32, '2025-10-01', 'p1', 'Y', null, null, 'Utilities', '']);
    t.eq(got[1], ['Robot Vacuum', 1367.48, '2025-10-12', 'p1', 'Y', null, 50, 'Household', '']);
    t.eq(got[3], ['Freddy', 162.5, '2025-10-03', 'p2', 'Y', 12.5, null, 'Groceries', '']);
    t.eq(got[4].slice(0, 5), ['Devon Insurance Oct', 280, '2025-10-01', 'p2', 'N']);
    t.eq(got[5].slice(4, 5), ['N'], 'lower case n is read');
    t.eq(got[6].slice(4, 5), [''], 'a blank flag is left unset');
    t.eq(got[7].slice(2, 3).concat([got[7][8]]), ['', 'Date in the spreadsheet could not be read ("#VALUE!")']);
    t.eq(got[8][4], 'Y'); t.ok(got[8][8].includes('Marked H'));
    t.eq(got[9].slice(0, 2), ['Power Nov', null], 'a past blank amount is imported for review');
    t.eq(got[10].slice(0, 3), ['Water Dec 2099', 100, '2099-12-01'], 'future rows with an amount are kept');
    t.eq(got[11][3], '', 'unknown letter leaves Paid by unset');
    t.eq(await t.eval(() => B.expenses.some(e => e.vendor === 'Power Dec 2099')), false, 'blank future row skipped');
    t.eq(await t.eval(() => B.expenses[0].source), 'expenses-sample.xlsx, row 3');
    t.eq(await t.eval(() => PANEL_BADGE.todo), 5);
  },
  async 'importing the same file again adds nothing'(t) {
    await t.open({ today: '2026-11-17' });
    await t.withFiles([FIX], 'importExcel'); await t.confirm();
    await t.withFiles([FIX], 'importExcel');
    t.ok((await t.text('#dlgbody')).includes('Nothing new to import'));
    t.eq(await t.eval(() => B.expenses.length), 12);
  },
  async 'a file that is not a workbook is reported'(t) {
    await t.open();
    await t.withFiles(['package.json'], 'importExcel');
    t.ok((await t.text('#dlgbody')).includes('could not be read as an Excel workbook'));
  },
  async 'imported October matches the spreadsheet formulas'(t) {
    await t.open({ today: '2026-11-17' });
    await t.withFiles([FIX], 'importExcel'); await t.confirm();
    // Devon joint 168.32 + (1367.48 - 50 cash back) = 1485.80, Alex joint 287.50; Alex paid 280 for Devon; Devon paid 60 for Alex
    t.eq(await t.eval(() => { const s = periodStats({ year: 2025, month: 10 }); return [r2(s.jointBy.p1), r2(s.jointBy.p2), r2(s.forOther.p1), r2(s.forOther.p2), r2(s.net)]; }), [1485.8, 287.5, 60, 280, 379.15]);
  },
};
tests['rows dated outside the months in the file name are flagged'] = async t => {
  await t.open({ today: '2026-11-17' });
  await t.withFiles(['tests/fixtures/Expense OCT2025-SEP2026.xlsx'], 'importExcel'); await t.confirm();
  t.eq(await t.eval(() => B.expenses.filter(e => e.check.includes('outside')).map(e => e.vendor)), ['Water Dec 2099']);
  t.eq(await t.eval(() => fileWindow('Expense OCT2026-SEP2027.xlsx')), ['2026-10', '2027-09']);
};
