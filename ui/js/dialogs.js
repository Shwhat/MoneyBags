// ---------- dialogs ----------
// dialog(title, fields, onOk, okLabel, extraHTML): one native <dialog> for every dialog. fields are
// [key, label, value, type, options]; types: text, number, date, month, password, check, select, textarea.
// onOk gets the trimmed values; returning false opens the dialog again with what was typed.
function dialog(title, fields, onOk, okLabel = 'OK', extraHTML = '') {
  const dlg = $('#dlg'); dlg.style.width = ''; dlg.style.maxWidth = ''; dlg.onkeydown = null; $('#dlgbody').onclick = null; $('#dlgbody').onchange = null; $('#dlgbody').oninput = null; $('#dlgbtns').onclick = null;
  $('#dlgtitle').textContent = title;
  let s = '';
  for (const [k, label, v, type, opt] of fields) {
    if (type === 'check') s += `<div class="prow"><label for="f-${k}">${esc(label)}</label><input type="checkbox" id="f-${k}" name="${k}" ${v ? 'checked' : ''} style="width:auto"></div>`;
    else if (type === 'select') s += `<div class="prow"><label for="f-${k}">${esc(label)}</label><select id="f-${k}" name="${k}">${opt.map(([ov, ol]) => `<option value="${esc(ov)}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ol)}</option>`).join('')}</select></div>`;
    else if (type === 'textarea') s += `<div class="prow"><label for="f-${k}">${esc(label)}</label><textarea id="f-${k}" name="${k}">${esc(v)}</textarea></div>`;
    else s += `<div class="prow"><label for="f-${k}">${esc(label)}</label><input id="f-${k}" name="${k}" value="${esc(v)}" autocomplete="off" ${type === 'number' ? 'type="number"' : type === 'date' ? 'type="date"' : type === 'month' ? 'type="month"' : type === 'password' ? 'type="password" autocomplete="off"' : ''}></div>`;
  }
  $('#dlgbody').innerHTML = s + extraHTML;
  $('#dlgbtns').innerHTML = onOk ? `<button type="button" class="btn" onclick="document.getElementById('dlg').close('cancel')">Cancel</button><button class="btn primary" value="ok">${esc(okLabel)}</button>` : '<button class="btn primary" value="cancel">Close</button>';
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok' || !onOk) return;
    const v = {}; for (const [k, , , type] of fields) { const el = $('#dlgform').elements[k]; v[k] = type === 'check' ? el.checked : el.value.trim(); }
    if (onOk(v) === false) setTimeout(() => dialog(title, fields.map(f => [f[0], f[1], v[f[0]], f[3], f[4]]), onOk, okLabel, extraHTML), 0);
  };
  dlg.onkeydown = e => { if (e.key === 'Enter' && onOk && (e.target.tagName === 'SELECT' || e.target.type === 'checkbox' || e.target.type === 'date' || e.target.type === 'month')) { e.preventDefault(); dlg.close('ok'); } };
  dlg.returnValue = ''; dlg.showModal();
  dlgFocus();
}
// put the cursor in the first field with its text selected, so typing replaces it and Enter confirms. A dialog opened
// from a mouse press loses focus to the press itself, so focus is set again once the event is over.
function dlgFocus() {
  const dlg = $('#dlg'); let touched = false;
  const mark = () => { touched = true; };
  dlg.addEventListener('keydown', mark, { once: true }); dlg.addEventListener('pointerdown', mark, { once: true });
  const go = () => {
    if (!dlg.open || (touched && dlg.contains(document.activeElement))) return;
    const first = $('#dlgbody input:not([type=checkbox]):not([type=hidden]):not([disabled]), #dlgbody textarea, #dlgbody select');
    if (!first) { const b = $('#dlgbtns .primary'); if (b) b.focus(); return; }
    if (document.activeElement !== first) first.focus();
    if (!touched && first.select && first.tagName !== 'SELECT' && first.type !== 'date' && first.type !== 'month') first.select();
  };
  go(); setTimeout(go, 0); requestAnimationFrame(() => setTimeout(go, 0));
}
document.addEventListener('mouseup', () => { if ($('#dlg') && $('#dlg').open && !$('#dlg').contains(document.activeElement)) dlgFocus(); }, true);

