const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');

// Replace the CheckboxFilter block
code = code.replace(
  /<div className="flex-1 flex flex-col gap-2">\s*<CheckboxFilter[\s\S]*?\/>\s*<\/div>/,
  `<div className="flex-1 flex flex-col gap-2 relative" ref={dropdownRef}>
              <label className="text-red-500 text-xs font-bold uppercase tracking-wider">🔴 Seleccionar Tanque(s) B</label>
              <div className="relative w-full">
                <button 
                  onClick={() => setIsOpenTanqueB(!isOpenTanqueB)} 
                  className="bg-black border border-red-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none hover:border-red-500 focus:border-red-500 w-full flex justify-between items-center h-[38px]"
                >
                  <span className="truncate">
                    {tanqueB.length === 0 ? "(Seleccionar)" : \`\${tanqueB.length} seleccionados\`}
                  </span>
                  <span className="ml-2 text-[10px]">▼</span>
                </button>
                
                {isOpenTanqueB && (
                  <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 w-full max-h-60 overflow-y-auto">
                    {uniqueTanques.map(f => (
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
            </div>`
);

// We need to add useRef and useEffect to React import
if (!code.includes("useRef") || !code.includes("useEffect")) {
  code = code.replace(
    /import React, \{ useState \} from "react"/,
    `import React, { useState, useRef, useEffect } from "react"`
  );
}

// Add dropdownRef and click outside listener
if (!code.includes("dropdownRef")) {
  code = code.replace(
    /const \[isOpenTanqueB, setIsOpenTanqueB\] = useState\(false\)/,
    `const [isOpenTanqueB, setIsOpenTanqueB] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenTanqueB(false)
      }
    }
    if (isOpenTanqueB) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpenTanqueB, setIsOpenTanqueB])`
  );
}

// CheckboxFilter import can be removed
code = code.replace(/import \{ CheckboxFilter \} from "\.\/checkbox-filter"\n/, '');

fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
console.log('Replaced custom multiselect!');
