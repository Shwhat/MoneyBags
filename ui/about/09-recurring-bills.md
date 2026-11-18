# Recurring bills

A recurring bill adds one expense each month by itself. This page covers the bill fields, when expenses are added and how to change or stop a bill.

## Fields

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Bill name | Text | Yes | Blank | Becomes the vendor of each expense |
| Amount | Money or blank | No | Blank | Blank: each expense is added with no amount and listed in the To-do panel until it is entered |
| Paid by | One of the two people | Yes | The signed-in person | |
| Split | Y, N or P | Yes | Y | P suits a bill that belongs to one person, such as a personal phone plan |
| Category | List | No | No category | |
| Day of the month | 1 to 28 | Yes | 1 | The date of each expense |
| First month | Month | Yes | The current month | |
| Last month | Month or blank | No | Blank (no end) | Must be on or after the first month |
| Active | Yes or no | Yes | Yes | A paused bill adds nothing |
| Notes | Text | No | Blank | Copied to each expense |

## When expenses are added

- One expense is added for every month from the first month through the current month, on the bill's day.
- When the first month is in the past, every missed month is added at once.
- Future months are added when they arrive: when the book is opened, and every 15 minutes while it stays open.
- Expenses are added only by the person who can edit the book; a read-only book adds nothing until it can be edited.
- MoneyBags remembers each month it has added. An expense deleted from the list is not added again.
- Each added expense shows **Bill** in the list, and the Properties panel links back to the bill.

## Adding a bill

1. Select **Insert > Recurring bill...**, **Recurring bill** on the Home tab, or **New recurring bill...** in the Recurring bills view.
2. Fill in the fields and select **Add bill**. The message says how many expenses were added.

## The Recurring bills view

| Column | Shows |
|---|---|
| Bill | The name; **Paused** when not active |
| Amount | The amount, or "Enter each month" |
| Paid by, Split, Category, Day | As set |
| Starts, Ends | The first and last month; "No end" when there is none |
| Added | How many expenses the bill has added that are still in the list |
| Next | The date of the next expense, or None |

## Changing a bill

Select a bill and change it in the Properties panel, or press Enter or double-click it to open the bill dialog. Changes apply to months added from then on; expenses already added keep their values. Moving the first month earlier adds the newly covered months at once.

## Stopping a bill

- Clear **Active** to pause it, or set a last month.
- **Delete** asks first, then deletes the bill. Expenses it already added stay in the list.
