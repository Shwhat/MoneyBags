# Messages

Short confirmations appear on the right of the status bar for about 3 seconds. Questions and errors open a dialog. This page lists every message.

## Confirmations

| Message | When |
|---|---|
| Added (vendor) (amount) | An expense was added from the entry row |
| Recorded (amount) from (person) to (person) | A settle-up entry was added; the dialog version also shows the new balance |
| Added (bill), Saved (bill), (n) expenses added | A recurring bill was added or saved, and how many expenses it added |
| Added (n) expenses for this bill | A bill change added months |
| Added (n) recurring bills for this month | Bills were added when the book opened or a month arrived |
| Duplicated (n) expenses, Duplicated (n) entries | Rows were copied |
| Deleted (n) expenses. Ctrl+Z brings them back. | Rows were deleted |
| Changed (n) expenses | Several expenses were changed together |
| Marked (n) reviewed, Marked reviewed, Marked (n) as needs review | Needs review marks changed |
| Imported (n) expenses, (n) in the To-do panel | An import finished |
| Exported (n) expenses to (file), Exported (n) settle-up entries to (file), Exported (file), Downloaded (file) | A file was saved |
| Book restored from (source) | A restore finished |
| Categories saved, Added category (name), Settings saved | Book changes applied |
| MoneyBags is set up for (name) and (name) | First run finished |
| Undo, Redo, Nothing to undo, Nothing to redo | History |
| Saved, All changes are saved | Save now |
| Filters cleared, (n) selected | The list changed |
| Light theme, Dark theme, Theme follows the computer | The theme changed |
| Workspace: (name), Saved workspace (name), Ribbon saved, Default ribbon restored. Save to keep it. | Layout changed |
| Command line on, Command line off, Command: (name) | The command line |
| Demo book opened. Changes are not saved. Help > Close the demo book returns to your book. | The demo opened |
| Closed the demo book, The demo book is not saved | The demo |
| You can edit the book again | The other person finished editing |
| Loaded the latest book | Load their version was chosen |
| Password changed. Other devices are signed out. | Password changed |

## Problems with what was typed

| Message | What to do |
|---|---|
| Type a vendor or an amount first | Enter at least one of them |
| The amount must be a number, like 12.50 | Type digits, with or without $ and commas |
| Cash back must be a number, like 1.25 | As above |
| Enter a number, like 12.50, or leave it blank | As above (Properties panel) |
| Enter a date for the expense, Enter a date, Enter a full date | Choose a full date |
| Enter an amount above zero, like 250.00 | Settle-up amounts must be above zero |
| From and To must be different people | Choose two different people |
| Give the bill a name, like Power | Name the bill |
| The amount must be a number, or blank | Fix the bill amount |
| The day must be from 1 to 28 | Pick a day that every month has |
| Choose the first month | Pick a first month for the bill |
| The last month must be on or after the first month | Fix the bill's months |
| The bill needs a name | A bill name cannot be blank |
| Enter both names., The two names must be different. | First-run names |
| Names and letters cannot be blank., The two letters must be different. | Book settings |
| Category names cannot be blank., Two categories have the same name., That category already exists, Type a name | Categories |
| Type a short reason | Needs review reason |
| Select rows first, Select expenses first | Select rows before the command |
| Duplicate works on expenses and payments | Duplicate is not used on recurring bills |
| None of the selected expenses is marked as needs review | Nothing to clear |
| Select or add a group first. | Customize ribbon: choose a group |
| Unknown command: (text) | Check the command name |
| Passwords need at least 8 characters., The new passwords do not match. | Change password |
| Enter the two names first | Import needs the setup dialog first |

## Sharing and saving

| Message | Meaning and what to do |
|---|---|
| Read-only: (name) is editing the book | Wait; the page becomes editable when they are done |
| The book is read-only right now | The book could not be loaded; reload the page |
| Not saved: (reason) | The save failed; it is tried again. Check the server if it stays |
| Could not save prefs.json: (reason) | A preference was not saved on the server |
| Book changed on the server | See [Undo and editing](/about/undo-and-editing) |
| The book could not be loaded from the server: (reason). Reload the page to try again. Nothing will be saved until it loads. | The server could not be reached; reload the page |
| Passwords are used on the server version only, Server backups exist on the server version only | The page runs without a server |

## Files

| Message | What to do |
|---|---|
| This file could not be read as an Excel workbook (reason). | Choose an .xlsx workbook |
| Nothing new to import. | Every row is already in the book or skipped |
| That file is not a MoneyBags backup. | Choose a backup file or a book.json |
| There are no server backups yet. | The server makes one after the first save of a day |
| Could not read that backup: (reason) | Try another day, or check the server |

## Sign-in page

| Message | What to do |
|---|---|
| Wrong user name or password. | Check both; names ignore case, passwords do not |
| Too many attempts. Try again in a few minutes. | Wait 5 to 15 minutes |
| That user name is taken. | Choose another name |
| User names are 3 to 32 letters, digits, dots, dashes or underscores, starting with a letter or digit. | Change the name |
| Passwords need at least 8 characters. | Use a longer password |
| The passwords do not match. | Type the same password twice |
| New accounts are turned off on this server. | The account limit is reached or sign-up is off |
| The current password is wrong. | Change password: check the current password |
| The server could not be reached., Something went wrong. | Check the server and the network |

## Questions

| Dialog | Choices |
|---|---|
| Delete (n expenses or settle-up entries)? | Cancel, Delete |
| Delete the recurring bill (name)? Expenses already added stay in the list. | Cancel, Delete |
| Restore: Replace the whole book with (source)? | Cancel, Replace the book |
| Export expenses (CSV) | Cancel, All expenses, Expenses shown |
| Book changed on the server | Cancel, Load their version, Keep my version |
