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
    <div className="bg-card rounded-xl border border-gray-100 shadow-sm p-3 md:p-4 w-full">
      <div className="flex items-center justify-between mb-2 md:mb-3 gap-2">
        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide line-clamp-1">
          {title}
        </p>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-gray-400 hover:text-muted-foreground ml-1 shrink-0"
                  aria-label="More information"
                >
                  <Info size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : rightIcon ? (
          <div className="text-gray-400 hover:text-muted-foreground ml-1 shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4">
            {rightIcon}
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl md:text-3xl font-bold text-foreground truncate">{value}</p>
        {icon && (
          <div
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0 flex items-center justify-center ${iconBgClass} [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5`}
          >
            <span className={iconColorClass}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
