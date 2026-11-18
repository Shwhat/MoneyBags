'use strict';
/* MoneyBags: shared expense tracker for two people */

// ---------- constants ----------
const APP_VERSION = '1.1.0';
const BOOK_FORMAT = 1;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const clone = o => JSON.parse(JSON.stringify(o));
const natCmp = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
// money rounds to cents, halves away from zero (like Excel's ROUND), with a nudge for binary fractions such as 0.285
const r2 = v => { v = +v || 0; const a = Math.round(Math.abs(v) * 100 + 1e-7) / 100; return v < 0 ? -a : a; };
// per-user preferences (prefs.json on the server, the browser's storage without one)
const PREFS = { theme: 'light', appVersion: null, ribbon: null, dock: null, workspace: 'Entry', workspaces: {}, cmdline: false, defaultPayer: 'auto', view: 'expenses', sort: null, yearsOpen: {} };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON3 = MONTHS.map(m => m.slice(0, 3));
const DEFAULT_CATEGORIES = ['Food', 'Groceries', 'Utilities', 'Travel', 'Household', 'Other'];
const SPLITS = { Y: 'Joint (split 50/50)', N: 'Paid for the other person', P: 'Personal (nobody owes)' };
const PAYMENT_KINDS = { payment: 'Payment', credit: 'Credit', adjustment: 'Adjustment' };

// ---------- money ----------
const moneyFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function money(v, opt = {}) {
  if (v == null || v === '') return opt.blank ?? '';
  const n = r2(v); const s = '$' + moneyFmt.format(Math.abs(n));
  return n < 0 ? '-' + s : s;
}
// parseMoney: "$1,234.50", "1234.5", "(12.00)" -> number; '' -> null; anything else -> NaN
function parseMoney(s) {
  if (typeof s === 'number') return isFinite(s) ? r2(s) : NaN;
  s = String(s ?? '').trim(); if (!s) return null;
  let neg = false; if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[$,\s]/g, ''); if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
  if (!/^\d*\.?\d+$/.test(s)) return NaN;
  return r2(neg ? -parseFloat(s) : parseFloat(s));
}

// ---------- dates (always plain YYYY-MM-DD text, never time zones) ----------
const pad2 = n => String(n).padStart(2, '0');
const isoDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
let TODAY_OVERRIDE = null; // tests set this to a fixed date
const today = () => TODAY_OVERRIDE || isoDate(new Date());
const ymOf = d => (d || '').slice(0, 7);
const yearOf = d => +(d || '').slice(0, 4) || 0;
const monthOf = d => +(d || '').slice(5, 7) || 0;
const daysIn = (y, m) => new Date(y, m, 0).getDate();
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && monthOf(s) >= 1 && monthOf(s) <= 12 && +s.slice(8) >= 1 && +s.slice(8) <= daysIn(yearOf(s), monthOf(s));
function fmtDate(s) { if (!validDate(s)) return ''; return `${MON3[monthOf(s) - 1]} ${+s.slice(8)}, ${yearOf(s)}`; }
const ymLabel = ym => ym ? `${MONTHS[+ym.slice(5) - 1]} ${ym.slice(0, 4)}` : '';
const addMonths = (ym, k) => { let y = +ym.slice(0, 4), m = +ym.slice(5) + k; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return `${y}-${pad2(m)}`; };
// parseDate: accepts YYYY-MM-DD, M/D/YYYY, M/D/YY and "Nov 3, 2026"; returns YYYY-MM-DD or ''
function parseDate(s) {
  s = String(s ?? '').trim(); if (!s) return '';
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (m) { const v = `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`; return validDate(v) ? v : ''; }
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/); if (m) { const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]; const v = `${y}-${pad2(m[1])}-${pad2(m[2])}`; return validDate(v) ? v : ''; }
  m = s.match(/^([A-Za-z]{3,})\.? (\d{1,2}),? (\d{4})$/); if (m) { const i = MON3.findIndex(x => x.toLowerCase() === m[1].slice(0, 3).toLowerCase()); if (i >= 0) { const v = `${m[3]}-${pad2(i + 1)}-${pad2(m[2])}`; return validDate(v) ? v : ''; } }
  return '';
}
// Excel stores dates as days since 1899-12-30
function excelSerialDate(n) {
  n = +n; if (!isFinite(n) || n < 1 || n > 2958465) return '';
  const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86400000);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

// ---------- the book ----------
// B is the open book: everything both people share. It is saved as JSON.
let B = null;
function newBook() {
  return {
    format: BOOK_FORMAT, setup: false,
    people: [{ id: 'p1', name: 'Person 1', short: 'P' }, { id: 'p2', name: 'Person 2', short: 'Q' }],
    categories: DEFAULT_CATEGORIES.map((n, i) => ({ id: 'c' + (i + 1), name: n })),
    expenses: [], payments: [], recurring: [], recurringLog: {},
    created: today(),
  };
}
function ensureBook(b) {
  const d = newBook();
  for (const k of Object.keys(d)) if (b[k] == null) b[k] = d[k];
  if (!Array.isArray(b.people) || b.people.length !== 2) b.people = d.people;
  for (const p of b.people) { p.name = String(p.name || '').trim() || (p.id === 'p1' ? 'Person 1' : 'Person 2'); p.short = String(p.short || p.name[0] || '').trim().slice(0, 3).toUpperCase(); }
  for (const e of b.expenses) { e.id = e.id || uid(); e.vendor = e.vendor || ''; e.date = e.date || ''; e.split = SPLITS[e.split] ? e.split : ''; e.cashBack = e.cashBack ?? null; e.saved = e.saved ?? null; e.category = e.category || ''; e.notes = e.notes || ''; e.check = e.check || ''; }
  for (const p of b.payments) { p.id = p.id || uid(); p.kind = PAYMENT_KINDS[p.kind] ? p.kind : 'payment'; p.notes = p.notes || ''; }
  for (const t of b.recurring) { t.id = t.id || uid(); t.day = Math.max(1, Math.min(28, +t.day || 1)); t.active = t.active !== false; t.end = t.end || ''; t.notes = t.notes || ''; }
  return b;
}
const person = id => B.people.find(p => p.id === id);
const pname = id => (person(id) || { name: '?' }).name;
const other = id => id === 'p1' ? 'p2' : 'p1';
const catName = id => { const c = B.categories.find(c => c.id === id); return c ? c.name : ''; };
const catByName = n => B.categories.find(c => c.name.toLowerCase() === String(n || '').trim().toLowerCase());
const findExpense = id => B.expenses.find(e => e.id === id);
const findPayment = id => B.payments.find(p => p.id === id);
const findRecurring = id => B.recurring.find(t => t.id === id);
// the person the signed-in user is (matched by name), or the preference
function myPerson() {
  if (PREFS.defaultPayer === 'p1' || PREFS.defaultPayer === 'p2') return PREFS.defaultPayer;
  const u = typeof host !== 'undefined' && host.user ? host.user.name.toLowerCase() : '';
  const p = u && B.people.find(p => p.name.toLowerCase() === u || p.name.toLowerCase().split(' ')[0] === u);
  return p ? p.id : 'p1';
}
