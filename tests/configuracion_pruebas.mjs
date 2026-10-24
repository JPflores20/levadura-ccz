/**
 * @fileoverview Registro de hooks de resolución de módulos para permitir que el ejecutor nativo
 * `node --test` resuelva importaciones con el alias `@/` y rutas relativas sin extensión `.ts`.
 */

import { registerHooks } from "node:module"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

/**
 * Inicializa la resolución del alias `@/` y de importaciones relativas TypeScript.
 */
export function registrar_alias_proyecto() {
  registerHooks({
    resolve(especificador_modulo, contexto_resolucion, siguiente_resolucion) {
      if (especificador_modulo.startsWith("@/")) {
        const ruta_relativa = especificador_modulo.slice(2)
        const candidato_archivo = path.join(process.cwd(), `${ruta_relativa}.ts`)
        const candidato_indice = path.join(process.cwd(), ruta_relativa, "index.ts")
        const ruta_final = fs.existsSync(candidato_archivo) ? candidato_archivo : candidato_indice
        return siguiente_resolucion(pathToFileURL(ruta_final).href, contexto_resolucion)
      }

      if (
        (especificador_modulo.startsWith("./") || especificador_modulo.startsWith("../")) &&
        !path.extname(especificador_modulo) &&
        contexto_resolucion.parentURL
      ) {
        const directorio_padre = path.dirname(fileURLToPath(contexto_resolucion.parentURL))
        const candidato_ts = path.resolve(directorio_padre, `${especificador_modulo}.ts`)
        if (fs.existsSync(candidato_ts)) {
          return siguiente_resolucion(pathToFileURL(candidato_ts).href, contexto_resolucion)
        }
      }

      return siguiente_resolucion(especificador_modulo, contexto_resolucion)
    }
  })
}

registrar_alias_proyecto()
