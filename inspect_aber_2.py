import openpyxl
import glob

files = glob.glob('public/contexto/*ABER*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Hoja1']

for i, row in enumerate(ws.iter_rows(min_row=4, max_row=8, values_only=True)):
    print(f"Row {i+4}: {row[14:]}")
