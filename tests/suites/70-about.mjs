// The built-in guide
export const tests = {
  async 'F1 opens the guide in the work area with the version'(t) {
    await t.open(); await t.eval(() => document.activeElement.blur());
    await t.key('F1');
    t.eq(await t.eval(() => [VIEW.kind, $('.abhead').textContent.includes('Version ' + APP_VERSION), $('.abtoc a.on').textContent]), ['about', true, 'Overview']);
  },
  async 'links, previous and next, the page list and Escape'(t) {
    await t.open(); await t.act('about');
    await t.click('.abpage a[data-about="expenses"]'); t.eq(await t.eval(() => $('.abpage h1').textContent), 'Expenses');
    await t.click('.abpager a:last-child'); t.eq(await t.eval(() => $('.abpage h1').textContent), 'Splitting and balances');
    await t.click('.abpager a:first-child'); t.eq(await t.eval(() => $('.abpage h1').textContent), 'Expenses');
    await t.click('.abtoc a[data-about="release-notes"]'); t.ok((await t.text('.abpage')).includes('1.0.0'));
    t.eq(await t.eval(() => $('.abpager').textContent.includes('Next:')), false, 'last page has no Next');
    await t.eval(() => document.activeElement.blur()); await t.key('Escape'); t.eq(await t.eval(() => VIEW.kind), 'expenses');
  },
  async 'address opens a page; an unknown page shows not found'(t) {
    await t.open({ hash: '#about/technical' }); await t.page.waitForTimeout(100);
    t.eq(await t.eval(() => $('.abpage h1').textContent), 'Technical');
    await t.eval(() => about('nothing-here')); t.eq(await t.eval(() => $('.abpage h1').textContent), 'Page not found');
  },
  async 'narrow screens get a page list drop-down'(t) {
    await t.page.setViewportSize({ width: 800, height: 800 }); await t.open(); await t.act('about');
    t.ok(await t.eval(() => getComputedStyle($('.abselect')).display !== 'none' && getComputedStyle($('.abtoc')).display === 'none'));
    await t.page.selectOption('.abselect', 'glossary'); t.eq(await t.eval(() => $('.abpage h1').textContent), 'Glossary');
  },
};
