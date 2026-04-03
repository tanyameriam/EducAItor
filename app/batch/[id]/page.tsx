"use client";

import { useGradingStore, Submission } from "@/lib/store/useGradingStore";
import { ThemeToggle } from "@/components/theme-toggle";
import { Chip, Button, Avatar, Input } from "@heroui/react";
import { ArrowLeft, Magnifier, TriangleExclamation, Shield, Check } from "@gravity-ui/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getWorstConfidence, confidenceOrder } from "@/lib/utils/confidence";
import { formatRelativeTime, isSessionStale } from "@/lib/utils/time";

type StatusFilter = "All" | "Evaluating" | "Needs Review" | "Approved";
type ConfidenceFilter = "All" | "Minimal" | "Weak" | "Partial" | "Strong";

export default function BatchView() {
  const params = useParams();
  const assignmentId = params.id as string;
  const store = useGradingStore();
  const router = useRouter();
  const { sessionState } = store;

  // Set current assignment when page loads
  useEffect(() => {
    if (assignmentId) {
      store.setCurrentAssignment(assignmentId);
    }
  }, [assignmentId]);

  const assignment = store.assignments[assignmentId];
  const submissions = store.getSubmissionsForAssignment(assignmentId);
  const course = assignment ? store.courses[assignment.courseId] : null;

  const [filterMode, setFilterMode] = useState<StatusFilter>("All");
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredSubs = submissions
    .filter(s => filterMode === "All" || s.status === filterMode)
    .filter(s => confidenceFilter === "All" || getWorstConfidence(s.criteria) === confidenceFilter)
    .filter(s =>
      !search ||
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.paperId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (confidenceFilter !== "All") return 0;
      return confidenceOrder[getWorstConfidence(a.criteria)] - confidenceOrder[getWorstConfidence(b.criteria)];
    });

  const strongUnreviewedCount = submissions.filter(
    s => getWorstConfidence(s.criteria) === "Strong" && s.status === "Needs Review"
  ).length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllStrong = () => {
    const ids = submissions
      .filter(s => getWorstConfidence(s.criteria) === "Strong" && s.status === "Needs Review")
      .map(s => s.id);
    setSelectedIds(new Set(ids));
  };

  const [showBulkNudge, setShowBulkNudge] = useState(false);

  const handleBulkApprove = () => {
    store.bulkApproveSubmissions(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBulkNudge(true);
    setTimeout(() => setShowBulkNudge(false), 4000);
  };

  const getConfidenceChipColor = (conf: string) => {
    switch (conf) {
      case "Strong": return "success";
      case "Partial": return "default";
      case "Weak": return "warning";
      case "Minimal": return "danger";
      default: return "default";
    }
  };

  const showSessionBanner = sessionState.savedAt && isSessionStale(sessionState.savedAt) && sessionState.lastOpenedSubmissionId;

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Assignment Not Found</h1>
          <p className="text-muted mb-4">The batch you are looking for does not exist.</p>
          <Link href="/assignments">
            <Button variant="primary">Back to Assignments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/10 blur-[120px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/assignments/${assignmentId}`}>
              <Button isIconOnly variant="ghost" size="sm" className="rounded-md">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {assignment.title}
              <span className="text-muted ml-2 text-sm font-normal">({course?.code || 'Unknown'})</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Avatar size="sm">
              <Avatar.Image src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg" />
              <Avatar.Fallback>SK</Avatar.Fallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Session Paused Banner */}
        {showSessionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-accent/5 border border-accent/20 rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Session Paused</p>
              <p className="text-xs text-muted mt-0.5">
                Last reviewed {formatRelativeTime(sessionState.savedAt!)} — pick up where you left off.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-accent text-white font-semibold rounded-lg shadow-md shadow-accent/20"
              onPress={() => router.push(`/grading/${sessionState.lastOpenedSubmissionId}`)}
            >
              Resume Session
            </Button>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Batch View</h1>
            <p className="mt-1 text-sm text-muted">
              {submissions.length} submissions in queue · {submissions.filter(s => s.status === "Approved").length} approved
            </p>
          </div>
          <div className="flex items-center gap-3">
            {strongUnreviewedCount > 0 && (
              <div className="relative group">
                <Button
                  size="sm"
                  className="bg-success/10 text-success border border-success/30 font-medium rounded-lg hover:bg-success/20 transition-colors"
                  onPress={selectAllStrong}
                >
                  Select All Strong ({strongUnreviewedCount})
                </Button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Select all Strong-confidence submissions for batch approval
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </div>
              </div>
            )}
            <div className="relative">
              <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
              <input
                placeholder="Search student or ID..."
                className="pl-8 pr-4 py-2 text-sm bg-surface border border-border/50 rounded-lg text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-colors w-56"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider w-16">Status:</span>
          <div className="flex flex-wrap gap-2">
            {(["All", "Needs Review", "Evaluating", "Approved"] as StatusFilter[]).map(mode => (
              <Button
                key={mode}
                variant={filterMode === mode ? "primary" : "ghost"}
                size="sm"
                className={`rounded-lg font-medium px-4 ${
                  filterMode === mode
                    ? mode === "Needs Review" ? "bg-warning text-warning-foreground shadow-md shadow-warning/20"
                    : mode === "Approved" ? "bg-success text-success-foreground shadow-md shadow-success/20"
                    : mode === "Evaluating" ? "bg-default text-foreground shadow-sm"
                    : "bg-accent shadow-md shadow-accent/20"
                    : "bg-surface border border-border/50 text-muted hover:text-foreground"
                }`}
                onPress={() => setFilterMode(mode)}
              >
                {mode === "Needs Review" && <TriangleExclamation className="size-3 mr-1" />}
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Confidence Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider w-16">Confidence:</span>
          <div className="flex flex-wrap gap-2">
            {(["All", "Minimal", "Weak", "Partial", "Strong"] as ConfidenceFilter[]).map(level => (
              <button
                key={level}
                onClick={() => setConfidenceFilter(level)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  confidenceFilter === level
                    ? level === "Minimal" ? "bg-danger/10 border-danger/30 text-danger"
                    : level === "Weak" ? "bg-warning/10 border-warning/30 text-warning-600"
                    : level === "Partial" ? "bg-default/40 border-border text-foreground"
                    : level === "Strong" ? "bg-success/10 border-success/30 text-success"
                    : "bg-accent/10 border-accent/30 text-accent"
                    : "bg-surface border-border/40 text-muted hover:border-border hover:text-foreground"
                }`}
              >
                {level !== "All" && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    level === "Minimal" ? "bg-danger" :
                    level === "Weak" ? "bg-warning" :
                    level === "Partial" ? "bg-default/60" : "bg-success"
                  }`} />
                )}
                {level}
              </button>
            ))}
            {confidenceFilter !== "All" && (
              <span className="text-xs text-muted self-center ml-1">
                {filteredSubs.length} result{filteredSubs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface/50 border border-border/50 rounded-xl backdrop-blur-md shadow-sm overflow-x-auto">
          <table className="min-w-full w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface/90 backdrop-blur-md z-10 border-b border-border/50">
              <tr>
                <th className="px-4 py-4 border-b border-border/40 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-border/50 accent-accent"
                    checked={selectedIds.size === filteredSubs.filter(s => s.status !== "Approved").length && filteredSubs.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredSubs.filter(s => s.status !== "Approved").map(s => s.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 border-b border-border/40">Student / Paper ID</th>
                <th className="px-6 py-4 border-b border-border/40">Status</th>
                <th className="px-6 py-4 border-b border-border/40">Final Score</th>
                <th className="px-6 py-4 border-b border-border/40">Confidence</th>
                <th className="px-6 py-4 border-b border-border/40">Flags</th>
                <th className="px-6 py-4 border-b border-border/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredSubs.map((sub) => {
                const worstConf = getWorstConfidence(sub.criteria);
                const isSelected = selectedIds.has(sub.id);
                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-default/10 transition-colors group ${isSelected ? "bg-accent/5" : ""}`}
                  >
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-border/50 accent-accent"
                        checked={isSelected}
                        disabled={sub.status === "Approved"}
                        onChange={() => toggleSelect(sub.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/80 to-accent text-white font-semibold text-xs shrink-0">
                          {sub.studentName.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{sub.studentName}</p>
                          <p className="text-xs text-muted font-mono">{sub.paperId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={sub.status === "Approved" ? "success" : sub.status === "Needs Review" ? "warning" : "default"}
                        className="font-medium text-xs border-none"
                      >
                        {sub.status}
                      </Chip>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-mono font-bold text-foreground bg-default/40 inline-flex px-2 py-0.5 rounded-md">
                        {sub.criteria.reduce((acc, c) => acc + c.score, 0)}
                        <span className="text-muted/60 font-normal">/{sub.criteria.reduce((acc, c) => acc + c.maxScore, 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={getConfidenceChipColor(worstConf) as any}
                        className="text-[10px] uppercase font-bold tracking-wider px-1 h-5 border-none"
                      >
                        {worstConf}
                      </Chip>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-1 items-center flex-wrap">
                        {sub.antiCheatingFlags.flagged && (
                          <Chip size="sm" color="danger" variant="soft" className="border-none text-[10px] uppercase font-bold tracking-wider px-1 h-5">
                            <Shield className="size-3 mr-0.5 inline" />
                            {sub.antiCheatingFlags.similarityScore}% Match
                          </Chip>
                        )}
                        {sub.appeal?.status === "Pending" && (
                          <Chip size="sm" color="warning" variant="soft" className="border-none text-[10px] uppercase font-bold tracking-wider px-1 h-5">
                            Appeal
                          </Chip>
                        )}
                        {sub.feedback?.releaseSchedule?.type === 'scheduled' && (
                          <Chip size="sm" color="default" variant="soft" className="border-none text-[10px] uppercase font-bold tracking-wider px-1 h-5">
                            Scheduled
                          </Chip>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Link href={`/grading/${sub.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-surface border border-border/50 shadow-sm hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all"
                        >
                          Review <span className="ml-1">→</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted text-sm">
                    No submissions match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Bulk Approve Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-surface border border-border/60 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-sm">{selectedIds.size}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">submissions selected</span>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <Button
              className="bg-success text-white font-semibold shadow-md shadow-success/20 rounded-xl px-5"
              onPress={handleBulkApprove}
            >
              Approve All ({selectedIds.size})
            </Button>
            <Button
              variant="ghost"
              className="text-muted font-medium hover:text-foreground"
              onPress={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Approval Success Nudge */}
      <AnimatePresence>
        {showBulkNudge && (
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
              <p className="font-semibold text-sm">Batch approved!</p>
              <p className="text-xs text-white/80">Next: Review remaining submissions with flags or appeals →</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
