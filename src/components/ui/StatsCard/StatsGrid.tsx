import React from "react";

interface StatsGridProps {
  children: React.ReactNode;
}

export default function StatsGrid({ children }: StatsGridProps) {
  const count = React.Children.count(children);
  const gridColsClass = count === 3 ? "md:grid-cols-3" : count === 2 ? "md:grid-cols-2" : "md:grid-cols-4";

  return (
    <div className={`flex overflow-x-auto gap-3 pb-2 md:pb-0 md:grid ${gridColsClass} md:gap-4 no-scrollbar w-full flex-shrink-0`}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return (
          <div className="min-w-[180px] xs:min-w-[200px] md:min-w-0 flex-shrink-0 flex-1">
            {child}
          </div>
        );
      })}
    </div>
  );
}