const personOpts = () => B.people.map(p => [p.id, p.name]);
const catOpts = (blank = 'No category') => [['', blank]].concat(B.categories.map(c => [c.id, c.name]));
const splitOpts = () => [['Y', 'Y: joint, split 50/50'], ['N', 'N: paid for the other person'], ['', 'Not set yet']];

// ---------- first run ----------
function setupDlg(force) {
  if (B.setup && !force) return;
  const guess = host.user ? host.user.name.charAt(0).toUpperCase() + host.user.name.slice(1) : '';
  dialog('Set up MoneyBags', [['a', 'First person', B.setup ? B.people[0].name : guess], ['b', 'Second person', B.setup ? B.people[1].name : '']], v => {
    if (!v.a || !v.b) { flash('Enter both names.'); return false; }
    if (v.a.toLowerCase() === v.b.toLowerCase()) { flash('The two names must be different.'); return false; }
    commit(() => { B.people[0].name = v.a; B.people[1].name = v.b; B.people[0].short = v.a[0].toUpperCase(); B.people[1].short = v.b[0].toUpperCase(); if (B.people[0].short === B.people[1].short) B.people[1].short = v.b.slice(0, 2).toUpperCase(); B.setup = true; });
    flash('MoneyBags is set up for ' + v.a + ' and ' + v.b);
  }, 'Start', '<div class="note">MoneyBags splits expenses between two people. Enter the two names. They can be changed later in File &gt; Book settings.</div>');
}

// ---------- book settings ----------
function bookSettings() {
  dialog('Book settings', [
    ['a', 'First person', B.people[0].name], ['as', 'First person letter', B.people[0].short],
    ['b', 'Second person', B.people[1].name], ['bs', 'Second person letter', B.people[1].short],
    ['payer', 'New expenses are paid by', PREFS.defaultPayer, 'select', [['auto', 'The signed-in person'], ['p1', B.people[0].name], ['p2', B.people[1].name]]],
    ['theme', 'Theme', PREFS.theme, 'select', [['light', 'Light'], ['dark', 'Dark'], ['system', 'Same as the computer']]],
  ], v => {
    if (!v.a || !v.b || !v.as || !v.bs) { flash('Names and letters cannot be blank.'); return false; }
    if (v.as.toUpperCase() === v.bs.toUpperCase()) { flash('The two letters must be different.'); return false; }
    PREFS.defaultPayer = v.payer; PREFS.theme = v.theme; savePrefs(); applyTheme();
    if (v.a !== B.people[0].name || v.b !== B.people[1].name || v.as.toUpperCase() !== B.people[0].short || v.bs.toUpperCase() !== B.people[1].short)
      commit(() => { B.people[0].name = v.a; B.people[1].name = v.b; B.people[0].short = v.as.toUpperCase().slice(0, 3); B.people[1].short = v.bs.toUpperCase().slice(0, 3); B.setup = true; });
    else render();
    flash('Settings saved');
  }, 'Save', '<div class="note">Names and letters belong to the shared book and change for both people. The letters match the Who Paid column when importing from Excel (for example D and A). The payer and theme settings are yours only.</div>');
}

