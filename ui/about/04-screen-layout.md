# Screen layout

The screen has, from top to bottom: the menu bar, the ribbon, the main area with panels around the work area, the optional command line, and the status bar.

## Menu bar

The menu bar holds File, Edit, Insert, View and Help, then the names of the two people and where the book is kept, then (on the server) the account menu with the signed-in user name. Opening a menu and moving to another menu name switches menus. Clicking anywhere else closes the menu.

### File

| Item | What it does |
|---|---|
| Save now (Ctrl+S) | Saves at once instead of waiting for the automatic save |
| Import from Excel... | Reads the old expense workbooks; see [Importing from Excel](/about/importing-from-excel) |
| Export expenses (CSV)... | Saves the expenses shown, or all expenses, as a CSV file |
| Export payments (CSV)... | Saves every settle-up entry as a CSV file |
| Export workbook (Excel)... | Saves the whole book as an Excel workbook |
| Download backup (.json) | Saves a copy of the whole book |
| Restore from backup file... | Replaces the book with a backup file |
| Restore from server backup... | Replaces the book with one of the server's daily copies (server only) |
| Book settings... | Names, letters, the default payer and the theme |
| Categories... | Adds, renames, reorders and deletes categories |

### Edit

| Item | What it does |
|---|---|
| Undo (Ctrl+Z) | Reverses the last change |
| Redo (Ctrl+Y) | Applies the change undone last |
| Duplicate (Ctrl+D) | Copies the selected expenses or payments |
| Delete (Del) | Deletes the selected rows |
| Select all (Ctrl+A) | Selects every row in the list |
| Change selected... | Sets the category, who paid or the split of the selected expenses |
| Mark reviewed | Clears the needs review mark on the selected expenses |
| Mark as needs review... | Marks the selected expenses with a reason |
| Search (Ctrl+F) | Moves the cursor to the search box |
| Clear filters | Clears the search and every filter |

### Insert

| Item | What it does |
|---|---|
| New expense (N) | Moves the cursor to the entry row |
| Settle-up payment... (P) | Records a payment, credit or adjustment |
| Recurring bill... | Adds a monthly bill |
| Category... | Adds a category |

### View

| Item | What it does |
|---|---|
| Expenses (Alt+1), Payments (Alt+2), Recurring bills (Alt+3), Summary (Alt+4), Charts (Alt+5) | Switch the work area |
| Previous month (PgUp), Next month (PgDn) | Move one month |
| This month | Opens the current month |
| Whole year | Shows the whole year of the period on screen |
| Previous year (Shift+PgUp), Next year (Shift+PgDn) | Move one year |
| Light theme, Dark theme, Theme follows the computer | Set the theme; the current one is ticked |
| Customize ribbon... | Changes the ribbon; see below |
| Years panel, To-do panel, Balance panel, Properties panel | Show or hide each panel; open panels are ticked |
| Command line | Shows or hides the command line |
| Workspace: Entry, Workspace: Review, Workspace: Reports | Switch to a saved panel arrangement |
| Save workspace... | Saves the current panel arrangement under a name |
| Manage workspaces... | Deletes saved workspaces or restores a built-in one |
| Reset panel layout | Puts the panels back to the current workspace |

### Help

| Item | What it does |
|---|---|
| Keyboard shortcuts | Lists every shortcut |
| Open the demo book, Close the demo book | Opens a made-up book that is never saved, or returns to the real book |
| About MoneyBags (F1) | Opens this guide |

### Account menu (server only)

| Item | What it does |
|---|---|
| About MoneyBags | Opens this guide |
| Change password... | Changes the password; other devices are signed out |
| Sign out | Saves any change, then signs out |

## Ribbon

The ribbon has tabs, and each tab has groups of buttons. Right-click the ribbon for the theme choices and **Customize ribbon...**. The **Workspace** list at the right end of the tab strip switches workspaces or saves the current layout.

| Tab | Group | Buttons |
|---|---|---|
| Home | History | Undo, Redo, Save now |
| Home | Add | New expense, Settle-up payment, Recurring bill |
| Home | Views | Expenses, Payments, Recurring bills, Summary, Charts |
| Home | Period | Previous month, Next month, This month, Whole year |
| Home | Find | Search, Clear filters |
| Data | Import | Import Excel |
| Data | Export | Expenses CSV, Payments CSV, Excel workbook |
| Data | Backup | Download backup, Restore backup, Server backups |
| Data | Book | Book settings, Categories |
| View | Theme | Light, Dark, Follow computer |
| View | Layout | Reset panels, Save workspace, Customize ribbon, Command line |
| Help | Help | Shortcuts, About, Demo book |
| Selection | Selected rows | Duplicate, Delete, Change selected |
| Selection | Review | Mark reviewed, Needs review |

The **Selection** tab has amber text. It appears while rows are selected in the Expenses view and is picked when it first appears. Buttons that are on (the current view, the current theme, Whole year when a whole year is shown, Command line when it is shown, Demo book while the demo is open) have a blue background.

### Customize ribbon

**Customize ribbon...** opens a dialog with four lists: tabs, the groups in the selected tab, the buttons in the selected group, and every available command. Add, Rename, Remove and the arrow buttons change tabs and groups. Clicking a command in the last list adds it to the selected group. **Reset to default** restores the original ribbon. **Save** keeps the result for your account. A new version of MoneyBags starts from the default ribbon, so new buttons always appear.

## Work area

The work area shows one view at a time: Expenses, Payments, Recurring bills, Summary, Charts, or this guide. Above it, the header row has the previous and next month buttons, the period in bold (for example "November 2026" or "All of 2026"), the view buttons, a short description (such as "38 expenses"), "Filtered" when a filter is on, and the position on the right (for example "Month 11 of 12").

## Panels

| Panel | What it shows |
|---|---|
| Years | Every year with an entry plus the current year, each with its months, counts and totals; see [Years and months](/about/years-and-months) |
| To-do | Expenses that need a look; the tab shows a count; see [To-do list](/about/to-do-list) |
| Balance | The balance today, a settle-up button, and the figures for the period on screen |
| Properties | The selected row, ready to change |

Panels sit in three dock areas (left, right and bottom) or float over the work area.

- Drag a panel's tab onto another panel to join it as a tab, beside a panel to split the space, to a window edge to dock it there, or into the work area to float it. A blue rectangle shows where it will land. Escape cancels the drag.
- Drag the thin lines between panels to resize them.
- A floating panel moves by its tab bar and resizes from any edge or corner. It sticks to nearby edges; hold Alt to place it freely. Dropping it on another panel's tab bar joins that panel; hold Shift to stop that.
- The × on a panel's tab closes it. The View menu opens it again.

## Workspaces

A workspace is a saved arrangement of panels, kept for your account.

| Workspace | Panels |
|---|---|
| Entry | Years and To-do on the left; Properties and Balance on the right |
| Review | To-do above Years on the left; Properties on the right |
| Reports | Years on the left; Balance on the right |

## Command line

**View > Command line** shows a line at the bottom labeled "Command:". Type the name of any command as it appears in a menu or on the ribbon (for example "summary" or "export workbook") and press Enter. A part of a name is enough when it starts only one command. The list of names appears as you type.

## Status bar

| Item | What it shows |
|---|---|
| View and period | For example "Expenses: November 2026" |
| Selection | How many rows are selected |
| Total | The total of the expenses shown, and of the selected expenses |
| Balance today | Who owes whom today |
| Saving | All changes saved, Saving..., Changes waiting to save, Saved in this browser, Read-only, Demo: not saved, or Not saved with the reason |
| Messages | A short confirmation of the last action, shown for about 3 seconds |
