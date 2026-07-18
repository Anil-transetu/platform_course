import { useState, useCallback, useEffect } from 'react';
import { CourseNote } from '../types';

export function useCourseNotes() {
  const [note, setNote] = useState<CourseNote | null>(null);

  // Initialize a default note if none exists
  useEffect(() => {
    if (!note) {
      setNote({
        id: 'single-note',
        title: '',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [note]);

  const updateNote = useCallback((updates: Partial<Pick<CourseNote, 'title' | 'content'>>) => {
    setNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date()
      };
    });
  }, []);

  return {
    note,
    updateNote,
  };
}
