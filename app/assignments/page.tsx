"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, Button, Chip, Avatar } from "@heroui/react";
import { 
  ArrowUpRight, 
  BookOpen, 
  Calendar, 
  Check, 
  Clock,
  GraduationCap,
  TriangleExclamation
} from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/time";

export default function AssignmentsDashboard() {
  const store = useGradingStore();
  const assignments = store.getAssignmentList();
  const courses = store.courses;
  const sections = store.sections;

  // Calculate stats
  const activeAssignments = assignments.filter(a => a.status === 'grading');
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.totalSubmissions, 0);
  
  // Sort by urgency: grading first, then by progress (lower = more urgent)
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.status === 'grading' && b.status !== 'grading') return -1;
    if (b.status === 'grading' && a.status !== 'grading') return 1;
    return a.evaluationProgress - b.evaluationProgress;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'grading': return 'accent';
      case 'evaluating': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'grading': return 'In Progress';
      case 'evaluating': return 'Evaluating';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Essay': return 'Essay';
      case 'Report': return 'Report';
      case 'Proposal': return 'Proposal';
      case 'Documentation': return 'Docs';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden z-0">
      {/* Decorative Gradient Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="h-16 border-b border-border/40 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">My Assignments</h1>
          <p className="text-xs text-muted mt-1">Manage all your grading assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Avatar size="sm" className="bg-gradient-to-br from-accent/80 to-accent text-white font-semibold text-xs border border-accent/30 hidden sm:flex">
            <Avatar.Fallback>SK</Avatar.Fallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Assignments Dashboard
            </h1>
            <p className="mt-2 text-muted font-medium">
              {assignments.length} assignments across {Object.keys(courses).length} courses
            </p>
          </div>
          <Link href="/assignments/new">
            <Button 
              variant="primary" 
              className="font-medium rounded-lg bg-accent hover:opacity-90 shadow-md shadow-accent/20 w-full md:w-auto"
            >
              <BookOpen className="size-4 mr-2" /> Create New Assignment
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-surface border border-border/50 rounded-xl p-3 md:p-4 shadow-sm">
            <p className="text-[10px] md:text-xs font-semibold text-muted uppercase tracking-wider mb-1">In Progress</p>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-accent">{activeAssignments.length}</p>
            <p className="text-[10px] md:text-xs text-muted mt-1">active assignments</p>
          </div>
          <div className="bg-surface border border-border/50 rounded-xl p-3 md:p-4 shadow-sm">
            <p className="text-[10px] md:text-xs font-semibold text-muted uppercase tracking-wider mb-1">Completed</p>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-success">{completedAssignments.length}</p>
            <p className="text-[10px] md:text-xs text-muted mt-1">this semester</p>
          </div>
          <div className="bg-surface border border-border/50 rounded-xl p-3 md:p-4 shadow-sm">
            <p className="text-[10px] md:text-xs font-semibold text-muted uppercase tracking-wider mb-1">Total Papers</p>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{totalSubmissions}</p>
            <p className="text-[10px] md:text-xs text-muted mt-1">to evaluate</p>
          </div>
          <div className="bg-surface border border-border/50 rounded-xl p-3 md:p-4 shadow-sm">
            <p className="text-[10px] md:text-xs font-semibold text-muted uppercase tracking-wider mb-1">Pending Review</p>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-warning">12</p>
            <p className="text-[10px] md:text-xs text-muted mt-1">need attention</p>
          </div>
        </div>

        {/* Priority Section: Needs Attention */}
        {activeAssignments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TriangleExclamation className="size-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Needs Attention</h2>
              <span className="text-sm text-muted">({activeAssignments.length} active)</span>
            </div>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeAssignments.slice(0, 3).map((assignment) => {
                const course = courses[assignment.courseId];
                const progress = assignment.evaluationProgress;
                const isUrgent = progress < 50;
                
                return (
                  <Link 
                    key={assignment.id} 
                    href={`/assignments/${assignment.id}`}
                    className="group"
                  >
                    <Card className={`rounded-xl shadow-sm border p-0 hover:shadow-md transition-all cursor-pointer h-full ${isUrgent ? 'border-warning/50 bg-warning/5' : 'border-border/50 bg-surface/60'}`}>
                      <Card.Content className="p-5 space-y-4">
                        {/* Top Row: Type + Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-accent/10 text-accent">
                              {getTypeLabel(assignment.type)}
                            </span>
                            <span className="text-xs text-muted">{course?.code}</span>
                          </div>
                          {isUrgent && (
                            <span className="text-xs font-medium text-warning">Urgent</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground leading-tight group-hover:text-accent transition-colors">
                          {assignment.title}
                        </h3>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Progress</span>
                            <span className={`font-medium ${isUrgent ? 'text-warning' : 'text-foreground'}`}>
                              {progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-default rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${isUrgent ? 'bg-warning' : 'bg-accent'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer: Submissions + Due Date */}
                        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/30">
                          <span>{assignment.totalSubmissions} submissions</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Due {formatRelativeTime(assignment.dueDate)}
                          </span>
                        </div>
                      </Card.Content>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Assignments Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">All Assignments</h2>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAssignments.map((assignment) => {
              const course = courses[assignment.courseId];
              const progress = assignment.evaluationProgress;
              
              return (
                <Link 
                  key={assignment.id} 
                  href={`/assignments/${assignment.id}`}
                  className="group"
                >
                  <Card className="rounded-xl shadow-sm border border-border/50 bg-surface/60 p-0 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer h-full">
                    <Card.Content className="p-5 space-y-4">
                      {/* Top Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-default text-muted-foreground">
                            {getTypeLabel(assignment.type)}
                          </span>
                          <span className="text-xs text-muted">{course?.code}</span>
                        </div>
                        <Chip 
                          size="sm" 
                          variant="soft" 
                          color={getStatusColor(assignment.status)}
                          className="border-none text-[10px] h-5"
                        >
                          {getStatusLabel(assignment.status)}
                        </Chip>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground leading-tight group-hover:text-accent transition-colors">
                        {assignment.title}
                      </h3>

                      {/* Progress (only for non-completed) */}
                      {assignment.status !== 'completed' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Progress</span>
                            <span className="font-medium text-foreground">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-default rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/30">
                        <span>{assignment.totalSubmissions} submissions</span>
                        <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
