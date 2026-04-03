"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, Button, Chip, Avatar } from "@heroui/react";
import { ArrowLeft, ChevronRight, Pencil, TriangleExclamation, Shield, Check } from "@gravity-ui/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGradingStore, OverrideRecord } from "@/lib/store/useGradingStore";
import { motion, AnimatePresence } from "framer-motion";

const REASON_LABELS: Record<OverrideRecord['reasonCode'], string> = {
  ocr: 'OCR / Handwriting Illegible',
  missed: 'Evidence Missed by AI Engine',
  interpretation: 'Differing Interpretation of Rubric',
  benefit: 'Benefit of the Doubt',
};

export default function GradingScreen() {
  const [viewMode, setViewMode] = useState<"image" | "ocr">("image");
  const params = useParams<{ subId: string }>();
  const router = useRouter();

  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [overrideScore, setOverrideScore] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<OverrideRecord['reasonCode'] | "">("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLockedByOtherTab, setIsLockedByOtherTab] = useState(false);

  const store = useGradingStore();
  const submissionId = params?.subId || "sub-1";
  const submission = store.submissions[submissionId];
  const evaluations = submission?.criteria || [];
  
  // Get assignment details for this submission
  const assignment = submission ? store.assignments[submission.assignmentId] : null;
  const course = assignment ? store.courses[assignment.courseId] : null;
  const assignmentCode = course?.code || "Assignment";

  const totalScore = evaluations.reduce((acc, c) => acc + c.score, 0);
  const maxScore = evaluations.reduce((acc, c) => acc + c.maxScore, 0);

  // AI "thinking" animation on navigation
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, [submissionId]);

  // Set session state when grading desk opens
  useEffect(() => {
    if (submission) {
      store.setSessionState({ lastOpenedSubmissionId: submissionId, savedAt: new Date().toISOString() });
    }
  }, [submissionId]);

  // Dual-instructor soft lock via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;
    let channel: BroadcastChannel;
    try {
      channel = new BroadcastChannel("grading-lock");
      channel.postMessage({ type: "LOCK", submissionId });
      channel.onmessage = (event) => {
        if (event.data.submissionId === submissionId) {
          if (event.data.type === "LOCK") setIsLockedByOtherTab(true);
          if (event.data.type === "UNLOCK") setIsLockedByOtherTab(false);
        }
      };
    } catch {}
    return () => {
      try {
        channel?.postMessage({ type: "UNLOCK", submissionId });
        channel?.close();
      } catch {}
    };
  }, [submissionId]);

  const handleSaveOverride = () => {
    if (activeOverride && overrideReason) {
      store.overrideScore(submissionId, activeOverride, overrideScore, overrideReason as OverrideRecord['reasonCode'], "prof-sk");
      setActiveOverride(null);
      setOverrideReason("");
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 2500);
    }
  };

  const [showWorkflowNudge, setShowWorkflowNudge] = useState<string | null>(null);

  const handleApproveAndNext = () => {
    store.approveSubmission(submissionId);
    const nextSub = store.getSubmissionList().find(s => s.status === "Needs Review" && s.id !== submissionId);
    if (nextSub) {
      router.push(`/grading/${nextSub.id}`);
    } else {
      setShowWorkflowNudge("batch-complete");
      setTimeout(() => {
        setShowWorkflowNudge(null);
        // Navigate back to the batch view for this submission's assignment
        const assignmentId = submission?.assignmentId;
        if (assignmentId) {
          router.push(`/batch/${assignmentId}`);
        } else {
          router.push("/assignments");
        }
      }, 2500);
    }
  };

  if (!submission) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative z-0 text-foreground">
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[140px] pointer-events-none -z-10" />

      {/* LEFT PANEL: Document Viewer */}
      <div className="flex flex-col w-[55%] h-full border-r border-border/40 bg-surface/30">
        <header className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border/40 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link href={assignment ? `/batch/${assignment.id}` : "/assignments"}>
              <Button isIconOnly variant="ghost" size="sm" className="rounded-md">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <span className="font-semibold text-sm">{assignmentCode} • {submission.paperId}</span>
            {submission.antiCheatingFlags.flagged && (
              <Chip size="sm" color="danger" variant="soft" className="border-none text-[10px] font-bold uppercase tracking-wider px-1 h-5">
                <Shield className="size-3 mr-0.5 inline" /> Integrity Flag
              </Chip>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLockedByOtherTab ? (
              <Chip size="sm" color="danger" variant="soft" className="border-none text-[10px] animate-pulse">
                Another session is editing this
              </Chip>
            ) : (
              <Chip size="sm" color="default" variant="soft" className="border-none text-[10px] text-muted">
                You're editing
              </Chip>
            )}
            <div className="flex bg-default/40 rounded-lg p-1">
              <button
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${viewMode === "image" ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}
                onClick={() => setViewMode("image")}
              >
                Original Scan
              </button>
              <button
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${viewMode === "ocr" ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}
                onClick={() => setViewMode("ocr")}
              >
                OCR Text
              </button>
            </div>
          </div>
        </header>

         {/* Document Content */}
        <div className="flex-1 overflow-auto p-8 bg-default/5 flex justify-center custom-scrollbar">
          {viewMode === "image" ? (
            /* Handwritten scan simulation */
            <div className="w-full max-w-[800px] min-h-[1050px] bg-background shadow-sm border border-border/50 rounded-md p-10 flex flex-col gap-4">
              {/* Simulation Notice Banner */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">i</div>
                  <p className="text-xs font-medium text-accent">Simulated Handwritten Scan — Original scan would appear here</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-2">
                <div>
                  <h2 className="text-lg font-bold font-serif">{submission.studentName}</h2>
                  <p className="text-xs text-muted font-mono">{submission.paperId} • {assignmentCode}</p>
                </div>
                <Chip size="sm" variant="soft" color="default" className="border-none text-[10px]">Scan Preview</Chip>
              </div>
              {/* Simulated handwriting lines - using submission criteria titles */}
              <div className="space-y-5 mt-2">
                {evaluations.map((criterion, qi) => (
                  <div key={qi} className="space-y-2">
                    <p className="text-xs font-bold text-muted uppercase tracking-wide">{criterion.title}</p>
                    {Array.from({ length: qi === 1 && submission.id === "sub-2" ? 3 : qi === 2 && submission.id === "sub-7" ? 1 : 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-5 rounded-sm ${
                          qi === 1 && submission.id === "sub-2" && i === 1
                            ? "bg-warning/20 border border-warning/30"
                            : (qi === 2 || qi === 3) && submission.id === "sub-7"
                            ? "bg-danger/10 border border-dashed border-danger/20"
                            : "bg-foreground/5"
                        }`}
                        style={{ width: `${70 + ((qi * 7 + i * 11) % 28)}%` }}
                      />
                    ))}
                    {qi === 1 && submission.id === "sub-2" && (
                      <div className="flex items-center gap-2 mt-1">
                        <TriangleExclamation className="size-3 text-warning shrink-0" />
                        <p className="text-[10px] text-warning font-medium">Smudge detected — OCR confidence 43%</p>
                      </div>
                    )}
                    {(qi === 2 || qi === 3) && submission.id === "sub-7" && (
                      <p className="text-[10px] text-danger/70 font-medium">No text detected — page may be blank</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* OCR Text content */
            <div className="w-full max-w-[800px] min-h-[1050px] bg-background shadow-sm border border-border/50 rounded-md p-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-4 bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
                <TriangleExclamation className="size-4 text-warning shrink-0" />
                <p className="text-xs text-warning font-medium">
                  OCR Extracted Text — accuracy varies per paragraph. Switch to "Original Scan" to verify flagged regions.
                </p>
              </div>
              <pre className="font-serif text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {submission.ocrContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: AI Copilot */}
      <div className="flex flex-col w-[45%] h-full bg-background/80 backdrop-blur-xl relative">
        <header className="flex h-14 shrink-0 items-center justify-between px-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Avatar size="sm" className="bg-gradient-to-br from-accent/80 to-accent text-white font-semibold text-xs">
              <Avatar.Fallback>{submission.studentName.charAt(0)}</Avatar.Fallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-tight">{submission.studentName}</p>
              <p className="text-xs text-muted">{submission.paperId} · {submission.submittedAt}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Chip variant="soft" color="default" size="sm" className="font-semibold px-2 font-mono">
              {totalScore}/{maxScore}
            </Chip>
            <Chip
              variant="soft"
              color={submission.status === "Approved" ? "success" : "warning"}
              size="sm"
              className="font-semibold px-2 text-[10px] uppercase tracking-wider border-none"
            >
              {submission.status}
            </Chip>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto custom-scrollbar pb-24">

          {/* Anti-Cheating Warning Panel */}
          {submission.antiCheatingFlags.flagged && (
            <div className="mx-6 mt-5 border border-danger/30 bg-danger/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-4 text-danger shrink-0" />
                <h4 className="text-sm font-bold text-danger">Academic Integrity Flag</h4>
                <Chip size="sm" color="danger" variant="soft" className="border-none text-[10px] font-bold">
                  {submission.antiCheatingFlags.similarityScore}% overlap
                </Chip>
              </div>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Semantic similarity detected with{" "}
                <span className="font-semibold text-foreground">
                  {store.submissions[submission.antiCheatingFlags.similarSubmissionId!]?.studentName || "another submission"}
                </span>{" "}
                ({store.submissions[submission.antiCheatingFlags.similarSubmissionId!]?.paperId}).
              </p>
              <div className="bg-surface border border-warning/30 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-warning-foreground">
                  This does not automatically indicate cheating — instructor judgment required.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-danger/10 text-danger border border-danger/30 font-medium rounded-lg"
                onPress={() => router.push(`/grading/${submission.antiCheatingFlags.similarSubmissionId}`)}
              >
                Compare Submissions
              </Button>
            </div>
          )}

           <div className="px-6 pt-5 pb-2">
             <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className="font-semibold tracking-tight">AI Evaluation Summary</h3>
                 <p className="text-xs text-muted mt-0.5">
                   {evaluations.filter(e => e.isOverridden || e.confidence !== 'Minimal').length} of {evaluations.length} criteria reviewed
                 </p>
               </div>
               <span className="text-xs font-semibold text-accent uppercase tracking-wider">{evaluations.length} Criteria</span>
             </div>

            {/* AI Loading Skeleton */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="border border-border/50 rounded-xl p-5 bg-surface space-y-3 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-4 bg-default/40 rounded w-2/3" />
                      <div className="h-6 bg-default/40 rounded w-12" />
                    </div>
                    <div className="h-3 bg-default/40 rounded w-1/4" />
                    <div className="h-16 bg-default/30 rounded-lg" />
                    <div className="h-3 bg-default/30 rounded w-full" />
                    <div className="h-3 bg-default/30 rounded w-4/5" />
                  </div>
                ))}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted animate-pulse">AI engine loading evaluation…</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {evaluations.map((item) => (
                  <Card key={item.id} className="rounded-xl shadow-none border border-border/50 bg-surface overflow-visible">
                    <Card.Header className="pb-2 pt-4 px-5 flex justify-between items-start">
                      <p className="font-semibold text-sm text-foreground pr-4 leading-tight">{item.title}</p>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="text-lg font-bold text-foreground font-mono bg-default/40 px-2 rounded-md">
                          {item.score}<span className="text-muted/60 text-sm">/{item.maxScore}</span>
                        </div>
                        {item.isOverridden && item.score !== item.originalAiScore && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted line-through font-mono">{item.originalAiScore}</span>
                            <span className="text-[10px] text-success font-bold">↑ adjusted</span>
                          </div>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Content className="px-5 py-3 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip
                          size="sm"
                          variant="soft"
                          color={item.confidenceColor}
                          className="text-[10px] font-bold uppercase tracking-wider px-1 border-none"
                        >
                          {item.confidence} Confidence
                        </Chip>
                        {item.confidence === "Minimal" && (
                          <Chip size="sm" color="danger" variant="soft" className="border-none text-[10px] font-bold uppercase">
                            0.60 — Review Required
                          </Chip>
                        )}
                        {item.confidence === "Weak" && (
                          <div title="OCR recognition degraded">
                            <TriangleExclamation className="size-4 text-warning" />
                          </div>
                        )}
                        {item.isOverridden && (
                          <Chip size="sm" color="success" variant="soft" className="border-none text-[10px]">
                            Instructor Adjusted
                          </Chip>
                        )}
                      </div>

                      <div className="bg-default/30 rounded-lg p-3 border border-border/40 relative">
                        <div className="absolute top-[-8px] left-3 bg-surface text-[10px] font-bold uppercase tracking-wider text-muted px-1">
                          Matched Evidence
                        </div>
                        <p className={`text-sm font-serif italic mt-1 ${
                          item.evidence.includes("[No evidence") ? "text-danger/70" : "text-foreground/90"
                        }`}>
                          "{item.evidence}"
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted mb-1">AI Rationale</p>
                        <p className="text-sm leading-snug">{item.rationale}</p>
                      </div>

                      {/* Override history */}
                      {item.overrideHistory.length > 0 && (
                        <div className="bg-success/5 border border-success/20 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-success mb-1">Override Log</p>
                          {item.overrideHistory.map((r, i) => (
                            <p key={i} className="text-[10px] text-muted">
                              {r.originalScore}→{r.newScore} · {r.reasonLabel}
                            </p>
                          ))}
                        </div>
                      )}
                    </Card.Content>
                    <hr className="border-t border-border/50" />
                    <Card.Footer className="px-3 py-2 bg-default/10 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs text-foreground font-medium px-3 rounded-lg border ${
                          item.isOverridden
                            ? "bg-success/20 border-success/50 text-success"
                            : "bg-surface hover:bg-default/50 border-border/50"
                        }`}
                        onPress={() => {
                          setOverrideScore(item.score);
                          setActiveOverride(item.id);
                        }}
                      >
                        <Pencil className="size-3 mr-1" />
                        {item.isOverridden ? "Re-adjust Score" : "Override Score"}
                      </Button>
                      {(item.confidence === "Weak" || item.confidence === "Minimal") && !item.isOverridden && (
                        <span className="text-xs font-medium text-warning flex items-center pr-2">
                          <TriangleExclamation className="size-3 mr-1" /> Needs Review
                        </span>
                      )}
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="h-20 shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 absolute bottom-0 w-full z-10">
          <div className="relative group">
            <Button
              variant="ghost"
              className="font-medium text-warning text-sm rounded-xl hover:bg-warning/10"
            >
              Mark for Later
            </Button>
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Keep in queue — review later
              <div className="absolute top-full left-4 border-4 border-transparent border-t-foreground" />
            </div>
          </div>
          <Button
            variant="primary"
            className="font-semibold shadow-md shadow-accent/20 rounded-xl px-6 h-11 bg-accent hover:opacity-90"
            isDisabled={submission.status === "Approved"}
            onPress={handleApproveAndNext}
          >
            {submission.status === "Approved" ? "Approved ✓" : "Approve & Next"}
            {submission.status !== "Approved" && <ChevronRight className="size-4 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Override Modal */}
      {activeOverride && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
          <div className="bg-surface border border-border/50 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold tracking-tight mb-1 text-foreground">Score Override</h3>
            <p className="text-xs text-muted mb-1">
              Adjusting: <span className="font-semibold text-foreground">{evaluations.find(e => e.id === activeOverride)?.title}</span>
            </p>
            <p className="text-xs text-muted mb-5">
              Original AI score:{" "}
              <span className="font-mono font-bold text-foreground">
                {evaluations.find(e => e.id === activeOverride)?.originalAiScore}/
                {evaluations.find(e => e.id === activeOverride)?.maxScore}
              </span>
            </p>

            {/* Quick reason chips */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Quick Reason</p>
              <div className="flex flex-wrap gap-2">
                {(["ocr", "missed", "interpretation", "benefit"] as OverrideRecord['reasonCode'][]).map(code => (
                  <button
                    key={code}
                    onClick={() => setOverrideReason(code)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      overrideReason === code
                        ? "bg-accent/10 border-accent/40 text-accent"
                        : "bg-default/20 border-border/40 text-muted hover:border-border hover:text-foreground"
                    }`}
                  >
                    {REASON_LABELS[code]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">New Score</label>
              <input
                type="number"
                min={0}
                max={evaluations.find(e => e.id === activeOverride)?.maxScore}
                className="w-full bg-default/10 border border-border/50 rounded-lg px-3 py-2 text-foreground font-mono outline-none focus:border-accent/50"
                value={overrideScore}
                onChange={e => setOverrideScore(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/40">
              <Button variant="ghost" size="sm" className="rounded-lg" onPress={() => { setActiveOverride(null); setOverrideReason(""); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={`rounded-lg font-medium px-4 ${overrideReason ? "bg-accent shadow-md shadow-accent/20" : "bg-default/50 opacity-50 cursor-not-allowed"}`}
                isDisabled={!overrideReason}
                onPress={handleSaveOverride}
              >
                Save Override
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Override saved toast */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[200] bg-success text-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 text-sm font-semibold"
          >
            <Check className="size-4" />
            Override logged to audit trail
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflow Nudge */}
      <AnimatePresence>
        {showWorkflowNudge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-accent text-white rounded-xl px-6 py-4 shadow-xl flex items-center gap-3"
          >
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="size-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">All submissions reviewed!</p>
              <p className="text-xs text-white/80">Next: Review flagged items or release feedback →</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
