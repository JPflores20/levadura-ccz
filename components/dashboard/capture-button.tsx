"use client"

import { Camera } from "lucide-react"
import * as htmlToImage from "html-to-image"

export function CaptureButton() {
  const handleCapture = async () => {
    const element = document.getElementById('capture-dashboard');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Reporte-Dashboard-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <button 
      onClick={handleCapture}
      className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded text-xs transition-colors uppercase font-bold shrink-0"
      title="Capturar pantalla del dashboard"
    >
      <Camera size={14} />
      Captura
    </button>
  )
}
