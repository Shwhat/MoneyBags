#!/usr/bin/env python3
"""Write tests/fixtures/expenses-sample.xlsx: a made-up workbook laid out like the old expense spreadsheets
(Expenses sheet with Vendor, Amount, Date, Who Paid, Joint Expense, Amount Saved, Money Back, and formula columns).
Usage: python3 tests/fixtures/make_fixture.py   (needs openpyxl)"""
import datetime, os
import openpyxl

wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Expenses'
ws['A1'] = 'Enter Things Here'; ws['I1'] = 'No touching'
ws.append(['Vendor', 'Amount', None, 'Date', 'Who Paid', 'Joint Expense (Y/N/H)', 'Amount Saved', 'Money Back from Credit Card', 'Final Total', 'Devon', 'Alex', 'Month'])
D = datetime.datetime
rows = [
    ('Power Oct', 168.32, D(2025, 10, 1), 'D', 'Y', None, None),
    ('Robot Vacuum', 1367.48, D(2025, 10, 12), 'D', 'Y', None, 50),
    ('Lunch out', 125.0, D(2025, 10, 11), 'A', 'Y', None, None),
    ('Freddy', 162.5, D(2025, 10, 3), 'A', 'y', 12.5, None),
    ('Devon Insurance Oct', 280.0, D(2025, 10, 1), 'A', 'N', None, None),
    ('Gift for Alex', 60.0, D(2025, 10, 20), 'D', 'n', None, None),
    ('Mystery', 20.0, D(2025, 11, 2), 'A', None, None, None),
    ('Sushi', 81.0, '#VALUE!', 'D', 'Y', None, None),
    ('House paint', 90.0, D(2025, 11, 5), 'D', 'H', None, None),
    ('Power Nov', None, D(2025, 11, 1), 'D', 'Y', None, None),
    ('Power Dec 2099', None, D(2099, 12, 1), 'D', 'Y', None, None),
    ('Water Dec 2099', 100.0, D(2099, 12, 1), 'A', 'Y', None, None),
    ('Unknown payer', 10.0, D(2025, 11, 9), 'Z', 'Y', None, None),
]
for i, r in enumerate(rows, start=3):
    v, a, d, w, j, s, c = r
    ws.cell(i, 1, v); ws.cell(i, 2, a); ws.cell(i, 4, d); ws.cell(i, 5, w); ws.cell(i, 6, j); ws.cell(i, 7, s); ws.cell(i, 8, c)
    if isinstance(d, D): ws.cell(i, 4).number_format = 'm/d/yyyy'
    ws.cell(i, 9, f'=B{i}-H{i}'); ws.cell(i, 10, f'=IF(E{i}="D",I{i},0)'); ws.cell(i, 11, f'=IF(E{i}="A",I{i},0)'); ws.cell(i, 12, f'=MONTH(D{i})')
for i in range(3 + len(rows), 40):  # formula-only rows, like the real sheets
    ws.cell(i, 9, f'=B{i}-H{i}')
ms = wb.create_sheet('Monthly Expenses'); ms['A1'] = 'Month'; ms['O17'] = 1700; ms['P17'] = 'Zelle'
here = os.path.dirname(os.path.abspath(__file__))
wb.save(os.path.join(here, 'expenses-sample.xlsx'))
wb.save(os.path.join(here, 'Expense OCT2025-SEP2026.xlsx'))  # same rows, with the months in the file name
