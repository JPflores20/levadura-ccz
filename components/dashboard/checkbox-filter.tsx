"use client"
import React, { useRef, useEffect } from "react"

interface CheckboxFilterProps {
  label: string
  options: string[]
  selectedOptions: string[]
  onChange: (selected: string[]) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function CheckboxFilter({ label, options, selectedOptions, onChange, isOpen, setIsOpen }: CheckboxFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{label}</label>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center"
        >
          <span className="truncate">
            {selectedOptions.length === 0 ? "(Todas)" : `${selectedOptions.length} seleccionadas`}
          </span>
          <span className="ml-2 text-[10px]">▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-60 overflow-y-auto">
            {options.length === 0 && <span className="text-zinc-500 text-xs">Sin datos</span>}
            
            {options.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1.5 rounded border-b border-zinc-700 pb-2 mb-1">
                <input 
                  type="checkbox" 
                  className="accent-yellow-500"
                  checked={selectedOptions.length === 0} 
                  onChange={() => onChange([])} 
                />
                (Todas)
              </label>
            )}
            
            {options.map(f => (
              <label key={f} className="flex items-center gap-2 text-zinc-300 text-sm hover:bg-zinc-800/50 p-1.5 rounded cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  className="accent-yellow-500"
                  checked={selectedOptions.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedOptions, f])
                    } else {
                      onChange(selectedOptions.filter(x => x !== f))
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
  )
}
