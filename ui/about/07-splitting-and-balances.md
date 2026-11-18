# Splitting and balances

This page explains how MoneyBags works out each person's share and who owes whom. The rules are the same as the old Monthly Expenses sheet.

## The final total

Final total = Amount - Cash back. Every share and balance uses the final total.

## Split

| Split | Meaning | Shares | What it adds to the balance |
|---|---|---|---|
| Y | Joint: both people share it | Half each | The other person owes the payer half |
| N | Paid for the other person | All of it is the other person's | The other person owes the payer all of it |
| P | Personal: the payer's own | All of it is the payer's | Nothing; nobody owes anything |
| Not set | Not decided yet | All of it counts for the payer | Nothing, until the split is set |

An expense also adds nothing to the balance while it has no date or no payer. Such expenses are listed in the To-do panel.

### Rounding

Each expense's effect on the balance is rounded to whole cents, so a balance can always be paid exactly. When a joint expense has an odd number of cents, the payer gets the extra cent: half of $10.01 is owed as $5.01. Shares in the list are shown to the cent; totals add the unrounded shares. Halves of a cent round away from zero, as Excel's ROUND does.

## The balance

The balance is everything owed between the two people, added up from the first entry in the book:

- every expense with a date, a payer and a Y or N split, as in the table above (personal expenses add nothing)
- minus every settle-up entry; see [Settle-up payments](/about/settle-up-payments)

It is shown as one sentence, such as "Alex owes Devon $728.29", or "All square" when it is under half a cent.

| Where | Which balance |
|---|---|
| Status bar and Balance panel, "Balance today" | Everything dated today or earlier |
| Balance panel, "Entries dated after today change this to" | Shown only when later entries exist: the balance including them |
| Balance panel, "Balance at the end" | Everything dated up to the end of the period on screen |
| Summary, "Balance" column | Everything dated up to the end of each month |
| Summary, "Carried in from" | Everything dated up to the end of the previous year |

## Worked example

October 2025 from the old spreadsheet:

| Expense | Paid by | Split | Final | Devon's share | Alex's share | Balance effect |
|---|---|---|---|---|---|---|
| Devon's joint expenses | Devon | Y | $2,041.14 | $1,020.57 | $1,020.57 | Alex owes Devon $1,020.57 |
| Alex's joint expenses | Alex | Y | $584.55 | $292.275 | $292.275 | Devon owes Alex $292.28 |

Net for October: $1,020.57 - $292.28 = $728.29, so Alex owes Devon $728.29.

A personal expense changes nothing in this example: if Devon also paid $45.00 for a haircut marked P, Devon's share grows by $45.00 and the balance stays the same.

Adding a month where Alex paid Devon's $280.00 insurance (split N) and Devon paid a $100.50 joint grocery bill with $0.50 cash back:

- Insurance: Devon owes Alex $280.00.
- Groceries: final $100.00; Alex owes Devon $50.00.
- After October, the balance is $728.29 - $280.00 + $50.00 = $498.29: Alex owes Devon $498.29.
- If Alex then pays Devon $700.00, the balance is $498.29 - $700.00 = -$201.71: Devon owes Alex $201.71.

## Period figures

The Balance panel and the Summary view show these for the period on screen:

| Figure | How it is worked out |
|---|---|
| Joint spending | Final totals of joint (Y) expenses |
| (person) paid (joint) | Final totals of joint expenses that person paid |
| (person) paid for (other) | Final totals of N expenses that person paid |
| (person) personal | Final totals of P expenses that person paid |
| (person)'s share | Sum of that person's shares |
| Settle-up entries | Total of payments, credits and adjustments in the period, both directions |
| Net for the period | The balance effect of the period's expenses and settle-up entries only |
| Balance at the end | The running balance at the last day of the period |
