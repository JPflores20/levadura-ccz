/**
 * @fileoverview Página principal del sistema HMI de Cervecería (Análisis de Levadura y Cinéticas de Fermentación).
 * Orquesta la navegación entre las 5 pestañas operativas y el botón de captura de pantalla.
 */

import { GitCompare, LineChart, Sprout, FlaskConical, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopNav } from "@/components/dashboard/top_nav"
import { PropagationTab } from "@/components/dashboard/propagation_tab"
import { CineticaTab } from "@/components/dashboard/cinetica_tab"
import { ComparacionTab } from "@/components/dashboard/comparacion_tab"
import { Comparacion4vTab } from "@/components/dashboard/comparacion_4v_tab"
import { ValidacionAberTab } from "@/components/dashboard/validacion_aber_tab"
import { CaptureButton } from "@/components/dashboard/capture_button"

/**
 * Renderiza el contenedor principal del tablero con sus 5 pestañas operativas.
 *
 * @returns {JSX.Element} Vista principal de la aplicación.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <TopNav />

      <div className="p-2 md:p-3 max-w-[1920px] mx-auto" id="capture-dashboard">
        <Tabs defaultValue="propagacion">
          <div className="w-full flex justify-between items-center pb-1 -mb-1 overflow-x-auto gap-4">
            <TabsList className="border border-yellow-500/40 bg-[#121212] min-w-max">
              <TabsTrigger value="propagacion" className="data-active:border-yellow-500/40">
                <Sprout data-icon="inline-start" className="text-yellow-500" />
                Propagación
              </TabsTrigger>
              <TabsTrigger value="comparacion" className="data-active:border-yellow-500/40">
                <GitCompare data-icon="inline-start" className="text-yellow-500" />
                Comparación cultivos
              </TabsTrigger>
              <TabsTrigger value="cinetica-4v" className="data-active:border-yellow-500/40">
                <LineChart data-icon="inline-start" className="text-yellow-500" />
                Cinéticas
              </TabsTrigger>
              <TabsTrigger value="comparacion-4v" className="data-active:border-yellow-500/40">
                <BarChart3 data-icon="inline-start" className="text-yellow-500" />
                Comparación cinéticas
              </TabsTrigger>
              <TabsTrigger value="validacion-aber" className="data-active:border-yellow-500/40">
                <FlaskConical data-icon="inline-start" className="text-yellow-500" />
                Auditoría Abber
              </TabsTrigger>
            </TabsList>
            <CaptureButton />
          </div>

          <TabsContent value="propagacion" className="mt-3">
            <PropagationTab />
          </TabsContent>
          <TabsContent value="comparacion" className="mt-3">
            <ComparacionTab />
          </TabsContent>
          <TabsContent value="cinetica-4v" className="mt-3">
            <CineticaTab />
          </TabsContent>
          <TabsContent value="comparacion-4v" className="mt-3">
            <Comparacion4vTab />
          </TabsContent>
          <TabsContent value="validacion-aber" className="mt-3">
            <ValidacionAberTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
