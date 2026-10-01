with open(r'C:\Users\pepej\.gemini\antigravity\brain\871684d6-bcaa-4bf5-8e56-63ba9ed941ca\excel_scripts.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines[10:140]:
        print(line.encode('ascii', 'ignore').decode('ascii'), end='')
