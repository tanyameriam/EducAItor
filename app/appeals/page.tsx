"use client";

import { useState, useMemo, Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Button, Avatar, Chip, Input
} from "@heroui/react";
import { 
  ArrowLeft, Check, ListUl, Magnifier, ChevronRight, Xmark, Sliders
} from "@gravity-ui/icons";
import { useGradingStore } from "@/lib/store/useGradingStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Loading state component
function AppealsLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-muted">Loading appeals...</div>
    </div>
  );
}

// Main component that uses useSearchParams
function AppealsWorkspaceInner() {
  const store = useGradingStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterAssignmentId = searchParams.get('assignment');
  
  // Get all appeals, optionally filtered by assignment
  const allSubmissions = store.getSubmissionList().filter(s => s.appeal);
  
  // Filter by assignment if specified in URL
  const submissions = useMemo(() => {
    if (filterAssignmentId) {
      return allSubmissions.filter(s => s.assignmentId === filterAssignmentId);
    }
    return allSubmissions;
  }, [allSubmissions, filterAssignmentId]);
  
  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || "");
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showResolutionToast, setShowResolutionToast] = useState(false);
  const [resolutionType, setResolutionType] = useState<"Uphold" | "Reject" | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Resolved">("all");

  const selectedSub = store.submissions[selectedSubId];
  const appeal = selectedSub?.appeal;

  // Get assignment name for filter context
  const filterAssignment = filterAssignmentId ? store.assignments[filterAssignmentId] : null;

  const filteredSubs = submissions.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || 
      s.paperId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.appeal?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!submissions.length) return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background relative z-10">
          <motion.div animate={{ scale: [0.8, 1.1, 1] }} className="size-24 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_var(--color-success)]">
              <Check className="size-12" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Inbox Zero</h2>
          <p className="text-muted mt-2 text-sm">All student appeals have been resolved.</p>
          <Link href="/" className="mt-8">
             <Button className="border border-border/40 hover:bg-surface font-medium bg-default/40">Return to Dashboard</Button>
          </Link>
      </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden relative z-0">
      {/* Decorative */}
      <div className="absolute bottom-[-20%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-warning/5 blur-[120px] pointer-events-none -z-10" />

      {/* Sidebar: Appeals Inbox (Screen 13) */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
           <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 z-20 bg-surface/95 backdrop-blur-md flex flex-col h-full overflow-hidden md:relative md:w-[380px]"
           >
                 <div className="w-full md:w-[380px] flex flex-col h-full">
                <div className="p-6 border-b border-border/40">
                   <div className="flex items-center justify-between mb-1">
                     <h2 className="text-xl font-bold tracking-tight text-foreground">Appeals Inbox</h2>
                     {filterAssignment && (
                       <Link 
                         href="/appeals"
                         className="text-xs text-accent hover:underline"
                       >
                         View All
                       </Link>
                     )}
                   </div>
                   
                   {filterAssignment ? (
                     <p className="text-sm text-muted">
                       {submissions.length} appeals for <span className="text-foreground font-medium">{filterAssignment.title}</span>
                     </p>
                   ) : (
                     <p className="text-sm text-muted">{submissions.length} disputed grading results across all assignments</p>
                   )}
                   
                   <div className="mt-4 space-y-3">
                      <Input 
                         placeholder="Search student or ID..." 
                         className="w-full bg-surface border border-border/50 shadow-sm rounded-lg px-3 py-2 text-sm"
                         value={search}
                         onChange={e => setSearch(e.target.value)}
                      />
                      
                      {/* Status Filter */}
                      <div className="flex gap-1">
                        {(['all', 'Pending', 'Resolved'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                              statusFilter === status
                                ? 'bg-accent text-white'
                                : 'bg-surface border border-border/50 text-muted hover:text-foreground'
                            }`}
                          >
                            {status === 'all' ? 'All' : status}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                  <AnimatePresence>
                     {filteredSubs.map((sub) => (
                        <motion.button
                           key={sub.id}
                           layout
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`w-full text-left p-4 rounded-xl transition-colors duration-200 border relative overflow-hidden group ${
                           selectedSubId === sub.id 
                              ? "bg-warning/10 border-warning/30 shadow-sm shadow-warning/5" 
                              : "bg-surface hover:bg-default/40 border-transparent hover:border-border/30"
                        }`}
                     >
                        {selectedSubId === sub.id && (
                           <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-r-full" />
                        )}
                        <div className="flex justify-between items-start mb-2">
                           <p className={`font-semibold ${selectedSubId === sub.id ? 'text-warning-600 dark:text-warning' : 'text-foreground'}`}>
                              {sub.studentName}
                           </p>
                           <Chip size="sm" variant="soft" color={sub.appeal?.status === "Resolved" ? "success" : "warning"} className="h-5 text-[10px] uppercase font-bold tracking-wider px-1">
                              {sub.appeal?.status}
                           </Chip>
                        </div>
                        <p className="text-xs text-muted mb-2 font-mono">{sub.paperId}</p>
                        {sub.appeal?.aiTriage && (
                          <div className="mb-2">
                            <Chip
                              size="sm"
                              variant="soft"
                              color={
                                sub.appeal.aiTriage === 'Likely Valid' ? 'success' :
                                sub.appeal.aiTriage === 'Unlikely Valid' ? 'danger' : 'warning'
                              }
                              className="h-5 text-[10px] font-semibold tracking-wide px-1.5 border-none"
                            >
                              AI: {sub.appeal.aiTriage}
                            </Chip>
                          </div>
                        )}
                        <p className="text-xs text-muted/80 line-clamp-2 italic">"{sub.appeal?.studentArgument}"</p>
                     </motion.button>
                  ))}
                  </AnimatePresence>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Appeal Review Split Pane (Screen 14 & 15) */}
      <div className="flex-1 flex flex-col h-full bg-background/50 z-10">
         {/* Top Header */}
          <header className="h-16 border-b border-border/40 backdrop-blur-xl px-4 flex items-center justify-between flex-shrink-0 z-20">
              <div className="flex items-center gap-3 min-w-0">
                 <Button isIconOnly variant="ghost" size="sm" onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground flex-shrink-0">
                    {isSidebarOpen ? <ArrowLeft className="size-4" /> : <ListUl className="size-4" />}
                 </Button>
                 <Avatar size="sm" className="bg-gradient-to-br from-warning/80 to-warning text-white font-semibold text-xs flex-shrink-0">
                    <Avatar.Fallback>{selectedSub?.studentName.charAt(0) || "?"}</Avatar.Fallback>
                 </Avatar>
                 <div className="min-w-0">
                    <h1 className="text-sm font-bold tracking-tight text-foreground leading-none truncate">
                      {selectedSub?.studentName} <span className="font-normal text-muted ml-1">Appeal Review</span>
                    </h1>
                    <p className="text-xs text-muted mt-1">{appeal?.date}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <ThemeToggle />
             </div>
         </header>

         {/* Review Canvas */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {appeal ? (
               <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {/* AI Triage Banner */}
                  {appeal.aiTriage && (
                    <div className={`flex items-start gap-4 rounded-xl border px-5 py-4 ${
                      appeal.aiTriage === 'Likely Valid'
                        ? 'bg-success/5 border-success/25'
                        : appeal.aiTriage === 'Unlikely Valid'
                        ? 'bg-danger/5 border-danger/25'
                        : 'bg-warning/5 border-warning/25'
                    }`}>
                      <div className={`size-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        appeal.aiTriage === 'Likely Valid' ? 'bg-success/15 text-success' :
                        appeal.aiTriage === 'Unlikely Valid' ? 'bg-danger/15 text-danger' :
                        'bg-warning/15 text-warning'
                      }`}>
                        {appeal.aiTriage === 'Likely Valid' ? <Check className="size-4" /> :
                         appeal.aiTriage === 'Unlikely Valid' ? <Xmark className="size-4" /> :
                         <Sliders className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs font-bold uppercase tracking-wider ${
                            appeal.aiTriage === 'Likely Valid' ? 'text-success' :
                            appeal.aiTriage === 'Unlikely Valid' ? 'text-danger' : 'text-warning'
                          }`}>AI Recommendation</p>
                          <Chip size="sm" variant="soft" color={
                            appeal.aiTriage === 'Likely Valid' ? 'success' :
                            appeal.aiTriage === 'Unlikely Valid' ? 'danger' : 'warning'
                          } className="h-5 text-[10px] font-bold px-1.5 border-none">{appeal.aiTriage}</Chip>
                        </div>
                        <p className="text-sm text-foreground font-medium">
                          {appeal.aiTriage === 'Likely Valid'
                            ? 'The AI assessment suggests this appeal has merit. The student\'s argument aligns with evidence found in the submission that may have been underweighted.'
                            : appeal.aiTriage === 'Unlikely Valid'
                            ? 'The AI assessment suggests this appeal is unlikely to change the outcome. The original scoring appears consistent with the evidence extracted.'
                            : 'The AI assessment is inconclusive. This appeal requires careful instructor judgment — the evidence is ambiguous or the argument raises a nuanced interpretation point.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Student Argument Panel */}
                  <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <ListUl className="size-4" /> Student Argument
                     </h3>
                     <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-warning/50">
                        {appeal.studentArgument}
                     </p>
                  </div>

                   {/* Evidence Comparison Split Pane (Screen 14) */}
                   <div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Evidence Comparison</h3>
                      <div className="flex flex-col md:flex-row gap-4 md:h-[300px]">
                         {/* AI Extraction side */}
                         <div className="flex-1 bg-default/20 border border-border/40 rounded-xl p-5 overflow-y-auto custom-scrollbar min-h-[200px]">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-1">
                               <Magnifier className="size-3" /> AI Extracted Evidence
                            </h4>
                            <div className="space-y-4">
                               {selectedSub?.criteria.map(c => (
                                  <div key={c.id} className="bg-surface p-3 rounded-lg border border-border/30 text-xs">
                                      <div className="flex justify-between items-center mb-1">
                                         <span className="font-semibold text-foreground">{c.title}</span>
                                         <span className={`font-mono font-bold ${c.score === c.maxScore ? 'text-success' : 'text-warning'}`}>{c.score}/{c.maxScore}</span>
                                      </div>
                                      <p className="text-muted-foreground italic mb-2">"{c.evidence}"</p>
                                      <p className="text-muted text-[10px] bg-default/40 p-1.5 rounded">{c.rationale}</p>
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* Grading Desk Preview side */}
                         <div className="flex-1 bg-surface border border-border/40 rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
                            <div className="size-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-3">
                               <ListUl className="size-5" />
                            </div>
                            <h4 className="text-sm font-bold text-foreground mb-1">Original Submission Paper</h4>
                            <p className="text-xs text-muted mb-4 max-w-[200px]">Review the original unadulterated paper context.</p>
                            <Button 
                               size="sm" 
                               className="bg-default/50 hover:bg-default font-medium border border-border/50 text-foreground"
                               onPress={() => router.push(`/grading/${selectedSubId}`)}
                            >
                               Open Grading Desk <ChevronRight className="size-3 ml-1" />
                            </Button>
                         </div>
                      </div>
                   </div>

                  <div className="opacity-50 block w-full h-[1px] bg-border/40" />

                    {/* Resolution Action Panel (Screen 15) */}
                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-border/50 rounded-xl p-6 shadow-sm">
                        <div>
                           <h3 className="text-lg font-bold tracking-tight text-foreground">Your Decision</h3>
                           <p className="text-sm text-muted mt-1">Resolve this dispute to notify the student.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Button 
                             variant="ghost" 
                             className={`font-medium px-4 rounded-lg flex items-center justify-center gap-2 ${appeal.status === 'Resolved' ? 'opacity-50 pointer-events-none' : 'bg-surface border border-border/50 hover:bg-danger/10 hover:text-danger hover:border-danger/30'}`}
                             onPress={() => {
                               store.resolveAppeal(selectedSubId, "Reject");
                               setResolutionType("Reject");
                               setShowResolutionToast(true);
                               setTimeout(() => setShowResolutionToast(false), 4000);
                             }}
                          >
                             <Xmark className="size-4" /> Reject Appeal
                          </Button>
                          <Button 
                             variant="primary" 
                             className={`font-medium px-4 rounded-lg shadow-md flex items-center justify-center gap-2 ${appeal.status === 'Resolved' ? 'opacity-50 pointer-events-none bg-default text-muted' : 'bg-success text-white shadow-success/20'}`}
                             onPress={() => {
                               store.resolveAppeal(selectedSubId, "Uphold");
                               setResolutionType("Uphold");
                               setShowResolutionToast(true);
                               setTimeout(() => setShowResolutionToast(false), 4000);
                             }}
                          >
                             <Check className="size-4" /> Uphold Appeal
                          </Button>
                          <div className="hidden sm:block w-[1px] mx-2 h-6 bg-border/50" />
                           <Button 
                              variant="ghost" 
                              className={`font-medium px-4 rounded-lg flex items-center justify-center gap-2 ${appeal.status === 'Resolved' ? 'opacity-50 pointer-events-none' : 'bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20'}`}
                              onPress={() => router.push(`/grading/${selectedSubId}`)}
                           >
                              <Sliders className="size-4" /> Open Grading Desk
                           </Button>
                       </div>
                    </div>

                </div>
             ) : (
                <div className="h-full flex items-center justify-center text-muted">Select an appeal to review.</div>
             )}
          </div>
       </div>

       {/* Resolution Confirmation Toast */}
       <AnimatePresence>
         {showResolutionToast && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-success text-white rounded-xl px-6 py-4 shadow-xl flex items-center gap-3"
           >
             <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
               <Check className="size-4" />
             </div>
             <div>
               <p className="font-semibold text-sm">Appeal {resolutionType === 'Uphold' ? 'upheld' : 'rejected'}</p>
               <p className="text-xs text-white/80">Student will be notified of your decision →</p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}

// Wrapper component with Suspense
export default function AppealsWorkspace() {
  return (
    <Suspense fallback={<AppealsLoading />}>
      <AppealsWorkspaceInner />
    </Suspense>
  );
}
