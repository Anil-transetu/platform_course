import { fetchQuizzes } from "./src/features/admin/quizzes/api/quiz-api";

async function run() {
  try {
    const data = await fetchQuizzes();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
