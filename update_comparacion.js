const fs = require('fs');
const file = 'components/dashboard/comparacion-tab.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove handleCapture
content = content.replace(/  const handleCapture = async \(\) => {[\s\S]*?  }\n/, '');

// 2. Remove Camera and htmlToImage imports
content = content.replace(/import \* as htmlToImage from 'html-to-image'\n/, '');
content = content.replace(/import \{ Camera \} from 'lucide-react'\n/, '');

// 3. Replace the two filter divs with a single div
const searchStr = `    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-comparacion">
      
      {/* Filtros Globales (Código, Dobleteo, Estado) */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-zinc-800 p-4 rounded-md shadow-lg">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Código de Cultivo</label>
          <select 
            value={filterCodigo}
            onChange={e => setFilterCodigo(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {codigosUnicos.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Dobleteo</label>
          <select 
            value={filterDobleteo}
            onChange={e => setFilterDobleteo(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {dobleteosUnicos.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Estado</label>
          <select 
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {estadosUnicos.map((e: string) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Controles de Selección */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-yellow-500/20 p-4 rounded-md shadow-lg relative">
        <button 
          onClick={handleCapture}
          className="absolute -top-3 right-4 flex items-center gap-1.5 bg-[#0a0a0a] hover:bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] transition-colors uppercase font-bold z-10"
          title="Capturar pantalla"
        >
          <Camera size={12} />
          Captura
        </button>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-blue-500 text-xs font-bold uppercase tracking-wider">🔵 Seleccionar Lote A</label>
          <select 
            value={loteAId}
            onChange={e => setLoteAId(e.target.value)}
            className="bg-black border border-blue-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="" disabled>Seleccione un lote...</option>
            {uniqueLotes.map((l: any) => <option key={\`A-\${l.id}\`} value={l.id}>{l.label}</option>)}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-red-500 text-xs font-bold uppercase tracking-wider">🔴 Seleccionar Lote B</label>
          <select 
            value={loteBId}
            onChange={e => setLoteBId(e.target.value)}
            className="bg-black border border-red-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="" disabled>Seleccione un lote...</option>
            {uniqueLotes.map((l: any) => <option key={\`B-\${l.id}\`} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </div>`;

const replaceStr = `    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg">
      
      {/* Filtros Globales y de Selección Combinados */}
      <div className="flex flex-col xl:flex-row gap-4 bg-[#121212] border border-yellow-500/20 p-3 rounded-md shadow-lg overflow-x-auto">
        <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Código de Cultivo</label>
          <select 
            value={filterCodigo}
            onChange={e => setFilterCodigo(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {codigosUnicos.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Dobleteo</label>
          <select 
            value={filterDobleteo}
            onChange={e => setFilterDobleteo(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {dobleteosUnicos.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[120px] flex flex-col gap-1.5 border-r border-zinc-800 pr-4">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Estado</label>
          <select 
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {estadosUnicos.map((e: string) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="flex-[1.5] min-w-[180px] flex flex-col gap-1.5">
          <label className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">🔵 Tanque A</label>
          <select 
            value={loteAId}
            onChange={e => setLoteAId(e.target.value)}
            className="bg-black border border-blue-500/50 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-blue-500"
          >
            <option value="" disabled>Seleccione un tanque...</option>
            {uniqueLotes.map((l: any) => <option key={\`A-\${l.id}\`} value={l.id}>{l.label}</option>)}
          </select>
        </div>

        <div className="flex-[1.5] min-w-[180px] flex flex-col gap-1.5">
          <label className="text-red-500 text-[10px] font-bold uppercase tracking-wider">🔴 Tanque B</label>
          <select 
            value={loteBId}
            onChange={e => setLoteBId(e.target.value)}
            className="bg-black border border-red-500/50 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-red-500"
          >
            <option value="" disabled>Seleccione un tanque...</option>
            {uniqueLotes.map((l: any) => <option key={\`B-\${l.id}\`} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </div>`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content);
console.log("Updated comparacion-tab.tsx successfully");
