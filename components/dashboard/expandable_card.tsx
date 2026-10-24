/**
 * @fileoverview Contenedor de tarjeta con botón de expansión a pantalla completa mediante modal (Dialog).
 */

"use client"

import React, { useState } from "react"
import { Maximize2 } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PropiedadesTarjetaExpandible {
  title: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  headerAction?: React.ReactNode
}

/**
 * Envuelve cualquier gráfica o tabla permitiendo ampliarla en un diálogo de alta resolución.
 * @param propiedades_tarjeta - Título, contenido hijo y acciones opcionales de cabecera.
 * @returns Elemento JSX de la tarjeta expandible.
 */
export function ExpandableCard({
  title: titulo_tarjeta,
  children: contenido_hijo,
  className: clases_tarjeta,
  contentClassName: clases_contenido,
  headerClassName: clases_cabecera,
  headerAction: accion_cabecera,
}: PropiedadesTarjetaExpandible) {
  const [esta_expandida, cambiar_estado_expandida] = useState(false)

  const estilos_grafica_expandida = [
    "[&>div]:!h-full [&>div]:!max-h-full",
    "[&_.recharts-text]:!text-[13px]",
    "[&_.recharts-legend-item-text]:!text-[14px]",
    "[&_.recharts-tooltip-item]:!text-[14px]",
    "[&_.recharts-tooltip-label]:!text-[15px]",
    "[&_.recharts-tooltip-label]:!mb-2",
  ].join(" ")

  return (
    <Card className={`border-yellow-500/40 bg-[#121212] text-white flex flex-col ${clases_tarjeta || ""}`}>
      <CardHeader className={`pb-2 flex flex-col items-start gap-2 space-y-0 ${clases_cabecera || ""}`}>
        <div className="flex items-start justify-between w-full">
          <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase mt-0.5 pr-4">
            {titulo_tarjeta}
          </CardTitle>
          <Dialog open={esta_expandida} onOpenChange={cambiar_estado_expandida}>
            <DialogTrigger
              render={
                <button className="text-zinc-500 hover:text-yellow-500 transition-colors -mt-1 -mr-1 p-1 shrink-0" />
              }
            >
              <Maximize2 className="size-3.5" />
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-full h-[85vh] bg-[#121212] border-yellow-500/40 text-white flex flex-col p-6">
              <DialogHeader className="flex flex-col items-start gap-2 border-b border-yellow-500/30 pb-4 space-y-0 w-full">
                <div className="flex items-start justify-between w-full">
                  <DialogTitle className="text-yellow-500 uppercase tracking-widest text-lg pr-4">
                    {titulo_tarjeta}
                  </DialogTitle>
                </div>
                {accion_cabecera && (
                  <div className="w-full flex justify-start sm:justify-end">{accion_cabecera}</div>
                )}
              </DialogHeader>
              {esta_expandida && (
                <div className={`flex-1 w-full min-h-0 mt-4 overflow-hidden ${estilos_grafica_expandida}`}>
                  {contenido_hijo}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        {accion_cabecera && (
          <div className="w-full flex justify-start sm:justify-end">{accion_cabecera}</div>
        )}
      </CardHeader>
      <div className={`pb-4 px-4 shrink-0 ${clases_contenido || ""}`}>
        {!esta_expandida && contenido_hijo}
      </div>
    </Card>
  )
}
