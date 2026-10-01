import re

with open('components/dashboard/comparacion-4v-tab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement_ui = """        {/* Controles Principales */}
        <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-zinc-800 p-4 rounded-md shadow-lg items-center justify-between">
          
          {/* Lado A */}
          <div className="flex-1 flex flex-col gap-2 p-2 border border-blue-500/30 rounded">
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">??? Marca A</label>
                <select 
                  value={marcaA}
                  onChange={e => setMarcaA(e.target.value)}
                  className="bg-black border border-blue-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Seleccione marca...</option>
                  {uniqueMarcas.map(m => <option key={MA-} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex-[2] flex flex-col gap-1">
                <label className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">??? Tanque A</label>
                <select 
                  value={tanqueA}
                  onChange={e => setTanqueA(e.target.value)}
                  className="bg-black border border-blue-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Seleccione un tanque...</option>
                  {tanquesA.map(c => <option key={A-} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Lado B */}
          <div className="flex-1 flex flex-col gap-2 p-2 border border-red-500/30 rounded" ref={dropdownRef}>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-red-500 text-[10px] font-bold uppercase tracking-wider">??? Marca B</label>
                <select 
                  value={marcaB}
                  onChange={e => setMarcaB(e.target.value)}
                  className="bg-black border border-red-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-red-500"
                >
                  <option value="" disabled>Seleccione marca...</option>
                  {uniqueMarcas.map(m => <option key={MB-} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex-[2] flex flex-col gap-1 relative">
                <label className="text-red-500 text-[10px] font-bold uppercase tracking-wider">??? Tanque(s) B</label>
                <div className="relative w-full">
                  <button 
                    onClick={() => setIsOpenTanqueB(!isOpenTanqueB)}
                    className="w-full bg-black border border-red-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-red-500 text-left flex justify-between items-center h-[32px]"
                  >
                    <span className="truncate">{tanqueB.length > 0 ? ${tanqueB.length} seleccionados : "Seleccionar..."}</span>
                    <span className="text-[10px]">?</span>
                  </button>
                  
                  {isOpenTanqueB && (
                    <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-red-500/50 rounded shadow-xl p-2 z-50 flex flex-col gap-1 w-full max-h-60 overflow-y-auto">
                      {tanquesB.map(f => (
                        <label key={f} className="flex items-center gap-2 text-zinc-300 text-sm hover:bg-zinc-800/50 p-1.5 rounded cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="accent-red-500"
                            checked={tanqueB.includes(f)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTanqueB([...tanqueB, f])
                              } else {
                                setTanqueB(tanqueB.filter(x => x !== f))
                              }
                            }}
                          />
                          <span className="truncate" title={f}>{f}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>"""

# Replace from "{/* Controles Principales */}" up to the closing tags
pattern = re.compile(r'\{\/\* Controles Principales \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>', re.DOTALL)
content = pattern.sub(replacement_ui, content)

with open('components/dashboard/comparacion-4v-tab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("UI replaced")
