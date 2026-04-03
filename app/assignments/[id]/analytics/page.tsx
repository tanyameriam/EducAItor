"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Chip, ProgressBar } from "@heroui/react";
import { ChartLine, CircleExclamation, Pencil, SquareHashtag } from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AssignmentAnalytics() {
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

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted">Assignment not found</p>
      </div>
    );
  }

  // Calculate stats
  const totalSubmissions = submissions.length;
  const processedCount = submissions.filter(s => s.status === "Approved").length;
  const avgScore = totalSubmissions > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + s.criteria.reduce((sum, c) => sum + c.score, 0), 0) / totalSubmissions)
    : 0;
  const maxPossible = submissions[0]?.criteria.reduce((sum, c) => sum + c.maxScore, 0) || 20;

  // Score distribution
  const scoreRanges = [
    { range: '0-25%', count: submissions.filter(s => {
      const score = s.criteria.reduce((sum, c) => sum + c.score, 0);
      return (score / maxPossible) <= 0.25;
    }).length },
    { range: '26-50%', count: submissions.filter(s => {
      const score = s.criteria.reduce((sum, c) => sum + c.score, 0);
      const pct = score / maxPossible;
      return pct > 0.25 && pct <= 0.5;
    }).length },
    { range: '51-75%', count: submissions.filter(s => {
      const score = s.criteria.reduce((sum, c) => sum + c.score, 0);
      const pct = score / maxPossible;
      return pct > 0.5 && pct <= 0.75;
    }).length },
    { range: '76-100%', count: submissions.filter(s => {
      const score = s.criteria.reduce((sum, c) => sum + c.score, 0);
      return (score / maxPossible) > 0.75;
    }).length },
  ];

  // Confidence distribution
  const confidenceData = [
    { level: 'Strong', count: submissions.filter(s => s.criteria.every(c => c.confidence === 'Strong')).length },
    { level: 'Partial', count: submissions.filter(s => s.criteria.some(c => c.confidence === 'Partial') && !s.criteria.every(c => c.confidence === 'Strong')).length },
    { level: 'Weak', count: submissions.filter(s => s.criteria.some(c => c.confidence === 'Weak')).length },
    { level: 'Minimal', count: submissions.filter(s => s.criteria.some(c => c.confidence === 'Minimal')).length },
  ];

  // Override rate
  const overrideCount = submissions.filter(s => 
    s.criteria.some(c => c.isOverridden)
  ).length;
  const overrideRate = totalSubmissions > 0 ? ((overrideCount / totalSubmissions) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 pb-20">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Total Submissions</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{totalSubmissions}</p>
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Processed</p>
          <p className="text-2xl font-bold tracking-tight text-success">{processedCount}</p>
          <ProgressBar value={(processedCount / totalSubmissions) * 100} color="success" className="mt-2" />
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Average Score</p>
          <p className="text-2xl font-bold tracking-tight text-accent">{avgScore}/{maxPossible}</p>
          <p className="text-xs text-muted mt-1">{((avgScore / maxPossible) * 100).toFixed(0)}% average</p>
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Override Rate</p>
          <p className="text-2xl font-bold tracking-tight text-warning">{overrideRate}%</p>
          <p className="text-xs text-muted mt-1">AI scores adjusted</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Distribution */}
        <Card className="rounded-xl shadow-sm p-6">
          <Card.Header>
            <Card.Title className="text-lg font-semibold">Score Distribution</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreRanges}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Confidence Distribution */}
        <Card className="rounded-xl shadow-sm p-6">
          <Card.Header>
            <Card.Title className="text-lg font-semibold">AI Confidence Levels</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {confidenceData.map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.level === 'Strong' ? 'bg-success' :
                      item.level === 'Partial' ? 'bg-accent' :
                      item.level === 'Weak' ? 'bg-warning' : 'bg-danger'
                    }`} />
                    <span className="text-sm font-medium">{item.level}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <div className="flex-1 h-2 bg-default rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.level === 'Strong' ? 'bg-success' :
                          item.level === 'Partial' ? 'bg-accent' :
                          item.level === 'Weak' ? 'bg-warning' : 'bg-danger'
                        }`}
                        style={{ width: `${totalSubmissions > 0 ? (item.count / totalSubmissions) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Issues & Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl shadow-sm">
          <Card.Header>
            <Card.Title className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <Pencil className="size-4 text-accent" /> Rubric Health
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="bg-background/50 border border-border/40 p-4 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">Criterion Override Analysis</p>
              <p className="text-xs text-muted">
                {overrideRate}% of submissions had score overrides. Review criteria clarity to reduce appeals.
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <Card.Header>
            <Card.Title className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <SquareHashtag className="size-4 text-danger" /> Issues Detected
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {submissions.filter(s => s.antiCheatingFlags.flagged).length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-danger/20 bg-danger/5">
                  <CircleExclamation className="size-4 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Plagiarism Flags</p>
                    <p className="text-xs text-muted">{submissions.filter(s => s.antiCheatingFlags.flagged).length} submissions flagged for similarity review</p>
                  </div>
                </div>
              )}
              {submissions.filter(s => s.appeal?.status === "Pending").length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                  <CircleExclamation className="size-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pending Appeals</p>
                    <p className="text-xs text-muted">{submissions.filter(s => s.appeal?.status === "Pending").length} appeals awaiting decision</p>
                  </div>
                </div>
              )}
              {submissions.filter(s => s.antiCheatingFlags.flagged).length === 0 && 
               submissions.filter(s => s.appeal?.status === "Pending").length === 0 && (
                <p className="text-sm text-muted text-center py-4">No issues detected for this assignment</p>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
