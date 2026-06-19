import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  defaultMonth?: Date
  showWeekNumber?: boolean
  className?: string
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  defaultMonth,
  showWeekNumber = false,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    defaultMonth || selected || new Date()
  )

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1)
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sun, 1 = Mon, etc.

  // Total days in the month
  const totalDays = new Date(year, month + 1, 0).getDate()

  // Days in previous month (to show placeholders)
  const prevMonthTotalDays = new Date(year, month, 0).getDate()

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  // Add previous month's trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthTotalDays - i),
      isCurrentMonth: false,
    })
  }

  // Add current month's days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    })
  }

  // Add next month's leading days to make a grid of 6 weeks (42 cells)
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    })
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const isSameDay = (d1: Date, d2?: Date) => {
    if (!d2) return false
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    )
  }

  return (
    <div className={cn("p-4 bg-white rounded-xl shadow-sm border border-slate-100 w-[280px]", className)}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          type="button"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-800">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          type="button"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((item, idx) => {
          const isSel = isSameDay(item.date, selected)
          return (
            <button
              key={idx}
              onClick={() => handleDateClick(item.date)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors font-medium",
                item.isCurrentMonth
                  ? "text-slate-800 hover:bg-slate-100"
                  : "text-slate-300",
                isSel && "bg-blue-600 text-white hover:bg-blue-700"
              )}
              type="button"
              disabled={!item.isCurrentMonth}
            >
              {item.date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
