export default function TutorQuizzesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quizzes</h1>
          <p className="text-card-foreground text-sm">
            Manage your quizzes and assessments.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center h-[50vh] text-center border-2 border-dashed border-border rounded-xl">
        <p className="text-lg text-foreground font-medium">Quizzes module coming soon...</p>
        <p className="text-sm text-muted-foreground mt-2">Features are currently under development.</p>
      </div>
    </div>
  );
}
