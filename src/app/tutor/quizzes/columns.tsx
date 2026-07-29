"use client";

import React from "react";
import Link from "next/link";
import { Column } from "@/components/reusable/DataTable";
import { Button } from "@/components/ui/button";

import { Avatar } from "@/components/ui/avatar";

export interface QuizOverview {
    id: number | string;
    batch_id: number | string;
    batch_name: string;
    course_name: string;
    total_quizzes: number;
}

export function buildQuizColumns(): Column<QuizOverview>[] {
    return [
        {
            key: "batch_id",
            label: "BATCH ID",
            render: (_, row) => (
                <div className="font-semibold text-slate-600 text-sm">
                    #BAT-{row.batch_id || row.id}
                </div>
            ),
        },
        {
            key: "batch_name",
            label: "BATCH NAME",
            render: (_, row) => (
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                        name={row.batch_name}
                        id={row.batch_id || row.id}
                        sizeClassName="w-10 h-10"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                            {row.batch_name}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "course_name",
            label: "COURSE NAME",
            render: (_, row) => (
                <div className="font-medium text-slate-600 text-sm">
                    {row.course_name || "N/A"}
                </div>
            ),
        },
        {
            key: "total_quizzes",
            label: "TOTAL QUIZZES",
            render: (_, row) => (
                <div className="font-semibold text-slate-800 text-sm">
                    {row.total_quizzes ?? 0}
                </div>
            ),
        },
        {
            key: "id",
            label: "ACTIONS",
            render: (_, row) => {
                const batchId = row.batch_id || row.id;
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
                        asChild
                    >
                        <Link href={`/tutor/quizzes/${batchId}?batch_name=${encodeURIComponent(row.batch_name || "N/A")}`}>
                            View Students
                        </Link>
                    </Button>
                );
            },
        },
    ];
}