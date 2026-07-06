import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mapModuleDetailToUpdates, mapLessonDetailToUpdates, mapTopicDetailToUpdates, mapCourseDetailsToStore } from '@/lib/utils';


export type ContentBlock = {
  id?: string | number;
  type: 'text' | 'image' | 'video' | 'pdf' | 'url';
  value: string;
  order_num: number;
};

export type Topic = {
  id: string;
  title: string;
  content: string;
  quizzes?: Quiz[];
  assignments?: Assignment[];
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
  order_num?: number;
  topics: Topic[];
  quizzes: Quiz[];
  assignments: Assignment[];
  order?: { id: string; type: 'topic' | 'quiz' | 'assignment' }[];
  image_url?: string;
  video_url?: string;
  pdf_url?: string;
  url?: string;
  content_text?: string;
  text?: string;
  images?: string[];
  videos?: string[];
  pdfs?: string[];
  urls?: string[];
  content_blocks?: ContentBlock[];
};

export type Module = {
  id: string;
  title: string;
  description: string;
  order_num?: number;
  lessons: Lesson[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
  order?: { id: string; type: 'lesson' | 'quiz' | 'assignment' }[];
  image_url?: string;
  video_url?: string;
  pdf_url?: string;
  url?: string;
  content_text?: string;
  text?: string;
  images?: string[];
  videos?: string[];
  pdfs?: string[];
  urls?: string[];
  content_blocks?: ContentBlock[];
};

export type Course = {
  id?: number | string;
  title: string;
  domain?: string;
  tags?: string[];
  thumbnail_url?: string;
  description?: string;
  status?: string;
  final_assessment?: any;
  final_assessment_id?: string | number | null;
  modules: Module[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
  content_blocks?: ContentBlock[];
};

interface CourseState {
  course: Course;
  cleanCourse: Course | null;
  activeModuleId: string | null;
  activeLessonId: string | null;
  activeTopicId: string | null;
  activeQuizId: string | null;
  activeAssignmentId: string | null;

  // Sidebar collapse state
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Expanded folder states
  expandedModules: Record<string, boolean>;
  expandedLessons: Record<string, boolean>;
  setModuleExpanded: (moduleId: string, expanded: boolean) => void;
  setLessonExpanded: (lessonId: string, expanded: boolean) => void;
  toggleModuleExpand: (moduleId: string) => void;
  toggleLessonExpand: (lessonId: string) => void;

  setCourseDetails: (title: string, description: string, thumbnail_url: string, domain?: string, tags?: string[], status?: string) => void;
  setCourseMetadata: (details: Record<string, any>) => void;
  setCourse: (course: any, options?: { force?: boolean }) => void;
  resetCourse: () => void;
  
  addModule: () => string;
  updateModule: (id: string, updates: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  setActiveModule: (id: string | null) => void;
  mapTemporaryModuleId: (tempId: string, backendId: string) => void;

  addLesson: (moduleId: string) => string;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  setActiveLesson: (id: string | null) => void;

  addTopic: (moduleId: string, lessonId: string) => string;
  updateTopic: (moduleId: string, lessonId: string, topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (moduleId: string, lessonId: string, topicId: string) => void;
  setActiveTopic: (id: string | null) => void;

  addQuiz: (moduleId: string, lessonId?: string) => string;
  updateQuiz: (moduleId: string, lessonId: string | undefined | null, quizId: string, updates: Partial<Quiz>, options?: { isLocalOnly?: boolean }) => void;
  deleteQuiz: (moduleId: string, lessonId: string | undefined | null, quizId: string) => void;
  setActiveQuiz: (id: string | null) => void;

  addAssignment: (moduleId: string, lessonId?: string) => string;
  updateAssignment: (moduleId: string, lessonId: string | undefined | null, assignmentId: string, updates: Partial<Assignment>, options?: { isLocalOnly?: boolean }) => void;
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

  deletedModules: string[];
  deletedLessons: string[];
  deletedTopics: string[];
  clearDeletedItems: () => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      course: {
        title: '',
        domain: '',
        tags: [],
        thumbnail_url: '',
        description: '',
        modules: [],
      },
      cleanCourse: null,
  activeModuleId: null,
  activeLessonId: null,
  activeTopicId: null,
  activeQuizId: null,
  activeAssignmentId: null,
  deletedModules: [],
  deletedLessons: [],
  deletedTopics: [],

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
    deletedModules: [],
    deletedLessons: [],
    deletedTopics: [],
  }),

  resetCourse: () => set({
    course: {
      title: '',
      domain: '',
      tags: [],
      thumbnail_url: '',
      description: '',
      status: '',
      modules: [],
    },
    activeModuleId: null,
    activeLessonId: null,
    activeTopicId: null,
    activeQuizId: null,
    activeAssignmentId: null,
    deletedModules: [],
    deletedLessons: [],
    deletedTopics: [],
  }),

  clearDeletedItems: () => set({ deletedModules: [], deletedLessons: [], deletedTopics: [] }),

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
      expandedModules: { ...state.expandedModules, [id]: true }
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
    let newActiveModuleId = state.activeModuleId;
    
    if (wasActive) {
      if (remainingModules.length > 0) {
        const deletedIndex = state.course.modules.findIndex(m => m.id === id);
        if (deletedIndex < remainingModules.length) {
          newActiveModuleId = remainingModules[deletedIndex].id;
        } else {
          newActiveModuleId = remainingModules[deletedIndex - 1].id;
        }
      } else {
        newActiveModuleId = null;
      }
    }

    const nextExpandedModules = { ...state.expandedModules };
    delete nextExpandedModules[id];

    return {
      course: {
        ...state.course,
        modules: remainingModules,
      },
      deletedModules: String(id).startsWith('temp-') ? state.deletedModules : [...state.deletedModules, String(id)],
      deletedModules: String(id).startsWith('temp-') ? state.deletedModules : [...state.deletedModules, String(id)],
      activeModuleId: newActiveModuleId,
      activeLessonId: wasActive ? null : state.activeLessonId,
      activeTopicId: wasActive ? null : state.activeTopicId,
      activeQuizId: wasActive ? null : state.activeQuizId,
      activeAssignmentId: wasActive ? null : state.activeAssignmentId,
      expandedModules: nextExpandedModules
    };
  }),

  mapTemporaryModuleId: (tempId, backendId) => set((state) => {
    const strBackendId = String(backendId);
    const modules = state.course.modules.map(m => m.id === tempId ? { ...m, id: strBackendId } : m);
    const activeModuleId = state.activeModuleId === tempId ? strBackendId : state.activeModuleId;
    const expandedModules = { ...state.expandedModules };
    if (expandedModules[tempId]) {
      expandedModules[strBackendId] = true;
      delete expandedModules[tempId];
    }
    
    const updatedCourse = {
      ...state.course,
      modules,
    };

    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse),
      activeModuleId,
      expandedModules,
    };
  }),

  setActiveModule: (id) => set((state) => ({
    activeModuleId: id,
    activeLessonId: null,
    activeTopicId: null,
    activeQuizId: null,
    activeAssignmentId: null,
    expandedModules: id ? { ...state.expandedModules, [id]: true } : state.expandedModules
  })),

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
      expandedModules: { ...state.expandedModules, [moduleId]: true },
      expandedLessons: { ...state.expandedLessons, [id]: true }
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
    deletedLessons: String(lessonId).startsWith('temp-') ? state.deletedLessons : [...state.deletedLessons, String(lessonId)],
    activeLessonId: state.activeLessonId === lessonId ? null : state.activeLessonId,
    activeTopicId: state.activeLessonId === lessonId ? null : state.activeTopicId,
    activeQuizId: state.activeLessonId === lessonId ? null : state.activeQuizId,
    activeAssignmentId: state.activeLessonId === lessonId ? null : state.activeAssignmentId,
  })),

  setActiveLesson: (id) => set((state) => {
    let parentModuleId: string | null = null;
    if (id) {
      const parentModule = state.course.modules.find(m => m.lessons.some(l => l.id === id));
      if (parentModule) {
        parentModuleId = parentModule.id;
      }
    }
    return {
      activeLessonId: id,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null,
      activeModuleId: parentModuleId || state.activeModuleId,
      expandedModules: parentModuleId ? { ...state.expandedModules, [parentModuleId]: true } : state.expandedModules,
      expandedLessons: id ? { ...state.expandedLessons, [id]: true } : state.expandedLessons
    };
  }),

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
      expandedModules: { ...state.expandedModules, [moduleId]: true },
      expandedLessons: { ...state.expandedLessons, [lessonId]: true }
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
      deletedTopics: String(topicId).startsWith('temp-') ? state.deletedTopics : [...state.deletedTopics, String(topicId)],
      activeTopicId: state.activeTopicId === topicId ? null : state.activeTopicId,
    }));
  },

  setActiveTopic: (id) => set((state) => {
    let parentLessonId: string | null = null;
    let parentModuleId: string | null = null;
    
    if (id) {
      for (const m of state.course.modules) {
        for (const l of m.lessons) {
          if (l.topics.some(t => t.id === id)) {
            parentLessonId = l.id;
            parentModuleId = m.id;
            break;
          }
        }
        if (parentModuleId) break;
      }
    }

    const nextExpandedModules = { ...state.expandedModules };
    const nextExpandedLessons = { ...state.expandedLessons };
    if (parentModuleId) nextExpandedModules[parentModuleId] = true;
    if (parentLessonId) nextExpandedLessons[parentLessonId] = true;

    return {
      activeTopicId: id,
      activeQuizId: null,
      activeAssignmentId: null,
      expandedModules: nextExpandedModules,
      expandedLessons: nextExpandedLessons,
      activeModuleId: parentModuleId || state.activeModuleId,
      activeLessonId: parentLessonId || state.activeLessonId
    };
  }),

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
    set((state) => {
      const nextExpandedModules = { ...state.expandedModules, [moduleId]: true };
      const nextExpandedLessons = { ...state.expandedLessons };
      if (lessonId) {
        nextExpandedLessons[lessonId] = true;
      }
      return {
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
        activeLessonId: lessonId || null,
        activeTopicId: null,
        activeQuizId: id,
        activeAssignmentId: null,
        expandedModules: nextExpandedModules,
        expandedLessons: nextExpandedLessons
      };
    });
    return id;
  },

  updateQuiz: (moduleId, lessonId, quizId, updates, options) => set((state) => {
    const updatedModules = state.course.modules.map(m => {
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
    });
    const updatedCourse = {
      ...state.course,
      modules: updatedModules,
    };
    if (options?.isLocalOnly) {
      return {
        course: updatedCourse
      };
    }
    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse)
    };
  }),

  deleteQuiz: (moduleId, lessonId, quizId) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };

    set((state) => {
      const module = state.course.modules.find(m => m.id === moduleId);
      const wasActive = state.activeQuizId === quizId;
      let newActiveQuizId = state.activeQuizId;
      
      let siblingQuizzes: Quiz[] = [];
      let deletedIndex = 0;

      if (!lessonId) {
        siblingQuizzes = module?.quizzes || [];
      } else {
        const lesson = module?.lessons.find(l => l.id === lessonId);
        siblingQuizzes = lesson?.quizzes || [];
      }

      const filteredQuizzes = siblingQuizzes.filter(q => q.id !== quizId);

      if (wasActive) {
        if (filteredQuizzes.length > 0) {
          deletedIndex = siblingQuizzes.findIndex(q => q.id === quizId);
          newActiveQuizId = filteredQuizzes[Math.max(0, deletedIndex - 1)].id;
        } else {
          newActiveQuizId = null;
        }
      }

      return {
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
        activeQuizId: newActiveQuizId,
        activeLessonId: (wasActive && newActiveQuizId === null) ? (lessonId || null) : state.activeLessonId,
        activeModuleId: (wasActive && newActiveQuizId === null) ? moduleId : state.activeModuleId,
      };
    });
  },

  setActiveQuiz: (id) => set((state) => {
    let parentLessonId: string | null = null;
    let parentModuleId: string | null = null;
    
    if (id) {
      for (const m of state.course.modules) {
        if (m.quizzes?.some(q => q.id === id)) {
          parentModuleId = m.id;
          break;
        }
        for (const l of m.lessons) {
          if (l.quizzes?.some(q => q.id === id)) {
            parentLessonId = l.id;
            parentModuleId = m.id;
            break;
          }
        }
        if (parentModuleId) break;
      }
    }

    const nextExpandedModules = { ...state.expandedModules };
    const nextExpandedLessons = { ...state.expandedLessons };
    if (parentModuleId) nextExpandedModules[parentModuleId] = true;
    if (parentLessonId) nextExpandedLessons[parentLessonId] = true;

    return {
      activeQuizId: id,
      activeTopicId: null,
      activeAssignmentId: null,
      expandedModules: nextExpandedModules,
      expandedLessons: nextExpandedLessons,
      activeModuleId: parentModuleId || state.activeModuleId,
      activeLessonId: parentLessonId
    };
  }),

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
    set((state) => {
      const nextExpandedModules = { ...state.expandedModules, [moduleId]: true };
      const nextExpandedLessons = { ...state.expandedLessons };
      if (lessonId) {
        nextExpandedLessons[lessonId] = true;
      }
      return {
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
        activeLessonId: lessonId || null,
        activeTopicId: null,
        activeQuizId: null,
        activeAssignmentId: id,
        expandedModules: nextExpandedModules,
        expandedLessons: nextExpandedLessons
      };
    });
    return id;
  },

  updateAssignment: (moduleId, lessonId, assignmentId, updates, options) => set((state) => {
    const updatedModules = state.course.modules.map(m => {
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
    });
    const updatedCourse = {
      ...state.course,
      modules: updatedModules,
    };
    if (options?.isLocalOnly) {
      return {
        course: updatedCourse
      };
    }
    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse)
    };
  }),

  deleteAssignment: (moduleId, lessonId, assignmentId) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };

    set((state) => {
      const module = state.course.modules.find(m => m.id === moduleId);
      const wasActive = state.activeAssignmentId === assignmentId;
      let newActiveAssignmentId = state.activeAssignmentId;
      
      let siblingAssignments: Assignment[] = [];
      let deletedIndex = 0;

      if (!lessonId) {
        siblingAssignments = module?.assignments || [];
      } else {
        const lesson = module?.lessons.find(l => l.id === lessonId);
        siblingAssignments = lesson?.assignments || [];
      }

      const filteredAssignments = siblingAssignments.filter(a => a.id !== assignmentId);

      if (wasActive) {
        if (filteredAssignments.length > 0) {
          deletedIndex = siblingAssignments.findIndex(a => a.id === assignmentId);
          newActiveAssignmentId = filteredAssignments[Math.max(0, deletedIndex - 1)].id;
        } else {
          newActiveAssignmentId = null;
        }
      }

      return {
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
        activeAssignmentId: newActiveAssignmentId,
        activeLessonId: (wasActive && newActiveAssignmentId === null) ? (lessonId || null) : state.activeLessonId,
        activeModuleId: (wasActive && newActiveAssignmentId === null) ? moduleId : state.activeModuleId,
      };
    });
  },

  setActiveAssignment: (id) => set((state) => {
    let parentLessonId: string | null = null;
    let parentModuleId: string | null = null;
    
    if (id) {
      for (const m of state.course.modules) {
        if (m.assignments?.some(a => a.id === id)) {
          parentModuleId = m.id;
          break;
        }
        for (const l of m.lessons) {
          if (l.assignments?.some(a => a.id === id)) {
            parentLessonId = l.id;
            parentModuleId = m.id;
            break;
          }
        }
        if (parentModuleId) break;
      }
    }

    const nextExpandedModules = { ...state.expandedModules };
    const nextExpandedLessons = { ...state.expandedLessons };
    if (parentModuleId) nextExpandedModules[parentModuleId] = true;
    if (parentLessonId) nextExpandedLessons[parentLessonId] = true;

    return {
      activeAssignmentId: id,
      activeTopicId: null,
      activeQuizId: null,
      expandedModules: nextExpandedModules,
      expandedLessons: nextExpandedLessons,
      activeModuleId: parentModuleId || state.activeModuleId,
      activeLessonId: parentLessonId
    };
  }),

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

  deleteCourseQuiz: (quizId) => set((state) => {
    const remaining = (state.course.quizzes || []).filter(q => q.id !== quizId);
    const wasActive = state.activeQuizId === quizId;
    let newActiveQuizId = state.activeQuizId;
    if (wasActive) {
      if (remaining.length > 0) {
        const idx = (state.course.quizzes || []).findIndex(q => q.id === quizId);
        newActiveQuizId = remaining[Math.max(0, idx - 1)].id;
      } else {
        newActiveQuizId = null;
      }
    }
    return {
      course: {
        ...state.course,
        quizzes: remaining
      },
      activeQuizId: newActiveQuizId
    };
  }),

  addCourseAssignment: () => {
    const id = 'temp-' + crypto.randomUUID();
    set((state) => ({
      course: {
        ...state.course,
        assignments: [{ id, title: '' }]
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
      assignments: [{ id: assignmentId, ...(updates as any) }]
    }
  })),

  deleteCourseAssignment: (assignmentId) => set((state) => {
    const remaining = (state.course.assignments || []).filter(a => a.id !== assignmentId);
    const wasActive = state.activeAssignmentId === assignmentId;
    let newActiveAssignmentId = state.activeAssignmentId;
    if (wasActive) {
      if (remaining.length > 0) {
        const idx = (state.course.assignments || []).findIndex(a => a.id === assignmentId);
        newActiveAssignmentId = remaining[Math.max(0, idx - 1)].id;
      } else {
        newActiveAssignmentId = null;
      }
    }
    return {
      course: {
        ...state.course,
        assignments: remaining
      },
      activeAssignmentId: newActiveAssignmentId
    };
  }),

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

  reorderModules: (startIndex, endIndex) => set((state) => {
    const modules = [...state.course.modules];
    if (startIndex === endIndex || startIndex < 0 || endIndex < 0 || startIndex >= modules.length || endIndex >= modules.length) {
      return state;
    }
    const [removed] = modules.splice(startIndex, 1);
    modules.splice(endIndex, 0, removed);
    return { course: { ...state.course, modules } };
  }),

  reorderModuleItems: (moduleId, startIndex, endIndex) => set((state) => {
    const ensureModuleOrder = (m: Module): Module => {
      if (m.order && m.order.length > 0) return m;
      const order: { id: string; type: 'lesson' | 'quiz' | 'assignment' }[] = [];
      (m.lessons || []).forEach(l => order.push({ id: l.id, type: 'lesson' }));
      (m.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (m.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...m, order };
    };
    return {
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id !== moduleId) return m;
          const updatedM = ensureModuleOrder(m);
          const order = [...(updatedM.order || [])];
          if (startIndex === endIndex || startIndex < 0 || endIndex < 0 || startIndex >= order.length || endIndex >= order.length) {
            return m;
          }
          const [removed] = order.splice(startIndex, 1);
          order.splice(endIndex, 0, removed);
          return { ...updatedM, order };
        })
      }
    };
  }),

  reorderLessonItems: (moduleId, lessonId, startIndex, endIndex) => set((state) => {
    const ensureLessonOrder = (l: Lesson): Lesson => {
      if (l.order && l.order.length > 0) return l;
      const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
      (l.topics || []).forEach(t => order.push({ id: t.id, type: 'topic' }));
      (l.quizzes || []).forEach(q => order.push({ id: q.id, type: 'quiz' }));
      (l.assignments || []).forEach(a => order.push({ id: a.id, type: 'assignment' }));
      return { ...l, order };
    };
    return {
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id !== lessonId) return l;
              const updatedL = ensureLessonOrder(l);
              const order = [...(updatedL.order || [])];
              if (startIndex === endIndex || startIndex < 0 || endIndex < 0 || startIndex >= order.length || endIndex >= order.length) {
                return l;
              }
              const [removed] = order.splice(startIndex, 1);
              order.splice(endIndex, 0, removed);
              return { ...updatedL, order };
            })
          };
        })
      }
    };
  }),
  }),
  {
    name: 'transetu-course-creation-store',
    storage: createJSONStorage(() => ({
      getItem: (name) => {
        try {
          return localStorage.getItem(name);
        } catch {
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          localStorage.setItem(name, value);
        } catch (e) {
          console.warn("Storage quota exceeded. State not persisted.", e);
        }
      },
      removeItem: (name) => {
        try {
          localStorage.removeItem(name);
        } catch {}
      },
    })),
    partialize: (state) => {
      // Persist in-progress create drafts only. Edit-mode course data is lazy-loaded from API.
      if (!state.course.id) {
        const { cleanCourse, ...rest } = state;
        return rest;
      }
      return {
        isSidebarCollapsed: state.isSidebarCollapsed,
        expandedModules: state.expandedModules,
        expandedLessons: state.expandedLessons,
      };
    },
  }
));
