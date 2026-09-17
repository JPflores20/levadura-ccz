import React, { useState, useRef, useEffect } from 'react';

interface CalendarFilterProps {
  label: string;
  options: string[]; // Fechas disponibles (idealmente en formato YYYY-MM-DD, pero intentaremos parsearlas)
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Normaliza cualquier string de fecha a un objeto Date (si es posible) y a string YYYY-MM-DD
function parseCustomDate(dateStr: string): { date: Date | null, isoStr: string, original: string } {
  let parsedDate: Date | null = null;
  const str = dateStr.trim();
  
  // Si es un número (formato Excel)
  if (!isNaN(Number(str))) {
    const excelEpoch = new Date(1899, 11, 30);
    parsedDate = new Date(excelEpoch.getTime() + Number(str) * 86400000);
  }
  // Si es YYYY-MM-DD
  else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    parsedDate = new Date(y, m - 1, d);
  }
  // Si es texto tipo "21 Julio"
  else {
    const parts = str.split(/[\s\-]+/);
    if (parts.length >= 2) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1].toLowerCase();
      let monthIndex = MESES.findIndex(m => m.toLowerCase().startsWith(monthStr.substring(0, 3)));
      if (!isNaN(day) && monthIndex !== -1) {
        parsedDate = new Date(new Date().getFullYear(), monthIndex, day);
      } else {
        parsedDate = new Date(str); // fallback
      }
    } else {
      parsedDate = new Date(str);
    }
  }

  // Verificar si es válida
  if (parsedDate && isNaN(parsedDate.getTime())) {
    parsedDate = null;
  }

  let isoStr = str;
  if (parsedDate) {
    const y = parsedDate.getFullYear();
    const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const d = String(parsedDate.getDate()).padStart(2, '0');
    isoStr = `${y}-${m}-${d}`;
  }

  return { date: parsedDate, isoStr, original: str };
}

export function CalendarFilter({ label, options, selectedOptions, onChange, isOpen, setIsOpen }: CalendarFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Mapeamos las opciones originales a ISO
  const availableDatesMap = new Map<string, string>(); // ISO -> Original
  let latestDate: Date | null = null;

  options.forEach(opt => {
    if (!opt || opt === "N/A") return;
    const { date, isoStr, original } = parseCustomDate(opt);
    if (date) {
      availableDatesMap.set(isoStr, original);
      if (!latestDate || date > latestDate) {
        latestDate = date;
      }
    } else {
      availableDatesMap.set(opt, opt); // Fallback
    }
  });

  // Al abrir, si hay una fecha seleccionada o disponible, ir a ese mes
  useEffect(() => {
    if (isOpen) {
      let dateToGo = latestDate || new Date();
      if (selectedOptions.length > 0) {
        const { date } = parseCustomDate(selectedOptions[selectedOptions.length - 1]);
        if (date) dateToGo = date;
      }
      setCurrentMonth(new Date(dateToGo.getFullYear(), dateToGo.getMonth(), 1));
    }
  }, [isOpen, latestDate, selectedOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const toggleDate = (originalOpt: string) => {
    if (selectedOptions.includes(originalOpt)) {
      onChange(selectedOptions.filter(x => x !== originalOpt));
    } else {
      onChange([...selectedOptions, originalOpt]);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    // Padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="w-8 h-8"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const originalOpt = availableDatesMap.get(isoStr);
      const isAvailable = !!originalOpt;
      const isSelected = isAvailable && selectedOptions.includes(originalOpt!);

      days.push(
        <button
          key={d}
          disabled={!isAvailable}
          onClick={() => isAvailable && toggleDate(originalOpt!)}
          className={`w-8 h-8 flex items-center justify-center text-xs rounded-full transition-all 
            ${!isAvailable ? 'text-zinc-700 cursor-not-allowed opacity-50' : 
              isSelected ? 'bg-yellow-500 text-black font-bold' : 
              'text-zinc-200 hover:bg-zinc-800 hover:text-yellow-500 border border-zinc-800 bg-[#121212]'}`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

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
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-2xl p-3 z-50 flex flex-col gap-2 min-w-[260px]">
            
            <div className="flex justify-between items-center mb-2">
              <button onClick={prevMonth} className="text-zinc-400 hover:text-yellow-500 px-2 py-1">◀</button>
              <div className="text-sm font-bold text-yellow-500">
                {MESES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button onClick={nextMonth} className="text-zinc-400 hover:text-yellow-500 px-2 py-1">▶</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Do','Lu','Ma','Mi','Ju','Vi','Sá'].map(d => (
                <div key={d} className="text-[10px] text-zinc-500 font-bold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800">
              <button 
                onClick={() => onChange([])} 
                className="text-xs text-zinc-400 hover:text-yellow-500 transition-colors"
              >
                Limpiar
              </button>
              <div className="text-[10px] text-zinc-500">{availableDatesMap.size} fechas disp.</div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
