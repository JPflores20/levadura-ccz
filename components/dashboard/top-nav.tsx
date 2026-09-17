"use client"

import { Crown } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function ControlSelect({
  label,
  defaultValue,
  options,
}: {
  label: string
  defaultValue: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-medium tracking-wide text-zinc-500 uppercase sm:inline">
        {label}
      </span>
      <Select defaultValue={defaultValue}>
        <SelectTrigger
          size="sm"
          className="border-yellow-500/40 bg-[#121212] text-xs text-zinc-200"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-yellow-500/40 bg-[#121212] text-zinc-200">
          <SelectGroup>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export function TopNav() {
  return (
    <header className="flex flex-col gap-3 border-b border-yellow-500/40 bg-[#0a0a0a] px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md border border-yellow-500/40 bg-yellow-500/10">
          <Crown className="size-5 text-yellow-500" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase">
            Analisis de Levadura y Cineticas de Fermentacion- Reposo
          </h1>
          <span className="text-[10px] font-mono tracking-wide text-zinc-500">
            HMI · CERVECERÍA · v2.4
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Los filtros ahora viven dentro de las pestanas de forma individual para evitar complejidad de estado global */}
      </div>
    </header>
  )
}
