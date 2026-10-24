# Levadura CCZ — HMI Cervecería (Análisis de Levadura y Cinéticas de Fermentación)

Sistema web de monitoreo industrial (HMI) construido con **Next.js (App Router)**, **React 19**, **Recharts**, **Tailwind CSS** y **Cloud Firestore (Firebase)** para el control estadístico de procesos (SPC), propagación de levadura, cinética de fermentación, comparación de generaciones (1V–4V) y validación de equipos en línea (Aber vs Laboratorio LAC).

---

## Arquitectura Modular (SOLID y DRY)

El proyecto sigue una arquitectura limpia desacoplada en **5 capas principales**, garantizando que **ningún archivo de código supere las 200 líneas**, empleando nomenclatura descriptiva en `snake_case` y bloques de documentación JSDoc (`@fileoverview`, `@param`, `@returns`) en cada módulo y función:

1. **Capa de Presentación (`components/` y `app/page.tsx`)**:
   - Componentes de interfaz gráfica puros y contenedores de pestañas ligeros.
   - Delegan toda la normalización, filtrado, pivoteo y cálculos estadísticos a la capa de servicios y sincronizan su estado mediante `lib/constantes_api.ts`.
2. **Capa de Servicios de Dominio (`lib/services/`)**:
   - Contiene la lógica de negocio desacoplada por dominio funcional: Propagación, Comparación de Cultivos, Cinética de Fermentación, Comparación de Generaciones 4V, Validación Aber, Lector de Excel, Calendario, Seguridad API y Persistencia Fragmentada en Firestore.
3. **Capa de Contratos y Estadística (`lib/types/`, `lib/statistics/`, `lib/utils.ts`, `lib/chart_config.ts`)**:
   - Contratos de dominio tipados (`contratos_dominio.ts`) y motores matemáticos reutilizables para estadística descriptiva, índices de capacidad del proceso ($Cp, Cpk, Pp, Ppk$), regresión lineal por mínimos cuadrados ($R^2$), normalización de fechas seriales de Excel y formatos numéricos.
4. **Capa de API y Persistencia Fragmentada (`app/api/`, `lib/firebase.ts`, `servicio_almacenamiento_json.ts`)**:
   - Endpoints REST (`GET`/`POST`/`OPTIONS`) protegidos opcionalmente por `SYNC_API_SECRET` (`x-api-key` / `Bearer`), que dividen automáticamente lotes mayores a 500 registros en fragmentos de Firestore (`dashboards/{id}_chunk_{n}`) para superar el límite de 1 MiB por documento y mantienen respaldos JSON locales (`database.json`, `database_kinetics.json`, `database_aber.json`).
5. **Capa de Auditoría y Pruebas Automatizadas (`scripts/`)**:
   - Guardia automatizada (`auditar_reglas_arquitectura.mjs`) que verifica las 6 reglas inquebrantables de refactorización y suite de pruebas unitarias (`ejecutar_pruebas_dominio.mjs`).

---

## Árbol de Directorios Actualizado

