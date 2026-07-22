import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mapModuleDetailToUpdates, mapLessonDetailToUpdates, mapTopicDetailToUpdates, mapCourseDetailsToStore } from '@/lib/utils';


export type ContentBlock = {
  id?: string | number;
  type: 'text' | 'image' | 'video' | 'pdf' | 'url';
  value: string;
  order_num: number;
};
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
  order_num?: number;
  quizzes?: Quiz[];
  assignments?: Assignment[];
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
  content_blocks?: ContentBlock[];
};

interface CourseState {
  course: Course;
  cleanCourse: Course | null;
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

  // Drag-and-drop reorder functions
  reorderModules: (startIndex: number, endIndex: number) => void;
  reorderModuleItems: (moduleId: string, startIndex: number, endIndex: number) => void;
  reorderLessonItems: (moduleId: string, lessonId: string, startIndex: number, endIndex: number) => void;

  deletedModules: string[];
  deletedLessons: string[];
  deletedTopics: string[];
  clearDeletedItems: () => void;

  hydrateModuleFromDetail: (moduleId: string, detail: Record<string, any>) => void;
  hydrateLessonFromDetail: (moduleId: string, lessonId: string, detail: Record<string, any>) => void;
  hydrateTopicFromDetail: (moduleId: string, lessonId: string, topicId: string, detail: Record<string, any>) => void;

  lastSavedCourseJson: string | null;
  setLastSavedCourseJson: (json: string | null) => void;
  pendingNavigation: {
    type: "module" | "lesson" | "topic" | "quiz" | "assignment" | "back" | "route" | "action";
    targetUrl?: string;
    action?: () => void | Promise<void>;
    activeModuleId?: string | null;
    activeLessonId?: string | null;
    activeTopicId?: string | null;
    activeQuizId?: string | null;
    activeAssignmentId?: string | null;
  } | null;
  setPendingNavigation: (nav: {
    type: "module" | "lesson" | "topic" | "quiz" | "assignment" | "back" | "route" | "action";
    targetUrl?: string;
    action?: () => void | Promise<void>;
    activeModuleId?: string | null;
    activeLessonId?: string | null;
    activeTopicId?: string | null;
    activeQuizId?: string | null;
    activeAssignmentId?: string | null;
  } | null) => void;
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
  isSidebarCollapsed: false,
  expandedModules: {},
  expandedLessons: {},
  deletedModules: [],
  deletedLessons: [],
  deletedTopics: [],
  lastSavedCourseJson: null,
  setLastSavedCourseJson: (json) => set({ lastSavedCourseJson: json }),
  pendingNavigation: null,
  setPendingNavigation: (nav) => set({ pendingNavigation: nav }),

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  setModuleExpanded: (moduleId, expanded) => set((state) => ({
    expandedModules: { ...state.expandedModules, [moduleId]: expanded }
  })),

  setLessonExpanded: (lessonId, expanded) => set((state) => ({
    expandedLessons: { ...state.expandedLessons, [lessonId]: expanded }
  })),

  toggleModuleExpand: (moduleId) => set((state) => ({
    expandedModules: { ...state.expandedModules, [moduleId]: !state.expandedModules[moduleId] }
  })),

  toggleLessonExpand: (lessonId) => set((state) => ({
    expandedLessons: { ...state.expandedLessons, [lessonId]: !state.expandedLessons[lessonId] }
  })),

  setCourseDetails: (title, description, thumbnail_url, domain = '', tags = [], status) => set((state) => ({
    course: { 
      ...state.course, 
      title, 
      description, 
      thumbnail_url, 
      domain, 
      tags, 
      status: status !== undefined ? status : state.course.status 
    }
  })),

