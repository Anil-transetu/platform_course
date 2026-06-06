import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  iconBgClass?: string
  iconColorClass?: string
  tooltip?: string
  rightIcon?: React.ReactNode
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgClass = "bg-blue-50",
  iconColorClass = "text-blue-600",
  tooltip,
  rightIcon,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </p>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 ml-1"
                  aria-label="More information"
                >
                  <Info size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : rightIcon ? (
          <div className="text-gray-400 hover:text-gray-600 ml-1">
            {rightIcon}
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {icon && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass}`}
          >
            <span className={iconColorClass}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
