import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatExcelDate(cellValue: any): string {
  if (cellValue === null || cellValue === undefined || cellValue === "" || cellValue === "N/A" || cellValue === "UNDEFINED") {
    return "N/A"
  }
  
  const numVal = typeof cellValue === 'number' ? cellValue : Number(cellValue)
  if (!isNaN(numVal) && numVal > 20000 && numVal < 100000) {
    // Convert Excel date to YYYY-MM-DD
    const date = new Date(Math.round((numVal - 25569) * 86400 * 1000))
    const tzOffset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() + tzOffset)
    return localDate.toISOString().split('T')[0]
  }
  
  return cellValue.toString().trim()
}

