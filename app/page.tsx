import { GitCompare, LineChart, Sprout } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopNav } from "@/components/dashboard/top-nav"
import { PropagationTab } from "@/components/dashboard/propagation-tab"
import { CineticaTab } from "@/components/dashboard/cinetica-tab"

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-yellow-600/30 bg-zinc-900 text-center">
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <p className="text-xs text-zinc-500">Módulo en desarrollo · datos no disponibles</p>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <TopNav />

      <div className="p-4 md:p-6">
        <Tabs defaultValue="propagacion">
          <TabsList className="border border-yellow-600/30 bg-zinc-900">
            <TabsTrigger value="propagacion">
              <Sprout data-icon="inline-start" />
              Propagación
            </TabsTrigger>
            <TabsTrigger value="cinetica">
              <LineChart data-icon="inline-start" />
              Cinética (Monitoreo)
            </TabsTrigger>
            <TabsTrigger value="comparacion">
              <GitCompare data-icon="inline-start" />
              Comparación de Cultivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="propagacion" className="mt-4">
            <PropagationTab />
          </TabsContent>
          <TabsContent value="cinetica" className="mt-4">
            <CineticaTab />
          </TabsContent>
          <TabsContent value="comparacion" className="mt-4">
            <Placeholder title="Comparación de Cultivos" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
