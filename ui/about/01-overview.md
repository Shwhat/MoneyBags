# Overview

MoneyBags is a shared expense tracker for two people who split household costs. It records what each person paid, works out what each person owes the other, and keeps a running balance that both people see.

| Area | What it holds |
|---|---|
| **Expenses** | Every purchase: vendor, amount, date, who paid, whether it is joint, category, cash back and notes |
| **Payments** | Settle-up entries between the two people: payments, credits and adjustments |
| **Recurring bills** | Monthly bills that add themselves, such as power, water and internet |
| **Summary** | The month-by-month table: joint spending, who paid it, shares, settle-up entries and the balance |
| **Charts** | Each person's share by month, spending by category and the balance over time |

Expenses and payments together make the balance. Recurring bills add expenses. The Summary and Charts views read the same numbers as the expense list, so every view agrees.

## Principles

1. **One shared book.** Both people work in the same book on the server. One person edits at a time; the other sees the book read-only until the first is done.
2. **Every change is saved.** Changes save a moment after they are made. The server also keeps a copy of the book for each day it is saved.
3. **The same math as the spreadsheet.** A joint expense is split in half. An expense paid for the other person is owed back in full.
4. **Nothing depends on the internet.** The program, its fonts, scripts and this guide are bundled with it.
5. **Data in a readable format.** The book is a JSON file, and every list can be exported to CSV or Excel.
6. **Every change can be undone.** Undo and redo cover every change made since the page was opened.

## In this guide

| Page | Covers |
|---|---|
| [Capabilities](/about/capabilities) | What MoneyBags can do today, and what is planned |
| [Getting started](/about/getting-started) | First sign-in, setting up the two names, the first expense |
| [Screen layout](/about/screen-layout) | Every menu, ribbon button, panel and status bar item |
| [Years and months](/about/years-and-months) | How time periods work and how to move between them |
| [Expenses](/about/expenses) | Adding, changing, finding and deleting expenses |
| [Splitting and balances](/about/splitting-and-balances) | How shares and the balance are worked out, with examples |
| [Settle-up payments](/about/settle-up-payments) | Recording payments, credits and adjustments |
| [Recurring bills](/about/recurring-bills) | Bills that add themselves each month |
| [Categories](/about/categories) | The category list and how to change it |
| [Summary and charts](/about/summary-and-charts) | Every summary column and chart |
| [To-do list](/about/to-do-list) | What needs a look and how to clear it |
| [Importing from Excel](/about/importing-from-excel) | Bringing in the old expense workbooks |
| [Exporting](/about/exporting) | CSV and Excel files, column by column |
| [Undo and editing](/about/undo-and-editing) | Undo, saving and one editor at a time |
| [Accounts and sign-in](/about/accounts-and-sign-in) | Accounts, sign-in, passwords and sessions |
| [Settings](/about/settings) | Book settings and personal preferences |
| [Keyboard shortcuts](/about/keyboard-shortcuts) | Every shortcut |
| [Storage and backups](/about/storage-and-backups) | Where the data lives, backups and restoring |
| [Messages](/about/messages) | Every message MoneyBags shows and what to do |
| [Limits](/about/limits) | What MoneyBags does not do |
| [Glossary](/about/glossary) | Terms used in MoneyBags |
| [Technical](/about/technical) | Architecture, installation, updates and components |
| [Release notes](/about/release-notes) | What changed in each update |
