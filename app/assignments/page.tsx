"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, Button, Chip, Avatar, Progress } from "@heroui/react";
import { 
  ArrowUpRight, 
  BookOpen, 
  Check, 
  Clock,
  Plus,
  TriangleExclamation,
  Calendar
} from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/time";
import { motion } from "framer-motion";

export default function InstructorDashboard() {
  const store = useGradingStore();
  const assignments = store.getAssignmentList();
  const courses = store.courses;

  // Stats for the "TODAY" sidebar section
  const needReviewCount = assignments.filter(a => a.status === 'grading').reduce((sum, a) => sum + (a.totalSubmissions - Math.round(a.totalSubmissions * (a.evaluationProgress / 100))), 0);
  const readyToShareCount = assignments.filter(a => a.status === 'grading' && a.evaluationProgress >= 90).length;
  const activeNowCount = assignments.filter(a => a.status === 'grading').length;
  const totalStudents = Object.values(store.sections).reduce((sum, s) => sum + s.studentCount, 0);

  // Active assignments for the main section
  const activeAssignments = assignments.filter(a => a.status === 'grading' || a.status === 'evaluating').slice(0, 3);
  const completedAssignments = assignments.filter(a => a.status === 'completed').slice(0, 1);

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] font-sans selection:bg-accent/30 selection:text-accent">
      {/* Top Navigation */}
      <header className="h-16 border-b border-white/5 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-[100] bg-[#121212]/80">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-white">EducAItors</span>
          <span className="text-muted/60 text-xs mt-1 border-l border-white/10 pl-2 ml-2 uppercase tracking-widest font-bold">Instructor</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-muted/60 font-semibold tracking-wide">Good morning, Dr. Lakshmi</span>
          </div>
          <Avatar 
            size="sm" 
            className="bg-gradient-to-br from-indigo-500 to-accent text-white font-black text-[10px] ring-2 ring-white/5 ring-offset-2 ring-offset-[#121212] cursor-pointer"
          >
            <Avatar.Fallback>RL</Avatar.Fallback>
          </Avatar>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8 mt-4">
        
        {/* Main Content (Left) */}
        <div className="space-y-10">
          
          {/* Start New Assignment Card */}
          <Link href="/assignments/new" className="block outline-none">
            <div className="bg-[#1e1e1e] border border-dashed border-white/10 rounded-2xl p-6 flex items-center gap-6 hover:border-accent/40 transition-all cursor-pointer group shadow-2xl shadow-black/40">
              <div className="size-12 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Plus className="size-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white group-hover:text-accent transition-colors">Start a new assignment</h2>
                <p className="text-sm text-muted/60 mt-0.5 leading-relaxed">Add details and marking criteria — system checks student answers</p>
              </div>
            </div>
          </Link>

          {/* Active Assignments Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-muted/50 leading-none">Active Assignments</h2>
              <Link href="/assignments/list" className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-wider">
                See all assignments <ArrowUpRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {activeAssignments.map((assignment) => {
                const course = courses[assignment.courseId];
                const doneCount = Math.round(assignment.totalSubmissions * (assignment.evaluationProgress / 100));
                const needReview = 7; // Mocked from image: "7 need your review"
                const handwritingUnclear = 2; // Mocked from image: "2 handwriting unclear"
                
                return (
                  <Card key={assignment.id} className="bg-[#1e1e1e] border-white/5 rounded-2xl p-0 hover:border-white/10 transition-all shadow-xl shadow-black/20">
                    <Card.Content className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">{assignment.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-muted/60">{course?.code}</span>
                            <span className="size-1 bg-white/10 rounded-full" />
                            <span className="text-[11px] font-bold text-muted/60">{assignment.totalSubmissions} students</span>
                            <span className="size-1 bg-white/10 rounded-full" />
                            <span className="text-[11px] font-bold text-muted/60">Due {formatRelativeTime(assignment.dueDate)}</span>
                          </div>
                        </div>
                        <Chip className="bg-accent/10 text-accent font-black text-[9px] uppercase tracking-widest px-2 py-0 h-5 border-none">
                          {assignment.status === 'grading' ? 'Check needed' : 'Checking now'}
                        </Chip>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <Chip className="bg-danger/20 text-danger font-bold text-[10px] px-3 h-6 border-none">
                          {needReview} need your review
                        </Chip>
                        <Chip className="bg-warning/20 text-warning font-bold text-[10px] px-3 h-6 border-none">
                          {handwritingUnclear} handwriting unclear
                        </Chip>
                        <Chip className="bg-white/5 text-muted/60 font-bold text-[10px] px-3 h-6 border-none">
                          {doneCount} marks done
                        </Chip>
                      </div>

                      <div className="space-y-3">
                        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full shadow-lg shadow-accent/20"
                            style={{ width: `${assignment.evaluationProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <Link href={`/grading/${assignment.id}`} className="text-xs font-bold text-accent flex items-center gap-2 hover:underline">
                            Continue reviewing <ArrowUpRight className="size-3" />
                          </Link>
                          <span className="text-xs font-black text-muted/30 uppercase tracking-widest">{doneCount} / {assignment.totalSubmissions}</span>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                );
              })}

              {/* Completed/Ready Section Example */}
              {completedAssignments.map((assignment) => (
                <Card key={assignment.id} className="bg-[#1e1e1e] border-white/5 rounded-2xl p-0 hover:border-white/10 transition-all opacity-90 shadow-lg">
                  <Card.Content className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{assignment.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-muted/60 tracking-wider font-mono">{courses[assignment.courseId]?.code}</span>
                          <span className="text-[11px] font-bold text-muted/60 italic">Checked {formatRelativeTime(assignment.createdAt)}</span>
                        </div>
                      </div>
                      <Chip className="bg-success/20 text-success font-black text-[9px] uppercase tracking-widest px-2 py-0 h-5 border-none">
                        Marks ready
                      </Chip>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <Chip className="bg-success/20 text-success font-bold text-[10px] px-3 h-6 border-none">
                        All {assignment.totalSubmissions} done
                      </Chip>
                      <Chip className="bg-white/5 text-muted/60 font-bold text-[10px] px-3 h-6 border-none italic">
                        3 marks changed by you
                      </Chip>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <Button variant="ghost" className="text-xs font-bold text-accent hover:bg-accent/10 px-0 h-auto">
                        Share marks with students →
                      </Button>
                      <span className="text-[10px] font-bold text-muted/30 uppercase tracking-widest">Not shared yet</span>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>

            <Button variant="ghost" className="w-full bg-[#1a1a1a] border-white/5 py-8 rounded-2xl text-xs font-bold text-muted hover:bg-white/[0.03] uppercase tracking-[0.15em]">
              View all assignments — past, drafts, and previous semesters
            </Button>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <aside className="space-y-10">
          
          {/* TODAY Section */}
          <section className="space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-muted/50 leading-none">Today</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 px-2">
              <div className="space-y-1">
                <p className="text-3xl font-black text-white leading-none">7</p>
                <p className="text-[11px] font-bold text-muted/60 leading-tight">Need your review</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white leading-none">41</p>
                <p className="text-[11px] font-bold text-muted/60 leading-tight">Ready to share</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white leading-none">3</p>
                <p className="text-[11px] font-bold text-muted/60 leading-tight">Active now</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white leading-none">79</p>
                <p className="text-[11px] font-bold text-muted/60 leading-tight">Students</p>
              </div>
            </div>
          </section>

          {/* UPDATES Section */}
          <section className="space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-muted/50 leading-none">Updates</h2>
            <div className="space-y-3">
              {[
                { title: "Rahul's answer — handwriting unclear", sub: "Check and mark manually", info: "Unit 3 · 30 min ago", color: "bg-danger" },
                { title: "3 students haven't submitted", sub: "OS Mid-sem · Deadline today 5 PM", info: "CS204 · Just now", color: "bg-warning" },
                { title: "Unit 2 marks finalised", sub: "Ready to share with students", info: "Linked Lists · 29 Mar", color: "bg-success" },
                { title: "Priya resubmitted her answer", sub: "Unit 3 · After correction", info: "CS301 · 1 hour ago", color: "bg-warning" },
              ].map((update, i) => (
                <div key={i} className="bg-[#1e1e1e] border border-white/[0.02] rounded-2xl p-5 hover:bg-[#252525] transition-colors cursor-pointer group shadow-lg">
                  <div className="flex gap-3">
                    <span className={`size-2 rounded-full mt-1.5 shrink-0 shadow-sm ${update.color}`} />
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-[13px] font-bold text-white group-hover:text-accent transition-colors truncate">{update.title}</p>
                      <p className="text-[12px] font-medium text-muted/60 leading-snug">{update.sub}</p>
                      <p className="text-[10px] font-bold text-muted/30 uppercase tracking-widest pt-1">{update.info}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

      </main>
    </div>
  );
}
