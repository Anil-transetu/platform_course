import { create } from 'zustand';
import { persist } from 'zustand/middleware';


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
  order?: { id: string; type: 'topic' | 'quiz' | 'assignment' }[];
};

export type Module = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
  order?: { id: string; type: 'lesson' | 'quiz' | 'assignment' }[];
};

export type Course = {
  id?: number | string;
  title: string;
  domain?: string;
  tags?: string;
  thumbnail_url?: string;
  description?: string;
  modules: Module[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
};

interface CourseState {
  course: Course;
  activeModuleId: string | null;
  activeLessonId: string | null;
  activeTopicId: string | null;
  activeQuizId: string | null;
  activeAssignmentId: string | null;

  setCourseDetails: (title: string, description: string, thumbnail_url: string, domain?: string, tags?: string) => void;
  setCourse: (course: Course) => void;
  resetCourse: () => void;
  
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

  addQuiz: (moduleId: string, lessonId?: string) => string;
  updateQuiz: (moduleId: string, lessonId: string | undefined | null, quizId: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (moduleId: string, lessonId: string | undefined | null, quizId: string) => void;
  setActiveQuiz: (id: string | null) => void;

  addAssignment: (moduleId: string, lessonId?: string) => string;
  updateAssignment: (moduleId: string, lessonId: string | undefined | null, assignmentId: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (moduleId: string, lessonId: string | undefined | null, assignmentId: string) => void;
  setActiveAssignment: (id: string | null) => void;

  addCourseQuiz: () => string;
  updateCourseQuiz: (quizId: string, updates: Partial<Quiz>) => void;
  deleteCourseQuiz: (quizId: string) => void;
  addCourseAssignment: () => string;
  updateCourseAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  deleteCourseAssignment: (assignmentId: string) => void;
  moveLessonItem: (moduleId: string, lessonId: string, itemId: string, direction: 'up' | 'down') => void;
  moveModuleItem: (moduleId: string, itemId: string, direction: 'up' | 'down') => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      course: {
    title: '',
    domain: '',
    tags: '',
    thumbnail_url: '',
    description: '',
    modules: [],
  },
  activeModuleId: null,
  activeLessonId: null,
  activeTopicId: null,
  activeQuizId: null,
  activeAssignmentId: null,

  setCourseDetails: (title, description, thumbnail_url, domain = '', tags = '') => set((state) => ({
    course: { ...state.course, title, description, thumbnail_url, domain, tags }
  })),

  setCourse: (course) => set({
    course: {
      ...course,
      modules: (course.modules || []).map(m => ({
        ...m,
        lessons: (m.lessons || []).map(l => {
          if (l.order && l.order.length > 0) return l;
          const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
          (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
          (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
          (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
          return { ...l, order };
        })
      }))
    },
    activeModuleId: course.modules[0]?.id || null,
    activeLessonId: course.modules[0]?.lessons[0]?.id || null,
    activeTopicId: null,
    activeQuizId: null,
    activeAssignmentId: null,
  }),

  resetCourse: () => set({
    course: {
      title: '',
      domain: '',
      tags: '',
      thumbnail_url: '',
      description: '',
      modules: [],
    },
    activeModuleId: null,
    activeLessonId: null,
    activeTopicId: null,
    activeQuizId: null,
    activeAssignmentId: null,
  }),

  addModule: () => {
    const id = 'temp-' + crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: [...state.course.modules, { id, title: '', description: '', lessons: [], quizzes: [], assignments: [] }],
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

  deleteModule: (id) => set((state) => {
    const remainingModules = state.course.modules.filter(m => m.id !== id);
    const wasActive = state.activeModuleId === id;
    const newActiveModuleId = wasActive 
      ? (remainingModules[0]?.id || null) 
      : state.activeModuleId;

    return {
      course: {
        ...state.course,
        modules: remainingModules,
      },
      activeModuleId: newActiveModuleId,
      activeLessonId: wasActive ? null : state.activeLessonId,
      activeTopicId: wasActive ? null : state.activeTopicId,
      activeQuizId: wasActive ? null : state.activeQuizId,
      activeAssignmentId: wasActive ? null : state.activeAssignmentId,
    };
  }),

  setActiveModule: (id) => set({ activeModuleId: id, activeLessonId: null, activeTopicId: null, activeQuizId: null, activeAssignmentId: null }),

  addLesson: (moduleId) => {
    const id = 'temp-' + crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            const order = m.order 
              ? [...m.order, { id, type: 'lesson' as const }] 
              : [
                  ...(m.lessons || []).map(l => ({ id: l.id, type: 'lesson' as const })),
                  ...(m.quizzes || []).map(q => ({ id: q.id, type: 'quiz' as const })),
                  ...(m.assignments || []).map(a => ({ id: a.id, type: 'assignment' as const })),
                  { id, type: 'lesson' as const }
                ];
            return {
              ...m,
              lessons: [...m.lessons, { id, title: '', content: '', topics: [], quizzes: [], assignments: [] }],
              order
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
            order: m.order ? m.order.filter(o => o.id !== lessonId) : undefined
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
    const id = 'temp-' + crypto.randomUUID();
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  return {
                    ...updatedL,
                    topics: [...updatedL.topics, { id, title: '', content: '' }],
                    order: [...(updatedL.order || []), { id, type: 'topic' }]
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

  deleteTopic: (moduleId, lessonId, topicId) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  return {
                    ...updatedL,
                    topics: updatedL.topics.filter(t => t.id !== topicId),
                    order: (updatedL.order || []).filter(o => o.id !== topicId)
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
    }));
  },

  setActiveTopic: (id) => set({ activeTopicId: id, activeQuizId: null, activeAssignmentId: null }),

  addQuiz: (moduleId, lessonId) => {
    const id = 'temp-' + crypto.randomUUID();
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            if (!lessonId) {
              const order = m.order 
                ? [...m.order, { id, type: 'quiz' as const }] 
                : [
                    ...(m.lessons || []).map(l => ({ id: l.id, type: 'lesson' as const })),
                    ...(m.quizzes || []).map(q => ({ id: q.id, type: 'quiz' as const })),
                    ...(m.assignments || []).map(a => ({ id: a.id, type: 'assignment' as const })),
                    { id, type: 'quiz' as const }
                  ];
              return {
                ...m,
                quizzes: [...(m.quizzes || []), { id, title: '' }],
                order
              };
            }
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  return {
                    ...updatedL,
                    quizzes: [...(updatedL.quizzes || []), { id, title: '' }],
                    order: [...(updatedL.order || []), { id, type: 'quiz' }]
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
          if (!lessonId) {
            const updatedQuizzes = (m.quizzes || []).map(q => q.id === quizId ? { ...q, ...updates } : q);
            const updatedOrder = updates.id && m.order
              ? m.order.map(o => (o.id === quizId && o.type === 'quiz') ? { ...o, id: String(updates.id) } : o)
              : m.order;
            return {
              ...m,
              quizzes: updatedQuizzes,
              order: updatedOrder
            };
          }
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                const updatedQuizzes = l.quizzes.map(q => q.id === quizId ? { ...q, ...updates } : q);
                const updatedOrder = updates.id && l.order
                  ? l.order.map(o => (o.id === quizId && o.type === 'quiz') ? { ...o, id: String(updates.id) } : o)
                  : l.order;
                return {
                  ...l,
                  quizzes: updatedQuizzes,
                  order: updatedOrder
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

  deleteQuiz: (moduleId, lessonId, quizId) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            if (!lessonId) {
              return {
                ...m,
                quizzes: (m.quizzes || []).filter(q => q.id !== quizId),
                order: m.order ? m.order.filter(o => o.id !== quizId) : undefined
              };
            }
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  return {
                    ...updatedL,
                    quizzes: updatedL.quizzes.filter(q => q.id !== quizId),
                    order: (updatedL.order || []).filter(o => o.id !== quizId)
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
    }));
  },

  setActiveQuiz: (id) => set({ activeQuizId: id, activeTopicId: null, activeAssignmentId: null }),

  addAssignment: (moduleId, lessonId) => {
    const id = 'temp-' + crypto.randomUUID();
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            if (!lessonId) {
              const order = m.order 
                ? [...m.order, { id, type: 'assignment' as const }] 
                : [
                    ...(m.lessons || []).map(l => ({ id: l.id, type: 'lesson' as const })),
                    ...(m.quizzes || []).map(q => ({ id: q.id, type: 'quiz' as const })),
                    ...(m.assignments || []).map(a => ({ id: a.id, type: 'assignment' as const })),
                    { id, type: 'assignment' as const }
                  ];
              return {
                ...m,
                assignments: [...(m.assignments || []), { id, title: '' }],
                order
              };
            }
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  return {
                    ...updatedL,
                    assignments: [...(updatedL.assignments || []), { id, title: '' }],
                    order: [...(updatedL.order || []), { id, type: 'assignment' }]
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
          if (!lessonId) {
            const updatedAssignments = (m.assignments || []).map(a => a.id === assignmentId ? { ...a, ...updates } : a);
            const updatedOrder = updates.id && m.order
              ? m.order.map(o => (o.id === assignmentId && o.type === 'assignment') ? { ...o, id: String(updates.id) } : o)
              : m.order;
            return {
              ...m,
              assignments: updatedAssignments,
              order: updatedOrder
            };
          }
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                const updatedAssignments = l.assignments.map(a => a.id === assignmentId ? { ...a, ...updates } : a);
                const updatedOrder = updates.id && l.order
                  ? l.order.map(o => (o.id === assignmentId && o.type === 'assignment') ? { ...o, id: String(updates.id) } : o)
                  : l.order;
                return {
                  ...l,
                  assignments: updatedAssignments,
                  order: updatedOrder
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

  deleteAssignment: (moduleId, lessonId, assignmentId) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            if (!lessonId) {
              return {
                ...m,
                assignments: (m.assignments || []).filter(a => a.id !== assignmentId),
                order: m.order ? m.order.filter(o => o.id !== assignmentId) : undefined
              };
            }
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  return {
                    ...updatedL,
                    assignments: updatedL.assignments.filter(a => a.id !== assignmentId),
                    order: (updatedL.order || []).filter(o => o.id !== assignmentId)
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
    }));
  },

  setActiveAssignment: (id) => set({ activeAssignmentId: id, activeTopicId: null, activeQuizId: null }),

  addCourseQuiz: () => {
    const id = 'temp-' + crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        quizzes: [...(state.course.quizzes || []), { id, title: '' }]
      },
      activeQuizId: id,
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeAssignmentId: null,
    }));
    return id;
  },

  updateCourseQuiz: (quizId, updates) => set((state) => ({
    course: {
      ...state.course,
      quizzes: (state.course.quizzes || []).map(q => q.id === quizId ? { ...q, ...updates } : q)
    }
  })),

  deleteCourseQuiz: (quizId) => set((state) => ({
    course: {
      ...state.course,
      quizzes: (state.course.quizzes || []).filter(q => q.id !== quizId)
    },
    activeQuizId: state.activeQuizId === quizId ? null : state.activeQuizId
  })),

  addCourseAssignment: () => {
    const id = 'temp-' + crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        assignments: [...(state.course.assignments || []), { id, title: '' }]
      },
      activeAssignmentId: id,
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
    }));
    return id;
  },

  updateCourseAssignment: (assignmentId, updates) => set((state) => ({
    course: {
      ...state.course,
      assignments: (state.course.assignments || []).map(a => a.id === assignmentId ? { ...a, ...updates } : a)
    }
  })),

  deleteCourseAssignment: (assignmentId) => set((state) => ({
    course: {
      ...state.course,
      assignments: (state.course.assignments || []).filter(a => a.id !== assignmentId)
    },
    activeAssignmentId: state.activeAssignmentId === assignmentId ? null : state.activeAssignmentId
  })),

  moveLessonItem: (moduleId, lessonId, itemId, direction) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => {
                if (l.id === lessonId) {
                  const updatedL = ensureLessonOrder(l);
                  const order = [...(updatedL.order || [])];
                  const index = order.findIndex(o => o.id === itemId);
                  if (index === -1) return l;
                  
                  const newIndex = direction === 'up' ? index - 1 : index + 1;
                  if (newIndex < 0 || newIndex >= order.length) return l;
                  
                  const temp = order[index];
                  order[index] = order[newIndex];
                  order[newIndex] = temp;
                  
                  return {
                    ...updatedL,
                    order
                  };
                }
                return l;
              })
            };
          }
          return m;
        })
      }
    }));
  },

  moveModuleItem: (moduleId, itemId, direction) => {
    const ensureModuleOrder = (m: Module): Module => {
      if (m.order && m.order.length > 0) return m;
      const order: { id: string; type: 'lesson' | 'quiz' | 'assignment' }[] = [];
      (m.lessons || []).forEach(l => order.push({ id: l.id, type: 'lesson' }));
      (m.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (m.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...m, order };
    };
    set((state) => ({
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id === moduleId) {
            const updatedM = ensureModuleOrder(m);
            const order = [...(updatedM.order || [])];
            const index = order.findIndex(o => o.id === itemId);
            if (index === -1) return m;
            
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= order.length) return m;
            
            const temp = order[index];
            order[index] = order[newIndex];
            order[newIndex] = temp;
            
            return {
              ...updatedM,
              order
            };
          }
          return m;
        })
      }
    }));
  },
  }),
  {
    name: 'transetu-course-creation-store',
  }
));
