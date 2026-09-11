import openpyxl
import glob

files = glob.glob('public/contexto/*ABER*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Hoja1']

col_a_empty = True
for row in ws.iter_rows(values_only=True):
    if row[0] is not None and str(row[0]).strip() != "":
        col_a_empty = False
        print(f"Col A has data: {row[0]}")
        break

print(f"Is Col A completely empty? {col_a_empty}")
