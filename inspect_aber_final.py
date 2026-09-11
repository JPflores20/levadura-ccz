import openpyxl
import glob

files = glob.glob('public/contexto/*ABER*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Hoja1']

for i, row in enumerate(ws.iter_rows(min_row=6, max_row=8, values_only=True)):
    print(f"Row {i+6}: Linea: {row[1]}, Fecha: {row[5]}, LAC: {row[14]}, ABER: {row[15]}, DIF: {row[16]}, Solidos: {row[22]}")
