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
          className="border-yellow-600/30 bg-zinc-900 text-xs text-zinc-200"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-yellow-600/30 bg-zinc-900 text-zinc-200">
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
    <header className="flex flex-col gap-3 border-b border-yellow-600/30 bg-zinc-950 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md border border-yellow-600/40 bg-yellow-500/10">
          <Crown className="size-5 text-yellow-500" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase">
            Sistema de Análisis de Levadura
          </h1>
          <span className="text-[10px] font-mono tracking-wide text-zinc-500">
            HMI · CERVECERÍA · v2.4
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ControlSelect
          label="Rango"
          defaultValue="7d"
          options={[
            { value: "24h", label: "Últimas 24 h" },
            { value: "7d", label: "Últimos 7 días" },
            { value: "30d", label: "Últimos 30 días" },
          ]}
        />
        <ControlSelect
          label="Lote"
          defaultValue="L-2418"
          options={[
            { value: "L-2418", label: "Lote L-2418" },
            { value: "L-2417", label: "Lote L-2417" },
            { value: "L-2416", label: "Lote L-2416" },
          ]}
        />
        <ControlSelect
          label="Tanque"
          defaultValue="FV-03"
          options={[
            { value: "FV-03", label: "Tanque FV-03" },
            { value: "FV-02", label: "Tanque FV-02" },
            { value: "FV-01", label: "Tanque FV-01" },
          ]}
        />
      </div>
    </header>
  )
}
