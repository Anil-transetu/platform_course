"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reusable/DataTable";
import { QuizSubmission } from "@/types/quize";
import { cn } from "@/lib/utils";

const avatarColors = [
    "bg-blue-100 text-blue-600",
    "bg-orange-200 text-orange-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-green-100 text-green-600",
];

const getAvatarColor = (id: string | number) => {
    const index =
        typeof id === "number"
            ? id % avatarColors.length
            : String(id).length % avatarColors.length;

    return avatarColors[index];
};

export function buildQuizSubmissionColumns(): Column<QuizSubmission>[] {
    return [
        {
            key: "name",
            label: "STUDENT NAME",
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    {row.avatar ? (
                        <div className="relative h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src={row.avatar}
                                alt={row.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                                getAvatarColor(row.id)
                            )}
                        >
                            <span>{row.name.charAt(0).toUpperCase()}</span>
                        </div>
                    )}

                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">
                            {row.name}
                        </span>
                        <span className="text-xs text-slate-500">{row.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "quizTitle",
            label: "QUIZ TITLE",
            render: (_, row) => (
                <div className="text-sm font-medium text-slate-700">
                    {row.quizTitle}
                </div>
            ),
        },
        {
            key: "submissionDate",
            label: "SUBMISSION DATE",
            render: (_, row) => (
                <div className="text-sm text-slate-500">
                    {row.submissionDate}
                </div>
            ),
        },
        // {
        //     key: "score",
        //     label: "SCORE",
        //     render: (_, row) => (
        //         <div className="font-bold text-slate-900 text-sm">
        //             {row.score !== null
        //                 ? `${row.score}/${row.score}`
        //                 : `--/${row.score}`}
        //         </div>
        //     ),
        // },
        {
            key: "score",
            label: "SCORE",
            render: (_, row) => (
                <div className="font-bold text-slate-900 text-sm">
                    {row.score}
                </div>
            ),
        },
        {
            key: "status",
            label: "STATUS",
            render: (_, row) => {
                const isGraded = row.status === "GRADED";

                return (
                    <Badge
                        className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold border-none uppercase tracking-wider",
                            isGraded
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        )}
                    >
                        {row.status}
                    </Badge>
                );
            },
        },
    ];
}