const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');

// Replace the Tanque B block with a custom built one
const target = `<div className="flex-1 flex flex-col gap-2">
              <CheckboxFilter 
                label="🔴 Seleccionar Tanque(s) B" 
                options={tanksList.filter(t => t !== tanqueA)}
                selectedOptions={tanqueB}
                onChange={setTanqueB}
                isOpen={isTanqueBOpen}
                setIsOpen={setIsTanqueBOpen}
              />
            </div>`;

const replacement = `<div className="flex-1 flex flex-col gap-2">
              <label className="text-red-500 text-xs font-bold uppercase tracking-wider">🔴 Seleccionar Tanque(s) B</label>
              <div className="relative w-full">
                <button 
                  onClick={() => setIsTanqueBOpen(!isTanqueBOpen)} 
                  className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded p-2 outline-none hover:border-yellow-500 focus:border-yellow-500 w-full flex justify-between items-center h-[38px]"
                >
                  <span className="truncate">
                    {tanqueB.length === 0 ? "(Seleccionar)" : \`\${tanqueB.length} seleccionados\`}
                  </span>
                  <span className="ml-2 text-[10px]">▼</span>
                </button>
                
                {isTanqueBOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 w-full max-h-60 overflow-y-auto">
                    {tanksList.filter(t => t !== tanqueA).map(f => (
                      <label key={f} className="flex items-center gap-2 text-zinc-300 text-sm hover:bg-zinc-800/50 p-1.5 rounded cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="accent-yellow-500"
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
            </div>`;

code = code.replace(target, replacement);

// We need to handle clicking outside to close it, but wait!
// Is there a useEffect already for click outside?
// No, the CheckboxFilter handled it internally with containerRef.
// If I inline it, I must handle it in comparacion-4v-tab.tsx.
fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
console.log('Replaced block');
