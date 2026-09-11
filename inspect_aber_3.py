import openpyxl
import glob

files = glob.glob('public/contexto/*ABER*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Hoja1']

for i, row in enumerate(ws.iter_rows(min_row=6, max_row=40, values_only=True)):
    if row[15] is not None:
        print(f"Row {i+6} Date: {row[5]} | Conteo ABER B.F: {row[15]} | Promedio Conteo LAC: {row[14]} | % Solidos: {row[22]}")
