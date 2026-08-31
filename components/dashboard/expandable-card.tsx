"use client"

import React, { useState } from "react"
import { Maximize2 } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ExpandableCardProps {
  title: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  headerAction?: React.ReactNode
}

export function ExpandableCard({
  title,
  children,
  className,
  contentClassName,
  headerClassName,
  headerAction,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const expandedChartStyles = [
    "[&>div]:!h-full [&>div]:!max-h-full",
    "[&_.recharts-text]:!text-[13px]",
    "[&_.recharts-legend-item-text]:!text-[14px]",
    "[&_.recharts-tooltip-item]:!text-[14px]",
    "[&_.recharts-tooltip-label]:!text-[15px]",
    "[&_.recharts-tooltip-label]:!mb-2",
  ].join(" ")

  return (
    <Card className={`border-yellow-500/40 bg-[#121212] text-white flex flex-col ${className || ""}`}>
      <CardHeader className={`pb-2 flex flex-col items-start gap-2 space-y-0 ${headerClassName || ""}`}>
        <div className="flex items-start justify-between w-full">
          <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase mt-0.5 pr-4">
            {title}
          </CardTitle>
          <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
            <DialogTrigger
              render={
                <button className="text-zinc-500 hover:text-yellow-500 transition-colors -mt-1 -mr-1 p-1 shrink-0" />
              }
            >
              <Maximize2 className="size-3.5" />
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-full h-[85vh] bg-[#121212] border-yellow-500/40 text-white flex flex-col p-6">
              <DialogHeader className="flex flex-col items-start gap-2 border-b border-yellow-500/30 pb-4 space-y-0 w-full">
                <div className="flex items-start justify-between w-full">
                  <DialogTitle className="text-yellow-500 uppercase tracking-widest text-lg pr-4">
                    {title}
                  </DialogTitle>
                </div>
                {headerAction && (
                  <div className="w-full flex justify-start sm:justify-end">
                    {headerAction}
                  </div>
                )}
              </DialogHeader>
              {isExpanded && (
                <div className={`flex-1 w-full min-h-0 mt-4 overflow-hidden ${expandedChartStyles}`}>
                  {children}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        {headerAction && (
          <div className="w-full flex justify-start sm:justify-end">
            {headerAction}
          </div>
        )}
      </CardHeader>
      <div className={`pb-4 px-4 shrink-0 ${contentClassName || ""}`}>
        {!isExpanded && children}
      </div>
    </Card>
  )
}
