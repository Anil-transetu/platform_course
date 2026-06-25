"use client";

import { useState } from "react";
import { 
  BookOpen, 
  CheckSquare,
  Layers
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";
import { cn } from "@/lib/utils";
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useStudentDashboardStats } from "@/features/student/dashboard/api/dashboard-api";

const activityDataDaily = [
  { label: "00:00", value: 5 },
  { label: "04:00", value: 10 },
  { label: "08:00", value: 25 },
  { label: "12:00", value: 60 },
  { label: "16:00", value: 80 },
  { label: "20:00", value: 45 },
  { label: "23:59", value: 15 },
];

const activityDataWeekly = [
  { label: "MON", value: 40 },
  { label: "TUE", value: 35 },
  { label: "WED", value: 55 },
  { label: "THU", value: 42 },
  { label: "FRI", value: 70 },
  { label: "SAT", value: 48 },
  { label: "SUN", value: 65 },
];

const activityDataMonthly = [
  { label: "Week 1", value: 150 },
  { label: "Week 2", value: 210 },
  { label: "Week 3", value: 180 },
  { label: "Week 4", value: 250 },
];

const chartConfig = {
  value: {
    label: "Engagement",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-gray-100 dark:border-border/50 shadow-sm p-3 md:p-4 w-full h-[104px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

function GraphSkeleton() {
  return (
    <div className="h-[350px] w-full mt-4">
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}

export default function StudentDashboard() {
  const { data: stats, isLoading, isError } = useStudentDashboardStats();
  const [timeRange, setTimeRange] = useState("weekly");

  const chartData = 
    timeRange === "daily" ? activityDataDaily : 
    timeRange === "monthly" ? activityDataMonthly : 
    activityDataWeekly;

  const xAxisKey = "label";

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">Student Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-muted-foreground mt-1">Welcome back! Here&apos;s a summary of your academic progress this semester.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10">
        {isLoading ? (
          <StatsGrid>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </StatsGrid>
        ) : isError ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
            Failed to load statistics. Please try again later.
          </div>
        ) : (
          <StatsGrid>
            <StatsCard 
              title="Active Batches" 
              value={stats?.active_batches ?? 0} 
              icon={<Layers size={20} />} 
              iconBgClass="bg-blue-50" 
              iconColorClass="text-blue-600" 
              tooltip="Number of batches you are currently active in" 
            />
            <StatsCard 
              title="Quizzes Attempted" 
              value={stats?.quizzes_attempted ?? 0} 
              icon={<BookOpen size={20} />} 
              iconBgClass="bg-green-50" 
              iconColorClass="text-green-600" 
              tooltip="Total quizzes you have participated in" 
            />
            <StatsCard 
              title="Assignments Submitted" 
              value={stats?.assignments_submitted ?? 0} 
              icon={<CheckSquare size={20} />} 
              iconBgClass="bg-purple-50" 
              iconColorClass="text-purple-600" 
              tooltip="Total assignments you have successfully submitted" 
            />
          </StatsGrid>
        )}
      </div>

      {/* Activity Chart Section */}
      <div className="bg-white dark:bg-card p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground tracking-tight">Analytics Overview</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">Student Engagement Index</p>
            </div>
          </div>
          
          <div className="w-[140px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-gray-50 dark:bg-muted/50 border-gray-100 dark:border-border/50 rounded-xl font-semibold">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="daily" className="font-medium cursor-pointer">Daily</SelectItem>
                <SelectItem value="weekly" className="font-medium cursor-pointer">Weekly</SelectItem>
                <SelectItem value="monthly" className="font-medium cursor-pointer">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <GraphSkeleton />
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full mt-4">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-border" />
              <XAxis 
                dataKey={xAxisKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-value)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ fill: 'var(--color-value)', strokeWidth: 2, r: 6, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={500}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