  setCourseMetadata: (details) => set((state) => {
    const metadata = mapCourseDetailsToStore(details);
    const final_assessment_id = metadata.final_assessment_id !== null ? metadata.final_assessment_id : (state.course.final_assessment_id ?? null);
    
    let final_assessment = metadata.final_assessment;
    if (!final_assessment && final_assessment_id) {
      if (state.course.final_assessment && String(state.course.final_assessment.id) === String(final_assessment_id)) {
        final_assessment = state.course.final_assessment;
      }
    } else if (!final_assessment_id) {
      final_assessment = null;
    }

    const updatedCourse = {
      ...state.course,
      ...metadata,
      title: metadata.title || state.course.title || "",
      description: metadata.description || state.course.description || "",
      thumbnail_url: metadata.thumbnail_url || state.course.thumbnail_url || "",
      domain: metadata.domain || state.course.domain || "",
      tags: (metadata.tags && metadata.tags.length > 0) ? metadata.tags : (state.course.tags || []),
      status: metadata.status || state.course.status || "draft",
      final_assessment,
      final_assessment_id,
      modules: state.course.modules || [],
    };
    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse),
    };
  }),

  setCourse: (course, options) => set((state) => {
    // Prevent background refetches from overwriting if the course ID is the same
    const isSameCourse = state.course && String(state.course.id) === String(course.id);
    const hasUnsavedEdits = isSameCourse && state.cleanCourse && JSON.stringify(state.course) !== JSON.stringify(state.cleanCourse);

    if (hasUnsavedEdits && !options?.force) {
      return {};
    }

    const incomingMetadata = mapCourseDetailsToStore(course);
    
    const final_assessment_id = incomingMetadata.final_assessment_id !== null ? incomingMetadata.final_assessment_id : (state.course.final_assessment_id ?? null);
    let final_assessment = incomingMetadata.final_assessment;
    if (!final_assessment && final_assessment_id) {
      if (state.course.final_assessment && String(state.course.final_assessment.id) === String(final_assessment_id)) {
        final_assessment = state.course.final_assessment;
      }
    } else if (!final_assessment_id) {
      final_assessment = null;
    }

    const mergedMetadata = {
      id: incomingMetadata.id ?? state.course.id,
      title: incomingMetadata.title || state.course.title || '',
      description: incomingMetadata.description || state.course.description || '',
      thumbnail_url: incomingMetadata.thumbnail_url || state.course.thumbnail_url || '',
      domain: incomingMetadata.domain || state.course.domain || '',
      tags: (incomingMetadata.tags && incomingMetadata.tags.length > 0) ? incomingMetadata.tags : (state.course.tags || []),
      status: course.status ? incomingMetadata.status : (state.course.status || 'draft'),
      final_assessment,
      final_assessment_id,
    };

    const mappedCourse = {
      ...mergedMetadata,
      content_blocks: course.content_blocks || [],
      modules: (course.modules || []).map((m: any) => {
        const mappedModule = {
          ...m,
          id: String(m.id),
          title: m.title || m.name || '',
          description: m.description || '',
          image_url: m.image_url || '',
          video_url: m.video_url || '',
          pdf_url: m.pdf_url || '',
          url: m.url || '',
          content_text: m.content_text || '',
          text: m.text || '',
          images: m.images || [],
          videos: m.videos || [],
          pdfs: m.pdfs || [],
          urls: m.urls || [],
          content_blocks: m.content_blocks || [],
          lessons: (m.lessons || []).map((l: any) => {
            const mappedLesson = {
              ...l,
              id: String(l.id),
              title: l.title || l.name || '',
              content: l.content || l.content_text || l.text || '',
              image_url: l.image_url || '',
              video_url: l.video_url || '',
              pdf_url: l.pdf_url || '',
              url: l.url || '',
              content_text: l.content_text || '',
              text: l.text || '',
              images: l.images || [],
              videos: l.videos || [],
              pdfs: l.pdfs || [],
              urls: l.urls || [],
              content_blocks: l.content_blocks || [],
              topics: (l.topics || []).map((t: any) => ({
                ...t,
                id: String(t.id),
                title: t.title || t.name || '',
                content: t.content || t.content_text || t.text || '',
                image_url: t.image_url || '',
                video_url: t.video_url || '',
                pdf_url: t.pdf_url || '',
                url: t.url || '',
                content_text: t.content_text || '',
                text: t.text || '',
                images: t.images || [],
                videos: t.videos || [],
                pdfs: t.pdfs || [],
                urls: t.urls || [],
                content_blocks: t.content_blocks || [],
              })),
              quizzes: (l.quizzes || []).map((q: any) => ({ ...q, id: String(q.id) })),
              assignments: (l.assignments || []).map((a: any) => ({ ...a, id: String(a.id) })),
            };
            if (l.order && l.order.length > 0) {
              return {
                ...mappedLesson,
                order: l.order.map((o: any) => ({ ...o, id: String(o.id) }))
              };
            }
            const order: { id: string; type: 'topic' | 'quiz' | 'assignment' }[] = [];
            (mappedLesson.topics || []).forEach((t: any) => order.push({ id: String(t.id), type: 'topic' }));
            (mappedLesson.quizzes || []).forEach((q: any) => order.push({ id: String(q.id), type: 'quiz' }));
            (mappedLesson.assignments || []).forEach((a: any) => order.push({ id: String(a.id), type: 'assignment' }));
            return { ...mappedLesson, order };
          }),
          quizzes: (m.quizzes || []).map((q: any) => ({ ...q, id: String(q.id) })),
          assignments: (m.assignments || []).map((a: any) => ({ ...a, id: String(a.id) })),
        };
        if (m.order && m.order.length > 0) {
          mappedModule.order = m.order.map((o: any) => ({ ...o, id: String(o.id) }));
        }
        return mappedModule;
      }),
      quizzes: (course.quizzes || []).map((q: any) => ({ ...q, id: String(q.id) })),
      assignments: (course.assignments || []).map((a: any) => ({ ...a, id: String(a.id) })),
    };

    const updateObject: any = {
      course: mappedCourse,
      cleanCourse: JSON.parse(JSON.stringify(mappedCourse)),
      lastSavedCourseJson: JSON.stringify(mappedCourse),
    };

    let nextActiveModuleId = state.activeModuleId ? String(state.activeModuleId) : null;
    let nextActiveLessonId = state.activeLessonId ? String(state.activeLessonId) : null;
    let nextActiveTopicId = state.activeTopicId ? String(state.activeTopicId) : null;
    let nextActiveQuizId = state.activeQuizId ? String(state.activeQuizId) : null;
    let nextActiveAssignmentId = state.activeAssignmentId ? String(state.activeAssignmentId) : null;

    const nextExpandedModules: Record<string, boolean> = {};
    const nextExpandedLessons: Record<string, boolean> = {};

    Object.entries(state.expandedModules).forEach(([k, v]) => {
      nextExpandedModules[String(k)] = v;
    });
    Object.entries(state.expandedLessons).forEach(([k, v]) => {
      nextExpandedLessons[String(k)] = v;
    });

    if (isSameCourse && state.course && state.course.modules) {
      state.course.modules.forEach((oldMod, mIdx) => {
        const newMod = mappedCourse.modules[mIdx];
        if (newMod) {
          if (String(state.activeModuleId) === String(oldMod.id)) {
            nextActiveModuleId = String(newMod.id);
          }
          if (state.expandedModules[oldMod.id]) {
            nextExpandedModules[String(newMod.id)] = true;
            if (String(oldMod.id) !== String(newMod.id)) {
              delete nextExpandedModules[String(oldMod.id)];
            }
          }

          if (oldMod.lessons && newMod.lessons) {
            oldMod.lessons.forEach((oldLes, lIdx) => {
              const newLes = newMod.lessons[lIdx];
              if (newLes) {
                if (String(state.activeLessonId) === String(oldLes.id)) {
                  nextActiveLessonId = String(newLes.id);
                }
                if (state.expandedLessons[oldLes.id]) {
                  nextExpandedLessons[String(newLes.id)] = true;
                  if (String(oldLes.id) !== String(newLes.id)) {
                    delete nextExpandedLessons[String(oldLes.id)];
                  }
                }

                if (oldLes.topics && newLes.topics) {
                  oldLes.topics.forEach((oldTop, tIdx) => {
                    const newTop = newLes.topics[tIdx];
                    if (newTop && String(state.activeTopicId) === String(oldTop.id)) {
                      nextActiveTopicId = String(newTop.id);
                    }
                  });
                }
              }
            });
          }
        }
      });
    }

    if (!isSameCourse) {
      const firstModule = mappedCourse.modules[0];
      const firstLesson = firstModule?.lessons?.[0];
      const firstTopic = firstLesson?.topics?.[0];

      const firstModuleId = firstModule?.id ? String(firstModule.id) : null;
      const firstLessonId = firstLesson?.id ? String(firstLesson.id) : null;
      const firstTopicId = firstTopic?.id ? String(firstTopic.id) : null;

      updateObject.activeModuleId = firstModuleId;
      updateObject.activeLessonId = firstTopicId ? firstLessonId : (firstLessonId ?? null);
      updateObject.activeTopicId = firstTopicId;
      updateObject.activeQuizId = null;
      updateObject.activeAssignmentId = null;
      updateObject.deletedModules = [];
      updateObject.deletedLessons = [];
      updateObject.deletedTopics = [];

      if (firstModuleId) {
        nextExpandedModules[firstModuleId] = true;
      }
      if (firstLessonId) {
        nextExpandedLessons[firstLessonId] = true;
      }
    } else {
      // Validate that resolved active IDs actually exist in mapped course
      const isCourseLevelQuizActive = nextActiveQuizId && mappedCourse.quizzes?.some((q: any) => String(q.id) === String(nextActiveQuizId));
      const isCourseLevelFinalAssessmentActive = nextActiveAssignmentId && (
        !nextActiveModuleId ||
        (mappedCourse.final_assessment_id && String(mappedCourse.final_assessment_id) === String(nextActiveAssignmentId)) ||
        (mappedCourse.final_assessment && String(mappedCourse.final_assessment.id) === String(nextActiveAssignmentId)) ||
        (mappedCourse.assignments?.some((a: any) => String(a.id) === String(nextActiveAssignmentId)))
      );

      if (!nextActiveModuleId && (isCourseLevelQuizActive || isCourseLevelFinalAssessmentActive)) {
        updateObject.activeModuleId = null;
        updateObject.activeLessonId = null;
        updateObject.activeTopicId = null;
        updateObject.activeQuizId = isCourseLevelQuizActive ? nextActiveQuizId : null;
        updateObject.activeAssignmentId = isCourseLevelFinalAssessmentActive ? nextActiveAssignmentId : null;
        if (isCourseLevelFinalAssessmentActive && nextActiveAssignmentId && !mappedCourse.final_assessment_id) {
          mappedCourse.final_assessment_id = nextActiveAssignmentId;
        }
      } else {
        const activeModule = mappedCourse.modules.find((m: any) => String(m.id) === String(nextActiveModuleId));
        if (!activeModule) {
          nextActiveModuleId = mappedCourse.modules[0]?.id ? String(mappedCourse.modules[0].id) : null;
          nextActiveLessonId = mappedCourse.modules[0]?.lessons[0]?.id ? String(mappedCourse.modules[0].lessons[0].id) : null;
          nextActiveTopicId = null;
          nextActiveQuizId = null;
          nextActiveAssignmentId = null;
        } else {
          const activeLesson = activeModule.lessons.find((l: any) => String(l.id) === String(nextActiveLessonId));
          if (!activeLesson && nextActiveLessonId !== null) {
            nextActiveLessonId = activeModule.lessons[0]?.id ? String(activeModule.lessons[0].id) : null;
            nextActiveTopicId = null;
          } else if (activeLesson) {
            const activeTopic = activeLesson.topics.find((t: any) => String(t.id) === String(nextActiveTopicId));
            if (!activeTopic && nextActiveTopicId !== null) {
              nextActiveTopicId = null;
            }
          }
        }

        updateObject.activeModuleId = nextActiveModuleId;
        updateObject.activeLessonId = nextActiveLessonId;
        updateObject.activeTopicId = nextActiveTopicId;
        updateObject.activeQuizId = nextActiveQuizId;
        updateObject.activeAssignmentId = nextActiveAssignmentId;
      }
    }

    updateObject.expandedModules = nextExpandedModules;
    updateObject.expandedLessons = nextExpandedLessons;

    return updateObject;
  }),

  resetCourse: () => {
    const emptyCourse = {
      title: '',
      domain: '',
      tags: [],
      tags: [],
      thumbnail_url: '',
      description: '',
      status: '',
      status: '',
      modules: [],
    };
    set({
      course: emptyCourse,
      cleanCourse: JSON.parse(JSON.stringify(emptyCourse)),
      lastSavedCourseJson: JSON.stringify(emptyCourse),
      activeModuleId: null,
      activeLessonId: null,
      activeTopicId: null,
      activeQuizId: null,
      activeAssignmentId: null,
      expandedModules: {},
      expandedLessons: {},
      deletedModules: [],
      deletedLessons: [],
      deletedTopics: [],
    });
  },

  clearDeletedItems: () => set((state) => ({ 
    deletedModules: [], 
    deletedLessons: [], 
    deletedTopics: [],
    cleanCourse: JSON.parse(JSON.stringify(state.course)),
    lastSavedCourseJson: JSON.stringify(state.course)
  })),

  hydrateModuleFromDetail: (moduleId, detail) => set((state) => {
    const updatedModules = state.course.modules.map(m =>
      String(m.id) === String(moduleId) ? { ...m, ...mapModuleDetailToUpdates(detail) } : m
    );
    const updatedCourse = {
      ...state.course,
      modules: updatedModules,
    };
    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse),
    };
  }),

  hydrateLessonFromDetail: (moduleId, lessonId, detail) => set((state) => {
    const updatedModules = state.course.modules.map(m => {
      if (String(m.id) !== String(moduleId)) return m;
      return {
        ...m,
        lessons: m.lessons.map(l =>
          String(l.id) === String(lessonId) ? { ...l, ...mapLessonDetailToUpdates(detail) } : l
        ),
      };
    });
    const updatedCourse = {
      ...state.course,
      modules: updatedModules,
    };
    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse),
    };
  }),

  hydrateTopicFromDetail: (moduleId, lessonId, topicId, detail) => set((state) => {
    const updatedModules = state.course.modules.map(m => {
      if (String(m.id) !== String(moduleId)) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (String(l.id) !== String(lessonId)) return l;
          return {
            ...l,
            topics: l.topics.map(t =>
              String(t.id) === String(topicId) ? { ...t, ...mapTopicDetailToUpdates(detail) } : t
            ),
          };
        }),
      };
    });
    const updatedCourse = {
      ...state.course,
      modules: updatedModules,
    };
    return {
      course: updatedCourse,
      cleanCourse: JSON.parse(JSON.stringify(updatedCourse)),
      lastSavedCourseJson: JSON.stringify(updatedCourse),
    };
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
      expandedModules: { ...state.expandedModules, [id]: true }
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

  deleteLesson: (moduleId, lessonId) => set((state) => {
    const targetModule = state.course.modules.find(m => String(m.id) === String(moduleId));
    const remainingLessons = targetModule ? targetModule.lessons.filter(l => String(l.id) !== String(lessonId)) : [];
    const wasActive = String(state.activeLessonId) === String(lessonId);
    let newActiveLessonId = state.activeLessonId;
    
    if (wasActive) {
      if (remainingLessons.length > 0) {
        const deletedIndex = targetModule ? targetModule.lessons.findIndex(l => String(l.id) === String(lessonId)) : 0;
        newActiveLessonId = remainingLessons[Math.max(0, deletedIndex - 1)].id;
      } else {
        newActiveLessonId = null;
      }
    }

    const nextExpandedLessons = { ...state.expandedLessons };
    delete nextExpandedLessons[lessonId];

    return {
      course: {
        ...state.course,
        modules: state.course.modules.map(m => {
          if (String(m.id) === String(moduleId)) {
            return {
              ...m,
              lessons: remainingLessons,
              order: m.order ? m.order.filter(o => String(o.id) !== String(lessonId)) : undefined
            };
          }
          return m;
        }),
      },
      deletedLessons: String(lessonId).startsWith('temp-') ? state.deletedLessons : [...state.deletedLessons, String(lessonId)],
      activeLessonId: newActiveLessonId,
      activeModuleId: (wasActive && newActiveLessonId === null) ? moduleId : state.activeModuleId,
      activeTopicId: wasActive ? null : state.activeTopicId,
      activeQuizId: wasActive ? null : state.activeQuizId,
      activeAssignmentId: wasActive ? null : state.activeAssignmentId,
      expandedLessons: nextExpandedLessons
    };
  }),

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
    set((state) => {
      const module = state.course.modules.find(m => m.id === moduleId);
      const lesson = module?.lessons.find(l => l.id === lessonId);
      const remainingTopics = lesson ? lesson.topics.filter(t => t.id !== topicId) : [];
      const wasActive = state.activeTopicId === topicId;
      let newActiveTopicId = state.activeTopicId;

      if (wasActive) {
        if (remainingTopics.length > 0) {
          const deletedIndex = lesson ? lesson.topics.findIndex(t => t.id === topicId) : 0;
          newActiveTopicId = remainingTopics[Math.max(0, deletedIndex - 1)].id;
        } else {
          newActiveTopicId = null;
        }
      }

      return {
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
                      topics: remainingTopics,
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
        activeTopicId: newActiveTopicId,
        activeLessonId: (wasActive && newActiveTopicId === null) ? lessonId : state.activeLessonId,
        activeModuleId: (wasActive && newActiveTopicId === null) ? moduleId : state.activeModuleId,
      };
    });
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
