# Settle-up payments

A settle-up entry records money or value passed between the two people to pay down the balance. This page covers the three kinds and how to record and change them.

## Fields

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Date | Date | Yes | Today (dialog) or today in the current month (entry row) | Decides which month it counts in |
| From | One of the two people | Yes | The person who owes, from the balance today | Must differ from To |
| To | One of the two people | Yes | The other person | Choosing the same person as From swaps them |
| Amount | Money above zero | Yes | Blank, or the balance when opened from the Balance panel | |
| Kind | Payment, Credit or Adjustment | Yes | Payment | A label only; all three work the same way |
| Notes | Text | No | Blank | For example Zelle or the reason for an adjustment |

## How an entry changes the balance

Every entry lowers what the From person owes the To person by its amount. When From owed nothing, the entry makes To owe From instead.

| Kind | Typical use |
|---|---|
| Payment | Money sent: Zelle, cash, a bank transfer |
| Credit | Value given instead of money, such as the money from selling something of the other person's |
| Adjustment | A correction, or an opening balance carried over from the old spreadsheet |

## Recording an entry

- **Balance panel > Record settle-up payment...** opens the dialog with From, To and the amount set to settle the balance today exactly.
- **P**, **Insert > Settle-up payment...** or **Settle-up payment** on the Home tab opens the same dialog empty. Select **Record**.
- In the **Payments** view, the entry row at the top of the list works like the expense entry row: Tab moves between fields, Enter adds, Escape clears.

The dialog opens again with what was typed when the amount is not above zero, the date is missing, or From and To are the same.

## The Payments view

| Column | Shows |
|---|---|
| Date | The date |
| From, To | The two people |
| Amount | The amount |
| Kind | Payment, Credit or Adjustment |
| Effect | For example "Alex owes Devon $250.00 less" |
| Notes | The notes |

The bottom row shows the number of entries, their total and the balance today. Select an entry to change it in the Properties panel. Duplicate, Delete, Undo and selection work as for expenses.

## Entries from the old spreadsheet

The old Monthly Expenses sheet kept payments as notes beside the table (for example "Devon Zelle Aug 25" and "Motor Credit (Ebay)"). Those notes are not imported. Record each one in the Payments view, or record one Adjustment that brings the balance to the agreed figure.
