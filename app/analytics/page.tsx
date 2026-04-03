"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Card, Button, Avatar, Chip, ProgressBar
} from "@heroui/react";
import { 
  ArrowLeft, ChartLine, CircleExclamation, TriangleRight, SquareHashtag, Pencil
} from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area
} from "recharts";

const scoreData = [
  { range: '0-50', count: 3 },
  { range: '51-60', count: 14 },
  { range: '61-70', count: 41 },
  { range: '71-80', count: 58 },
  { range: '81-90', count: 32 },
  { range: '91-100', count: 6 },
];

const confidenceData = [
  { date: 'Batch 1', score: 81 },
  { date: 'Batch 2', score: 86 },
  { date: 'Batch 3', score: 84 },
  { date: 'Batch 4', score: 79 },
  { date: 'Batch 5', score: 88 },
];

export default function AnalyticsDashboard() {
  const store = useGradingStore();

  return (
    <div className="min-h-screen bg-background relative z-0 pb-20">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 h-16 border-b border-border/40 backdrop-blur-xl px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
           <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mr-2">
              <ArrowLeft className="mr-2 size-3" /> Dashboard
           </Link>
           <Divider orientation="vertical" className="h-6" />
           <h1 className="text-sm font-bold tracking-tight">Enterprise Analytics</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <ThemeToggle />
           <Button variant="ghost" size="sm" className="font-medium bg-surface border border-border/50 text-foreground">
              Export Report
           </Button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-8 pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
         {/* Metric Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="rounded-xl shadow-sm">
               <Card.Content className="p-5">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Average Score</p>
                  <div className="flex items-end gap-2">
                     <h2 className="text-3xl font-bold tracking-tight text-foreground">71.6%</h2>
                     <span className="text-xs font-medium text-success mb-1 flex items-center"><TriangleRight className="rotate-[-90deg] size-3" /> 2.1%</span>
                  </div>
               </Card.Content>
            </Card>
            <Card className="rounded-xl shadow-sm">
               <Card.Content className="p-5">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">AI Confidence Rating</p>
                  <div className="flex items-end gap-2">
                     <h2 className="text-3xl font-bold tracking-tight text-foreground">83.2%</h2>
                  </div>
                  <ProgressBar value={83.2} className="mt-3" color="success" />
               </Card.Content>
            </Card>
            <Card className="rounded-xl shadow-sm">
               <Card.Content className="p-5">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Manual Overrides</p>
                  <div className="flex items-end gap-2">
                     <h2 className="text-3xl font-bold tracking-tight text-warning-600">9</h2>
                     <span className="text-xs text-muted mb-1">criteria adjusted</span>
                  </div>
               </Card.Content>
            </Card>
            <Card className="rounded-xl shadow-sm">
               <Card.Content className="p-5 text-center flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold text-muted mb-2">Processed Submissions</p>
                  <div className="flex items-center gap-2">
                     <span className="text-xl font-bold">{store.getProcessedCount()}</span>
                     <span className="text-muted-foreground">/</span>
                     <span className="text-sm font-medium">{store.getSubmissionList().length}</span>
                  </div>
               </Card.Content>
            </Card>
         </div>

         {/* Charts Split (Screen 16) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <Card className="lg:col-span-2 rounded-xl shadow-sm">
               <Card.Header className="pb-0">
                  <Card.Title>Score Distribution Curve</Card.Title>
               </Card.Header>
               <Card.Content className="p-6">
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                           <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                           <RechartsTooltip 
                              cursor={{ fill: 'hsl(var(--accent) / 0.05)' }} 
                              contentStyle={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                           />
                           <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </Card.Content>
            </Card>

            <Card className="rounded-xl shadow-sm flex flex-col">
               <Card.Header className="pb-0">
                  <Card.Title>AI Grading Confidence</Card.Title>
                  <Card.Description>Aggregate confidence scores over the evaluation period.</Card.Description>
               </Card.Header>
               <Card.Content className="p-6 flex-1">
                  <div className="flex-1 w-full min-h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={confidenceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={['dataMin - 10', 'dataMax + 5']} />
                           <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                           <Area type="monotone" dataKey="score" stroke="hsl(var(--success))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </Card.Content>
            </Card>

         </div>

         {/* Rubric Health Monitor (Phase 6 Learning Loop) */}
         <Card className="rounded-xl shadow-sm">
            <Card.Header className="flex items-center justify-between pb-0">
               <div>
                  <Card.Title>Rubric Health Monitor</Card.Title>
                  <Card.Description>Per-criterion override rates signal where the rubric needs refinement — Phase 6 Learning Loop.</Card.Description>
               </div>
               <Chip size="sm" variant="soft" color="accent" className="border-none text-[10px] font-bold uppercase tracking-wider">Phase 6</Chip>
            </Card.Header>
            <Card.Content className="pt-6">
               <RubricHealthCards />
            </Card.Content>
         </Card>

         {/* Suggestion & Pattern Panels (Screen 17 & 18) */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Suggestion Panel */}
            <Card className="rounded-xl shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 scale-150 text-accent/5 pointer-events-none">
                  <Pencil className="size-24" />
               </div>
               <Card.Header>
                  <Card.Title className="flex items-center gap-2 text-sm uppercase tracking-wider">
                     <Pencil className="size-4 text-accent" /> Algorithmic Suggestions
                  </Card.Title>
               </Card.Header>
                <Card.Content>
                   <div className="bg-background/50 border border-border/40 p-4 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Rubric Calibration Recommended</p>
                      <p className="text-xs text-muted leading-relaxed">
                         The &quot;Tone, Format &amp; Task Fulfilment&quot; criterion has a 45% override rate across evaluated submissions. The AI suggests adding worked examples of correct email salutations, report headers, and proposal formats to the rubric description to reduce recurring instructor corrections.
                      </p>
                      <Button size="sm" variant="secondary" className="mt-3 text-xs bg-accent/10 text-accent font-medium h-7">
                         Apply Rubric Update
                      </Button>
                   </div>
                </Card.Content>
            </Card>

            {/* Pattern Detection */}
            <Card className="rounded-xl shadow-sm">
               <Card.Header>
                  <Card.Title className="flex items-center gap-2 text-sm uppercase tracking-wider">
                     <SquareHashtag className="size-4 text-danger" /> Pattern & Anomaly Detection
                  </Card.Title>
               </Card.Header>
               <Card.Content>
                  <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                         <div className="mt-0.5 size-5 rounded-full bg-warning/20 text-warning-600 flex shrink-0 items-center justify-center">
                            <CircleExclamation className="size-3" />
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-foreground">Grammar Criterion — Highest Override Rate</p>
                            <p className="text-xs text-muted">28 students scored lower on Grammar &amp; Sentence Structure than their actual ability warrants. The AI is penalising complex sentences that use Indian English concord conventions (&ldquo;along with&rdquo;, proximity agreement). Review Grammar criterion AI calibration.</p>
                            <div className="mt-2 flex gap-2">
                               <Chip size="sm" color="warning" variant="secondary" className="h-5 text-[10px] border-none">Calibration</Chip>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                         <div className="mt-0.5 size-5 rounded-full bg-warning/20 text-warning-600 flex shrink-0 items-center justify-center">
                            <CircleExclamation className="size-3" />
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-foreground">Vocabulary Weakness Pattern Identified</p>
                            <p className="text-xs text-muted">41 students in TE-MECH and TE-IT sections are using nominal constructions and passive voice without communicative purpose, affecting Vocabulary &amp; Word Choice scores. Consider a targeted vocabulary-building activity for Section A batches.</p>
                         </div>
                      </div>
                  </div>
               </Card.Content>
            </Card>

         </div>

      </main>
    </div>
  );
}

