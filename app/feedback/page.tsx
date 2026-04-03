"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, Avatar, Chip, Switch } from "@heroui/react";
import { ArrowLeft, Check, ListUl, Pencil, PaperPlane, Envelope, Clock } from "@gravity-ui/icons";
import { useGradingStore, ReleaseSchedule } from "@/lib/store/useGradingStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackEditor() {
  const store = useGradingStore();
  const router = useRouter();
  const submissions = store.getSubmissionList().filter(s => s.feedback);

  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || "");
  const [search, setSearch] = useState("");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scheduleType, setScheduleType] = useState<ReleaseSchedule['type']>('immediate');
  const [scheduledAt, setScheduledAt] = useState("2026-04-07T09:00");

  const selectedSub = store.submissions[selectedSubId];
  const feedback = selectedSub?.feedback;

  const filteredSubs = submissions.filter(s =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.paperId.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = () => {
    if (scheduleType === 'immediate') {
      store.releaseFeedback(selectedSubId);
    } else {
      store.scheduleFeedbackRelease(selectedSubId, {
        type: scheduleType,
        scheduledAt: scheduleType === 'scheduled' ? scheduledAt : undefined,
      });
    }
    setIsPublishModalOpen(false);
  };

  const getReleaseChip = (sub: typeof selectedSub) => {
    if (!sub?.feedback) return null;
    const { isReleased, releaseSchedule } = sub.feedback;
    if (isReleased) return { label: "Released", color: "success" as const };
    if (releaseSchedule?.type === 'scheduled') return { label: "Scheduled", color: "accent" as const };
    if (releaseSchedule?.type === 'manual') return { label: "On Hold", color: "default" as const };
    return { label: "Draft", color: "warning" as const };
  };

  if (!submissions.length) return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background">
      <motion.div animate={{ scale: [0.8, 1.1, 1] }} className="size-24 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mb-6">
        <Check className="size-12" />
      </motion.div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">All Caught Up!</h2>
      <p className="text-muted mt-2 text-sm">No feedback pending review.</p>
      <Link href="/" className="mt-8">
        <Button className="border border-border/40 hover:bg-surface font-medium bg-default/40">Return to Dashboard</Button>
      </Link>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden relative z-0">
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-shrink-0 border-r border-border/40 bg-surface/30 backdrop-blur-md flex flex-col h-full z-10 overflow-hidden"
          >
            <div className="w-[380px] flex flex-col h-full">
              <div className="p-6 border-b border-border/40">
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">Feedback Batch</h2>
                <p className="text-sm text-muted">{submissions.length} students pending review</p>
                <div className="mt-5">
                  <input
                    placeholder="Search students..."
                    className="w-full bg-surface border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent/40 transition-colors"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                <AnimatePresence>
                  {filteredSubs.map((sub) => {
                    const chip = getReleaseChip(sub);
                    return (
                      <motion.button
                        key={sub.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`w-full text-left p-4 rounded-xl transition-colors duration-200 border relative overflow-hidden ${
                          selectedSubId === sub.id
                            ? "bg-accent/10 border-accent/30 shadow-sm shadow-accent/5"
                            : "bg-surface hover:bg-default/40 border-transparent hover:border-border/30"
                        }`}
                      >
                        {selectedSubId === sub.id && (
                          <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />
                        )}
                        <div className="flex justify-between items-start mb-1.5">
                          <p className={`font-semibold text-sm ${selectedSubId === sub.id ? "text-accent" : "text-foreground"}`}>
                            {sub.studentName}
                          </p>
                          <div className="flex gap-1">
                            {chip && (
                              <Chip size="sm" variant="soft" color={chip.color} className="h-5 text-[10px] uppercase font-bold tracking-wider px-1 border-none">
                                {chip.label}
                              </Chip>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted font-mono mb-1">{sub.paperId}</p>
                        {sub.feedback?.releaseSchedule?.type === 'scheduled' && sub.feedback.releaseSchedule.scheduledAt && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="size-3 text-accent" />
                            <p className="text-[10px] text-accent font-medium">{sub.feedback.releaseSchedule.scheduledAt}</p>
                          </div>
                        )}
                        {sub.feedback?.tone && (
                          <p className="text-[10px] text-muted">Tone: {sub.feedback.tone}</p>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-background/50 z-10">
        <header className="h-16 border-b border-border/40 backdrop-blur-xl px-4 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Button isIconOnly variant="ghost" size="sm" onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground mr-2">
              {isSidebarOpen ? <ArrowLeft className="size-4" /> : <ListUl className="size-4" />}
            </Button>
            <Avatar size="sm" className="bg-gradient-to-br from-accent/80 to-accent text-white font-semibold text-xs">
              <Avatar.Fallback>{selectedSub?.studentName.charAt(0) || "?"}</Avatar.Fallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">{selectedSub?.studentName}</h1>
              <p className="text-xs text-muted mt-1">{selectedSub?.paperId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              size="sm"
              className="bg-surface border border-border/50 text-foreground font-medium rounded-lg"
              onPress={() => router.push(`/grading/${selectedSubId}`)}
            >
              View Submission
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-accent font-medium rounded-lg shadow-md shadow-accent/20"
              onPress={() => { setScheduleType('immediate'); setIsPublishModalOpen(true); }}
              isDisabled={selectedSub?.feedback?.isReleased}
            >
              <PaperPlane className="size-3 mr-1.5" />
              {selectedSub?.feedback?.isReleased ? "Released" : "Release Feedback"}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {feedback ? (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">AI-Generated Feedback</h2>
                  <p className="text-sm text-muted mt-1">Review and refine before releasing to the student.</p>
                </div>
                <div className="bg-surface border border-border/50 p-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider px-2">Tone:</span>
                  <select
                    className="bg-default/40 border border-transparent hover:border-border/50 focus:border-accent rounded text-sm py-1 pl-2 pr-6 appearance-none outline-none transition-colors cursor-pointer"
                    value={feedback.tone}
                    onChange={e => store.updateFeedbackTone(selectedSubId, e.target.value as any)}
                  >
                    <option value="Constructive">Constructive</option>
                    <option value="Direct">Direct</option>
                    <option value="Encouraging">Encouraging</option>
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                {[
                  { key: "strengths" as const, label: "Strengths to Highlight", icon: <Check className="size-3" />, color: "bg-success/20 text-success" },
                  { key: "gaps" as const, label: "Identified Gaps", icon: <ListUl className="size-3" />, color: "bg-warning/20 text-warning" },
                  { key: "improvements" as const, label: "Actionable Improvements", icon: <Envelope className="size-3" />, color: "bg-accent/20 text-accent" },
                ].map(({ key, label, icon, color }) => (
                  <section key={key}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`size-6 rounded-full ${color} flex items-center justify-center`}>{icon}</div>
                      <h3 className="text-lg font-bold">{label}</h3>
                    </div>
                    <div className="space-y-3">
                      {feedback[key].map((text, idx) => (
                        <div key={idx} className="relative group">
                          <textarea
                            className="w-full bg-surface/60 border border-border/40 hover:border-accent/40 focus:border-accent focus:ring-1 focus:ring-accent rounded-xl p-4 text-sm text-foreground resize-none transition-all outline-none leading-relaxed"
                            rows={2}
                            value={text}
                            onChange={e => store.updateFeedbackText(selectedSubId, key, idx, e.target.value)}
                          />
                          <Pencil className="absolute right-4 top-4 size-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                    <div className="my-8 opacity-50 block w-full h-[1px] bg-border/40" />
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted">Select a submission to edit feedback.</div>
          )}
        </div>
      </div>

      {/* Release Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
          <div className="bg-surface border border-border/50 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold tracking-tight mb-1 text-foreground">Release Feedback</h3>
            <p className="text-xs text-muted leading-relaxed mb-5">
              Choose when{" "}
              <span className="font-semibold text-foreground">{selectedSub?.studentName}</span>
              's feedback becomes visible in their student portal.
            </p>

            <div className="space-y-2 mb-5">
              {[
                { value: "immediate" as const, label: "Publish Now", desc: "Delivers immediately to the student portal" },
                { value: "scheduled" as const, label: "Schedule Release", desc: "Set a specific date and time" },
                { value: "manual" as const, label: "Hold for Now", desc: "Save as approved — release manually later" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setScheduleType(opt.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    scheduleType === opt.value
                      ? "bg-accent/10 border-accent/30"
                      : "border-border/40 bg-default/10 hover:bg-default/20"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {scheduleType === "scheduled" && (
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">Release Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full bg-default/10 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-accent/50"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button variant="ghost" size="sm" className="rounded-lg" onPress={() => setIsPublishModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                className="rounded-lg font-medium px-4 bg-accent shadow-md shadow-accent/20"
                onPress={handlePublish}
              >
                {scheduleType === "immediate" ? "Publish Now" : scheduleType === "scheduled" ? "Schedule" : "Hold Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
