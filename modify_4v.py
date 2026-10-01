import re

with open('components/dashboard/comparacion-4v-tab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add uniqueMarcas
replacement_top = """  const statsData = dbData?.stats || []

  // Unique Marcas
  const uniqueMarcas = Array.from(new Set(statsData.map((d: any) => d.cepa?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A") as string[]
  uniqueMarcas.sort()

  const [marcaA, setMarcaA] = useState<string>("")
  const [marcaB, setMarcaB] = useState<string>("")

  // Unique Tanques A & B based on Marca
  const getTanquesForMarca = (marca: string) => {
    const data = marca ? statsData.filter((d: any) => d.cepa?.toString().trim().toUpperCase() === marca) : statsData
    const tqs = Array.from(new Set(data.map((d: any) => d.tanque?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A") as string[]
    tqs.sort()
    return tqs
  }

  const tanquesA = getTanquesForMarca(marcaA)
  const tanquesB = getTanquesForMarca(marcaB)

  const [tanqueA, setTanqueA] = useState<string>("")
  const [tanqueB, setTanqueB] = useState<string[]>([])"""

content = re.sub(r'  const statsData = dbData\?\.stats \|\| \[\]\s+// Unique Tanques\s+const uniqueTanques = .*?uniqueTanques\.sort\(\)\s+const \[tanqueA, setTanqueA\] = useState<string>\(uniqueTanques\[0\] \|\| ""\)\s+const \[tanqueB, setTanqueB\] = useState<string\[\]>\(\[\]\)', replacement_top, content, flags=re.DOTALL)

# Update useEffect
replacement_effect = """  React.useEffect(() => {
    if (uniqueMarcas.length > 0) {
      if (!marcaA) setMarcaA(uniqueMarcas[0])
      if (!marcaB) setMarcaB(uniqueMarcas[0])
    }
  }, [uniqueMarcas.length, marcaA, marcaB])

  React.useEffect(() => {
    if (tanquesA.length > 0 && (!tanqueA || !tanquesA.includes(tanqueA))) {
      setTanqueA(tanquesA[0])
    }
  }, [tanquesA, tanqueA])

  React.useEffect(() => {
    if (tanquesB.length > 0) {
      const validTanquesB = tanqueB.filter(t => tanquesB.includes(t))
      if (validTanquesB.length === 0) {
        setTanqueB([tanquesB[0]])
      } else if (validTanquesB.length !== tanqueB.length) {
        setTanqueB(validTanquesB)
      }
    }
  }, [tanquesB, tanqueB])"""

content = re.sub(r'  React\.useEffect\(\(\) => \{\s+if \(uniqueTanques\.length > 0\) \{\s+if \(!tanqueA\) setTanqueA\(uniqueTanques\[0\]\)\s+if \(tanqueB\.length === 0 && uniqueTanques\.length > 1\) setTanqueB\(\[uniqueTanques\[1\]\]\)\s+\}\s+\}, \[uniqueTanques\.length, tanqueA, tanqueB\]\)', replacement_effect, content, flags=re.DOTALL)


# Update UI
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
                    className="w-full bg-black border border-red-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-red-500 text-left flex justify-between items-center"
                  >
                    <span className="truncate">{tanqueB.length > 0 ? ${tanqueB.length} seleccionados : "Seleccionar..."}</span>
                    <span className="text-[10px]">?</span>
                  </button>
                  
                  {isOpenTanqueB && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-red-500/50 rounded-md shadow-xl max-h-60 overflow-y-auto">
                      <div className="p-1 flex flex-col gap-0.5">
                        {tanquesB.map(t => (
                          <label key={B-} className="flex items-center gap-2 p-1.5 hover:bg-zinc-800 rounded cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                checked={tanqueB.includes(t)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTanqueB([...tanqueB, t])
                                  } else {
                                    setTanqueB(tanqueB.filter(x => x !== t))
                                  }
                                }}
                                className="peer appearance-none w-3.5 h-3.5 border border-zinc-500 rounded-sm checked:bg-red-500 checked:border-red-500 cursor-pointer"
                              />
                              <svg className="absolute w-2.5 h-2.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <span className="text-xs text-zinc-300 group-hover:text-white">{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>"""

content = re.sub(r'        \{/\* Controles Principales \*/\}.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>', replacement_ui, content, flags=re.DOTALL)

with open('components/dashboard/comparacion-4v-tab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
