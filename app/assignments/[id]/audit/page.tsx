"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Chip } from "@heroui/react";
import { Shield, Clock, Person, FileText, CircleExclamation, Check } from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";


export default function AssignmentAudit() {
  const params = useParams();
  const assignmentId = params.id as string;
  const store = useGradingStore();

  useEffect(() => {
    if (assignmentId) {
      store.setCurrentAssignment(assignmentId);
    }
  }, [assignmentId]);

  const assignment = store.assignments[assignmentId];
  const submissions = store.getSubmissionsForAssignment(assignmentId);
  const auditLog = store.auditLog.filter(log => log.assignmentId === assignmentId);

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted">Assignment not found</p>
      </div>
    );
  }

  // Calculate stats for this assignment
  const totalGradingSessions = submissions.filter(s => s.status === "Approved").length;
  const overrideCount = submissions.filter(s => 
    s.criteria.some(c => c.isOverridden)
  ).length;
  const appealCount = submissions.filter(s => s.appeal?.status).length;
  const integrityFlagCount = submissions.filter(s => s.antiCheatingFlags.flagged).length;

  const getActionIcon = (action: string) => {
    if (action.includes("Completed")) return <Check className="size-4 text-success" />;
    if (action.includes("Override")) return <CircleExclamation className="size-4 text-warning" />;
    if (action.includes("Appeal")) return <FileText className="size-4 text-accent" />;
    return <Clock className="size-4 text-muted" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes("Completed")) return "success";
    if (action.includes("Override")) return "warning";
    if (action.includes("Appeal")) return "accent";
    return "default";
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Assignment Context Header */}
      <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Assignment Audit Trail</p>
            <h2 className="text-lg font-semibold text-foreground mt-1">{assignment.title}</h2>
            <p className="text-sm text-muted">{assignment.totalSubmissions} submissions • {auditLog.length} audit events</p>
          </div>
          <Chip variant="soft" color="default" className="border-none">
            <Shield className="size-3 mr-1 inline" />
            Immutable Record
          </Chip>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Graded</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{totalGradingSessions}</p>
          <p className="text-xs text-muted mt-1">submissions reviewed</p>
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Overrides</p>
          <p className="text-2xl font-bold tracking-tight text-warning">{overrideCount}</p>
          <p className="text-xs text-muted mt-1">AI scores adjusted</p>
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Appeals</p>
          <p className="text-2xl font-bold tracking-tight text-accent">{appealCount}</p>
          <p className="text-xs text-muted mt-1">filed by students</p>
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Flags</p>
          <p className="text-2xl font-bold tracking-tight text-danger">{integrityFlagCount}</p>
          <p className="text-xs text-muted mt-1">integrity concerns</p>
        </div>
      </div>

      {/* Audit Log */}
      <Card className="rounded-xl shadow-sm">
        <Card.Header>
          <Card.Title className="text-lg font-semibold flex items-center gap-2">
            <Clock className="size-5 text-accent" />
            Grading Activity Log
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {auditLog.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Clock className="size-12 mx-auto mb-4 opacity-30" />
              <p>No audit events recorded for this assignment yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLog
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
                >
                  <div className="mt-0.5">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{entry.action}</span>
                      <Chip 
                        size="sm" 
                        variant="soft" 
                        color={getActionColor(entry.action) as any}
                        className="text-[10px] border-none h-5"
                      >
                        {entry.actionColor}
                      </Chip>
                    </div>
                    <p className="text-sm text-muted mt-1">{entry.details}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Person className="size-3" />
                        {entry.actor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="font-mono text-muted-foreground">{entry.targetLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Submission-Level Audit */}
      <Card className="rounded-xl shadow-sm">
        <Card.Header>
          <Card.Title className="text-lg font-semibold">Submission Audit Details</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {submissions.slice(0, 10).map((sub) => (
              <div key={sub.id} className="border border-border/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{sub.studentName}</span>
                    <span className="text-xs text-muted font-mono">{sub.paperId}</span>
                  </div>
                  <div className="flex gap-2">
                    {sub.status === "Approved" && (
                      <Chip size="sm" variant="soft" color="success" className="text-[10px] border-none h-5">
                        Graded
                      </Chip>
                    )}
                    {sub.criteria.some(c => c.isOverridden) && (
                      <Chip size="sm" variant="soft" color="warning" className="text-[10px] border-none h-5">
                        Overridden
                      </Chip>
                    )}
                    {sub.appeal?.status && (
                      <Chip size="sm" variant="soft" color="accent" className="text-[10px] border-none h-5">
                        Appeal
                      </Chip>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted">
                  <p>Final Score: {sub.criteria.reduce((sum, c) => sum + c.score, 0)}/{sub.criteria.reduce((sum, c) => sum + c.maxScore, 0)}</p>
                  {sub.criteria.some(c => c.isOverridden) && (
                    <p className="mt-1 text-warning">
                      {sub.criteria.filter(c => c.isOverridden).length} criteria overridden
                    </p>
                  )}
                </div>
              </div>
            ))}
            {submissions.length > 10 && (
              <p className="text-center text-sm text-muted py-2">
                + {submissions.length - 10} more submissions
              </p>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Global Audit Link */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Need system-wide audit?</p>
            <p className="text-sm text-muted">View cross-assignment compliance reports and bias detection</p>
          </div>
          <a 
            href="/audit" 
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View Global Audit
          </a>
        </div>
      </div>
    </div>
  );
}