function RubricHealthCards({ assignmentId }: { assignmentId?: string }) {
  const store = useGradingStore();
  const allSubs = assignmentId 
    ? store.getSubmissionsForAssignment(assignmentId)
    : store.getSubmissionList();

  // Build per-criterion aggregated stats
  const criterionMap: Record<string, { title: string; totalEvals: number; overrideCount: number }> = {};
  for (const sub of allSubs) {
    for (const c of sub.criteria) {
      if (!criterionMap[c.id]) {
        criterionMap[c.id] = { title: c.title, totalEvals: 0, overrideCount: 0 };
      }
      criterionMap[c.id].totalEvals += 1;
      criterionMap[c.id].overrideCount += (c.overrideHistory?.length ?? 0);
    }
  }

  const criterionStats = Object.entries(criterionMap).map(([id, d]) => {
    const overrideRate = d.totalEvals > 0 ? Math.round((d.overrideCount / d.totalEvals) * 100) : 0;
    const aiAccuracy = 100 - overrideRate;
    return { id, ...d, overrideRate, aiAccuracy };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {criterionStats.map(c => (
        <Card key={c.id} className="rounded-xl">
          <Card.Content className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                <p className="text-xs text-muted mt-0.5">{c.totalEvals} evaluations · {c.overrideCount} overrides</p>
              </div>
              <Chip
                size="sm"
                variant="soft"
                color={c.overrideRate > 30 ? 'danger' : c.overrideRate > 15 ? 'warning' : 'success'}
                className="h-5 text-[10px] font-bold px-1.5 border-none shrink-0"
              >
                {c.overrideRate}% overridden
              </Chip>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
                  <span>AI Accuracy</span>
                  <span>{c.aiAccuracy}%</span>
                </div>
                <ProgressBar
                  aria-label={`AI accuracy for ${c.title}`}
                  value={c.aiAccuracy}
                  color={c.overrideRate > 30 ? 'danger' : c.overrideRate > 15 ? 'warning' : 'success'}
                  className="max-w-full"
                />
              </div>
            </div>

            {c.overrideRate > 30 && (
              <div className="mt-3 flex items-start gap-2 bg-danger/5 border border-danger/20 rounded-lg p-3">
                <CircleExclamation className="size-3.5 text-danger shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-danger">High Override Rate — Rubric Reword Suggested</p>
                  <p className="text-[10px] text-muted mt-0.5 leading-relaxed">
                    Instructors are consistently disagreeing with AI on this criterion. Consider clarifying the scoring boundary or providing a worked example in the rubric.
                  </p>
                  <Button size="sm" className="mt-2 h-6 text-[10px] font-semibold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 px-2">
                    <Pencil className="size-2.5 mr-1" /> Suggest Reword
                  </Button>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}

// Temporary internal component for layout structure
const Divider = ({ className, orientation = "horizontal" }: { className?: string, orientation?: "horizontal" | "vertical" }) => (
  <div className={orientation === "horizontal" ? `w-full h-px bg-border/40 ${className}` : `h-full w-px bg-border/40 ${className}`} />
);
