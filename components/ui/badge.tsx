/**
 * @fileoverview Componente de insignia (Badge) reutilizable con variantes visuales.
 */

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { combinar_clases_css } from "@/lib/utils"

const variantes_insignia = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

/**
 * Renderiza una etiqueta o insignia estilizada.
 *
 * @param {object} propiedades_insignia - Clases, variante y propiedades del elemento span.
 * @returns {JSX.Element} Elemento de insignia.
 */
function Badge({
  className: clases_personalizadas,
  variant: variante_visual = "default",
  render: renderizador_personalizado,
  ...propiedades_restantes
}: useRender.ComponentProps<"span"> & VariantProps<typeof variantes_insignia>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: combinar_clases_css(
          variantes_insignia({ variant: variante_visual }),
          clases_personalizadas
        )
      },
      propiedades_restantes
    ),
    render: renderizador_personalizado,
    state: {
      slot: "badge",
      variant: variante_visual
    }
  })
}

export { Badge, variantes_insignia as badgeVariants }
