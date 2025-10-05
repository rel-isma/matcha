"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  className?: string
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Calendar({ selected, onSelect, minDate, maxDate, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date())
  const [viewDate, setViewDate] = React.useState(selected || new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    if (!isDateDisabled(newDate)) {
      setCurrentDate(newDate)
      onSelect?.(newDate)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1)
      } else {
        newDate.setFullYear(prev.getFullYear() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2"></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      const disabled = isDateDisabled(date)
      const isSelectedDate = isDateSelected(date)
      const isTodayDate = isToday(date)

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={cn(
            "p-2 h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            isSelectedDate && "bg-primary-600 text-white shadow-lg scale-105",
            !isSelectedDate && !disabled && "hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100",
            isTodayDate && !isSelectedDate && "bg-blue-50 text-blue-600 border border-blue-200",
            disabled && "text-gray-300 cursor-not-allowed hover:scale-100",
            "relative"
          )}
        >
          {day}
          {isTodayDate && !isSelectedDate && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
          )}
        </button>
      )
    }

    return days
  }

  return (
    <div className={cn("p-6 bg-white rounded-xl shadow-xl border border-gray-100", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateYear('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800">
            {months[viewDate.getMonth()]}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {viewDate.getFullYear()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => navigateYear('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Footer with quick actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              const today = new Date()
              if (!isDateDisabled(today)) {
                setViewDate(today)
                setCurrentDate(today)
                onSelect?.(today)
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200"
          >
            Today
          </button>
          {selected && (
            <div className="text-xs text-gray-500">
              Selected: {selected.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}