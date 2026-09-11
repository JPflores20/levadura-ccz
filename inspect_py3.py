import openpyxl
import os
import glob

files = glob.glob('public/contexto/*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Cineticas']
has_glucosa = False
for i, row in enumerate(ws.iter_rows(min_row=7, max_row=5000, values_only=True)):
    if row[6] is not None: # % Glucosa
        print(f"Row {i+7} has Glucosa: {row[6]}")
        has_glucosa = True
        break
if not has_glucosa: print("No Glucosa data in first 5000 rows")
