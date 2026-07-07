import { keepPreviousData, useQuery } from "@tanstack/react-query";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "https://lms-backend-n83k.onrender.com";

//Specific student States api URL
const BASE_URL = `${API_HOST}/api/v1/tutor-portal/batch`;

//Specific student table data api URL
const STUDENT_BATCH_QUIZZES_URL = `${API_HOST}/api/v1/tutor-portal/batch`;

/**
 * Get Authorization Headers
 */
function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )token=([^;]+)/);

        if (match) {
            headers["Authorization"] = `Bearer ${match[2]}`;
        }
    }

    return headers;
}

/**
 * Handle API Response
 */
async function handleResponse(response: Response) {
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));

        let messageStr = "API request failed";

        if (err.errors) {
            if (Array.isArray(err.errors)) {
                messageStr = err.errors
                    .map((e: any) => (typeof e === "string" ? e : JSON.stringify(e)))
                    .join(", ");
            } else if (typeof err.errors === "object") {
                messageStr = Object.values(err.errors).flat().join(", ");
            } else {
                messageStr = String(err.errors);
            }
        } else if (Array.isArray(err.message)) {
            messageStr = err.message.join(", ");
        } else if (err.message) {
            messageStr = err.message;
        } else if (err.detail) {
            messageStr = err.detail;
        }

        const isTokenExpired =
            messageStr.toLowerCase().includes("token expired") ||
            response.status === 401;

        if (isTokenExpired) {
            if (typeof document !== "undefined") {
                document.cookie =
                    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie =
                    "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                window.location.href = "/login";
            }
        } else {
            console.error("API ERROR:", err);
        }

        throw new Error(messageStr);
    }

    return response.json();
}

/**
 * Fetch Quiz Stats by Batch ID
 * Endpoint:
 * GET /api/v1/tutor-portal/batch/:batchId/quiz-stats
 */
export async function fetchBatchQuizStats(batchId: string | number) {
    const response = await fetch(
        `${BASE_URL}/${batchId}/quiz-stats`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    const result = await handleResponse(response);
    return result.data || result;
}

/**
 * React Query Hook for quiz stats
 */
export function useBatchQuizStats(batchId: string | number) {
    return useQuery({
        queryKey: ["batch-quiz-stats", batchId],
        queryFn: () => fetchBatchQuizStats(batchId),
        enabled: !!batchId,
    });
}

export async function fetchBatchQuizzes(
    batchId: number | string,
    page: number = 1,
    limit: number = 5,
    search?: string,
    statusFilter?: string
) {
    let url = `${STUDENT_BATCH_QUIZZES_URL}/${batchId}/quizzes`;

    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (search?.trim()) {
        query.append("search", search);
    }

    if (statusFilter && statusFilter !== "All Status") {
        query.append("status", statusFilter.toLowerCase());
    }

    url += `?${query.toString()}`;

    console.log("Batch Quiz URL:", url);

    const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);

    const data = result?.data?.data || result?.data || [];
    const total = result?.pagination?.total_items || data.length;

    const mappedData = data.map((student: any) => ({
        id: `${student.quiz_id}-${student.student_id ?? "guest"}`,
        studentId: student.student_id,
        quizId: student.quiz_id,
        avatar: student.student_profile,
        name: student.student_name,
        email: student.student_email,
        quizTitle: student.quiz_title,
        submissionDate: student.submission_date,
        score: student.score,
        status: student.status,
    }));

    return {
        data: mappedData,
        total,
        batchId, // optional, if you need it in the UI
    };
}

export function useBatchQuizzes(
    batchId: number | string,
    page: number = 1,
    limit: number = 5,
    search?: string,
    statusFilter?: string
) {
    return useQuery({
        queryKey: ["batchQuizzes", batchId, { page, limit, search, statusFilter }],
        queryFn: () => fetchBatchQuizzes(batchId, page, limit, search, statusFilter),
        enabled: !!batchId,
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });
}
