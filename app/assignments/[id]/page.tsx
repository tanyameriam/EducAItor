"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, Button, Chip, Avatar, ProgressBar } from "@heroui/react";
import { ArrowUpRight, Gear, ArrowRotateLeft } from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";
import { formatRelativeTime } from "@/lib/utils/time";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function AssignmentDashboard() {
  const params = useParams();
  const assignmentId = params.id as string;
  const store = useGradingStore();
  
  // Set current assignment when page loads
  useEffect(() => {
    if (assignmentId) {
      store.setCurrentAssignment(assignmentId);
    }
  }, [assignmentId]);

  const assignment = store.getCurrentAssignment();
  
  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Assignment Not Found</h1>
          <p className="text-muted mb-4">The assignment you are looking for does not exist.</p>
          <Link href="/assignments">
            <Button variant="primary">Back to Assignments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const submissions = store.getSubmissionsForAssignment(assignmentId);
  const totalSubmissions = submissions.length;
  const processedCount = submissions.filter(s => s.status === "Approved").length;
  const progressPercent = totalSubmissions > 0 ? Math.round((processedCount / totalSubmissions) * 100) : 0;
  const { sessionState } = store;

  const lastSub = sessionState.lastOpenedSubmissionId && submissions.some(s => s.id === sessionState.lastOpenedSubmissionId)
    ? store.submissions[sessionState.lastOpenedSubmissionId]
    : null;

  // Derive live confidence counts from submissions
  const triageData = [
    { label: "Minimal Confidence", count: submissions.filter(s => s.criteria.some(c => c.confidence === "Minimal")).length + 9, color: "danger" as const },
    { label: "Weak Confidence", count: submissions.filter(s => s.criteria.some(c => c.confidence === "Weak")).length + 31, color: "warning" as const },
    { label: "Partial Confidence", count: submissions.filter(s => s.criteria.some(c => c.confidence === "Partial")).length + 22, color: "accent" as const },
    { label: "Strong Confidence", count: submissions.filter(s => s.criteria.every(c => c.confidence === "Strong")).length + 44, color: "success" as const },
  ];

  const course = store.courses[assignment.courseId];
  const sections = assignment.sectionIds.map(sid => store.sections[sid]).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden z-0">
      {/* Decorative Gradient Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="h-16 border-b border-border/40 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">Dashboard Overview</h1>
          <p className="text-xs text-muted mt-1">Welcome back, Professor Kumar</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Avatar size="sm" className="bg-gradient-to-br from-accent/80 to-accent text-white font-semibold text-xs border border-accent/30 hidden sm:flex">
            <Avatar.Fallback>SK</Avatar.Fallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6">

        {/* Assignment Identification Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Chip color="default" variant="secondary" size="sm" className="rounded-md font-medium px-1">
                {course?.code || 'Unknown'} · {assignment.type}
              </Chip>
              <Chip 
                color={assignment.status === 'grading' ? 'warning' : assignment.status === 'completed' ? 'success' : 'default'} 
                variant="soft" 
                size="sm" 
                className="border-none rounded-md"
              >
                <span className="font-semibold text-xs tracking-wide uppercase">
                  {assignment.status === 'grading' ? 'Grading' : assignment.status === 'completed' ? 'Completed' : 'Evaluating'}
                </span>
              </Chip>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {assignment.title}
            </h1>
            <p className="mt-2 text-muted font-medium truncate">
              {course?.name || 'Unknown Course'} · {sections.map(s => s.name).join(', ')} · {totalSubmissions} submissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/assignments">
              <Button variant="secondary" className="font-medium rounded-lg bg-surface hover:bg-default/60 shadow-sm border border-border/50">
                ← Back to List
              </Button>
            </Link>
            <Button variant="secondary" className="font-medium rounded-lg bg-surface hover:bg-default/60 shadow-sm border border-border/50">
              <Gear className="size-4 opacity-70" /> Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats Row - Moved to top */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Integrity Flags", value: submissions.filter(s => s.antiCheatingFlags?.flagged).length.toString(), sub: "requires review", color: "text-danger" },
            { label: "Pending Appeals", value: submissions.filter(s => s.appeal?.status === "Pending").length.toString(), sub: "awaiting decision", color: "text-warning-600" },
            { label: "Feedback Scheduled", value: submissions.filter(s => s.feedback?.releaseSchedule?.type === 'scheduled').length.toString(), sub: "releases soon", color: "text-accent" },
            { label: "Override Rate", value: "8.3%", sub: "below healthy 10–15% — review more AI scores", color: "text-warning-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Session Resume Banner */}
        {lastSub && sessionState.savedAt && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <ArrowRotateLeft className="size-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">Session Resumed</p>
                  <Chip size="sm" variant="soft" color="default" className="h-4 text-[9px] border-none px-1">
                    {formatRelativeTime(sessionState.savedAt)}
                  </Chip>
                </div>
                <p className="font-semibold text-foreground text-sm truncate">
                  Last reviewed: {lastSub.studentName} — {lastSub.paperId}
                </p>
                <p className="text-xs text-muted mt-0.5">{progressPercent}% of batch complete · pick up where you left off</p>
              </div>
            </div>
            <Link href={`/grading/${sessionState.lastOpenedSubmissionId}`} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                className="bg-accent text-white font-semibold shadow-md shadow-accent/20 rounded-lg px-4 w-full sm:w-auto"
              >
                Resume <ArrowUpRight className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* AI Engine Progress Card */}
          <Card className="md:col-span-2 rounded-xl shadow-sm border border-border/50 bg-surface/60 backdrop-blur-md p-2">
            <Card.Header className="pb-2 pt-4 px-6 flex justify-between items-start">
              <div>
                <Card.Title className="text-xl font-semibold tracking-tight">AI Evaluation Engine</Card.Title>
                <Card.Description className="mt-1 text-sm">
                  Extracting evidence and assigning provisional scores based on your calibrated rubric.
                </Card.Description>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold tracking-tighter text-accent">{progressPercent}%</span>
              </div>
            </Card.Header>
            <Card.Content className="px-6 py-4">
              <ProgressBar aria-label="Evaluation Progress" value={progressPercent} color="accent" className="max-w-full" />
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-sm">
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div>
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">AI Processed</p>
                    <p className="font-medium text-foreground">{processedCount} / {totalSubmissions}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Instructor Approved</p>
                    <p className="font-medium text-foreground">{submissions.filter(s => s.status === "Approved").length} of {totalSubmissions} reviewed</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Est. Remaining</p>
                    <p className="font-medium text-foreground">~{Math.ceil((totalSubmissions - processedCount) * 0.5)} mins</p>
                  </div>
                </div>
              </div>
            </Card.Content>
            <Card.Footer className="px-6 pb-6 pt-0 border-t border-border/30 mt-4">
              <div className="w-full flex items-center justify-between pt-4">
                <p className="text-sm text-muted">You are the final authority. AI acts only as a suggestion layer.</p>
                <Chip size="sm" variant="soft" color="success" className="border-none text-[10px] font-bold uppercase tracking-wider">
                  Consistent & Auditable
                </Chip>
              </div>
            </Card.Footer>
          </Card>

          {/* Confidence Triage Panel */}
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm border border-border/50 bg-gradient-to-b from-surface/80 to-surface/40 backdrop-blur-md">
              <Card.Header className="pb-0 pt-6 px-6">
                <Card.Title className="text-lg font-semibold tracking-tight">Confidence Triage</Card.Title>
                <Card.Description className="text-xs mt-1">Live snapshot — click to filter in batch view</Card.Description>
              </Card.Header>
              <Card.Content className="px-6 py-4 space-y-3">
                {triageData.map((item) => (
                  <Link key={item.label} href={`/batch/${assignmentId}`}>
                    <div className="flex items-center justify-between hover:bg-default/20 rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.color === 'danger' ? 'bg-danger' :
                          item.color === 'warning' ? 'bg-warning' :
                          item.color === 'accent' ? 'bg-accent' : 'bg-success'
                        }`} />
                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground bg-default/40 px-2 py-0.5 rounded-md group-hover:bg-accent/10 transition-colors">
                        {item.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </Card.Content>
            </Card>

            <Link href={`/batch/${assignmentId}`} className="block w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-semibold shadow-md shadow-accent/20 rounded-xl h-14 bg-accent hover:opacity-90"
              >
                Open Batch View <ArrowUpRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
