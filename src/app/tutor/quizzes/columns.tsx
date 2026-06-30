"use client";

import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface QuizOverview {
    id: number | string;
    batch_id: number;
    batch_name: string;
    course_name: string;
    latest_quiz: string;
    submissions_ratio: string;
    submission_percentage: number;
    average_score: number;
}

const progressColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
];

const borderColors = [
    "border-blue-500",
    "border-purple-500",
    "border-green-500",
    "border-orange-500",
];

export function buildQuizColumns(): Column<QuizOverview>[] {
    return [
        {
            key: "batch_name",
            label: "BATCH NAME",
            render: (value, row) => {
                const index = row.batch_id % borderColors.length;

                return (
                    <div className="flex items-center gap-3">
                        <div className={`h-10 border-l-4 rounded-sm ${borderColors[index]}`} />
                        <div>
                            <p className="font-semibold text-sm text-slate-900">
                                {row.batch_name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {row.course_name || "-"}
                            </p>
                        </div>
                    </div>
                );
            },
        },

        {
            key: "latest_quiz",
            label: "LAST QUIZ",
            render: (value) => (
                <span className="text-sm text-slate-700">
                    {(value as string) || "N/A"}
                </span>
            ),
        },

        {
            key: "submissions_ratio",
            label: "SUBMISSIONS",
            render: (_, row) => {
                const index = row.batch_id % progressColors.length;

                return (
                    <div className="w-28 space-y-1">
                        <span className="text-sm font-medium">
                            {row.submissions_ratio}
                        </span>

                        <Progress
                            value={row.submission_percentage}
                            indicatorClassName={progressColors[index]}
                            className="h-2"
                        />
                    </div>
                );
            },
        },

        {
            key: "average_score",
            label: "AVG. SCORE",
            render: (_, row) => (
                <span
                    className={`font-semibold text-sm ${row.average_score >= 80
                        ? "text-green-600"
                        : row.average_score >= 50
                            ? "text-yellow-600"
                            : "text-slate-600"
                        }`}>
                    {row.average_score}%
                </span>
            ),
        },

        {
            key: "batch_id",
            label: "ACTION",
            render: (_, row) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                        console.log("View quizzes", row.batch_id);
                    }}
                >
                    View All Quizzes
                </Button>
            ),
        },
    ];
}