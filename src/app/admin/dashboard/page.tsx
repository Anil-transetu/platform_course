"use client"

import {
  Building2,
  Layers,
  BookOpen,
  Users,
  Plus,
  School,
  ArrowRight,
  Eye,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import StatsCard, { StatsGrid } from "@/components/ui/StatsCard"
import { useAdminDashboardStats } from "@/hooks/use-dashboard"
import DashboardSkeleton from "@/components/admin/dashboard/DashboardSkeleton"

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Hub</h1>
          <p className="text-card-foreground text-sm">
            Manage institutions, learning paths, and users.
          </p>
        </div>

      </div>

      {/* Quick Navigation */}

      <h2 className="font-semibold mb-4 text-foreground">Quick Navigation</h2>

      <div className="mb-10">
        <StatsGrid>
          {/* Institutions */}
          <Link href="/admin/institutions" className="block w-full">
            <StatsCard
              title="Total Institutions"
              
              icon={<Building2 size={20} />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              value={`${stats?.total_institutions || 0}`}
              
            />
          </Link>

          {/* Batches */}
          <Link href="/admin/batches" className="block w-full">
            <StatsCard
              title="Total Batches"
              icon={<Layers size={20} />}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              value={`${stats?.total_batches || 0} `}
              
            />
          </Link>

          {/* Courses */}
          <Link href="/admin/courses" className="block w-full">
            <StatsCard
              title="Total Courses"
              icon={<BookOpen size={20} />}
              iconBgClass="bg-orange-50"
              iconColorClass="text-orange-600"
              value={`${stats?.total_courses || 0}`}
              
            />
          </Link>

          {/* Tutors */}
          <Link href="/admin/tutors" className="block w-full">
            <StatsCard
              title="Total Tutors"
              icon={<Users size={20} />}
              iconBgClass="bg-red-50"
              iconColorClass="text-red-500"
              value={`${stats?.total_tutors || 0}`}
              
            />
          </Link>
        </StatsGrid>
      </div>

      {/* Creation Hub */}

      <h2 className="font-semibold mb-4 text-foreground">⚡ Creation Hub</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Create Batch */}
        <Link href="/admin/batches?action=create" className="block">
          <div className="bg-blue-600 text-white rounded-xl p-4 sm:p-6 flex justify-between items-center shadow-md hover:bg-blue-700 transition-colors">
            <div className="flex gap-3 items-center">
              <div className="bg-blue-500 p-2 rounded-md">
                <Plus size={18}/>
              </div>
              <div>
                <p className="font-semibold">Create New Batch</p>
                <p className="text-xs opacity-80">
                  Configure schedules & tutors
                </p>
              </div>
            </div>
            <ArrowRight size={18}/>
          </div>
        </Link>

        {/* Add Institution */}
        <Link href="/admin/institutions?action=create" className="block">
          <div className="bg-card rounded-xl p-4 sm:p-6 border-l-4 border-blue-500 flex justify-between items-center hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex gap-3 items-center">
              <School size={18} className="text-blue-500"/>
              <div>
                <p className="font-semibold text-foreground">Add Institution</p>
                <p className="text-xs text-card-foreground">
                  Onboard a new institution
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground"/>
          </div>
        </Link>

        {/* Build Course */}
        <Link href="/admin/courses/create" className="block">
          <div className="bg-card rounded-xl p-4 sm:p-6 border-l-4 border-yellow-500 flex justify-between items-center hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex gap-3 items-center">
              <BookOpen size={18} className="text-yellow-500"/>
              <div>
                <p className="font-semibold text-foreground">Build Course</p>
                <p className="text-xs text-card-foreground">
                  Author curriculum content
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground"/>
          </div>
        </Link>

        {/* Add Students */}
        <Link href="/admin/students?action=create" className="block">
          <div className="bg-card rounded-xl p-4 sm:p-6 border-l-4 border-green-500 flex justify-between items-center hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex gap-3 items-center">
              <UserPlus size={18} className="text-green-500"/>
              <div>
                <p className="font-semibold text-foreground">Add Students</p>
                <p className="text-xs text-card-foreground">
                  Register new learners
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground"/>
          </div>
        </Link>

        {/* Add Tutors */}
        <Link href="/admin/tutors?action=create" className="block">
          <div className="bg-card rounded-xl p-4 sm:p-6 border-l-4 border-purple-500 flex justify-between items-center hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex gap-3 items-center">
              <Users size={18} className="text-purple-500"/>
              <div>
                <p className="font-semibold text-foreground">Add Tutors</p>
                <p className="text-xs text-card-foreground">
                  Onboard faculty members
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground"/>
          </div>
        </Link>

      </div>

    </div>
  )
}
