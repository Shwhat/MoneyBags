# Exporting

MoneyBags saves CSV and Excel files to the browser's download folder. Every export uses the names in Book settings for the person columns.

## Expenses (CSV)

**File > Export expenses (CSV)...** asks for **Expenses shown** (the period on screen with any filters, in list order) or **All expenses** (the whole book in date order).

| Column | Contents |
|---|---|
| Date | YYYY-MM-DD |
| Vendor | Text |
| Category | Name |
| Paid by | Name |
| Split (Y/N/P) | Y, N, P or blank |
| Amount | Number, blank when blank |
| Cash back | Number or blank |
| Amount saved | Number or blank |
| Final total | Number |
| (first person)'s share | Number |
| (second person)'s share | Number |
| Notes | Text |
| Needs review | The reasons, or blank |
| Recurring bill | The bill name, or blank |
| Added | YYYY-MM-DD |
| Added by | User name, Recurring bill or Excel import |

File name: moneybags-expenses-all.csv, or moneybags-expenses-YYYY-MM.csv or moneybags-expenses-YYYY.csv for the expenses shown.

## Payments (CSV)

**File > Export payments (CSV)...** saves every settle-up entry in date order as moneybags-payments-YYYY-MM-DD.csv.

| Column | Contents |
|---|---|
| Date | YYYY-MM-DD |
| From, To | Names |
| Amount | Number |
| Kind | Payment, Credit or Adjustment |
| Notes | Text |

## Workbook (Excel)

**File > Export workbook (Excel)...** saves moneybags-YYYY-MM-DD.xlsx with these sheets. Each sheet has a bold header row that stays in view when scrolling.

| Sheet | Contents |
|---|---|
| Expenses | Every expense, with the same columns as the CSV |
| Payments | Every settle-up entry, with the same columns as the CSV |
| Summary YYYY | One sheet per year, oldest first: the month-by-month table from the Summary view, a total row, and the balance carried in |
| Recurring bills | Bill, Amount, Paid by, Split (Y/N/P), Category, Day, First month, Last month, Active, Notes |
| Categories | Category, number of expenses, total |

## CSV format

- Commas between columns, lines ending in carriage return and line feed.
- Text with commas, quotes or line breaks is in double quotes, with quotes doubled.
- The file starts with a byte order mark so Excel reads names with accents correctly.

## Backups

**File > Download backup (.json)** saves the whole book; see [Storage and backups](/about/storage-and-backups).
