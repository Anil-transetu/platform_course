import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CourseNote } from '../types';
import { ActiveSidebarItem } from '@/types/student-course';
import { fetchNotes, saveNotesApi } from '@/features/student/courses/api/notes.service';
import { toast } from 'sonner';

export function useCourseNotes(courseId: string, activeItem: ActiveSidebarItem | null, isOpen: boolean) {
  const queryClient = useQueryClient();
  const queryKey = ['courseNotes', courseId, activeItem?.type, activeItem?.id];

  const { data: fetchedNote, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchNotes(courseId, activeItem),
    enabled: !!courseId && isOpen,
  });

  const [localNote, setLocalNote] = useState<CourseNote | null>(null);

  // Sync with fetched data or create empty
  useEffect(() => {
    if (fetchedNote) {
      setLocalNote(fetchedNote);
    } else if (!isLoading) {
      setLocalNote({
        id: 'new-note',
        title: '',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [fetchedNote, isLoading, activeItem?.id]);

  const updateNote = useCallback((updates: Partial<Pick<CourseNote, 'title' | 'content'>>) => {
    setLocalNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date()
      };
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: (payload: { title: string; content: string }) => saveNotesApi(courseId, activeItem, payload),
    onSuccess: (savedData) => {
      toast.success("Notes saved successfully");
      queryClient.setQueryData(queryKey, savedData);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save notes");
    }
  });

  const saveNote = () => {
    if (localNote) {
      saveMutation.mutate({
        title: localNote.title,
        content: localNote.content,
      });
    }
  };

  return {
    note: localNote,
    updateNote,
    saveNote,
    isSaving: saveMutation.isPending,
    isLoading,
    isError,
  };
}
