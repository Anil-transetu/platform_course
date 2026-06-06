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
      <div className="bg-white w-[500px] rounded-xl shadow-xl p-8 text-center space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Edit Course (ID: {id})
        </h2>
        <p className="text-sm text-gray-600">
          Course edit functionality will be implemented here.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/admin/courses"
            className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
