"use client"

import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Calendar } from "./Calendar"
import { cn } from "@/lib/utils"

interface DateInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
  error?: string
  label?: string
}

export function DateInput({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className,
  minDate,
  maxDate,
  error,
  label
}: DateInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDateSelect = (date: Date) => {
    onChange?.(date)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[52px] flex items-center justify-between",
            "hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20",
            error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
            disabled && "bg-gray-50 cursor-not-allowed opacity-60",
            !error && !disabled && "border-gray-200",
            className
          )}
        >
          <div className="flex items-center flex-1">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className={cn(
              "flex-1 text-left",
              value ? "text-gray-900 font-medium" : "text-gray-500"
            )}>
              {value ? formatDate(value) : placeholder}
            </span>
          </div>
          
          {value && !disabled && (
            <button
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Calendar Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 z-50 mt-2">
            <div className="animate-in fade-in-0 zoom-in-95 duration-200">
              <Calendar
                selected={value}
                onSelect={handleDateSelect}
                minDate={minDate}
                maxDate={maxDate}
                className="shadow-2xl border-2 border-primary-100"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
          {error}
        </p>
      )}

      {value && !error && (
        <p className="text-sm text-gray-600 flex items-center">
          <span className="inline-block w-1 h-1 bg-green-500 rounded-full mr-2"></span>
          Age: {Math.floor((new Date().getTime() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
        </p>
      )}
    </div>
  )
}