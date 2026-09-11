import openpyxl
import os
import glob
files = glob.glob('public/contexto/*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Cineticas']
for row in ws.iter_rows(min_row=6, max_row=6, values_only=True):
    print(repr(row[20]))
