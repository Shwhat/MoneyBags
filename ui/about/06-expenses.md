# Expenses

An expense is one purchase or bill. This page covers its fields and every way to add, change, find and delete expenses.

## Fields

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Date | Date | Yes, for the balance | Today in the current month, otherwise the 1st of the month on screen | An expense with no date is listed in the To-do panel and left out of every balance |
| Vendor | Text | Vendor or amount | Blank | Where the money went; vendors used before are suggested as you type |
| Category | List | No | Blank, or the vendor's last category | See [Categories](/about/categories) |
| Paid by | One of the two people | Yes, for the balance | The signed-in person (see [Settings](/about/settings)) | |
| Split | Y or N | Yes, for the balance | Y | Y: joint, split 50/50. N: paid for the other person. See [Splitting and balances](/about/splitting-and-balances) |
| Amount | Money | Vendor or amount | Blank | A blank amount counts as $0.00 and is listed in the To-do panel |
| Cash back | Money | No | Blank | Money back from the credit card; it comes off the amount |
| Amount saved | Money | No | Blank | A note of money saved (for example a discount); it does not change any total |
| Notes | Text | No | Blank | |
| Needs review | Yes or no, with a reason | No | No | Lists the expense in the To-do panel with the reason |
| Final total | Worked out | | | Amount minus cash back |
| Each person's share | Worked out | | | See [Splitting and balances](/about/splitting-and-balances) |
| Added, Added by | Recorded | | | The day the expense was added and who added it (a user name, Recurring bill or Excel import) |
| Recurring bill | Recorded | | | The bill that added the expense, as a link |
| Imported from | Recorded | | | The workbook file and row it came from |

Money is typed as a number, with or without a dollar sign and commas, such as 12.5, $12.50 or 1,250. A number in brackets, such as (12.00), is negative.

## The expense list

The Expenses view lists the expenses in the period on screen.

| Column | Shows |
|---|---|
| Date | The date, or **No date** |
| Vendor | The vendor; **Bill** when a recurring bill added it; **Review** when it needs a look (point at it for the reasons) |
| Category | The category name |
| Paid by | Who paid |
| Split | **Y** (blue), **N** (orange) or **?** when not set |
| Amount | The amount, or **Blank** |
| Cash back | Money back from the card |
| Final | Amount minus cash back |
| (person)'s share | Each person's share |
| Notes | The notes |

The bottom row shows the number of expenses and the totals of the money columns. When a whole year is shown in date order, a heading row starts each month.

## Adding expenses

### Entry row

The first row under the column names is the entry row.

1. Press **N** (or select **New expense**). The cursor moves to the vendor field.
2. Type the vendor. Tab moves to the next field and Shift+Tab to the previous one.
3. Press **Enter** in any field of the row. The expense is added and selected, the row clears, and the cursor returns to the vendor field. Date, Paid by and Split keep their values, so a batch of receipts can be typed quickly.
4. **Escape** clears the row.

When the vendor was used before and the category is blank, the category of that vendor's last expense is filled in. When the new expense's date is outside the period on screen, the view moves to its month.

The entry row is not shown while the book is read-only.

### Duplicate

Select expenses and press **Ctrl+D** (or **Duplicate**). The copies have the same fields, a new added date, and no needs review mark or recurring bill link.

## Changing expenses

- Click a row, or select it and press **Enter**, or double-click it: the Properties panel shows every field. A change applies when you leave the field (or press Enter in it).
- Select several expenses: the Properties panel shows their count and total, with Category, Paid by and Split. A field shows **(mixed)** when the selected expenses differ. A change applies to every selected expense.
- **Change selected...** opens the same three fields in a dialog; **(keep as is)** leaves a field unchanged.

## Selecting

| Action | Result |
|---|---|
| Click | Selects one row |
| Ctrl+click | Adds or removes a row |
| Shift+click | Selects every row between the last clicked row and this one |
| Up and Down | Select the previous or next row |
| Shift+Up and Shift+Down | Add the previous or next row |
| Ctrl+A | Selects every row in the list |
| Escape | Clears the selection |

## Finding expenses

| Control | What it does |
|---|---|
| Search box (Ctrl+F) | Shows expenses whose vendor, notes, category, payer or amount contains the text; Escape clears it |
| All categories | One category, or **No category** |
| Anyone paid | Only expenses paid by one person |
| Joint and not joint | Joint (Y), For the other person (N), or Split not set |
| Needs review only | Only expenses with something to check |
| Clear filters | Clears the search and every filter |

The search and filters apply within the period on screen. "Filtered" appears in the header while any is on.

### Sorting

Click a column name to sort by it; click again to reverse. A blue arrow marks the sort column. The sort is remembered for your account. Rows with the same value keep the order they were added in.

## Needs review

- **Mark as needs review...** asks for a short reason and marks the selected expenses.
- **Mark reviewed** clears the mark. **Done** in the To-do panel clears it for one expense.
- The Properties panel has a Needs review box and the reason.

## Deleting expenses

Select expenses and press **Delete** (or **Delete** on the ribbon or in the Edit menu). One expense is deleted at once; several ask first. Ctrl+Z brings deleted expenses back. Deleting an expense added by a recurring bill does not make the bill add it again.
