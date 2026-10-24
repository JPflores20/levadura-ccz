/**
 * @fileoverview Punto de entrada unificado (barrel file) para los datos simulados y tipos base del sistema.
 */

import {
  type PropagationPoint,
  type Kpi,
  type ProcessVar,
  type Conclusion,
  datos_propagacion_simulados,
  datos_composicion_simulados,
  indicadores_kpi_propagacion,
  datos_dispersion_propagacion,
  variables_proceso_propagacion,
  datos_capacidad_resumen,
  conclusiones_propagacion,
  limites_control_propagacion,
} from "./mock_data/datos_simulados_propagacion"

import {
  type KineticPoint,
  type MiniKpi,
  datos_cinetica_simulados,
  indicadores_kpi_cinetica,
  fases_cinetica_fermentacion,
  datos_celulas_cinetica,
  datos_sabores_cinetica,
  datos_dispersion_cinetica,
  datos_proceso_cinetica,
  informe_ejecutivo_cinetica,
} from "./mock_data/datos_simulados_cinetica"

import {
  indicadores_comparacion_cultivos,
  resumen_comparacion_cultivos,
  series_comparacion_simuladas,
} from "./mock_data/datos_simulados_comparacion"

export type {
  PropagationPoint,
  Kpi,
  ProcessVar,
  Conclusion,
  KineticPoint,
  MiniKpi,
}

export {
  datos_propagacion_simulados,
  datos_composicion_simulados,
  indicadores_kpi_propagacion,
  datos_dispersion_propagacion,
  variables_proceso_propagacion,
  datos_capacidad_resumen,
  conclusiones_propagacion,
  limites_control_propagacion,
  datos_cinetica_simulados,
  indicadores_kpi_cinetica,
  fases_cinetica_fermentacion,
  datos_celulas_cinetica,
  datos_sabores_cinetica,
  datos_dispersion_cinetica,
  datos_proceso_cinetica,
  informe_ejecutivo_cinetica,
  indicadores_comparacion_cultivos,
  resumen_comparacion_cultivos,
  series_comparacion_simuladas,
  datos_propagacion_simulados as propagationData,
  datos_composicion_simulados as composicionData,
  indicadores_kpi_propagacion as kpis,
  datos_dispersion_propagacion as scatterData,
  variables_proceso_propagacion as processVars,
  datos_capacidad_resumen as capacidadData,
  conclusiones_propagacion as conclusiones,
  limites_control_propagacion as limits,
  datos_cinetica_simulados as kineticsData,
  indicadores_kpi_cinetica as kineticsKpis,
  fases_cinetica_fermentacion as kineticsPhases,
  datos_celulas_cinetica as kineticsCellsData,
  datos_sabores_cinetica as kineticsFlavorData,
  datos_dispersion_cinetica as kineticsScatterData,
  datos_proceso_cinetica as kineticsProcessData,
  informe_ejecutivo_cinetica as kineticsExecutiveReport,
  indicadores_comparacion_cultivos as comparacionKpis,
  resumen_comparacion_cultivos as comparacionResumen,
  series_comparacion_simuladas as comparacionSeriesData,
}
