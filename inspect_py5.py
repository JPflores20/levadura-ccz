import openpyxl
import os
import glob

files = glob.glob('public/contexto/*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Cineticas']

for i, row in enumerate(ws.iter_rows(min_row=7, max_row=100, values_only=True)):
    if row[20] is not None and str(row[20]).strip() != "":
        print(f"Row {i+7} Celulas Vigorosas: {row[20]}")
