"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Button, Avatar, Chip, Input
} from "@heroui/react";
import {
  ArrowLeft, Shield, ClockArrowRotateLeft, ArrowDown, Eye, Check, Xmark, ChevronRight
} from "@gravity-ui/icons";
import Link from "next/link";
import { useGradingStore } from "@/lib/store/useGradingStore";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditComplianceWorkspace() {
  const store = useGradingStore();
  const auditLog = store.auditLog;
  const allSubs = store.getSubmissionList();

  const [search, setSearch] = useState("");
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isBiasFlyoutOpen, setIsBiasFlyoutOpen] = useState(false);

  const filteredLog = auditLog.filter(entry =>
    search === "" ||
    entry.id.toLowerCase().includes(search.toLowerCase()) ||
    entry.actor.toLowerCase().includes(search.toLowerCase()) ||
    entry.action.toLowerCase().includes(search.toLowerCase()) ||
    entry.targetLabel.toLowerCase().includes(search.toLowerCase())
  );

  // Build replay data: per-criterion AI vs final score across all submissions
  const replayData = allSubs.flatMap(sub =>
    sub.criteria.map(c => ({
      submissionId: sub.id,
      studentName: sub.studentName,
      paperId: sub.paperId,
      criterionTitle: c.title,
      aiScore: c.originalAiScore,
      finalScore: c.score,
      maxScore: c.maxScore,
      drifted: c.score !== c.originalAiScore,
    }))
  );

  const driftCount = replayData.filter(r => r.drifted).length;
  const matchCount = replayData.length - driftCount;

  // Bias flyout: per-criterion variance bars (deterministic)
  const biasData = [
    { criterion: "Grammar & Sentence Structure", variance: 3, cohortA: 89, cohortB: 86 },
    { criterion: "Vocabulary & Word Choice",      variance: 5, cohortA: 83, cohortB: 78 },
    { criterion: "Coherence & Organisation",       variance: 4, cohortA: 80, cohortB: 76 },
    { criterion: "Tone, Format & Task Fulfilment", variance: 2, cohortA: 87, cohortB: 85 },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative z-0">
      {/* Decorative Gradient Blob */}
      <div className="absolute top-[20%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />

      {/* Sidebar: Compliance Actions */}
      <div className="w-[380px] flex-shrink-0 border-r border-border/40 bg-surface/30 backdrop-blur-md flex flex-col h-full z-10">
        <div className="p-6 border-b border-border/40">
           <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="mr-2 size-3" /> Dashboard
           </Link>
           <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="size-5 text-slate-500" /> Compliance
           </h2>
           <p className="text-sm text-muted mt-1">Audit trails and bias management.</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

           {/* Bias Detection */}
           <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                 <Shield className="size-4" /> Bias Detection Engine
              </h3>
              <div className="space-y-4">
                 <div className="bg-surface border border-border/50 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium">Demographic Parity</span>
                       <Chip size="sm" color="success" variant="secondary" className="h-5 text-[10px] border-none">Healthy</Chip>
                    </div>
                    <p className="text-xs text-muted mb-3">No statistically significant score deviation detected across protected cohorts.</p>
                    <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-success h-full w-[98%]" />
                    </div>
                 </div>

                 <button
                    className="w-full text-left bg-surface border border-warning/30 p-4 rounded-xl shadow-sm hover:bg-warning/5 transition-colors group"
                    onClick={() => setIsBiasFlyoutOpen(true)}
                 >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium">Linguistic Bias Index</span>
                       <div className="flex items-center gap-2">
                         <Chip size="sm" color="warning" variant="soft" className="h-5 text-[10px]">Review</Chip>
                         <ChevronRight className="size-3 text-muted group-hover:text-warning transition-colors" />
                       </div>
                    </div>
                    <p className="text-xs text-muted mb-3">1.8% score gap detected for Civil Dept students on Vocabulary criterion — possible cohort effect from less prior formal English exposure.</p>
                    <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-warning h-full w-[65%]" />
                    </div>
                    <p className="text-[10px] text-warning mt-2 font-medium">Click to view per-criterion breakdown →</p>
                 </button>
              </div>
           </section>

           <div className="opacity-50 block w-full h-[1px] bg-border/40" />

           {/* Compliance Export */}
           <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                 Data Export
              </h3>
              <p className="text-xs text-muted mb-4">Export DPDP/GDPR compliant records for accreditation review.</p>

              <div className="space-y-2">
                 <Button variant="ghost" className="w-full justify-start text-sm bg-surface border border-border/50 hover:bg-default/40">
                    <ArrowDown className="mr-2 size-4" /> Export Audit Log (CSV)
                 </Button>
                 <Button variant="ghost" className="w-full justify-start text-sm bg-surface border border-border/50 hover:bg-default/40">
                    <ArrowDown className="mr-2 size-4" /> Download Rubric Schema (JSON)
                 </Button>
              </div>
           </section>

        </div>
      </div>

      {/* Main Content: Audit Log */}
      <div className="flex-1 flex flex-col h-full bg-background/50 z-10 overflow-hidden relative">
         {/* Top Header */}
         <header className="h-16 border-b border-border/40 backdrop-blur-xl px-8 flex items-center justify-between flex-shrink-0">
             <div className="flex items-center gap-4 text-foreground">
                 <h1 className="text-sm font-bold tracking-tight">System Audit Log</h1>
                 <Chip size="sm" variant="soft" color="default" className="border-none text-[10px] font-semibold">
                   {auditLog.length} entries
                 </Chip>
             </div>
             <div className="flex items-center gap-3">
                <ThemeToggle />
             </div>
         </header>

         {/* Canvas */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500">

               <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2 w-full max-w-sm">
                     <Input
                        placeholder="Search logs..."
                        className="bg-surface border border-border/50 shadow-sm rounded-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                     />
                  </div>
                  <Chip variant="secondary" className="bg-surface border border-border/50 text-muted-foreground text-xs uppercase tracking-wider border-none">
                     <LockIcon className="size-3 inline-block mr-1" /> Immutable Record
                  </Chip>
               </div>

               {/* Log Table */}
               <div className="bg-surface border border-border/50 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-default/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                       <tr>
                          <th className="px-6 py-4 border-b border-border/40">Log ID</th>
                          <th className="px-6 py-4 border-b border-border/40">Timestamp</th>
                          <th className="px-6 py-4 border-b border-border/40">Actor</th>
                          <th className="px-6 py-4 border-b border-border/40">Action</th>
                          <th className="px-6 py-4 border-b border-border/40">Target</th>
                          <th className="px-6 py-4 border-b border-border/40">Details</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-foreground">
                       {(filteredLog.length > 0 ? filteredLog : auditLog).map((entry) => (
                          <tr key={entry.id} className="hover:bg-default/20 transition-colors">
                             <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{entry.id}</td>
                             <td className="px-6 py-4 text-xs">{new Date(entry.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <Avatar size="sm" className={`size-6 text-[10px] ${entry.actor === 'System' || entry.actor === 'AI Engine' ? 'bg-accent/20 text-accent' : 'bg-default/50'}`}>
                                      <Avatar.Fallback>{entry.actor.substring(0,2)}</Avatar.Fallback>
                                   </Avatar>
                                   <span className="font-medium text-xs">{entry.actor}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <Chip size="sm" variant="soft" color={entry.actionColor ?? 'default'} className="border-none text-xs font-medium">
                                   {entry.action}
                                </Chip>
                             </td>
                             <td className="px-6 py-4 text-xs font-medium max-w-[160px] truncate">{entry.targetLabel}</td>
                             <td className="px-6 py-4 text-xs text-muted max-w-[220px] truncate" title={entry.details}>{entry.details}</td>
                          </tr>
                       ))}
                    </tbody>
                  </table>

                  <div className="p-4 border-t border-border/40 flex justify-between items-center bg-default/10">
                     <span className="text-xs text-muted-foreground">Showing {filteredLog.length > 0 ? filteredLog.length : auditLog.length} of {auditLog.length} entries</span>
                     <Chip size="sm" variant="soft" color="success" className="border-none text-[10px] font-bold uppercase">DPDP Compliant</Chip>
                  </div>
               </div>

               {/* Replay Eval Panel */}
               <div className="mt-8 bg-surface border border-border/50 rounded-xl p-6 shadow-sm border-l-4 border-l-accent flex justify-between items-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 text-accent/5 pointer-events-none scale-[2]">
                     <ClockArrowRotateLeft className="size-32" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <ClockArrowRotateLeft className="size-5 text-accent" /> Evaluation Replay Engine
                     </h3>
                     <p className="text-sm text-muted mt-1 max-w-xl">
                        Compare AI's initial scores against instructor-approved final scores. Verify determinism — same input should always produce same output.
                     </p>
                     <div className="flex items-center gap-4 mt-3">
                       <span className="text-xs font-semibold text-success">{matchCount} criteria matched</span>
                       <span className="text-xs font-semibold text-warning">{driftCount} criteria drifted</span>
                     </div>
                  </div>
                  <Button variant="primary" className="bg-accent text-white shadow-md shadow-accent/20 shrink-0" onPress={() => setIsReplayOpen(true)}>
                     Launch Replay Engine
                  </Button>
               </div>

            </div>
         </div>
      </div>

      {/* Replay Modal */}
      <AnimatePresence>
        {isReplayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/40">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <ClockArrowRotateLeft className="size-5 text-accent" /> Evaluation Replay — AI vs Approved
                  </h3>
                  <p className="text-xs text-muted mt-1">Every criterion for every submission. Green = AI was right. Amber = instructor drift.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-success"><span className="size-2 rounded-full bg-success inline-block" /> Match: {matchCount}</span>
                    <span className="flex items-center gap-1.5 font-semibold text-warning"><span className="size-2 rounded-full bg-warning inline-block" /> Drift: {driftCount}</span>
                  </div>
                  <Button isIconOnly variant="ghost" size="sm" onPress={() => setIsReplayOpen(false)}>
                    <Xmark className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="space-y-2">
                  {replayData.map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-3 rounded-lg border text-sm ${
                        row.drifted
                          ? 'bg-warning/5 border-warning/20'
                          : 'bg-success/5 border-success/15'
                      }`}
                    >
                      <div className={`size-7 rounded-full flex items-center justify-center shrink-0 ${row.drifted ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                        {row.drifted ? <Eye className="size-3.5" /> : <Check className="size-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-xs truncate">{row.studentName} — {row.criterionTitle}</p>
                        <p className="text-[10px] text-muted font-mono">{row.paperId}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <div className="text-center">
                          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">AI Score</p>
                          <p className="font-bold text-foreground font-mono">{row.aiScore}/{row.maxScore}</p>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Final</p>
                          <p className={`font-bold font-mono ${row.drifted ? 'text-warning' : 'text-success'}`}>{row.finalScore}/{row.maxScore}</p>
                        </div>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={row.drifted ? 'warning' : 'success'}
                          className="h-5 text-[10px] font-bold px-1.5 border-none"
                        >
                          {row.drifted ? 'Drift ⚠' : 'Match ✓'}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-border/40 flex justify-between items-center">
                <p className="text-xs text-muted">AI override rate: {replayData.length > 0 ? Math.round((driftCount / replayData.length) * 100) : 0}% — target range 10–15%</p>
                <Button size="sm" variant="ghost" className="font-medium" onPress={() => setIsReplayOpen(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bias Detection Flyout */}
      <AnimatePresence>
        {isBiasFlyoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black"
              onClick={() => setIsBiasFlyoutOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-[420px] z-[100] bg-surface border-l border-border/50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/40">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">Linguistic Bias Deep Dive</h3>
                  <p className="text-xs text-muted mt-0.5">Per-criterion score variance — Civil Dept vs IT/Mech cohorts</p>
                </div>
                <Button isIconOnly variant="ghost" size="sm" onPress={() => setIsBiasFlyoutOpen(false)}>
                  <Xmark className="size-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                <div className="bg-warning/5 border border-warning/20 rounded-lg px-4 py-3 text-xs text-warning font-medium">
                  1.8% score gap detected for Civil Dept cohort on Vocabulary. Approaching threshold — monitor closely.
                </div>

                {biasData.map((item, i) => (
                  <div key={i} className="bg-background/60 border border-border/40 rounded-xl p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">{item.criterion}</p>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted mb-1">
                          <span>IT / Mech Cohort</span>
                          <span>{item.cohortA}%</span>
                        </div>
                        <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-success h-full rounded-full" style={{ width: `${item.cohortA}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted mb-1">
                          <span>Civil Engineering Cohort</span>
                          <span>{item.cohortB}%</span>
                        </div>
                        <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-warning h-full rounded-full" style={{ width: `${item.cohortB}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-muted">Variance</span>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={item.variance > 8 ? 'danger' : item.variance > 4 ? 'warning' : 'success'}
                        className="h-5 text-[10px] font-bold px-1.5 border-none"
                      >
                        {item.variance > 8 ? '⚠ ' : ''}{item.variance}% gap
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border/40">
                <Button className="w-full font-semibold bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20" onPress={() => setIsBiasFlyoutOpen(false)}>
                  Adjust Evaluation Weights
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const LockIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
   </svg>
);
