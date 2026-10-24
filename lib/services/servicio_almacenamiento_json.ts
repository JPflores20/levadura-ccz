/**
 * @fileoverview Servicio de persistencia híbrida (Firestore con fragmentación automática + JSON local).
 * Resuelve el límite de 1 MiB por documento de Cloud Firestore dividiendo `rawData` en fragmentos
 * de 500 registros y reconstruyéndolos de forma transparente al consultar.
 */

import { base_datos_firestore } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import fs from "fs"
import path from "path"

/**
 * Cantidad máxima de registros compactados por documento individual de Firestore para evitar superar 1 MiB.
 */
export const TAMANO_FRAGMENTO_FIRESTORE = 900

/**
 * Elimina propiedades vacías (`""`, `null`, `undefined`) de cada fila para reducir hasta un 80% el peso en Firestore.
 *
 * @param {Record<string, any>[]} lista_registros - Arreglo de registros a compactar.
 * @returns {Record<string, any>[]} Registros sin llaves vacías redundantes.
 */
export function compactar_registros_para_nube(
  lista_registros: Record<string, any>[]
): Record<string, any>[] {
  if (!Array.isArray(lista_registros)) return []
  return lista_registros.map((fila_actual) => {
    if (!fila_actual || typeof fila_actual !== "object") return fila_actual
    return Object.fromEntries(
      Object.entries(fila_actual).filter(
        ([, valor_celda]) => valor_celda !== "" && valor_celda !== null && valor_celda !== undefined
      )
    )
  })
}

/**
 * Divide un arreglo de registros en sub-arreglos de tamaño fijo (`tamano_maximo`).
 *
 * @template T
 * @param {T[]} lista_registros - Arreglo completo de registros a particionar.
 * @param {number} [tamano_maximo=500] - Cantidad máxima de elementos por fragmento.
 * @returns {T[][]} Lista de fragmentos generados.
 */
export function dividir_arreglo_en_fragmentos<T>(
  lista_registros: T[],
  tamano_maximo: number = TAMANO_FRAGMENTO_FIRESTORE
): T[][] {
  if (!Array.isArray(lista_registros) || lista_registros.length === 0) {
    return [[]]
  }
  const tamano_seguro = Math.max(1, tamano_maximo)
  const lista_fragmentos: T[][] = []
  for (
    let indice_inicio = 0;
    indice_inicio < lista_registros.length;
    indice_inicio += tamano_seguro
  ) {
    lista_fragmentos.push(lista_registros.slice(indice_inicio, indice_inicio + tamano_seguro))
  }
  return lista_fragmentos
}

/**
 * Guarda un paquete de datos en el archivo JSON local de respaldo y en Cloud Firestore,
 * aplicando particionamiento automático si `rawData` supera `TAMANO_FRAGMENTO_FIRESTORE`.
 *
 * @param {string} identificador_documento - ID del documento en la colección `dashboards` (ej. `kinetics_stats`).
 * @param {string} nombre_archivo_local - Nombre del archivo JSON en la raíz del proyecto (ej. `database_kinetics.json`).
 * @param {Record<string, any>} paquete_completo - Objeto con metadatos, estadísticas y `rawData`.
 * @returns {Promise<{ guardado_local: boolean; guardado_firestore: boolean; total_fragmentos: number }>} Resultado de persistencia.
 */
