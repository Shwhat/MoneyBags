// ---------- calculations ----------
// Every figure in MoneyBags comes from these functions, so the expense list, the summary, the charts, the balance
// panel and the exports always agree. "net" is always seen from person 1: a positive net means person 2 owes
// person 1, a negative net means person 1 owes person 2.
const finalOf = e => r2((e.amount ?? 0) - (e.cashBack ?? 0));
// what each person spent on an expense: joint expenses are split in half, "for the other person" expenses belong
// entirely to the other person, and personal expenses (and an expense with no split yet) count for the person who paid
function sharesOf(e) {
  const f = finalOf(e), p = e.paidBy, o = other(p), s = { p1: 0, p2: 0 };
  if (!person(p)) return s;
  if (e.split === 'Y') { s[p] = f / 2; s[o] = f / 2; }
  else if (e.split === 'N') s[o] = f;
  else s[p] = f;
  return s;
}
// how an expense moves the balance: the person who did not pay owes the payer their share, in whole cents (an odd
// cent on a joint expense goes to the payer), so a balance can always be settled exactly. Personal expenses never
// move the balance.
function owedOf(e) {
  if (!person(e.paidBy) || (e.split !== 'Y' && e.split !== 'N') || !validDate(e.date)) return 0;
  const f = finalOf(e), amt = r2(e.split === 'Y' ? f / 2 : f);
  return e.paidBy === 'p1' ? amt : -amt;
}
// a payment lowers what the From person owes the To person
function paidOf(p) {
  if (!person(p.from) || !person(p.to) || p.from === p.to || !validDate(p.date)) return 0;
  return p.from === 'p2' ? -(p.amount || 0) : (p.amount || 0);
}
const inPeriod = (d, per) => validDate(d) && yearOf(d) === per.year && (!per.month || monthOf(d) === per.month);
const periodEnd = per => per.month ? `${per.year}-${pad2(per.month)}-${pad2(daysIn(per.year, per.month))}` : `${per.year}-12-31`;

// problems: what makes an expense need a look. Shown as flags in the list and as items in the To-do panel.
function problemsOf(e) {
  const out = [];
  if (e.amount == null) out.push({ code: 'amount', text: 'Amount is blank' });
  if (!validDate(e.date)) out.push({ code: 'date', text: 'Date is missing' });
  if (!e.split) out.push({ code: 'split', text: 'Joint or not is not set' });
  if (!person(e.paidBy)) out.push({ code: 'payer', text: 'Who paid is not set' });
  if (e.check) out.push({ code: 'check', text: e.check });
  return out;
}

// stats for any set of expenses and payments
function statsOf(exps, pays) {
  const s = { count: exps.length, total: 0, joint: 0, jointBy: { p1: 0, p2: 0 }, forOther: { p1: 0, p2: 0 }, personal: { p1: 0, p2: 0 }, paidBy: { p1: 0, p2: 0 }, share: { p1: 0, p2: 0 }, unsplit: 0, owed: 0, payments: 0, paysFrom: { p1: 0, p2: 0 }, cats: {} };
  for (const e of exps) {
    const f = finalOf(e), sh = sharesOf(e);
    s.total += f; if (person(e.paidBy)) s.paidBy[e.paidBy] += f;
    if (e.split === 'Y') { s.joint += f; if (person(e.paidBy)) s.jointBy[e.paidBy] += f; }
    else if (e.split === 'N') { if (person(e.paidBy)) s.forOther[e.paidBy] += f; }
    else if (e.split === 'P') { if (person(e.paidBy)) s.personal[e.paidBy] += f; }
    else s.unsplit += f;
    s.share.p1 += sh.p1; s.share.p2 += sh.p2;
    s.owed += owedOf(e);
    const c = e.category || ''; s.cats[c] = (s.cats[c] || 0) + f;
  }
  for (const p of pays) { const v = paidOf(p); s.payments += v; if (person(p.from)) s.paysFrom[p.from] += p.amount || 0; }
  s.net = s.owed + s.payments;
  return s;
}
const periodExpenses = per => B.expenses.filter(e => inPeriod(e.date, per));
const periodPayments = per => B.payments.filter(p => inPeriod(p.date, per));
const periodStats = per => statsOf(periodExpenses(per), periodPayments(per));
// the balance after everything dated on or before a day (YYYY-MM-DD)
function balanceThrough(day) {
  let n = 0;
  for (const e of B.expenses) if (validDate(e.date) && e.date <= day) n += owedOf(e);
  for (const p of B.payments) if (validDate(p.date) && p.date <= day) n += paidOf(p);
  return r2(n);
}
const balanceNow = () => balanceThrough(today());
function netText(n, short) {
  n = r2(n);
  if (Math.abs(n) < 0.005) return 'All square';
  const [a, b] = n > 0 ? ['p2', 'p1'] : ['p1', 'p2'];
  return short ? `${pname(a)} owes ${money(Math.abs(n))}` : `${pname(a)} owes ${pname(b)} ${money(Math.abs(n))}`;
}
// the years shown: every year with an entry, plus the current year (so a new year starts on its own in January)
function bookYears() {
  const ys = new Set([yearOf(today())]);
  for (const e of B.expenses) if (validDate(e.date)) ys.add(yearOf(e.date));
  for (const p of B.payments) if (validDate(p.date)) ys.add(yearOf(p.date));
  return [...ys].sort((a, b) => b - a);
}
// the monthly table for a year, used by the Summary view, the charts and the Excel export
function yearTable(year) {
  const rows = [];
  for (let m = 1; m <= 12; m++) {
    const per = { year, month: m }, s = periodStats(per);
    rows.push({ month: m, label: MONTHS[m - 1], s, end: balanceThrough(periodEnd(per)) });
  }
  return { rows, total: periodStats({ year, month: 0 }), start: balanceThrough(`${year - 1}-12-31`), end: balanceThrough(`${year}-12-31`) };
}
