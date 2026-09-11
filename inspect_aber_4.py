import openpyxl
import glob

files = glob.glob('public/contexto/*ABER*.xlsx')
wb = openpyxl.load_workbook(files[0], read_only=True, data_only=True)
ws = wb['Hoja1']

found = 0
for i, row in enumerate(ws.iter_rows(min_row=6, max_row=1000, values_only=True)):
    aber_bf = row[15]
    aber_conteo = row[6]
    if (aber_bf is not None and str(aber_bf).strip() != "") or (aber_conteo is not None and str(aber_conteo).strip() != "" and str(aber_conteo).strip() != ""):
        print(f"Row {i+6} - Linea: {row[1]} Date: {row[5]} | Aber (Col6): {aber_conteo} | Aber B.F (Col15): {aber_bf} | LAC: {row[14]} | Solidos: {row[22]}")
        found += 1
        if found > 20: break
