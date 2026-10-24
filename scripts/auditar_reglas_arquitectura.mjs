/**
 * @fileoverview Script automatizado de auditoría de las 6 reglas inquebrantables de arquitectura.
 * Verifica límite de <= 200 líneas, nomenclatura `snake_case`, presencia de `@fileoverview`,
 * ausencia de nombres genéricos/de una sola letra y validez de importaciones `@/`.
 */

import fs from "fs"
import path from "path"

const DIRECTORIOS_AUDITADOS = ["app", "components", "lib", "scripts", "tests"]
const LIMITE_MAXIMO_LINEAS = 200

/**
 * Recorre recursivamente un directorio devolviendo las rutas de todos los archivos de código.
 *
 * @param {string} ruta_directorio - Carpeta raíz a inspeccionar.
 * @returns {string[]} Lista de rutas absolutas de archivos `.ts`, `.tsx` y `.mjs`.
 */
function listar_archivos_codigo(ruta_directorio) {
  if (!fs.existsSync(ruta_directorio)) return []
  const entradas = fs.readdirSync(ruta_directorio, { withFileTypes: true })
  let archivos_encontrados = []

  for (const entrada_actual of entradas) {
    const ruta_completa = path.join(ruta_directorio, entrada_actual.name)
    if (entrada_actual.isDirectory()) {
      archivos_encontrados = archivos_encontrados.concat(listar_archivos_codigo(ruta_completa))
    } else if (/\.(ts|tsx|mjs)$/.test(entrada_actual.name)) {
      archivos_encontrados.push(ruta_completa)
    }
  }
  return archivos_encontrados
}

/**
 * Ejecuta la auditoría integral sobre el árbol de directorios del repositorio.
 */
function ejecutar_auditoria_arquitectura() {
  const raiz_proyecto = process.cwd()
  const lista_archivos = DIRECTORIOS_AUDITADOS.flatMap((carpeta) =>
    listar_archivos_codigo(path.join(raiz_proyecto, carpeta))
  )

  const archivos_excedidos = []
  const archivos_sin_jsdoc = []
  const archivos_nombre_invalido = []
  const variables_prohibidas = []
  const importaciones_rotas = []
  let maximo_lineas_observado = 0
  let archivo_mas_largo = ""

  const patron_declaracion_prohibida = /\b(const|let|var)\s+(x|y|z|temp|data|val|item|i|e)\b/
  const patron_parametro_prohibido = /[(,]\s*(x|y|z|temp|data|val|item|i|e)\s*([:,)])/
  const patron_importacion_interna = /from\s+["']@\/([^"']+)["']/

  for (const ruta_archivo of lista_archivos) {
    const ruta_relativa = path.relative(raiz_proyecto, ruta_archivo).replace(/\\/g, "/")
    const contenido_crudo = fs.readFileSync(ruta_archivo, "utf-8")
    const lineas_archivo = contenido_crudo.split(/\r?\n/)
    const total_lineas = lineas_archivo.length

    if (total_lineas > maximo_lineas_observado) {
      maximo_lineas_observado = total_lineas
      archivo_mas_largo = ruta_relativa
    }

    if (total_lineas > LIMITE_MAXIMO_LINEAS) {
      archivos_excedidos.push(`${ruta_relativa} (${total_lineas} líneas)`)
    }

    if (!contenido_crudo.includes("@fileoverview")) {
      archivos_sin_jsdoc.push(ruta_relativa)
    }

    if (!ruta_relativa.startsWith("app/")) {
      const nombre_sin_extension = path.basename(ruta_archivo, path.extname(ruta_archivo))
      if (/[A-Z-]/.test(nombre_sin_extension)) {
        archivos_nombre_invalido.push(ruta_relativa)
      }
    }

    for (let indice_linea = 0; indice_linea < lineas_archivo.length; indice_linea++) {
      const texto_linea = lineas_archivo[indice_linea]
      const texto_recortado = texto_linea.trim()
      const es_comentario =
        texto_recortado.startsWith("//") ||
        texto_recortado.startsWith("*") ||
        texto_recortado.startsWith("/*")

      if (
        !es_comentario &&
        (patron_declaracion_prohibida.test(texto_linea) ||
          patron_parametro_prohibido.test(texto_linea))
      ) {
        variables_prohibidas.push(`${ruta_relativa}:${indice_linea + 1} -> ${texto_recortado}`)
      }

      const coincidencia_import = texto_linea.match(patron_importacion_interna)
      if (coincidencia_import) {
        const ruta_modulo = coincidencia_import[1]
        const candidato_ts = path.join(raiz_proyecto, `${ruta_modulo}.ts`)
        const candidato_tsx = path.join(raiz_proyecto, `${ruta_modulo}.tsx`)
        if (!fs.existsSync(candidato_ts) && !fs.existsSync(candidato_tsx)) {
          importaciones_rotas.push(`${ruta_relativa}:${indice_linea + 1} -> @/${ruta_modulo}`)
        }
      }
    }
  }

  console.log("====================================================")
  console.log(" AUDITORÍA DE REGLAS DE ARQUITECTURA (LEVADURA-CCZ)")
  console.log("====================================================")
  console.log(`Archivos auditados          : ${lista_archivos.length}`)
  console.log(`Máximo de líneas detectado  : ${maximo_lineas_observado} (${archivo_mas_largo})`)
  console.log(`Archivos > 200 líneas       : ${archivos_excedidos.length}`)
  console.log(`Archivos sin @fileoverview  : ${archivos_sin_jsdoc.length}`)
  console.log(`Nombres fuera de snake_case : ${archivos_nombre_invalido.length}`)
  console.log(`Variables prohibidas        : ${variables_prohibidas.length}`)
  console.log(`Importaciones @/ rotas      : ${importaciones_rotas.length}`)
  console.log("====================================================")

  const total_incumplimientos =
    archivos_excedidos.length +
    archivos_sin_jsdoc.length +
    archivos_nombre_invalido.length +
    variables_prohibidas.length +
    importaciones_rotas.length

  if (total_incumplimientos > 0) {
    for (const detalle_error of [
      ...archivos_excedidos,
      ...archivos_sin_jsdoc,
      ...archivos_nombre_invalido,
      ...variables_prohibidas,
      ...importaciones_rotas
    ]) {
      console.error(`  [INCUMPLIMIENTO] ${detalle_error}`)
    }
    process.exit(1)
  }
}

ejecutar_auditoria_arquitectura()
