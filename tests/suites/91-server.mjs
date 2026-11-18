// Builds and starts the real server with an empty data folder, then drives two browsers against it
import { execFileSync, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function withServer(t, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-')), bin = path.join(dir, 'moneybags');
  execFileSync('go', ['build', '-o', bin, '.'], { cwd: t.root });
  const port = 18000 + Math.floor(Math.random() * 2000);
  const p = spawn(bin, [], { env: { ...process.env, MONEYBAGS_ADDR: '127.0.0.1:' + port, MONEYBAGS_DATA: path.join(dir, 'data') }, stdio: 'ignore' });
  try {
    for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/healthz`)).ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 100)); }
    await fn(`http://127.0.0.1:${port}`, dir);
  } finally { p.kill(); }
}
async function signUp(page, base, name) {
  await page.goto(base + '/');
  await page.waitForURL(/\/login$/);
  if (!(await page.evaluate(() => document.querySelector('#tabs button[data-t="up"]').classList.contains('on')))) await page.click('#tabs button[data-t="up"]');
  await page.fill('#name', name); await page.fill('#pw', 'password123'); await page.fill('#pw2', 'password123');
  await page.click('#go');
  await page.waitForFunction(() => typeof B !== 'undefined' && B && B.expenses, null, { timeout: 8000 });
  await page.waitForTimeout(300);
}
export const tests = {
  async 'two people: sign up, save, read-only while the other edits'(t) {
    await withServer(t, async (base, dir) => {
      const page = t.page;
      await signUp(page, base, 'devon');
      t.ok(await page.evaluate(() => $('#dlg').open && $('#dlgtitle').textContent === 'Set up MoneyBags'), 'first run asks for names');
      t.eq(await page.inputValue('#f-a'), 'Devon', 'first name comes from the account');
      await page.fill('#f-b', 'Alex'); await page.click('#dlgbtns .primary');
      await page.fill('#en-vendor', 'Safeway'); await page.fill('#en-amount', '40'); await page.press('#en-amount', 'Enter');
      await page.waitForFunction(() => !dirty && !host.saving, null, { timeout: 5000 });
      t.eq(await page.textContent('#st-save'), 'All changes saved');
      t.ok(fs.readFileSync(path.join(dir, 'data', 'book.json'), 'utf8').includes('Safeway'), 'book.json written');
      t.eq(fs.readdirSync(path.join(dir, 'data', 'backups')).length, 1, 'daily backup written');
      await page.reload(); await page.waitForFunction(() => B && B.expenses.length === 1);
      t.eq(await page.evaluate(() => [B.people[1].name, B.expenses[0].vendor, B.expenses[0].addedBy]), ['Alex', 'Safeway', 'devon']);

      const ctx2 = await page.context().browser().newContext(); const p2 = await ctx2.newPage(); p2.setDefaultTimeout(8000);
      await signUp(p2, base, 'alex');
      t.eq(await p2.evaluate(() => [host.readOnly, host.lockedBy, !!$('#en-vendor'), myPerson()]), [true, 'devon', false, 'p2']);
      t.ok((await p2.textContent('#docname')).includes('Read-only while devon edits'));
      await page.evaluate(() => host.unlock());
      await p2.evaluate(() => host.lock(false)); await p2.waitForTimeout(300);
      t.eq(await p2.evaluate(() => [host.readOnly, !!$('#en-vendor'), B.expenses.length]), [false, true, 1]);
      t.eq(await p2.evaluate(() => $('#en-payer').value), 'p2', 'Alex pays by default');
      await p2.evaluate(async () => { await api('POST', '/api/logout'); });
      await ctx2.close();
    });
  },
};
