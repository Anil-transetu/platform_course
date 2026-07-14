import React from "react";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, ChevronRight, FileText, Target, 
  HelpCircle, ClipboardList, Lock, CheckCircle2, Play, Award
} from "lucide-react";
import { 
  CourseSidebarResponse, SidebarModule, SidebarLesson, ActiveSidebarItem, SidebarItemType
} from "@/types/student-course";

interface CourseSidebarProps {
  courseData: CourseSidebarResponse;
  activeItem: ActiveSidebarItem | null;
  onSelectItem: (item: ActiveSidebarItem) => void;
  expandedModules: Record<string, boolean>;
  toggleModule: (id: string) => void;
  expandedLessons: Record<string, boolean>;
  toggleLesson: (id: string) => void;
}

export function CourseSidebar({
  courseData,
  activeItem,
  onSelectItem,
  expandedModules,
  toggleModule,
  expandedLessons,
  toggleLesson
}: CourseSidebarProps) {
  
  const renderItemButton = (
    type: SidebarItemType,
    id: string | number,
    data: any,
    name: string,
    IconComponent: React.ElementType,
    indentLevel: number
  ) => {
    const isActive = activeItem?.type === type && activeItem?.id === id;
    const isLocked = !!data.isLocked;
    
    return (
      <button
        key={id}
        onClick={() => !isLocked && onSelectItem({ type, id, data })}
        disabled={isLocked}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-left text-sm font-medium flex items-center gap-3 transition-colors",
          indentLevel === 1 && "ml-4 w-[calc(100%-16px)]",
          indentLevel === 2 && "ml-8 w-[calc(100%-32px)]",
          isActive 
            ? "bg-primary/10 text-primary font-semibold" 
            : isLocked
              ? "text-muted-foreground/70 cursor-not-allowed"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <div className="flex items-center justify-center shrink-0">
          {isLocked ? (
            <Lock size={14} />
          ) : data.progressPct === 100 ? (
            <CheckCircle2 size={14} className="text-green-500" />
          ) : (
            <IconComponent size={14} />
          )}
        </div>
        
        <span className="truncate flex-1">{name}</span>
        
        {!isLocked && data.progressPct !== undefined && data.progressPct < 100 && (
          <span className="text-[10px] font-semibold text-muted-foreground ml-2">
            {data.progressPct}%
          </span>
        )}
      </button>
    );
  };

  const renderLessons = (lessons: SidebarLesson[] = [], indentLevel: number) => {
    return lessons.map((lesson) => {
      const subItems = lesson.lessons || lesson.topics;
      if (subItems && subItems.length > 0) {
        const isLessExpanded = !!expandedLessons[String(lesson.id)];
        const isLessActive = activeItem?.type === "lesson" && activeItem?.id === lesson.id;
        
        return (
          <div key={lesson.id} className="mt-1">
            <div 
              onClick={() => {
                if (!lesson.isLocked) {
                  onSelectItem({ type: "lesson", id: lesson.id, data: lesson });
                  toggleLesson(String(lesson.id));
                }
              }}
              className={cn(
                "w-full px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between",
                indentLevel === 1 && "ml-2 w-[calc(100%-8px)]",
                lesson.isLocked ? "opacity-60 cursor-not-allowed text-muted-foreground" : "hover:bg-muted/50",
                isLessActive && !lesson.isLocked && "bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden w-full text-sm font-medium">
                {lesson.isLocked ? <Lock size={14} className="shrink-0" /> : <FileText size={14} className="shrink-0" />}
                <span className="truncate">{lesson.name}</span>
              </div>
              {!lesson.isLocked && (
                <div className="shrink-0 ml-2">
                  {isLessExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}
            </div>

            {isLessExpanded && !lesson.isLocked && (
              <div className="py-1 space-y-1">
                {renderLessons(subItems, indentLevel + 1)}
              </div>
            )}
          </div>
        );
      }

      return renderItemButton("topic", lesson.id, lesson, lesson.name, Play, indentLevel);
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-12 bg-background border-r">
      {/* Sidebar Header */}
      <div 
        onClick={() => onSelectItem({ type: "course", id: courseData.courseId, data: courseData })}
        className={cn(
          "p-6 cursor-pointer border-b transition-colors",
          activeItem?.type === "course" ? "bg-muted/50" : "hover:bg-muted/30"
        )}
      >
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-primary uppercase tracking-wider">
          <Target size={14} /> Dashboard
        </div>
        <h3 className="font-semibold text-foreground text-sm line-clamp-2">
          {courseData.courseName || "Untitled Course"}
        </h3>
      </div>

      <div className="p-3 space-y-3">
        {courseData.sidebar?.map((module: SidebarModule, mIdx: number) => {
          const isModExpanded = !!expandedModules[String(module.id)];
          const isModActive = activeItem?.type === "module" && activeItem?.id === module.id;
          const isLocked = !!module.isLocked;
          
          return (
            <div key={module.id} className="relative">
              {/* Module Header Card */}
              <div 
                onClick={() => {
                  if (!isLocked) {
                    onSelectItem({ type: "module", id: module.id, data: module });
                    toggleModule(String(module.id));
                  }
                }}
                className={cn(
                  "w-full p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between border",
                  isLocked 
                    ? "opacity-60 cursor-not-allowed bg-muted/30 border-transparent text-muted-foreground" 
                    : "hover:bg-muted/30 border-border",
                  !isLocked && isModActive 
                    ? "bg-primary/5 border-primary/20 text-foreground"
                    : "bg-card text-foreground"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden w-full">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                    isLocked ? "bg-muted" : "bg-primary/10 text-primary"
                  )}>
                    {isLocked ? <Lock size={14} /> : String(mIdx + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold truncate">
                      {module.name}
                    </span>
                    
                    {module.progressPct !== undefined && !isLocked && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full", 
                              module.progressPct === 100 ? "bg-green-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, module.progressPct))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{module.progressPct}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!isLocked && (
                  <div className="shrink-0 ml-2 text-muted-foreground">
                    {isModExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                )}
              </div>

              {/* Module Content */}
              {isModExpanded && !isLocked && (
                <div className="mt-2 mb-4 space-y-1">
                  {module.lessons && module.lessons.length > 0 && renderLessons(module.lessons, 1)}
                  
                  {/* Module Quiz */}
                  {module.quiz && renderItemButton("quiz", module.quiz.id, module.quiz, module.quiz.name || module.quiz.title || "Module Quiz", HelpCircle, 1)}
                  {module.quizzes?.map(q => renderItemButton("quiz", q.id, q, q.name || q.title || "Module Quiz", HelpCircle, 1))}
                  
                  {/* Module Assignment */}
                  {module.assignment && renderItemButton("assignment", module.assignment.id, module.assignment, module.assignment.name || module.assignment.title || "Module Assignment", ClipboardList, 1)}
                  {module.assignments?.map(a => renderItemButton("assignment", a.id, a, a.name || a.title || "Module Assignment", ClipboardList, 1))}

                  {(!module.lessons?.length && !module.quiz && !module.quizzes?.length && !module.assignment && !module.assignments?.length) && (
                    <div className="mx-4 p-3 rounded-lg border border-dashed text-center text-xs text-muted-foreground font-medium">
                      No content available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {(!courseData.sidebar || courseData.sidebar.length === 0) && (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm font-medium">Curriculum is empty.</p>
          </div>
        )}

        {/* Final Course Assignment */}
        {(courseData.finalAssignment || courseData.courseAssignment) && (
          <div className="mt-6 pt-4 border-t">
            {renderItemButton("assignment", (courseData.finalAssignment || courseData.courseAssignment).id, courseData.finalAssignment || courseData.courseAssignment, (courseData.finalAssignment || courseData.courseAssignment).name || (courseData.finalAssignment || courseData.courseAssignment).title || "Final Course Assignment", Award, 0)}
          </div>
        )}
      </div>
    </div>
  );
}
