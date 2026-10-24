"use client"

/**
 * @fileoverview Pestaña de Comparación Cinéticas (4V) entre Marca/Tanque A y Marca/Tanque(s) B.
 * Delega la agrupación y preparación de series comparativas a `servicio_comparacion_4v`.
 */

import React, { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { ChartsGrid4v } from "@/components/dashboard/kinetics/charts_grid_4v"
import { CustomDropdownSelect } from "@/components/dashboard/custom_dropdown_select"
import {
  RUTAS_API_PANEL,
  CONFIGURACION_SWR_PANEL,
  obtener_datos_json_api
} from "@/lib/constantes_api"
import {
  agrupar_estadisticas_volatiles_4v,
  ordenar_tanques_por_completitud,
  preparar_serie_comparativa_volatil
} from "@/lib/services/servicio_comparacion_4v"

/**
 * Renderiza la pestaña de Comparación Cinéticas (4V) con selección de Marca/Tanque A vs Tanques B.
 *
 * @returns {JSX.Element} Vista de Comparación Cinéticas 4V.
 */
export function Comparacion4vTab() {
  const { data: datos_base_remotos } = useSWR(
    RUTAS_API_PANEL.OBTENER_CINETICA,
    obtener_datos_json_api,
    CONFIGURACION_SWR_PANEL
  )

  const registros_crudos = datos_base_remotos?.rawData || []
  const estadisticas_agrupadas = useMemo(() => agrupar_estadisticas_volatiles_4v(registros_crudos), [registros_crudos])

  const marcas_unicas = (
    Array.from(new Set(estadisticas_agrupadas.map((registro: any) => registro.cepa?.toString().trim().toUpperCase()))).filter(
      (marca) => marca && marca !== "N/A"
    ) as string[]
  ).sort()

  const [marca_seleccionada_a, establecer_marca_seleccionada_a] = useState<string>("")
  const [marca_seleccionada_b, establecer_marca_seleccionada_b] = useState<string>("")

  const obtener_tanques_por_marca = (nombre_marca: string) => {
    const subconjunto = nombre_marca
      ? estadisticas_agrupadas.filter((registro: any) => registro.cepa?.toString().trim().toUpperCase() === nombre_marca)
      : estadisticas_agrupadas
    const lista_tanques = Array.from(new Set(subconjunto.map((registro: any) => registro.tanque?.toString().trim().toUpperCase()))).filter(
      (tanque) => tanque && tanque !== "N/A"
    ) as string[]
    return lista_tanques.sort((tanque_a, tanque_b) => tanque_a.localeCompare(tanque_b, undefined, { numeric: true }))
  }

  const tanques_disponibles_a = obtener_tanques_por_marca(marca_seleccionada_a)
  const tanques_disponibles_b = obtener_tanques_por_marca(marca_seleccionada_b)

  const [tanque_seleccionado_a, establecer_tanque_seleccionado_a] = useState<string>("")
  const [tanques_seleccionados_b, establecer_tanques_seleccionados_b] = useState<string[]>([])

  useEffect(() => {
    if (marcas_unicas.length > 0) {
      const marca_preferida = marcas_unicas.includes("CORONA") ? "CORONA" : marcas_unicas[0]
      if (!marca_seleccionada_a) establecer_marca_seleccionada_a(marca_preferida)
      if (!marca_seleccionada_b) establecer_marca_seleccionada_b(marca_preferida)
    }
  }, [marcas_unicas, marca_seleccionada_a, marca_seleccionada_b])

  useEffect(() => {
    if (
      tanques_disponibles_a.length > 0 &&
      (!tanque_seleccionado_a || !tanques_disponibles_a.includes(tanque_seleccionado_a))
    ) {
      const mejores_tanques_a = ordenar_tanques_por_completitud(
        estadisticas_agrupadas,
        marca_seleccionada_a,
        tanques_disponibles_a
      )
      establecer_tanque_seleccionado_a(mejores_tanques_a[0] || tanques_disponibles_a[0])
    }
  }, [tanques_disponibles_a, tanque_seleccionado_a, marca_seleccionada_a, estadisticas_agrupadas])

  useEffect(() => {
    if (tanques_disponibles_b.length > 0) {
      const tanques_validos_b = tanques_seleccionados_b.filter((tanque) =>
        tanques_disponibles_b.includes(tanque)
      )
      if (tanques_validos_b.length === 0) {
        const mejores_tanques_b = ordenar_tanques_por_completitud(
          estadisticas_agrupadas,
          marca_seleccionada_b,
          tanques_disponibles_b
        )
        const segundo_tanque =
          mejores_tanques_b.find((tanque) => tanque !== tanque_seleccionado_a) ||
          mejores_tanques_b[1] ||
          mejores_tanques_b[0] ||
          tanques_disponibles_b[0]
        establecer_tanques_seleccionados_b([segundo_tanque])
      } else if (tanques_validos_b.length !== tanques_seleccionados_b.length) {
        establecer_tanques_seleccionados_b(tanques_validos_b)
      }
    }
  }, [
    tanques_disponibles_b,
    tanques_seleccionados_b,
    marca_seleccionada_b,
    tanque_seleccionado_a,
    estadisticas_agrupadas
  ])

  const obtener_series_tanque = (codigo_tanque: string, nombre_marca: string) =>
    !codigo_tanque
      ? []
      : estadisticas_agrupadas.filter(
          (registro: any) =>
            registro.tanque?.toString().trim().toUpperCase() === codigo_tanque &&
            (!nombre_marca || registro.cepa?.toString().trim().toUpperCase() === nombre_marca)
        )

  const series_tanque_a = obtener_series_tanque(tanque_seleccionado_a, marca_seleccionada_a)
  const mapa_series_tanques_b = tanques_seleccionados_b.map((codigo_tanque_b) => ({
    name: codigo_tanque_b,
    data: obtener_series_tanque(codigo_tanque_b, marca_seleccionada_b)
  }))

  const serie_diacetilo = preparar_serie_comparativa_volatil("DIACETILO", series_tanque_a, mapa_series_tanques_b)
  const serie_acetaldehido = preparar_serie_comparativa_volatil("ACETALDEHIDO", series_tanque_a, mapa_series_tanques_b)
  const serie_esteres = preparar_serie_comparativa_volatil("ESTERES", series_tanque_a, mapa_series_tanques_b)
  const serie_isoamilo = preparar_serie_comparativa_volatil("ISOAMILO", series_tanque_a, mapa_series_tanques_b)
  const serie_etilo = preparar_serie_comparativa_volatil("ETILO", series_tanque_a, mapa_series_tanques_b)
  const serie_alcoholes = preparar_serie_comparativa_volatil("ALCOHOLES", series_tanque_a, mapa_series_tanques_b)
  const serie_propanol = preparar_serie_comparativa_volatil("PROPANOL", series_tanque_a, mapa_series_tanques_b)
  const serie_isoamilico = preparar_serie_comparativa_volatil("ISOAMILICO", series_tanque_a, mapa_series_tanques_b)
  const serie_isobutanol = preparar_serie_comparativa_volatil("ISOBUTAN", series_tanque_a, mapa_series_tanques_b)

  const combinar_par_series = (
    serie_primaria: any[],
    serie_secundaria: any[],
    prefijo_primario: string,
    prefijo_secundario: string
  ) =>
    serie_primaria.map((punto_primario, indice_paso) => {
      const base_combinada: any = {
        vuelta: punto_primario.vuelta,
        [`${prefijo_primario}_A`]: punto_primario.valorA,
        [`${prefijo_secundario}_A`]: serie_secundaria[indice_paso]?.valorA ?? null
      }
      tanques_seleccionados_b.forEach((_, indice_b) => {
        base_combinada[`${prefijo_primario}_B_${indice_b}`] = punto_primario[`valorB_${indice_b}`]
        base_combinada[`${prefijo_secundario}_B_${indice_b}`] =
          serie_secundaria[indice_paso]?.[`valorB_${indice_b}`] ?? null
      })
      return base_combinada
    })

  const datos_diacetilo_acetaldehido = combinar_par_series(serie_diacetilo, serie_acetaldehido, "diac", "acet")
  const datos_esteres_alcoholes = combinar_par_series(serie_esteres, serie_alcoholes, "est", "alc")

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-4v">
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-zinc-800 p-4 rounded-md shadow-lg items-center justify-between">
        <div className="flex-1 w-full flex flex-col gap-2 p-2 border border-blue-500/30 rounded">
          <div className="flex gap-2">
            <div className="flex-1">
              <CustomDropdownSelect etiqueta_titulo="Marca A" color_tema="blue" opciones={marcas_unicas} valor_unico={marca_seleccionada_a} al_cambiar_unico={establecer_marca_seleccionada_a} texto_vacio="Seleccione marca..." />
            </div>
            <div className="flex-[2]">
              <CustomDropdownSelect etiqueta_titulo="Tanque A" color_tema="blue" opciones={tanques_disponibles_a} valor_unico={tanque_seleccionado_a} al_cambiar_unico={establecer_tanque_seleccionado_a} texto_vacio="Seleccione un tanque..." />
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-2 p-2 border border-red-500/30 rounded">
          <div className="flex gap-2">
            <div className="flex-1">
              <CustomDropdownSelect etiqueta_titulo="Marca B" color_tema="red" opciones={marcas_unicas} valor_unico={marca_seleccionada_b} al_cambiar_unico={establecer_marca_seleccionada_b} texto_vacio="Seleccione marca..." />
            </div>
            <div className="flex-[2]">
              <CustomDropdownSelect etiqueta_titulo="Tanque(s) B" color_tema="red" opciones={tanques_disponibles_b} valores_multiples={tanques_seleccionados_b} al_cambiar_multiple={establecer_tanques_seleccionados_b} modo_multiple={true} texto_vacio="Seleccionar..." />
            </div>
          </div>
        </div>
      </div>

      <ChartsGrid4v tanqueA={tanque_seleccionado_a} tanqueB={tanques_seleccionados_b} diacetiloAcetaldehidoData={datos_diacetilo_acetaldehido} esteresAlcoholesData={datos_esteres_alcoholes} acetatoIsoamiloData={serie_isoamilo} acetatoEtiloData={serie_etilo} propanolData={serie_propanol} alcoholIsoamilicoData={serie_isoamilico} isobutanolData={serie_isobutanol} />
    </div>
  )
}

export { Comparacion4vTab as pestana_comparacion_4v }
