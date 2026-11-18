// ---------- Charts view ----------
// Built to the data visualization rules: one axis per chart, thin marks, 2 px lines with 8 px markers, rounded bar
// ends, a recessive grid, a legend for two series plus direct labels, and a hover tooltip on every mark.
// Colors: categorical slot 1 (blue) for the first person, slot 2 (orange) for the second; light and dark steps are
// set in style.css (.viz) and were checked with the palette validator.
// charts are drawn at the size they appear (one SVG unit is one pixel), so text keeps the interface size
const CH = { W: 760, H: 260, L: 64, R: 70, T: 16, B: 30 };
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
const shortMoney = v => { const a = Math.abs(v), s = a >= 10000 ? '$' + Math.round(a / 1000) + 'k' : a >= 1000 ? '$' + (a / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : '$' + Math.round(a); return v < 0 ? '-' + s : s; };
let CHART_TIPS = {};
function lineChart(id, series, labels, opt = {}) {
  const { W, H, L, R, T, B: Bm } = CH, pw = W - L - R, ph = H - T - Bm;
  const vals = series.flatMap(s => s.values);
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  if (opt.symmetric) { const m = niceMax(Math.max(Math.abs(lo), Math.abs(hi))); lo = -m; hi = m; } else { hi = niceMax(hi); lo = lo < 0 ? -niceMax(-lo) : 0; }
  const x = i => L + (labels.length === 1 ? pw / 2 : i * pw / (labels.length - 1)), y = v => T + (hi - v) / (hi - lo || 1) * ph;
  const ticks = []; for (let k = 0; k <= 4; k++) ticks.push(lo + (hi - lo) * k / 4);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opt.title || '')}">`;
  s += ticks.map(v => `<line class="gl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${shortMoney(v)}</text>`).join('');
  if (lo < 0) s += `<line class="zero" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>`;
  s += labels.map((l, i) => `<text class="ax" x="${x(i)}" y="${H - 10}" text-anchor="middle">${esc(l)}</text>`).join('');
  if (opt.above) s += `<text class="ax" x="${L + 4}" y="${T + 11}">${esc(opt.above)}</text>`;
  if (opt.below) s += `<text class="ax" x="${L + 4}" y="${T + ph - 4}">${esc(opt.below)}</text>`;
  // direct labels at the line ends, pushed apart so they never overlap
  const ends = series.map((se, k) => ({ k, y: y(se.values[se.values.length - 1]) + 4 })).sort((p, q) => p.y - q.y);
  for (let j = 1; j < ends.length; j++) if (ends[j].y - ends[j - 1].y < 14) ends[j].y = ends[j - 1].y + 14;
  const endY = {}; for (const e of ends) endY[e.k] = e.y;
  series.forEach((se, k) => {
    s += `<polyline fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${se.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>`;
    s += se.values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${se.color}" stroke="var(--surf)" stroke-width="2"/>`).join('');
    const li = se.values.length - 1;
    if (opt.directLabels !== false) s += `<text class="lbl" x="${x(li) + 10}" y="${endY[k]}">${esc(se.name)}</text>`;
  });
  // one hover column per month: a crosshair line and a tooltip with every series' value
  const cw = labels.length > 1 ? pw / (labels.length - 1) : pw;
  s += labels.map((l, i) => `<rect class="hit" data-tip="${id}:${i}" x="${x(i) - cw / 2}" y="${T}" width="${cw}" height="${ph}"/>`).join('');
  s += `<line class="xhair" x1="0" x2="0" y1="${T}" y2="${T + ph}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3,3" visibility="hidden"/></svg>`;
  CHART_TIPS[id] = i => ({ title: opt.tipTitle ? opt.tipTitle(i) : labels[i], rows: series.map(se => [se.name, se.fmt ? se.fmt(se.values[i]) : money(se.values[i]), se.color]), x: x(i) });
  return s;
}
function barChartH(id, items, opt = {}) {
  const { W } = CH, L = 150, R = 90, rowH = 26, T = 6, H = T + items.length * rowH + 22, pw = W - L - R;
  const hi = niceMax(Math.max(0, ...items.map(i => i.value))), x = v => L + Math.max(0, v) / hi * pw;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opt.title || '')}">`;
  for (let k = 0; k <= 4; k++) { const v = hi * k / 4; s += `<line class="gl" x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H - 20}"/><text class="ax" x="${x(v)}" y="${H - 6}" text-anchor="middle">${shortMoney(v)}</text>`; }
  items.forEach((it, i) => {
    const yy = T + i * rowH + 4, h = rowH - 8, w = Math.max(0, x(it.value) - L);
    // rounded at the data end only; the bar starts square on the baseline
    s += `<text class="lbl" x="${L - 8}" y="${yy + h / 2 + 4}" text-anchor="end">${esc(it.label)}</text>`;
    if (w > 0) s += `<path d="M${L},${yy}h${Math.max(0, w - 4)}a4,4 0 0 1 4,4v${h - 8}a4,4 0 0 1 -4,4h${-Math.max(0, w - 4)}z" fill="var(--s1)"/>`;
    s += `<text class="lbl" x="${L + w + 6}" y="${yy + h / 2 + 4}">${money(it.value)}</text>`;
    s += `<rect class="hit" data-tip="${id}:${i}" x="0" y="${yy - 3}" width="${W}" height="${rowH}"/>`;
  });
  CHART_TIPS[id] = i => ({ title: items[i].label, rows: [['Total', money(items[i].value), 'var(--s1)'], ['Expenses', String(items[i].count), '']].concat(items[i].extra || []) });
  return s + '</svg>';
}
// the months a year's charts cover: from the book's first entry (if it is in that year) through the current month
function chartMonths(y) {
  const dates = B.expenses.concat(B.payments).map(x => x.date).filter(validDate).sort();
  const t = today(); let m0 = 1, m1 = 12;
  if (dates.length && yearOf(dates[0]) === y) m0 = monthOf(dates[0]);
  if (yearOf(t) === y) m1 = monthOf(t); else if (y > yearOf(t)) m1 = 0;
  return { m0, m1 };
}
function chartsHTML() {
  CHART_TIPS = {};
  CH.W = Math.max(460, ($('#work').clientWidth || 800) - 44);
  const [a, b] = B.people, y = VIEW.year, T = yearTable(y), { m0, m1 } = chartMonths(y);
  const rows = T.rows.filter(r => r.month >= m0 && r.month <= m1), labs = rows.map(r => MON3[r.month - 1]);
  const share1 = rows.map(r => r.s.share.p1), share2 = rows.map(r => r.s.share.p2), bal = rows.map(r => r.end);
  const per = curPeriod(), pe = periodExpenses(per), cats = Object.entries(periodStats(per).cats).sort((x, z) => z[1] - x[1]);
  const items = cats.map(([c, v]) => { const l = pe.filter(e => (e.category || '') === c); return { label: catName(c) || 'No category', value: r2(v), count: l.length, extra: [[a.name + "'s share", money(l.reduce((u, e) => u + sharesOf(e).p1, 0)), ''], [b.name + "'s share", money(l.reduce((u, e) => u + sharesOf(e).p2, 0)), '']] }; });
  const any = rows.some(r => r.s.count || r.s.payments);
  if (!any || !rows.length) return `<div class="empty">No expenses in ${y} yet, so there is nothing to chart.</div>`;
  const legend = `<div class="legend"><span><i style="background:var(--s1)"></i>${esc(a.name)}</span><span><i style="background:var(--s2)"></i>${esc(b.name)}</span></div>`;
  return `<div class="viz">
    <div class="card"><div class="cardhead">Each person's share of spending by month, ${y}<span class="note">The same numbers are in the Summary view.</span></div>${legend}
      <div class="chart" data-chart="shares">${lineChart('shares', [{ name: a.name, values: share1, color: 'var(--s1)' }, { name: b.name, values: share2, color: 'var(--s2)' }], labs, { title: 'Each person\'s share by month', tipTitle: i => `${MONTHS[rows[i].month - 1]} ${y}` })}</div></div>
    <div>
      <div class="card" style="margin-top:10px"><div class="cardhead">Spending by category, ${esc(periodLabel())}</div><div class="chart" data-chart="cats">${items.length ? barChartH('cats', items, { title: 'Spending by category' }) : '<div class="empty">No expenses in this period.</div>'}</div></div>
      <div class="card" style="margin-top:10px"><div class="cardhead">Balance at the end of each month, ${y}</div>
        <div class="chart" data-chart="bal">${lineChart('bal', [{ name: 'Balance', values: bal, color: 'var(--s1)', fmt: v => netText(v) }], labs, { title: 'Balance by month', symmetric: true, directLabels: false, above: `${b.name} owes ${a.name}`, below: `${a.name} owes ${b.name}`, tipTitle: i => `End of ${MONTHS[rows[i].month - 1]} ${y}` })}</div></div>
    </div></div>`;
}
function wireCharts() {
  const tip = $('#tip');
  document.querySelectorAll('#work .chart svg').forEach(svg => {
    const xh = svg.querySelector('.xhair');
    svg.addEventListener('mousemove', e => {
      const h = e.target.closest('[data-tip]'); if (!h) { tip.classList.add('hidden'); if (xh) xh.setAttribute('visibility', 'hidden'); return; }
      const [id, i] = h.dataset.tip.split(':'), d = CHART_TIPS[id] && CHART_TIPS[id](+i); if (!d) return;
      tip.innerHTML = `<b>${esc(d.title)}</b>` + d.rows.map(([n, v, c]) => `<div class="tr"><span>${c ? `<i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${c};margin-right:5px"></i>` : ''}${esc(n)}</span><span>${esc(v)}</span></div>`).join('');
      tip.classList.remove('hidden');
      const tw = tip.offsetWidth; tip.style.left = Math.min(innerWidth - tw - 8, e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
      if (xh && d.x != null) { xh.setAttribute('x1', d.x); xh.setAttribute('x2', d.x); xh.setAttribute('visibility', 'visible'); }
    });
    svg.addEventListener('mouseleave', () => { tip.classList.add('hidden'); if (xh) xh.setAttribute('visibility', 'hidden'); });
  });
}
