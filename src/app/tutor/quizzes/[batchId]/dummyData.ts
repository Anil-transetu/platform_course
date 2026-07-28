export interface QuizSubmission extends Record<string, any> {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
    quizTitle: string;
    submissionDate: string;
    score: number | null;
    totalScore: number;
    status: "GRADED" | "PENDING";
}

export const DUMMY_QUIZ_SUBMISSIONS: QuizSubmission[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "https://i.pravatar.cc/150?u=john",
        quizTitle: "React Fundamentals - Quiz 1",
        submissionDate: "Oct 24, 2023 • 02:45 PM",
        score: 85,
        totalScore: 100,
        status: "GRADED",
    },
    {
        id: 2,
        name: "Sarah Smith",
        email: "sarah.s@example.com",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        quizTitle: "React Fundamentals - Quiz 1",
        submissionDate: "Oct 24, 2023 • 03:15 PM",
        score: null,
        totalScore: 100,
        status: "PENDING",
    },
    {
        id: 3,
        name: "Michael Chen",
        email: "m.chen@example.com",
        avatar: "https://i.pravatar.cc/150?u=michael",
        quizTitle: "React Fundamentals - Quiz 1",
        submissionDate: "Oct 24, 2023 • 11:30 AM",
        score: 92,
        totalScore: 100,
        status: "GRADED",
    },
    {
        id: 4,
        name: "Emma Wilson",
        email: "emma.w@example.com",
        avatar: "https://i.pravatar.cc/150?u=emma",
        quizTitle: "React Fundamentals - Quiz 1",
        submissionDate: "Oct 24, 2023 • 01:05 PM",
        score: 78,
        totalScore: 100,
        status: "GRADED",
    },
    {
        id: 5,
        name: "David Lee",
        email: "d.lee@example.com",
        avatar: "https://i.pravatar.cc/150?u=david",
        quizTitle: "React Fundamentals - Quiz 1",
        submissionDate: "Oct 23, 2023 • 05:20 PM",
        score: null,
        totalScore: 100,
        status: "PENDING",
    },
];