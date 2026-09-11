import openpyxl
import os
import glob

files = glob.glob('public/contexto/*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Cineticas']

cols = [10, 11, 14, 15, 16, 17, 18, 20]
found = {c: False for c in cols}

for i, row in enumerate(ws.iter_rows(min_row=7, max_row=5000, values_only=True)):
    for c in cols:
        if row[c] is not None and str(row[c]).strip() != "":
            found[c] = True
            
for c, is_found in found.items():
    print(f"Col {c}: {'FOUND' if is_found else 'EMPTY'}")
