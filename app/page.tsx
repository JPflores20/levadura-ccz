import { GitCompare, LineChart, Sprout, FlaskConical, BarChart3 } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopNav } from "@/components/dashboard/top-nav"
import { PropagationTab } from "@/components/dashboard/propagation-tab"
import { CineticaTab } from "@/components/dashboard/cinetica-tab"
import { ComparacionTab } from "@/components/dashboard/comparacion-tab"
import { Comparacion4vTab } from "@/components/dashboard/comparacion-4v-tab"

import { CultivoTab } from "@/components/dashboard/cultivo-tab"

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-yellow-600/30 bg-zinc-900 text-center">
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <p className="text-xs text-zinc-500">Módulo en desarrollo — datos no disponibles</p>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <TopNav />

      <div className="p-2 md:p-3 max-w-[1920px] mx-auto">
        <Tabs defaultValue="propagacion">
          <div className="w-full overflow-x-auto pb-1 -mb-1">
            <TabsList className="border border-yellow-500/40 bg-[#121212] min-w-max">
              <TabsTrigger value="propagacion" className="data-active:border-yellow-500/40">
                <Sprout data-icon="inline-start" className="text-yellow-500" />
                Propagación
              </TabsTrigger>
              <TabsTrigger value="comparacion" className="data-active:border-yellow-500/40">
                <GitCompare data-icon="inline-start" className="text-yellow-500" />
                Comparación
              </TabsTrigger>
              <TabsTrigger value="cultivo" className="data-active:border-yellow-500/40">
                <FlaskConical data-icon="inline-start" className="text-yellow-500" />
                Validación ABER
              </TabsTrigger>
              <TabsTrigger value="cinetica-4v" className="data-active:border-yellow-500/40">
                <LineChart data-icon="inline-start" className="text-yellow-500" />
                Nueva Cinética 4/v
              </TabsTrigger>
              <TabsTrigger value="comparacion-4v" className="data-active:border-yellow-500/40">
                <BarChart3 data-icon="inline-start" className="text-yellow-500" />
                Comparación 4/v
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="propagacion" className="mt-3">
            <PropagationTab />
          </TabsContent>
          <TabsContent value="comparacion" className="mt-3">
            <ComparacionTab />
          </TabsContent>
          <TabsContent value="cultivo" className="mt-3">
            <CultivoTab />
          </TabsContent>
          <TabsContent value="cinetica-4v" className="mt-3">
            <CineticaTab />
          </TabsContent>
          <TabsContent value="comparacion-4v" className="mt-3">
            <Comparacion4vTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
