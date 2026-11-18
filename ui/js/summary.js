// ---------- Summary view ----------
// The monthly table follows the old "Monthly Expenses" sheet: joint spending, who paid it, what each person paid
// for the other, and who owes whom. It adds each person's share, settle-up entries and the running balance.
function statTile(lbl, val, sub) { return `<div class="stat"><div class="lbl">${esc(lbl)}</div><div class="val">${val}</div>${sub ? `<div class="note sub">${sub}</div>` : ''}</div>`; }
function summaryHTML() {
  const [a, b] = B.people, y = VIEW.year, T = yearTable(y), per = curPeriod(), s = periodStats(per), n = balanceNow();
  const tiles = statTile('Balance today', n ? money(Math.abs(n)) : '$0.00', esc(netText(n))) +
    statTile(`Joint spending, ${periodLabel()}`, money(s.joint), `${esc(a.name)} paid ${money(s.jointBy.p1)}, ${esc(b.name)} paid ${money(s.jointBy.p2)}`) +
    statTile(`${a.name}'s share`, money(s.share.p1), `${esc(periodLabel())}`) + statTile(`${b.name}'s share`, money(s.share.p2), `${esc(periodLabel())}`) +
    statTile('Personal', money(s.personal.p1 + s.personal.p2), `${esc(a.name)} ${money(s.personal.p1)}, ${esc(b.name)} ${money(s.personal.p2)}`) +
    statTile('Net for the period', esc(Math.abs(s.net) < 0.005 ? '$0.00' : money(Math.abs(s.net))), esc(netText(s.net)));
  const cell = v => `<td class="num">${Math.abs(v) < 0.005 ? '<span class="muted">-</span>' : money(v)}</td>`;
  const netCell = v => `<td>${Math.abs(v) < 0.005 ? '<span class="muted">All square</span>' : esc(netText(v, true))}</td>`;
  const rows = T.rows.map(r => `<tr class="row${VIEW.month === r.month ? ' on cur' : ''}" data-month="${r.month}" title="Show ${r.label}"><td>${r.label}</td>${cell(r.s.joint)}${cell(r.s.jointBy.p1)}${cell(r.s.jointBy.p2)}${cell(r.s.forOther.p1)}${cell(r.s.forOther.p2)}${cell(r.s.personal.p1)}${cell(r.s.personal.p2)}${cell(r.s.share.p1)}${cell(r.s.share.p2)}${cell(r.s.paysFrom.p1 + r.s.paysFrom.p2)}${netCell(r.s.net)}${netCell(r.end)}</tr>`).join('');
  const t = T.total;
  const cats = Object.entries(periodStats(per).cats).sort((x, z) => z[1] - x[1]);
  const pe = periodExpenses(per), catTot = Math.abs(cats.reduce((u, c) => u + c[1], 0)) || 1;
  const catRows = cats.map(([c, v]) => { const l = pe.filter(e => (e.category || '') === c), sa = l.reduce((u, e) => u + sharesOf(e).p1, 0), sb = l.reduce((u, e) => u + sharesOf(e).p2, 0); return `<tr class="row" data-cat="${esc(c || '-')}" title="Show these expenses"><td>${esc(catName(c) || 'No category')}</td><td class="num">${l.length}</td><td class="num">${money(v)}</td><td class="num">${money(sa)}</td><td class="num">${money(sb)}</td><td class="num">${Math.round(v / catTot * 100)}%</td></tr>`; }).join('');
  return `<div class="sumgrid">${tiles}</div>
    <div class="card"><div class="cardhead">Month by month, ${y}<span class="note">Carried in from ${y - 1}: ${esc(netText(T.start))}. Click a month to open it.</span></div>
    <div style="overflow:auto"><table class="grid sum" id="sumtable"><thead><tr><th>Month</th><th class="num" title="Joint spending (Y)">Joint</th><th class="num" title="Joint spending paid by ${esc(a.name)}">${esc(a.name)} paid</th><th class="num" title="Joint spending paid by ${esc(b.name)}">${esc(b.name)} paid</th><th class="num" title="${esc(a.name)} paid for ${esc(b.name)} (N)">${esc(a.name)} for ${esc(b.name)}</th><th class="num" title="${esc(b.name)} paid for ${esc(a.name)} (N)">${esc(b.name)} for ${esc(a.name)}</th><th class="num" title="${esc(a.name)}'s personal spending (P)">${esc(a.name)} personal</th><th class="num" title="${esc(b.name)}'s personal spending (P)">${esc(b.name)} personal</th><th class="num">${esc(a.name)}'s share</th><th class="num">${esc(b.name)}'s share</th><th class="num" title="Payments, credits and adjustments">Settle-up</th><th title="Net for the month">Net</th><th title="Balance at the end of the month">Balance</th></tr></thead>
    <tbody>${rows}<tr class="total"><td>${y}</td>${cell(t.joint)}${cell(t.jointBy.p1)}${cell(t.jointBy.p2)}${cell(t.forOther.p1)}${cell(t.forOther.p2)}${cell(t.personal.p1)}${cell(t.personal.p2)}${cell(t.share.p1)}${cell(t.share.p2)}${cell(t.paysFrom.p1 + t.paysFrom.p2)}${netCell(t.net)}${netCell(T.end)}</tr></tbody></table></div></div>
    <div class="card" style="margin-top:10px"><div class="cardhead">By category, ${esc(periodLabel())}</div>
    <table class="grid" id="cattable"><thead><tr><th>Category</th><th class="num">Expenses</th><th class="num">Total</th><th class="num">${esc(a.name)}'s share</th><th class="num">${esc(b.name)}'s share</th><th class="num">Of total</th></tr></thead><tbody>${catRows || '<tr><td colspan="6" class="empty">No expenses in this period.</td></tr>'}</tbody></table></div>
    ${s.unsplit ? `<div class="note">${money(s.unsplit)} of spending in this period has no split set yet, so it is counted for the person who paid and left out of the balance.</div>` : ''}`;
}
$('#work').addEventListener('click', e => {
  if (VIEW.kind !== 'summary') return;
  const m = e.target.closest('#sumtable tr[data-month]'); if (m) { setPeriod(VIEW.year, +m.dataset.month); return; }
  const c = e.target.closest('#cattable tr[data-cat]'); if (c) { FILT.cat = c.dataset.cat === '-' ? '-' : c.dataset.cat; setView('expenses'); }
});