// ---------- categories ----------
function categoriesDlg() {
  if (!canEdit()) { flash(readOnlyReason()); return; }
  let W = clone(B.categories); const used = id => B.expenses.filter(e => e.category === id).length;
  const draw = () => {
    $('#dlgbody').innerHTML = W.map((c, i) => `<div class="catrow"><input data-ci="${i}" value="${esc(c.name)}" aria-label="Category name"><span class="n">${used(c.id)} expense${used(c.id) === 1 ? '' : 's'}</span><button type="button" class="btn small" data-cup="${i}" title="Move up">▲</button><button type="button" class="btn small" data-cdn="${i}" title="Move down">▼</button><button type="button" class="btn small" data-cdel="${i}">Delete</button></div>`).join('') +
      `<div class="btnrow"><button type="button" class="btn" data-cadd="1">Add category</button></div><div class="note">Deleting a category asks which category its expenses move to. Names must be unique.</div>`;
  };
  dialog('Categories', [], () => {
    const names = W.map(c => c.name.trim());
    if (names.some(n => !n)) { flash('Category names cannot be blank.'); return false; }
    if (new Set(names.map(n => n.toLowerCase())).size !== names.length) { flash('Two categories have the same name.'); return false; }
    const moves = W.moves || {};
    commit(() => { B.categories = W.map(c => ({ id: c.id, name: c.name.trim() })); for (const e of B.expenses) if (moves[e.category] !== undefined) e.category = moves[e.category]; });
    flash('Categories saved');
  }, 'Save');
  $('#dlg').style.width = '520px'; draw();
  $('#dlgbody').oninput = e => { const i = e.target.dataset.ci; if (i != null) W[+i].name = e.target.value; };
  $('#dlgbody').onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.cadd) { W.push({ id: 'c' + uid(), name: 'New category' }); draw(); const ins = $('#dlgbody').querySelectorAll('input'); ins[ins.length - 1].select(); return; }
    if (b.dataset.cup != null || b.dataset.cdn != null) { const i = +(b.dataset.cup ?? b.dataset.cdn), j = i + (b.dataset.cup != null ? -1 : 1); if (j >= 0 && j < W.length) { [W[i], W[j]] = [W[j], W[i]]; draw(); } return; }
    if (b.dataset.cdel != null) {
      const i = +b.dataset.cdel, c = W[i], n = used(c.id);
      if (n) {
        const sel = $('#catmove'); if (!sel || sel.dataset.for !== c.id) { b.insertAdjacentHTML('afterend', ` <select id="catmove" data-for="${c.id}">${W.filter(x => x.id !== c.id).map(x => `<option value="${x.id}">Move to ${esc(x.name)}</option>`).join('')}<option value="">Move to no category</option></select> <button type="button" class="btn small primary" data-cdel2="${i}">Confirm</button>`); return; }
      }
      W.moves = W.moves || {}; W.moves[c.id] = ''; W.splice(i, 1); draw(); return;
    }
    if (b.dataset.cdel2 != null) { const i = +b.dataset.cdel2, c = W[i]; W.moves = W.moves || {}; W.moves[c.id] = $('#catmove').value; for (const k in W.moves) if (W.moves[k] === c.id) W.moves[k] = W.moves[c.id]; W.splice(i, 1); draw(); }
  };
}

// ---------- keyboard shortcuts ----------
const SHORTCUTS = [
  ['Adding', [['N', 'New expense (moves to the entry row)'], ['P', 'Record a settle-up payment'], ['Enter (entry row)', 'Add the expense and start the next one'], ['Tab / Shift+Tab', 'Next or previous field in the entry row'], ['Escape (entry row)', 'Clear the entry row']]],
  ['Selecting and editing', [['Click', 'Select a row'], ['Ctrl+click', 'Add or remove a row from the selection'], ['Shift+click', 'Select a range of rows'], ['Up / Down', 'Select the previous or next row'], ['Shift+Up / Shift+Down', 'Extend the selection'], ['Ctrl+A', 'Select every row in the list'], ['Enter', 'Edit the selected row in the Properties panel'], ['Double-click', 'Edit the row in the Properties panel'], ['Ctrl+D', 'Duplicate the selected rows'], ['Delete', 'Delete the selected rows'], ['Escape', 'Clear the selection or close About']]],
  ['History and saving', [['Ctrl+Z', 'Undo'], ['Ctrl+Y or Ctrl+Shift+Z', 'Redo'], ['Ctrl+S', 'Save now']]],
  ['Moving around', [['Alt+1', 'Expenses view'], ['Alt+2', 'Payments view'], ['Alt+3', 'Recurring bills view'], ['Alt+4', 'Summary view'], ['Alt+5', 'Charts view'], ['Page Up / Page Down', 'Previous or next month'], ['Shift+Page Up / Shift+Page Down', 'Previous or next year'], ['Ctrl+F', 'Search the expense list'], ['F1', 'About MoneyBags']]],
];
function shortcuts() {
  tell('Keyboard shortcuts', SHORTCUTS.map(([g, rows]) => `<div class="pgrp"><h4>${esc(g)}</h4><div class="kbd">${rows.map(([k, d]) => `<b>${esc(k)}</b><span>${esc(d)}</span>`).join('')}</div></div>`).join('') + '<div class="note">Single-letter shortcuts work when the cursor is not in a text field.</div>');
  $('#dlg').style.width = '560px';
}