export async function guardar_documento_respaldado(
  identificador_documento: string,
  nombre_archivo_local: string,
  paquete_completo: Record<string, any>
): Promise<{ guardado_local: boolean; guardado_firestore: boolean; total_fragmentos: number }> {
  let guardado_local = false
  let guardado_firestore = false

  const registros_totales = Array.isArray(paquete_completo.rawData)
    ? compactar_registros_para_nube(paquete_completo.rawData)
    : []
  const paquete_compactado = {
    ...paquete_completo,
    rawData: registros_totales
  }
  const fragmentos_registros = dividir_arreglo_en_fragmentos(
    registros_totales,
    TAMANO_FRAGMENTO_FIRESTORE
  )
  const total_fragmentos = fragmentos_registros.length

  const ruta_archivo_local = path.join(/*turbopackIgnore: true*/ process.cwd(), nombre_archivo_local)
  try {
    fs.writeFileSync(ruta_archivo_local, JSON.stringify(paquete_compactado, null, 2), "utf-8")
    guardado_local = true
  } catch (error_disco) {
    console.warn(`No se pudo escribir respaldo local ${nombre_archivo_local}:`, error_disco)
  }

  try {
    const documento_raiz = {
      ...paquete_compactado,
      rawData: fragmentos_registros[0] || [],
      totalChunks: total_fragmentos
    }
    await setDoc(doc(base_datos_firestore, "dashboards", identificador_documento), documento_raiz)

    if (total_fragmentos > 1) {
      const promesas_fragmentos = fragmentos_registros
        .slice(1)
        .map((registros_fragmento, indice_secundario) => {
          const id_fragmento = `${identificador_documento}_chunk_${indice_secundario + 1}`
          return setDoc(doc(base_datos_firestore, "dashboards", id_fragmento), {
            chunkIndex: indice_secundario + 1,
            updatedAt: new Date().toISOString(),
            rawData: registros_fragmento
          })
        })
      await Promise.all(promesas_fragmentos)
    }
    guardado_firestore = true
  } catch (error_firebase) {
    console.warn(`No se pudo guardar ${identificador_documento} en Firestore:`, error_firebase)
  }

  return { guardado_local, guardado_firestore, total_fragmentos }
}

/**
 * Lee un documento desde Cloud Firestore reensamblando todos sus fragmentos `rawData` si existen,
 * o recurre al archivo JSON local de respaldo en caso de desconexión.
 *
 * @param {string} identificador_documento - ID del documento en la colección `dashboards`.
 * @param {string} nombre_archivo_local - Nombre del archivo JSON local de respaldo.
 * @returns {Promise<Record<string, any> | null>} Paquete reconstruido o `null` si no existen datos.
 */
export async function leer_documento_respaldado(
  identificador_documento: string,
  nombre_archivo_local: string
): Promise<Record<string, any> | null> {
  try {
    const referencia_principal = doc(base_datos_firestore, "dashboards", identificador_documento)
    const instantanea_principal = await getDoc(referencia_principal)

    if (instantanea_principal.exists()) {
      const datos_principales = instantanea_principal.data()
      const cantidad_fragmentos = Number(datos_principales.totalChunks || 1)
      let registros_acumulados: any[] = Array.isArray(datos_principales.rawData)
        ? [...datos_principales.rawData]
        : []

      if (cantidad_fragmentos > 1) {
        const promesas_lectura = Array.from(
          { length: cantidad_fragmentos - 1 },
          (_, indice_extra) =>
            getDoc(
              doc(
                base_datos_firestore,
                "dashboards",
                `${identificador_documento}_chunk_${indice_extra + 1}`
              )
            )
        )
        const instantaneas_secundarias = await Promise.all(promesas_lectura)
        for (const instantanea_chunk of instantaneas_secundarias) {
          if (instantanea_chunk.exists()) {
            const datos_chunk = instantanea_chunk.data()
            if (Array.isArray(datos_chunk.rawData)) {
              registros_acumulados = registros_acumulados.concat(datos_chunk.rawData)
            }
          }
        }
      }

      return {
        ...datos_principales,
        rawData: registros_acumulados
      }
    }
  } catch (error_firebase) {
    console.warn(
      `No se pudo leer ${identificador_documento} desde Firestore, usando respaldo local:`,
      error_firebase
    )
  }

  const ruta_archivo_local = path.join(/*turbopackIgnore: true*/ process.cwd(), nombre_archivo_local)
  if (fs.existsSync(ruta_archivo_local)) {
    const contenido_texto = fs.readFileSync(ruta_archivo_local, "utf-8")
    return JSON.parse(contenido_texto)
  }

  return null
}
