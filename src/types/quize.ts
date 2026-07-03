export interface QuizSubmission extends Record<string, any> {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
    quizTitle: string;
    submissionDate: string;
    score: number | null;
    totalScore: number;
    status: "GRADED" | "PENDING" | string;
}