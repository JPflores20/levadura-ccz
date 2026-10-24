/**
 * @fileoverview Componentes estructurales de tarjeta (Card, CardHeader, CardTitle, CardContent, CardFooter).
 */

import * as React from "react"
import { combinar_clases_css } from "@/lib/utils"

/**
 * Contenedor principal de tarjeta.
 */
function Card({
  className: clases_personalizadas,
  size: tamano_tarjeta = "default",
  ...propiedades_restantes
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={tamano_tarjeta}
      className={combinar_clases_css(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

/**
 * Encabezado de tarjeta.
 */
function CardHeader({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={combinar_clases_css(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

/**
 * Título de tarjeta.
 */
function CardTitle({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={combinar_clases_css(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

/**
 * Descripción secundaria de tarjeta.
 */
function CardDescription({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={combinar_clases_css("text-sm text-muted-foreground", clases_personalizadas)}
      {...propiedades_restantes}
    />
  )
}

/**
 * Contenedor de acción en el encabezado de la tarjeta.
 */
function CardAction({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={combinar_clases_css(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

/**
 * Cuerpo de contenido principal de la tarjeta.
 */
function CardContent({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={combinar_clases_css("px-(--card-spacing)", clases_personalizadas)}
      {...propiedades_restantes}
    />
  )
}

/**
 * Pie de tarjeta.
 */
function CardFooter({
  className: clases_personalizadas,
  ...propiedades_restantes
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={combinar_clases_css(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent
}
