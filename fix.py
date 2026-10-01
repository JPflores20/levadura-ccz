import re
with open("components/dashboard/comparacion-4v-tab.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = re.sub(r'key=\{MA-\}', r'key={`MA-${m}`}', text)
text = re.sub(r'key=\{MB-\}', r'key={`MB-${m}`}', text)
text = re.sub(r'key=\{A-\}', r'key={`A-${c}`}', text)
text = re.sub(r'<span className="truncate">\{tanqueB.length > 0 \? ', r'<span className="truncate">{tanqueB.length > 0 ? `${tanqueB.length} seleccionados` : ', text)

with open("components/dashboard/comparacion-4v-tab.tsx", "w", encoding="utf-8") as f:
    f.write(text)
