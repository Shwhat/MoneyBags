// Checks on the source itself: script order, banned characters, the About guide and its coverage
import fs from 'fs';
import path from 'path';
const read = (t, p) => fs.readFileSync(path.join(t.root, p), 'utf8');
function walk(dir, out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (['node_modules', 'build', '.git'].includes(e.name)) continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; }
export const tests = {
  async 'manifest lists every script once and files.js last'(t) {
    const names = read(t, 'ui/manifest.txt').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
    const files = fs.readdirSync(path.join(t.root, 'ui/js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f).sort();
    t.eq([...names].sort(), files); t.eq(new Set(names).size, names.length); t.eq(names[names.length - 1], 'js/files.js');
  },
  async 'no em dashes anywhere'(t) {
    const bad = walk(t.root).filter(p => /\.(js|mjs|go|md|html|css|yml|py|json|txt)$|Dockerfile|\.env\.example$/.test(p) && !p.endsWith('package-lock.json')).filter(p => fs.readFileSync(p, 'utf8').includes('\u2014'));
    t.eq(bad.map(p => path.relative(t.root, p)), []);
  },
  async 'versions agree'(t) {
    const v = read(t, 'ui/js/core.js').match(/APP_VERSION = '([^']+)'/)[1];
    t.eq(JSON.parse(read(t, 'package.json')).version, v, 'package.json');
    const lock = JSON.parse(read(t, 'package-lock.json')); t.eq([lock.version, lock.packages[''].version], [v, v], 'package-lock.json');
    const notes = fs.readdirSync(path.join(t.root, 'ui/about')).sort().pop();
    t.ok(/release-notes\.md$/.test(notes), 'release notes are the last page');
    t.eq(read(t, 'ui/about/' + notes).match(/^## (\S+) \(/m)[1], v, 'newest release note');
    t.ok(read(t, 'docs/HANDOFF.md').includes('Version: ' + v), 'handoff version');
  },
  async 'about pages: numbering, titles and links'(t) {
    const files = fs.readdirSync(path.join(t.root, 'ui/about')).sort();
    t.ok(files.every(f => /^\d{2}-[a-z0-9-]+\.md$/.test(f)), 'file names');
    t.eq(files.map(f => +f.slice(0, 2)), files.map((_, i) => i + 1), 'numbered 01, 02, ... in order');
    const slugs = new Set(files.map(f => f.slice(3, -3)));
    for (const f of files) {
      const body = read(t, 'ui/about/' + f);
      t.ok(/^# .+/.test(body), f + ' starts with one # heading'); t.eq((body.match(/^# /gm) || []).length, 1, f + ' has one # heading');
      for (const m of body.matchAll(/\]\(\/about\/([^)]+)\)/g)) t.ok(slugs.has(m[1]), `${f} links to missing page ${m[1]}`);
    }
    const ov = read(t, 'ui/about/01-overview.md');
    for (const s of slugs) if (s !== 'overview') t.ok(ov.includes('(/about/' + s + ')'), 'overview lists ' + s);
  },
  async 'the guide documents every menu item, button, panel, setting and shortcut'(t) {
    await t.open();
    const missing = await t.eval(() => {
      const guide = ABOUT_PAGES.map(p => p.body).join('\n'), out = [];
      const need = (s, where) => { if (s && !guide.includes(s)) out.push(where + ': ' + s); };
      for (const [m, items] of Object.entries(MENUS)) for (const i of items) if (i !== '-') need(typeof i[0] === 'function' ? i[0]().replace(/^[✓ ]+/, '') : i[0], 'menu ' + m);
      for (const c of Object.values(CMDS)) need(c[0], 'ribbon');
      for (const tb of DEFAULT_RIBBON) { need(tb.name, 'ribbon tab'); for (const g of tb.groups) need(g.name, 'ribbon group'); }
      for (const p of Object.values(PANELS)) need(p.title, 'panel');
      for (const n of PRESET_NAMES) need(n, 'workspace');
      for (const k of Object.values(PAYMENT_KINDS)) need(k, 'payment kind');
      for (const n of DEFAULT_CATEGORIES) need(n, 'category');
      for (const v of Object.values(VIEWS)) need(v, 'view');
      for (const [, rows] of SHORTCUTS) for (const [k, d] of rows) { need(k, 'shortcut'); need(d, 'shortcut text'); }
      for (const s of ['All changes saved', 'Saving...', 'Changes waiting to save', 'Saved in this browser', 'Read-only', 'Demo: not saved']) need(s, 'status');
      return out;
    });
    t.eq(missing, []);
  },
};
