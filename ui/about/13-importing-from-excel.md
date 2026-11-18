# Importing from Excel

**File > Import from Excel...** (or **Import Excel** on the Data tab) reads the old expense workbooks into the book. Several workbooks can be chosen at once. The two names must be set up first; when they are not, the setup dialog opens.

## What is read

Only the **Expenses** sheet is read (or the first sheet when there is none by that name). The row with the column names "Vendor" and "Amount" marks the start; every row below it is read.

| Workbook column | Becomes | How the value is converted |
|---|---|---|
| Vendor | Vendor | Spaces at the ends are removed |
| Amount | Amount | A number; blank stays blank; text that is not a number is left blank and flagged |
| Date | Date | Excel dates and typed dates (11/3/2026, 2026-11-03, Nov 3, 2026) are read; anything else is left blank and flagged with what the cell held |
| Who Paid | Paid by | Matched to a person's letter (set in Book settings), full name or first name, ignoring case; no match leaves Paid by unset |
| Joint Expense (Y/N/H) | Split | Y or y: Y. N or n: N. H: Y, flagged as "Marked H (house)". Blank: not set |
| Amount Saved | Amount saved | A number; zero is left blank |
| Money Back from Credit Card | Cash back | A number; zero is left blank |

Columns found by their names can be in any order. When the names are missing, columns A, B, D, E, F, G and H are used. The formula columns (Final Total, the two person columns and Month) are not read; MoneyBags works them out itself. Rows where both Vendor and Amount are blank are skipped.

Every imported expense also gets:

- a category guessed from the vendor name (for example Power, Water and Internet: Utilities; Safeway, Trader Joes and Freddy: Groceries; Sushi, Pho and Lunch: Food; Hotel and Tickets: Travel; Amazon and Target: Household; anything else: Other)
- **Added by** Excel import, and **Imported from** with the file name and row number

## Rows that are skipped

| Rows | Why |
|---|---|
| Already in the book | Same date, vendor, amount, payer and split as an expense already in the book; importing a file twice adds nothing |
| Blank amount dated after today | Placeholders for future bills; set those bills up as [recurring bills](/about/recurring-bills) instead |

Two identical rows in the same workbook are both imported the first time.

## Rows that are flagged

These are imported and listed in the To-do panel:

- the amount is blank or could not be read
- the date could not be read
- joint or not is blank
- the Who Paid letter matches no one
- the row was marked H
- the file name holds a month range, such as "Expense OCT2025-SEP2026.xlsx", and the row's date falls outside it. The old Monthly Expenses sheet grouped rows by month only, so a wrong year was not noticed there.

## The preview

Before anything changes, a dialog shows for each file: new expenses, rows already in the book, blank future rows skipped, and rows that will need review. It also shows the total of the new expenses and the balance they make on their own, any Who Paid letters that match no one, and the first 25 rows that will need review. **Import** adds the new expenses; **Cancel** adds nothing. After importing, the view opens the most recent year in the files.

## What is not imported

- The Monthly Expenses sheet: MoneyBags works out the same figures itself.
- Payments noted beside the Monthly Expenses sheet. Record them in the Payments view; see [Settle-up payments](/about/settle-up-payments).
- Other sheets in the workbook.
