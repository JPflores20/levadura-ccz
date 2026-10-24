"use client"

/**
 * @fileoverview Componentes de navegación por pestañas (Tabs, TabsList, TabsTrigger, TabsContent) basados en Base UI.
 */

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { combinar_clases_css } from "@/lib/utils"

function Tabs({
  className: clases_personalizadas,
  orientation: orientacion_pestanas = "horizontal",
  ...propiedades_restantes
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientacion_pestanas}
      className={combinar_clases_css(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

const variantes_lista_pestanas = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

function TabsList({
  className: clases_personalizadas,
  variant: variante_visual = "default",
  ...propiedades_restantes
}: TabsPrimitive.List.Props & VariantProps<typeof variantes_lista_pestanas>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variante_visual}
      className={combinar_clases_css(
        variantes_lista_pestanas({ variant: variante_visual }),
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

function TabsTrigger({
  className: clases_personalizadas,
  ...propiedades_restantes
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={combinar_clases_css(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-yellow-500/10 data-active:text-yellow-500 data-active:border-yellow-500/40 dark:data-active:border-yellow-500/40 dark:data-active:bg-yellow-500/10 dark:data-active:text-yellow-500",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        clases_personalizadas
      )}
      {...propiedades_restantes}
    />
  )
}

function TabsContent({
  className: clases_personalizadas,
  ...propiedades_restantes
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={combinar_clases_css("flex-1 text-sm outline-none", clases_personalizadas)}
      {...propiedades_restantes}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, variantes_lista_pestanas as tabsListVariants }
