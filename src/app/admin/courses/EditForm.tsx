"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditFormProps {
  id: string;
}

export default function EditForm({ id }: EditFormProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-card w-[500px] rounded-xl shadow-xl p-8 text-center space-y-6">
        <h2 className="text-xl font-semibold text-card-foreground">
          Edit Course (ID: {id})
        </h2>
        <p className="text-sm text-muted-foreground">
          Course edit functionality will be implemented here.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/admin/courses"
            className="px-5 py-2 border rounded-lg text-card-foreground hover:bg-accent"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
