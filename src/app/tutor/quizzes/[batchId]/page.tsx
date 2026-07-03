"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { FileText, CheckCircle, Percent } from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";
import InstitutionPageSkeleton from "@/components/admin/institutions/InstitutionPageSkeleton";
import { useBatchQuizStats, useBatchQuizzes } from "@/features/tutor/api/batch-quiz-api";
import { buildQuizSubmissionColumns } from "./columns";
import DataTable from "@/components/reusable/DataTable";


export default function BatchQuizStatsPage() {
    // Dynamic batchId from URL
    const params = useParams();
    const batchId = params.batchId as string;

    //State
    const {
        data: statsData,
        isLoading,
        isError,
        error,
    } = useBatchQuizStats(batchId);

    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to load quiz statistics.");
        }
    }, [isError, error]);

    // Debugging (remove later)
    useEffect(() => {
        console.log("Batch ID:", batchId);
        console.log("Quiz Stats Response:", statsData);
    }, [batchId, statsData]);

    const stats = statsData || {};


    //Table States
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState<"All Status" | "Graded" | "Pending">("All Status");

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Fetch batch quizzes with pagination and search
    const { data, isFetching } = useBatchQuizzes(batchId, page, rowsPerPage, debouncedSearch);

    const filterConfig = [
        {
            id: "status",
            label: "Status: All Status",
            type: "select" as const,
            value: status,
            options: [
                { value: "All Status", label: "Status: All" },
                { value: "Graded", label: "Graded" },
                { value: "Pending", label: "Pending" },
            ],
            onChange: (val: string | string[]) => {
                const selected = Array.isArray(val) ? val[0] : val;
                setStatus((selected || "All Status") as "All Status" | "Graded" | "Pending");
            },
        },
    ];

    return (
        <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Quiz Statistics
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View quiz statistics for this batch.
                </p>
            </div>

            {isLoading ? (
                <InstitutionPageSkeleton />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total Submissions"
                            value={stats.total_submissions ?? 0}
                            icon={<FileText size={20} />}
                            iconBgClass="bg-blue-50"
                            iconColorClass="text-blue-600"
                        />

                        <StatsCard
                            title="Completed Submissions"
                            value={stats.completed_submissions ?? 0}
                            icon={<CheckCircle size={20} />}
                            iconBgClass="bg-green-50"
                            iconColorClass="text-green-600"
                        />

                        <StatsCard
                            title="Completion Rate"
                            value={`${stats.completion_rate ?? 0}%`}
                            icon={<Percent size={20} />}
                            iconBgClass="bg-orange-50"
                            iconColorClass="text-orange-600"
                        />
                    </div>

                    <DataTable<any>
                        data={data?.data ?? []}
                        columns={buildQuizSubmissionColumns()}
                        loading={isFetching}
                        rowKey={(row) => row.id}
                        filters={filterConfig}
                        search={{
                            enabled: true,
                            value: search,
                            onChange: setSearch,
                            placeholder: "Search by Student Name..."
                        }}
                        currentPage={page}
                        rowsPerPage={rowsPerPage}
                        totalPages={Math.max(1, Math.ceil((data?.total || 0) / rowsPerPage))}
                        onPageChange={setPage}
                        onRowsPerPageChange={(rows) => {
                            setRowsPerPage(rows);
                            setPage(1);
                        }}
                        paginationInfo={
                            data?.total
                                ? `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(
                                    page * rowsPerPage,
                                    data.total
                                )} of ${data.total}`
                                : "0-0 of 0"
                        }
                    />
                </>

            )}
        </div>
    );
}