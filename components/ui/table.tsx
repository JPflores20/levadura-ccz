"use client"

/**
 * @fileoverview Componentes de tabla HTML estilizada con soporte de desplazamiento horizontal.
 */

import * as React from "react"
import { combinar_clases_css } from "@/lib/utils"

function Table({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto custom-scrollbar">
      <table
        data-slot="table"
        className={combinar_clases_css("w-full caption-bottom text-sm", clases_personalizadas)}
        {...propiedades_restantes}
      />
    </div>
  )
}

function TableHeader({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={combinar_clases_css("[&_tr]:border-b", clases_personalizadas)}
      {...propiedades_restantes}
    />
  )
}

function TableBody({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={combinar_clases_css("[&_tr:last-child]:border-0", clases_personalizadas)}
      {...propiedades_restantes}
    />
  )
}

function TableFooter({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={combinar_clases_css(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

function TableRow({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={combinar_clases_css(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

function TableHead({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={combinar_clases_css(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

function TableCell({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={combinar_clases_css(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

function TableCaption({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={combinar_clases_css("mt-4 text-sm text-muted-foreground", clases_personalizadas)}
      {...propiedades_restantes}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
}
