# MoneyBags handoff

Version: 1.0.0
Last updated: 2026-11-17

## Project

MoneyBags replaces the yearly expense spreadsheets ("Expense OCT2025-SEP2026.xlsx" and "Expense OCT2026-SEP2027.xlsx") that Devon and Alex used to split household spending. It keeps one shared book on a home server, works out who owes whom with the spreadsheet's rules, and runs as a Docker container managed by Dockhand.

Repository: https://github.com/Shwhat/MoneyBags (branch `main`). Image: `ghcr.io/shwhat/moneybags`.

## Rules

- Built to the program design guide (OpenSchem structure, theme, components) and the docker-server-setup conventions (Dockhand Git stack, absolute data path, no Watchtower).
- Do not build or change the program until Devon says "build it".
- Do not commit or push until asked. Do not remind about uncommitted work.
- Never use em dashes anywhere. `tests/suites/00-static.mjs` checks this.
- Answer questions simply and directly, without extra unrequested actions.
- Every build that changes what the program does or the rules it follows updates the About guide (`ui/about/`): the affected pages, Capabilities, and a new release notes entry. Raise the version everywhere (patch for fixes, minor for features, major only when Devon says so): `APP_VERSION` in `ui/js/core.js`, `package.json`, this file and the release notes.
- Keep the README feature list and keyboard shortcut list current; the shortcut list also lives in `SHORTCUTS` in `ui/js/dialogs.js` and on the guide's Keyboard shortcuts page.
- Every change gets tests, and the full run must pass before a build is delivered.
- Keep this file identical to the HANDOFF document in the claude.ai MoneyBags project.

## Decisions

| Question | Decision |
|---|---|
| Setup | Full OpenSchem stack: Go server, Docker, sign-in for both people |
| Joint flag | Y (split 50/50) and N (the other person owes it all). H (house) is dropped; imported H rows become Y and are flagged |
| Years | Calendar years, January to December; a new year appears on its own |
| Extras | Import both workbooks, settle-up payments, categories and charts, recurring bills |
| Updates | Dockhand only (scheduled image updates); no Watchtower |
| Guide | Full coverage: 24 pages |

## Code map

| File | Contents |
|---|---|
| `main.go` | Configuration, page assembly (About pages + manifest), routes, accounts, book API |
| `store.go` | Data folder: users, sessions, book, revisions, edit lock, daily backups, per-user prefs |
| `auth.go` | Password hashing (PBKDF2), name and password rules, sign-in rate limits |
| `server_test.go` | Server tests |
| `ui/js/core.js` | Constants, `APP_VERSION`, money and date helpers, the book model `B`, `PREFS` |
| `ui/js/model.js` | Every calculation: final total, shares, balance effect, period stats, year table |
| `ui/js/state.js` | `commit()`, undo and redo, view and period state, `render()` |
| `ui/js/host.js` | Server or browser storage, saving, edit lock, read-only, small dialogs, account actions |
| `ui/js/dialogs.js` | `dialog()` helper, first-run setup, book settings, categories, shortcuts list |
| `ui/js/ribbon.js` | Icons (`RI`), commands (`CMDS`), `DEFAULT_RIBBON`, customize ribbon, prefs load and save |
| `ui/js/dock.js` | Dockable panels and workspaces (ported from OpenSchem) |
| `ui/js/menus.js` | `MENUS`, `ACTIONS`, keyboard shortcuts, command line |
| `ui/js/views.js` | Expenses, Payments and Recurring bills views; selection; filters; Years, To-do and Balance panels |
| `ui/js/edit.js` | Adding and changing entries, recurring bill generation, selection commands, Properties panel |
| `ui/js/summary.js` | Summary view |
| `ui/js/charts.js` | Charts view (SVG, tooltips) |
| `ui/js/about.js` | The built-in guide and its Markdown renderer |
| `ui/js/importxl.js` | Excel import |
| `ui/js/exports.js` | CSV and Excel export, backup and restore |
| `ui/js/xlsx.js` | Minimal .xlsx reader and writer (from OpenSchem) |
| `ui/js/demo.js` | Demo book |
| `ui/js/files.js` | Startup (must stay last in the manifest) |
| `ui/about/*.md` | The guide, 24 pages |
| `web/login.html`, `web/logo.svg` | Sign-in page and logo |
| `tests/run.mjs`, `tests/suites/` | Playwright test runner and suites |
| `tests/fixtures/` | Made-up sample workbooks for the import tests and the script that writes them |
| `tools/assemble.py` | Builds the single page to `build/moneybags.html` |
| `Dockerfile`, `docker-compose.yml`, `.env.example`, `.github/workflows/docker.yml` | Image, stack and CI |

## Data model

The book (`book.json`): `people` (two, with name and letter), `categories`, `expenses` (date, vendor, amount, cashBack, saved, paidBy, split Y/N/blank, category, notes, check, recurring, source, added, addedBy), `payments` (date, from, to, amount, kind, notes), `recurring` (name, amount or null, paidBy, split, category, day, start, end, active, notes), `recurringLog` (months already added per bill), `setup`, `format`.

Balance rule: a joint expense makes the non-payer owe half of the final total; an N expense makes the non-payer owe all of it; each expense's effect is rounded to whole cents (halves away from zero); a settle-up entry lowers what From owes To.

## Open bugs

None known.

## Spreadsheet findings (from checking the real workbooks)

- The Monthly Expenses sheet groups rows with MONTH() only, ignoring the year. In the 2025-2026 workbook, Lyft (Jan 26, 2025), Longhouse Cafe (Jun 6, 2029), Trader Joes (Oct 2, 2026) and Sushi Spott (Oct 13, 2026) were counted in the wrong months. The importer flags rows dated outside the months in the file name.
- One sushi row has a date cell Excel cannot read; it imports with no date and is flagged.
- Five travel rows from late December 2025 and early January 2026 have no Y/N flag, so the spreadsheet left them out of every total. They import with the split not set and are flagged.
- The side notes on the Monthly Expenses sheet (Devon's $1,700 Zelle, the $757.14 eBay Motors credit, the "paid by" columns) are not imported; they need to be entered as settle-up entries or one adjustment.

## Open ideas

- Splits other than 50/50
- Monthly budgets per category
- Receipt photos
- Printing the summary

## Known limits

See the guide's Limits page (`ui/about/21-limits.md`).

## Where work stopped

Version 1.0.0 built and pushed to `main`. All Go and Playwright tests pass. The real workbooks were imported in a local check (254 expenses, 8 flagged rows); they are not stored in the repository. Next: Devon deploys the stack with Dockhand, imports both workbooks, reviews the To-do panel, and records the past settle-up payments.
