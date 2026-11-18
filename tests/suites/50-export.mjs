// Exports, backups and restore
const seed = () => { commit(() => { B.expenses.push(newExpenseObj({ date: '2026-11-02', vendor: 'Safeway, "big" shop', amount: 50, paidBy: 'p1', split: 'Y', category: B.categories[1].id, cashBack: 1 }), newExpenseObj({ date: '2026-10-05', vendor: 'Gift', amount: 20, paidBy: 'p2', split: 'N' })); B.payments.push({ id: 'x', date: '2026-11-03', from: 'p2', to: 'p1', amount: 4.5, kind: 'payment', notes: 'Zelle' }); }); };
export const tests = {
  async 'expenses CSV: all or shown, quoted cells, shares'(t) {
    await t.open(); await t.eval(seed);
    const run = async which => { const w = t.page.waitForEvent('download'); await t.act('exportCSV'); await t.page.waitForTimeout(50); await t.page.click(`#dlgbtns [data-v="${which}"]`); return w; };
    let d = await run('all'); let txt = require_text(await d.path());
    const lines = txt.replace(/^﻿/, '').trim().split('\r\n');
    t.eq(lines[0].split(',').slice(0, 11), ['Date', 'Vendor', 'Category', 'Paid by', 'Joint (Y/N)', 'Amount', 'Cash back', 'Amount saved', 'Final total', "Devon's share", "Alex's share"]);
    t.eq(lines.length, 3); t.ok(lines[2].startsWith('2026-11-02,"Safeway, ""big"" shop",Groceries,Devon,Y,50,1,,49,24.5,24.5'), lines[2]);
    t.eq(d.suggestedFilename(), 'moneybags-expenses-all.csv');
    d = await run('shown'); t.eq(d.suggestedFilename(), 'moneybags-expenses-2026-11.csv');
    t.eq(require_text(await d.path()).trim().split('\r\n').length, 2);
  },
  async 'payments CSV'(t) {
    await t.open(); await t.eval(seed);
    const d = await t.download('exportPaymentsCSV');
    t.eq(d.text.replace(/^﻿/, '').trim().split('\r\n'), ['Date,From,To,Amount,Kind,Notes', '2026-11-03,Alex,Devon,4.5,Payment,Zelle']);
  },
  async 'Excel workbook has every sheet and reads back'(t) {
    await t.open(); await t.eval(seed);
    const [d] = await Promise.all([t.page.waitForEvent('download'), t.act('exportExcel')]);
    const b64 = require_b64(await d.path());
    const r = await t.eval(async b => { const by = b64Decode(b); const out = {}; for (const n of ['Expenses', 'Payments', 'Summary 2026', 'Recurring bills', 'Categories']) out[n] = await readXlsx(by, n); return out; }, b64);
    t.eq(r.Expenses.length, 3); t.eq(r.Expenses[1][1], 'Gift');
    t.eq(r.Payments[1], ['2026-11-03', 'Alex', 'Devon', '4.5', 'Payment', 'Zelle']);
    t.eq(r['Summary 2026'][10].slice(0, 2), ['October', '0']);
    t.eq(r['Summary 2026'][11].slice(9), ['Alex owes Devon $20.00', 'All square']);
    t.eq(r.Categories[2], ['Groceries', '1', '49']);
  },
  async 'backup downloads and restores, with undo'(t) {
    await t.open(); await t.eval(seed);
    const d = await t.download('downloadBackup');
    t.ok(/^moneybags-backup-\d{4}-\d{2}-\d{2}\.json$/.test(d.name));
    const o = JSON.parse(d.text); t.eq([o.app, o.book.expenses.length], ['MoneyBags', 2]);
    await t.eval(() => commit(() => { B.expenses = []; }));
    await t.withFiles([d.path], 'restoreBackup'); await t.confirm();
    t.eq(await t.eval(() => B.expenses.length), 2);
    await t.eval(() => undo()); t.eq(await t.eval(() => B.expenses.length), 0, 'undo reverses the restore');
  },
  async 'restore refuses a file that is not a backup'(t) {
    await t.open();
    await t.withFiles(['package.json'], 'restoreBackup');
    t.ok((await t.text('#dlgbody')).includes('not a MoneyBags backup'));
  },
};
import fs from 'fs';
function require_text(p) { return fs.readFileSync(p, 'utf8'); }
function require_b64(p) { return fs.readFileSync(p).toString('base64'); }