```text
levadura-ccz/
├── app/
│   ├── api/
│   │   ├── get-aber/route.ts                # Endpoint GET para consultar datos de Validación Aber
│   │   ├── get-data/route.ts                # Alias GET de compatibilidad hacia /api/get-propagation
│   │   ├── get-kinetics/route.ts            # Endpoint GET para consultar datos de Cinética
│   │   ├── get-propagation/route.ts         # Endpoint GET para consultar datos de Propagación
│   │   ├── sync-aber/route.ts               # Endpoint POST para sincronizar Validación Aber (Firestore + JSON)
│   │   ├── sync-all/route.ts                # Endpoint POST maestro desde macro Excel (Propagación, Cinética y Aber)
│   │   ├── sync-kinetics/route.ts           # Endpoint POST para sincronizar Cinética (Firestore + JSON)
│   │   └── sync-propagation/route.ts        # Endpoint POST para sincronizar Propagación (Firestore + JSON)
│   ├── globals.css                          # Estilos globales y variables de tema oscuro HMI
│   ├── layout.tsx                           # Layout raíz con fuentes Geist y proveedor Toaster
│   └── page.tsx                             # Contenedor principal de las 5 pestañas del tablero
├── components/
│   ├── charts/
│   │   ├── comparison_line_chart.tsx        # Gráfica de líneas comparativa reutilizable (Cultivo A vs B)
│   │   └── metric_scatter_chart.tsx         # Gráfica de dispersión con línea de tendencia y R²
│   ├── dashboard/
│   │   ├── aber/
│   │   │   └── aber_validation_charts.tsx   # Las 3 gráficas de Validación de Equipos Aber vs LAC
│   │   ├── comparison/
│   │   │   ├── comparison_charts_grid.tsx   # Cuadrícula de gráficas comparativas base
│   │   │   ├── comparison_kinetics_charts.tsx # Cuadrícula 2x2 de evolución comparativa entre dos tanques
│   │   │   └── culture_summary_column.tsx   # Columna de tarjetas KPI y medidores por cultivo
│   │   ├── cultivo/
│   │   │   └── excel_processor_aber.tsx     # Cargador de archivos Excel para Validación Aber
│   │   ├── kinetics/
│   │   │   ├── attenuation_curve_chart.tsx  # Curva de atenuación (°P vs Tiempo)
│   │   │   ├── batch_summary_card.tsx       # Tarjeta de metadatos del lote de fermentación
│   │   │   ├── charts_grid_4v.tsx           # Las 7 gráficas comparativas por generación (1V, 2V, 3V, 4V)
│   │   │   ├── correlation_heatmap.tsx      # Mapa de calor de correlaciones de variables críticas
│   │   │   ├── excel_processor_kinetics.tsx # Cargador de archivos Excel para Cinética
│   │   │   ├── fermentation_phases_table.tsx # Tabla cronológica de fases de fermentación
│   │   │   ├── kinetics_capability_report.tsx # Análisis de capacidad e informe ejecutivo de cinética
│   │   │   ├── kinetics_evolution_charts.tsx # Las 4 gráficas de doble eje de evolución de cinética
│   │   │   ├── kinetics_kpi_grid.tsx        # Cuadrícula de 8 KPIs de cinética
│   │   │   ├── kinetics_scatter_grid.tsx    # Cuadrícula de dispersión (Variables vs Sabores)
│   │   │   ├── main_fermentation_chart.tsx  # Gráfica multieje de tendencia principal de fermentación
│   │   │   └── secondary_charts_row.tsx     # Fila de 3 gráficas secundarias (Conteo, pH/Temp, Sabor)
│   │   ├── propagation/
│   │   │   ├── capability_table.tsx         # Tabla interactiva Cp, Cpk, Pp, Ppk con límites editables
│   │   │   ├── cell_count_chart.tsx         # Gráfica de tendencia de conteo celular con USL/LC/LSL
│   │   │   ├── correlation_scatter_grid.tsx # Cuadrícula 2x2 de correlación contra conteo celular
│   │   │   ├── excel_processor.tsx          # Botón de carga y revalidación SWR de archivos Excel de propagación
│   │   │   ├── executive_report.tsx         # Resumen ejecutivo con gráfica circular y velocímetro Cpk
│   │   │   ├── process_variables_table.tsx  # Tabla de promedios, mínimos y máximos de proceso
│   │   │   ├── viability_chart.tsx          # Gráfica de tendencia de Viabilidad (%) y Vitalidad (%)
│   │   │   └── vitality_composition_chart.tsx # Gráfica apilada de composición celular y Top 10 cultivos
│   │   ├── calendar_filter.tsx              # Selector de fechas jerárquico (Año → Mes → Día)
│   │   ├── capture_button.tsx               # Captura y descarga en PNG de alta resolución del tablero
│   │   ├── checkbox_filter.tsx              # Filtro desplegable multiselección con búsqueda
│   │   ├── cinetica_tab.tsx                 # Pestaña 3: Cinética de Fermentación
│   │   ├── comparacion_4v_tab.tsx           # Pestaña 4: Comparación de Generaciones (1V–4V)
│   │   ├── comparacion_tab.tsx              # Pestaña 2: Comparación de Cultivos (Tanque A vs B)
│   │   ├── custom_dropdown_select.tsx       # Selector desplegable oscuro con casillas de verificación (A y B)
│   │   ├── expandable_card.tsx              # Tarjeta contenedor con modal de pantalla completa
│   │   ├── filter_status_bar.tsx            # Contador de muestra activa, estado de carga y botón Limpiar filtros
│   │   ├── kpi_card.tsx                     # Tarjeta de indicador KPI con minigráfica sparkline
│   │   ├── propagation_tab.tsx              # Pestaña 1: Propagación de Levadura
│   │   ├── top_nav.tsx                      # Barra de navegación superior con reloj y estado en vivo
│   │   └── validacion_aber_tab.tsx          # Pestaña 5: Validación de Equipos Aber
│   └── ui/                                  # Componentes atómicos de interfaz (Badge, Button, Card, Dialog, Select, Table, Tabs)
├── lib/
│   ├── mock_data/
│   │   ├── datos_simulados_cinetica.ts      # Datos de respaldo para Cinética
│   │   ├── datos_simulados_comparacion.ts   # Datos de respaldo para Comparación de Cultivos
│   │   └── datos_simulados_propagacion.ts   # Datos de respaldo para Propagación
│   ├── services/
│   │   ├── servicio_almacenamiento_json.ts  # Persistencia híbrida Firestore (con fragmentación 500 filas) + JSON local
│   │   ├── servicio_cinetica_fermentacion.ts # Normalización, filtrado, KPIs y series de Cinética
│   │   ├── servicio_comparacion_4v.ts       # Pivoteo por generación (1V–4V) y promedios por vuelta
│   │   ├── servicio_comparacion_cultivos.ts # Cálculos comparativos entre Cultivo A y Cultivo B
│   │   ├── servicio_fechas_calendario.ts    # Árbol jerárquico Año/Mes/Día para el filtro de calendario
│   │   ├── servicio_lector_excel_propagacion.ts # Lector de hojas Excel de propagación en cliente
│   │   ├── servicio_propagacion_panel.ts    # Normalización, filtrado y recálculo dinámico de Propagación
│   │   ├── servicio_seguridad_api.ts        # Cabeceras CORS y validación opcional de SYNC_API_SECRET
│   │   ├── servicio_sincronizacion_cinetica.ts # Procesador de carga útil para API de Cinética y 4V
│   │   ├── servicio_sincronizacion_propagacion.ts # Procesador de carga útil para API de Propagación
│   │   ├── servicio_tabla_capacidad.ts      # Cálculo de Cp/Cpk/Pp/Ppk y persistencia de límites en Firestore
│   │   └── servicio_validacion_aber.ts      # Normalización, filtrado, KPIs y series de Validación Aber
│   ├── statistics/
│   │   ├── estadisticas_descriptivas.ts     # Media, desviación estándar, mediana, IQR, Cp, Cpk, Pp, Ppk
│   │   └── estadisticas_graficas.ts         # Regresión lineal, histogramas, curva normal y puntos I-MR
│   ├── types/
│   │   └── contratos_dominio.ts             # Interfaces de dominio y validadores de arreglos de entrada
│   ├── chart_config.ts                      # Paleta de colores, estilos de tooltips y ejes para Recharts
│   ├── constantes_api.ts                    # Rutas centralizadas de API y configuración SWR
│   ├── firebase.ts                          # Inicialización de Firebase App y Cloud Firestore
│   ├── mock_data.ts                         # Punto de entrada unificado de datos simulados
│   ├── statistics.ts                        # Punto de entrada unificado de funciones estadísticas
│   └── utils.ts                             # Conversión numérica segura y normalización de fechas Excel
├── scripts/
│   ├── auditar_reglas_arquitectura.mjs      # Verificador automatizado de las 6 reglas de refactorización
│   └── ejecutar_pruebas_dominio.mjs         # Suite de pruebas unitarias de estadística y servicios
├── database.json                            # Respaldo local sincronizado de Propagación
├── database_kinetics.json                   # Respaldo local sincronizado de Cinética
└── database_aber.json                       # Respaldo local sincronizado de Validación Aber
```

---

## Ejecución y Verificación de Calidad

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 3000)
npm run dev

# Auditar cumplimiento de las 6 reglas de arquitectura (<=200 líneas, snake_case, JSDoc, imports)
npm run audit:rules

# Verificar tipado estricto de TypeScript (cero errores)
npm run typecheck

# Ejecutar pruebas unitarias de estadística y servicios de dominio
npm test
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador para visualizar el panel.
