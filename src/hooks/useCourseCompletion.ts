import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseCompletionService } from "@/services/courseCompletion.service";
import { CompletionResourceType } from "@/types/completion";
import { toast } from "sonner"; // Assuming sonner is available based on package.json

interface UseCourseCompletionParams {
  courseId: string | number;
}

export function useCourseCompletion({ courseId }: UseCourseCompletionParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resourceType,
      resourceId,
    }: {
      resourceType: CompletionResourceType;
      resourceId: string | number;
    }) => {
      return courseCompletionService.markAsCompleted(resourceType, resourceId);
    },
    onSuccess: (_, variables) => {
      // Show success toast
      toast.success(
        `${variables.resourceType.charAt(0).toUpperCase() + variables.resourceType.slice(1)} marked as completed!`
      );

      // Optimistically update course sidebar progress on the frontend
      queryClient.setQueryData(["course-sidebar", String(courseId)], (oldData: any) => {
        if (!oldData || !oldData.sidebar) return oldData;
        const newData = JSON.parse(JSON.stringify(oldData));
        
        const recalcProgress = (item: any) => {
           let total = 0;
           let completed = 0;
           
           if (item.topics && item.topics.length > 0) {
              item.topics.forEach((t: any) => {
                 recalcProgress(t);
                 total += 1;
                 if (t.progressPct === 100 || t.isCompleted) completed += 1;
              });
           }
           if (item.lessons && item.lessons.length > 0) {
              item.lessons.forEach((l: any) => {
                 recalcProgress(l);
                 total += 1;
                 if (l.progressPct === 100 || l.isCompleted) completed += 1;
              });
           }
           
           if (item.quiz) { total += 1; if (item.quiz.progressPct === 100) completed += 1; }
           if (item.quizzes) {
              item.quizzes.forEach((q: any) => { total += 1; if (q.progressPct === 100) completed += 1; });
           }
           if (item.assignment) { total += 1; if (item.assignment.progressPct === 100) completed += 1; }
           if (item.assignments) {
              item.assignments.forEach((a: any) => { total += 1; if (a.progressPct === 100) completed += 1; });
           }

           if (total > 0) {
              item.progressPct = Math.round((completed / total) * 100);
           }
        };

        const updateItem = (items: any[]) => {
          let found = false;
          for (let i = 0; i < items.length; i++) {
            // We just check ID. Since IDs are usually unique, this is safe enough.
            if (String(items[i].id) === String(variables.resourceId)) {
               items[i].progressPct = 100;
               items[i].isCompleted = true;
               found = true;
            }
            if (items[i].lessons && updateItem(items[i].lessons)) found = true;
            if (items[i].topics && updateItem(items[i].topics)) found = true;
          }
          return found;
        };

        if (variables.resourceType === 'module') {
           const mod = newData.sidebar.find((m: any) => String(m.id) === String(variables.resourceId));
           if (mod) mod.progressPct = 100;
        } else {
           for (const mod of newData.sidebar) {
             let wasUpdated = false;
             if (mod.lessons && updateItem(mod.lessons)) wasUpdated = true;
             if (mod.topics && updateItem(mod.topics)) wasUpdated = true;
             
             if (wasUpdated) {
                recalcProgress(mod);
             }
           }
        }
        return newData;
      });

      // Optimistically update current view
      queryClient.setQueryData(
        ["course-view", String(courseId), variables.resourceType, String(variables.resourceId)],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            isCompleted: true,
            progressPct: 100,
            metadata: {
               ...(oldData.metadata || {}),
               is_completed: true
            }
          };
        }
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to mark as completed. Please try again.");
    },
  });
}
