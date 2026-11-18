// MoneyBags test runner.
// Assembles ui/ into one page (same as the server does), opens it in headless Chromium and runs every suite.
// Usage: npm test            (all suites)
//        npm test -- import  (only suites whose file name contains "import")
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
function loadPlaywright() {
  for (const p of ['playwright', '/opt/npm-tools/node_modules/playwright']) { try { return require(p); } catch (e) {} }
  console.error('Playwright is not installed. Run: npm install'); process.exit(2);
}
const { chromium } = loadPlaywright();
export const TEST_TODAY = '2026-11-17';

class Tester {
  constructor(page, root, url) { this.page = page; this.root = root; this.url = url; }
  // open the app with a fixed date and an empty browser store; setup: false keeps the first-run dialog
  async open(o = {}) {
    await this.page.goto(this.url + '?today=' + (o.today || TEST_TODAY) + (o.hash || ''));
    await this.page.waitForFunction(() => typeof B !== 'undefined' && B && B.expenses);
    await this.page.waitForTimeout(80);
    if (o.setup !== false) await this.page.evaluate(() => { if ($('#dlg').open) $('#dlg').close('cancel'); B.people[0].name = 'Devon'; B.people[0].short = 'D'; B.people[1].name = 'Alex'; B.people[1].short = 'A'; B.setup = true; render(); });
  }
  eval(fn, arg) { return this.page.evaluate(fn, arg); }
  eq(actual, expected, msg = '') {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    if (a !== e) throw new Error(`${msg}\n  expected ${e}\n  got      ${a}`);
  }
  ok(v, msg = 'expected true') { if (!v) throw new Error(msg); }
  key(k) { return this.page.keyboard.press(k); }
  type(sel, text) { return this.page.fill(sel, text); }
  click(sel) { return this.page.click(sel); }
  // press the dialog's main button and wait until its close handler has run
  async confirm() { await this.page.click('#dlgbtns .primary'); await this.page.waitForFunction(() => !$('#dlg').open); await this.page.waitForTimeout(30); }
  async enter() { await this.key('Enter'); await this.page.waitForFunction(() => !$('#dlg').open); await this.page.waitForTimeout(30); }
  act(name) { return this.page.evaluate(n => { ACTIONS[n](); }, name); }
  text(sel) { return this.page.$eval(sel, e => e.textContent); }
  // run an action that opens a file picker and answer it with these files (paths relative to the repository)
  async withFiles(files, action) {
    const [fc] = await Promise.all([this.page.waitForEvent('filechooser'), this.act(action)]);
    await fc.setFiles(files.map(f => path.isAbsolute(f) ? f : path.join(this.root, f)));
    await this.page.waitForTimeout(250);
  }
  // run an action that downloads a file; returns { name, text, path }
  async download(action) {
    const [d] = await Promise.all([this.page.waitForEvent('download'), this.act(action)]);
    const p = await d.path(); return { name: d.suggestedFilename(), path: p, text: fs.readFileSync(p, 'utf8') };
  }
  // add an expense through the entry row, the way a person types it
  async addExpense(o) {
    if (o.date) await this.page.fill('#en-date', o.date);
    await this.page.fill('#en-vendor', o.vendor || '');
    if (o.cat) await this.page.selectOption('#en-cat', { label: o.cat });
    if (o.payer) await this.page.selectOption('#en-payer', o.payer);
    if (o.split) await this.page.selectOption('#en-split', o.split);
    await this.page.fill('#en-amount', o.amount == null ? '' : String(o.amount));
    if (o.cash != null) await this.page.fill('#en-cash', String(o.cash));
    await this.page.focus('#en-amount'); await this.key('Enter'); await this.page.waitForTimeout(40);
  }
}

function aboutJS() {
  const dir = path.join(ROOT, 'ui', 'about');
  const pages = fs.readdirSync(dir).filter(f => /^\d+-.+\.md$/.test(f)).sort().map(f => {
    const body = fs.readFileSync(path.join(dir, f), 'utf8'), m = body.match(/^# (.+)$/m);
    return { slug: f.replace(/^\d+-/, '').replace(/\.md$/, ''), title: m ? m[1].trim() : f, body };
  });
  return '// ---------- About guide pages (built from ui/about/*.md when the page is assembled) ----------\nconst ABOUT_PAGES = ' + JSON.stringify(pages) + ';\n';
}
export function assemble() {
  const ui = n => fs.readFileSync(path.join(ROOT, 'ui', n), 'utf8');
  const names = ui('manifest.txt').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
  const js = (aboutJS() + names.map(ui).join('\n') + '\n').replace(/<\/script/g, '<\\/script').replace(/<script/g, '<\\x73cript');
  return ui('index.html').replace('/*CSS*/', () => ui('style.css')).replace('/*JS*/', () => js);
}

const out = path.join(ROOT, 'build', 'test.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, assemble());
const URL = pathToFileURL(out).href;

const filter = process.argv[2] || '';
const dir = path.join(ROOT, 'tests', 'suites');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mjs') && f.includes(filter)).sort();

const browser = await chromium.launch();
let pass = 0, fail = 0;
const failures = [];
for (const f of files) {
  const suite = await import(pathToFileURL(path.join(dir, f)).href);
  for (const [name, fn] of Object.entries(suite.tests)) {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, acceptDownloads: true });
    const page = await ctx.newPage(); page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => (d.type() === 'prompt' ? d.accept(t.promptAnswer || 'X') : d.accept()));
    const t = new Tester(page, ROOT, URL);
    try {
      await Promise.race([fn(t), new Promise((_, rej) => setTimeout(() => rej(new Error('test took longer than 40 seconds')), 40000))]);
      if (errors.length) throw new Error('page error: ' + errors.join(' | '));
      pass++; process.stdout.write(`  ok    ${f.replace('.mjs', '')}: ${name}\n`);
    } catch (e) {
      fail++; failures.push(`${f}: ${name}\n        ${e.message.split('\n').join('\n        ')}`);
      process.stdout.write(`  FAIL  ${f.replace('.mjs', '')}: ${name}\n`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) { console.log('\nFailures:\n  ' + failures.join('\n  ')); process.exit(1); }
