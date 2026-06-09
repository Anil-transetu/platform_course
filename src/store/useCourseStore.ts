import { create } from 'zustand';

export type Topic = {
  id: string;
  title: string;
  content: string;
};

export type Quiz = {
  id: string;
  title: string;
};

export type Assignment = {
  id: string;
  title: string;
};

export type Lesson = {
  id: string;
  title: string;
  content: string;
  topics: Topic[];
  quizzes: Quiz[];
  assignments: Assignment[];
};

export type Module = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export type Course = {
  title: string;
  domain: string;
  tags: string;
  modules: Module[];
};

interface CourseState {
  course: Course;
  activeModuleId: string | null;
  activeLessonId: string | null;
  activeTopicId: string | null;
  activeQuizId: string | null;
  activeAssignmentId: string | null;

  setCourseDetails: (title: string, domain: string, tags: string) => void;
  
  addModule: () => string;
  updateModule: (id: string, updates: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  setActiveModule: (id: string | null) => void;

  addLesson: (moduleId: string) => string;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  setActiveLesson: (id: string | null) => void;

  addTopic: (moduleId: string, lessonId: string) => string;
  updateTopic: (moduleId: string, lessonId: string, topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (moduleId: string, lessonId: string, topicId: string) => void;
  setActiveTopic: (id: string | null) => void;

  addQuiz: (moduleId: string, lessonId: string) => string;
  updateQuiz: (moduleId: string, lessonId: string, quizId: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (moduleId: string, lessonId: string, quizId: string) => void;
  setActiveQuiz: (id: string | null) => void;

  addAssignment: (moduleId: string, lessonId: string) => string;
  updateAssignment: (moduleId: string, lessonId: string, assignmentId: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (moduleId: string, lessonId: string, assignmentId: string) => void;
  setActiveAssignment: (id: string | null) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  course: {
    title: '',
    domain: '',
    tags: '',
    modules: [],
  },
  activeModuleId: null,
  activeLessonId: null,
  activeTopicId: null,
  activeQuizId: null,
  activeAssignmentId: null,

  setCourseDetails: (title, domain, tags) => set((state) => ({
    course: { ...state.course, title, domain, tags }
  })),

  addModule: () => {
    const id = crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: [...state.course.modules, { id, title: '', description: '', lessons: [] }],
      },
      activeModuleId: id,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null,
    }));
    return id;
  },

  updateModule: (id, updates) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => m.id === id ? { ...m, ...updates } : m),
    }
  })),

  deleteModule: (id) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.filter(m => m.id !== id),
    },
    activeModuleId: state.activeModuleId === id ? null : state.activeModuleId,
    activeLessonId: state.activeModuleId === id ? null : state.activeLessonId,
    activeTopicId: state.activeModuleId === id ? null : state.activeTopicId,
    activeQuizId: state.activeModuleId === id ? null : state.activeQuizId,
    activeAssignmentId: state.activeModuleId === id ? null : state.activeAssignmentId,
  })),

  setActiveModule: (id) => set({ activeModuleId: id, activeLessonId: null, activeTopicId: null, activeQuizId: null, activeAssignmentId: null }),

  addLesson: (moduleId) => {
    const id = crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: [...m.lessons, { id, title: '', content: '', topics: [], quizzes: [], assignments: [] }],
            };
          }
          return m;
        }),
      },
      activeModuleId: moduleId,
      activeLessonId: id,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null,
    }));
    return id;
  },

  updateLesson: (moduleId, lessonId, updates) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l),
          };
        }
        return m;
      }),
    }
  })),

  deleteLesson: (moduleId, lessonId) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.filter(l => l.id !== lessonId),
          };
        }
        return m;
      }),
    },
    activeLessonId: state.activeLessonId === lessonId ? null : state.activeLessonId,
    activeTopicId: state.activeLessonId === lessonId ? null : state.activeTopicId,
    activeQuizId: state.activeLessonId === lessonId ? null : state.activeQuizId,
    activeAssignmentId: state.activeLessonId === lessonId ? null : state.activeAssignmentId,
  })),

  setActiveLesson: (id) => set({ activeLessonId: id, activeTopicId: null, activeQuizId: null, activeAssignmentId: null }),

  addTopic: (moduleId, lessonId) => {
    const id = crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  return {
                    ...l,
                    topics: [...l.topics, { id, title: '', content: '' }],
                  };
                }
                return l;
              }),
            };
          }
          return m;
        }),
      },
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: id,
      activeQuizId: null,
      activeAssignmentId: null,
    }));
    return id;
  },

  updateTopic: (moduleId, lessonId, topicId, updates) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return {
                  ...l,
                  topics: l.topics.map(t => t.id === topicId ? { ...t, ...updates } : t),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    }
  })),

  deleteTopic: (moduleId, lessonId, topicId) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return {
                  ...l,
                  topics: l.topics.filter(t => t.id !== topicId),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    },
    activeTopicId: state.activeTopicId === topicId ? null : state.activeTopicId,
  })),

  setActiveTopic: (id) => set({ activeTopicId: id, activeQuizId: null, activeAssignmentId: null }),

  addQuiz: (moduleId, lessonId) => {
    const id = crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  return {
                    ...l,
                    quizzes: [...(l.quizzes || []), { id, title: '' }],
                  };
                }
                return l;
              }),
            };
          }
          return m;
        }),
      },
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: null,
      activeQuizId: id,
      activeAssignmentId: null,
    }));
    return id;
  },

  updateQuiz: (moduleId, lessonId, quizId, updates) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return {
                  ...l,
                  quizzes: l.quizzes.map(q => q.id === quizId ? { ...q, ...updates } : q),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    }
  })),

  deleteQuiz: (moduleId, lessonId, quizId) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return {
                  ...l,
                  quizzes: l.quizzes.filter(q => q.id !== quizId),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    },
    activeQuizId: state.activeQuizId === quizId ? null : state.activeQuizId,
  })),

  setActiveQuiz: (id) => set({ activeQuizId: id, activeTopicId: null, activeAssignmentId: null }),

  addAssignment: (moduleId, lessonId) => {
    const id = crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  return {
                    ...l,
                    assignments: [...(l.assignments || []), { id, title: '' }],
                  };
                }
                return l;
              }),
            };
          }
          return m;
        }),
      },
      activeModuleId: moduleId,
      activeLessonId: lessonId,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: id,
    }));
    return id;
  },

  updateAssignment: (moduleId, lessonId, assignmentId, updates) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return {
                  ...l,
                  assignments: l.assignments.map(a => a.id === assignmentId ? { ...a, ...updates } : a),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    }
  })),

  deleteAssignment: (moduleId, lessonId, assignmentId) => set((state) => ({
    course: {
      ...state.course,
      modules: state.course.modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return {
                  ...l,
                  assignments: l.assignments.filter(a => a.id !== assignmentId),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    },
    activeAssignmentId: state.activeAssignmentId === assignmentId ? null : state.activeAssignmentId,
  })),

  setActiveAssignment: (id) => set({ activeAssignmentId: id, activeTopicId: null, activeQuizId: null }),

}));
