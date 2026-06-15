"use client"

import {
  Building2,
  Layers,
  BookOpen,
  Users,
  Plus,
  School,
  ArrowRight,
  Eye
} from "lucide-react"
import Link from "next/link"
import StatsCard from "@/components/ui/StatsCard"

export default function DashboardPage() {
  return (
    <div className="p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Hub</h1>
          <p className="text-card-foreground text-sm">
            Manage institutions, learning paths, and users.
          </p>
        </div>

        {/* <input
          type="text"
          placeholder="Search anything..."
          className="border rounded-lg px-4 py-2 w-72 bg-muted text-foreground"
        /> */}

      </div>

      {/* Quick Navigation */}

      <h2 className="font-semibold mb-4 text-foreground">Quick Navigation</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">

        {/* Institutions */}

        <Link href="/admin/institutions" className="block w-full">
          <StatsCard
            title="Institutions"
            value="42 Units"
            icon={<Building2 size={20} />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
            rightIcon={<Eye size={16} />}
          />
        </Link>

        {/* Batches */}

        <Link href="/admin/batches" className="block w-full">
          <StatsCard
            title="Batches"
            value="156 Active"
            icon={<Layers size={20} />}
            iconBgClass="bg-purple-50"
            iconColorClass="text-purple-600"
            rightIcon={<Eye size={16} />}
          />
        </Link>

        {/* Courses */}

        <Link href="/admin/courses" className="block w-full">
          <StatsCard
            title="Courses"
            value="84 Courses"
            icon={<BookOpen size={20} />}
            iconBgClass="bg-orange-50"
            iconColorClass="text-orange-600"
            rightIcon={<Eye size={16} />}
          />
        </Link>

        {/* Tutors */}

        <Link href="/admin/tutors" className="block w-full">
          <StatsCard
            title="Tutors"
            value="892 Staff"
            icon={<Users size={20} />}
            iconBgClass="bg-red-50"
            iconColorClass="text-red-500"
            rightIcon={<Eye size={16} />}
          />
        </Link>

      </div>

      {/* Creation Hub */}

      <h2 className="font-semibold mb-4 text-foreground">⚡ Creation Hub</h2>

      <div className="grid grid-cols-3 gap-6">

        {/* Create Batch */}

        <div className="bg-blue-600 text-white rounded-xl p-6 flex justify-between items-center shadow-md">

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

        {/* Add Institution */}

        <Link href="/admin/institutions/new">

          <div className="bg-card rounded-xl p-6 border-l-4 border-blue-500 flex justify-between items-center cursor-pointer">

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

        <div className="bg-card rounded-xl p-6 border-l-4 border-yellow-500 flex justify-between items-center">
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

      </div>

    </div>
  )
}
