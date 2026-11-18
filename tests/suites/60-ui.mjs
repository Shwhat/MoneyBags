// Screen, menus, ribbon, panels, workspaces, keyboard, themes, read-only
export const tests = {
  async 'menus open, switch on hover and run commands'(t) {
    await t.open();
    await t.page.dispatchEvent('.menu[data-menu="view"]', 'mousedown');
    t.ok(await t.eval(() => !$('#dropdown').classList.contains('hidden')));
    await t.page.hover('.menu[data-menu="help"]');
    t.ok((await t.text('#dropdown')).includes('Keyboard shortcuts'), 'hovering another menu switches');
    await t.click('#dropdown [data-act="shortcuts"]');
    t.eq(await t.eval(() => $('#dlgtitle').textContent), 'Keyboard shortcuts');
  },
  async 'every menu and ribbon command exists'(t) {
    await t.open();
    t.eq(await t.eval(() => Object.values(MENUS).flat().filter(i => i !== '-' && !ACTIONS[i[1]]).map(i => i[1])), []);
    t.eq(await t.eval(() => Object.values(CMDS).filter(c => !ACTIONS[c[2]]).map(c => c[2])), []);
    t.eq(await t.eval(() => DEFAULT_RIBBON.flatMap(tb => tb.groups.flatMap(g => g.items)).filter(id => !CMDS[id])), []);
  },
  async 'views and periods from the keyboard'(t) {
    await t.open({ today: '2026-11-17' }); await t.eval(() => document.activeElement.blur());
    for (const [k, v] of [['Alt+2', 'payments'], ['Alt+3', 'recurring'], ['Alt+4', 'summary'], ['Alt+5', 'charts'], ['Alt+1', 'expenses']]) { await t.key(k); t.eq(await t.eval(() => VIEW.kind), v); }
    await t.key('PageUp'); t.eq(await t.eval(() => [VIEW.year, VIEW.month]), [2026, 10]);
    await t.key('Shift+PageDown'); t.eq(await t.eval(() => [VIEW.year, VIEW.month]), [2027, 10]);
    await t.act('wholeYear'); t.eq(await t.eval(() => periodLabel()), 'All of 2027');
    await t.act('thisMonth'); t.eq(await t.eval(() => periodLabel()), 'November 2026');
    await t.key('PageDown'); await t.key('PageDown'); t.eq(await t.eval(() => periodLabel()), 'January 2027');
  },
  async 'years panel opens a month or a year'(t) {
    await t.open({ today: '2026-11-17' });
    await t.click('#tab-years .mo[data-month="3"]'); t.eq(await t.eval(() => periodLabel()), 'March 2026');
    await t.click('#tab-years .yr[data-year="2026"]'); t.eq(await t.eval(() => periodLabel()), 'All of 2026');
    await t.click('#tab-years [data-ytoggle="2026"]'); t.eq(await t.eval(() => document.querySelectorAll('#tab-years .mo').length), 0, 'collapsed');
  },
  async 'themes: light, dark, system, saved per user'(t) {
    await t.open();
    await t.act('themeDark'); t.eq(await t.eval(() => [document.documentElement.dataset.theme, PREFS.theme]), ['dark', 'dark']);
    await t.act('themeSystem'); t.eq(await t.eval(() => PREFS.theme), 'system');
    await t.act('themeLight'); await t.open(); t.eq(await t.eval(() => document.documentElement.dataset.theme), 'light');
  },
  async 'panels close, reopen and switch workspaces'(t) {
    await t.open();
    await t.eval(() => closePanel('balance')); t.eq(await t.eval(() => panelOpen('balance')), false);
    await t.eval(() => togglePanel('balance')); t.eq(await t.eval(() => panelOpen('balance')), true);
    await t.eval(() => switchWorkspace('Reports')); t.eq(await t.eval(() => [panelOpen('years'), panelOpen('props'), panelOpen('todo')]), [true, false, false]);
    await t.act('resetPanels'); t.eq(await t.eval(() => PREFS.workspace), 'Reports');
    await t.eval(() => switchWorkspace('Entry')); t.eq(await t.eval(() => [panelOpen('years'), panelOpen('props'), panelOpen('todo'), panelOpen('balance')]), [true, true, true, true]);
  },
  async 'command line runs commands by name'(t) {
    await t.open();
    await t.act('toggleCmdline'); t.ok(await t.eval(() => !$('#cmdbar').classList.contains('hidden')));
    await t.page.fill('#cmdinput', 'summary'); await t.page.press('#cmdinput', 'Enter');
    t.eq(await t.eval(() => VIEW.kind), 'summary');
  },
  async 'customize ribbon saves a new group'(t) {
    await t.open(); t.promptAnswer = 'Mine';
    await t.act('customizeRibbon');
    await t.click('[data-czb="g:add"]'); await t.click('[data-czadd="exportCSV"]'); await t.confirm();
    t.ok(await t.eval(() => PREFS.ribbon[0].groups.some(g => g.name === 'Mine' && g.items.includes('exportCSV'))));
    t.ok((await t.text('#toolbar')).includes('Mine'));
  },
  async 'book settings rename people and refuse matching letters'(t) {
    await t.open();
    await t.act('bookSettings'); await t.type('#f-bs', 'D'); await t.click('#dlgbtns .primary'); await t.page.waitForTimeout(100); await t.page.waitForFunction(() => $('#dlg').open);
    t.eq(await t.eval(() => $('#f-bs').value), 'D', 'same letters are refused and the dialog opens again');
    await t.type('#f-b', 'Alexis'); await t.type('#f-bs', 'X'); await t.confirm();
    t.eq(await t.eval(() => B.people.map(p => p.name + p.short)), ['DevonD', 'AlexisX']);
  },
  async 'categories: add, rename, delete with a move'(t) {
    await t.open();
    await t.eval(() => commit(() => B.expenses.push(newExpenseObj({ vendor: 'Trip', amount: 9, category: B.categories.find(c => c.name === 'Travel').id }))));
    await t.act('newCategory'); await t.type('#f-name', 'Pets'); await t.confirm();
    t.ok(await t.eval(() => !!catByName('Pets')));
    await t.act('categoriesDlg');
    const i = await t.eval(() => B.categories.findIndex(c => c.name === 'Travel'));
    await t.click(`[data-cdel="${i}"]`); await t.page.selectOption('#catmove', { label: 'Move to Pets' }); await t.click('[data-cdel2]'); await t.confirm();
    t.eq(await t.eval(() => [!!catByName('Travel'), catName(B.expenses[0].category)]), [false, 'Pets']);
  },
  async 'read-only: changes are refused with the reason'(t) {
    await t.open();
    await t.eval(() => { host.readOnly = true; host.lockedBy = 'Alex'; render(); });
    t.eq(await t.eval(() => !!$('#en-vendor')), false, 'no entry row');
    await t.act('newPayment');
    t.eq(await t.text('#st-msg'), 'Read-only: Alex is editing the book');
    t.ok((await t.text('#docname')).includes('Read-only while Alex edits'));
  },
  async 'charts draw with tooltips'(t) {
    await t.open(); await t.act('demo'); await t.act('viewCharts');
    t.eq(await t.eval(() => document.querySelectorAll('#work .chart svg').length), 3);
    const box = await t.page.locator('[data-chart="shares"] .hit').nth(7).boundingBox();
    await t.page.mouse.move(box.x + box.width / 2, box.y + 20);
    t.ok(await t.eval(() => !$('#tip').classList.contains('hidden') && $('#tip').textContent.includes('Sam')), 'tooltip shows');
  },
  async 'demo opens and closes without touching the book'(t) {
    await t.open();
    await t.eval(() => commit(() => B.expenses.push(newExpenseObj({ vendor: 'Mine', amount: 1 }))));
    await t.act('demo'); t.eq(await t.eval(() => [DEMO, B.people[0].name]), [true, 'Sam']);
    await t.eval(() => commit(() => { B.expenses = []; }));
    await t.act('demo'); t.eq(await t.eval(() => [DEMO, B.expenses.map(e => e.vendor)]), [false, ['Mine']]);
  },
};
