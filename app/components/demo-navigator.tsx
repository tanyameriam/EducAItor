"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";

const SCENARIOS = [
  {
    group: "Happy Path",
    color: "success" as const,
    items: [
      { id: "S1", label: "Standard Batch — Bulk Approve Strong", desc: "Arjun Mehta: 'Describe a Technical Process' essay, all 4 criteria Strong confidence", href: "/batch/TE-MECH-ESSAY", highlight: "Open batch → Select All Strong Confidence → Approve All" },
      { id: "S6", label: "Split-Screen OCR Toggle", desc: "Kavitha Nair: Lab Observation Notes — switch Scan ↔ OCR to inspect smudged Section 4", href: "/grading/sub-2", highlight: "Click 'Original Scan' vs 'OCR Text' toggle — note smudge warning in Section 4" },
      { id: "S15b", label: "Feedback Release Scheduling", desc: "Arjun Mehta: Essay feedback drafted — schedule release after all sections are graded", href: "/feedback", highlight: "Select submission → Click Release Feedback → Choose 'Schedule Release'" },
    ],
  },
  {
    group: "Error & Recovery",
    color: "warning" as const,
    items: [
      { id: "S3", label: "OCR Misread Override", desc: "Kavitha Nair: Observations section OCR failed due to smudge near binding margin — Weak confidence on c1 and c3", href: "/grading/sub-2", highlight: "Override Grammar (c1) → select 'OCR / Handwriting Illegible' → adjust score → save" },
      { id: "S4", label: "Strong Confidence, Needs Judgment", desc: "Deepak Raj: AI flagged grammar error but student's Indian English usage may be formally correct", href: "/grading/sub-3", highlight: "Review Grammar evidence panel — AI flagged 'are requested'; consider Benefit of the Doubt" },
      { id: "S5", label: "Session Resume", desc: "Dashboard shows last session was on Arjun's essay — stale session banner triggered", href: "/assignments", highlight: "Assignments Dashboard → 'Session Resumed' banner → click Resume" },
    ],
  },
  {
    group: "Edge Cases",
    color: "danger" as const,
    items: [
      { id: "S12", label: "Pending Appeal — Needs Instructor Review", desc: "Deepak Raj: Student disputes Grammar score using Indian English concord argument — AI triaged as 'Needs Instructor Review'", href: "/appeals", highlight: "AI Triage shows 'Needs Instructor Review' — read student argument → Uphold or Reject" },
      { id: "S11", label: "Vocabulary Pattern — Cohort Weak Spot", desc: "Analytics: 41 students across TE-MECH sections show nominal/passive patterns affecting Vocabulary scores", href: "/analytics", highlight: "Scroll to Pattern Detection panel → 'Vocabulary Weakness Pattern' card" },
      { id: "S2", label: "Confidence Triage — Weak & Partial", desc: "Kavitha Nair: 2 criteria at Weak confidence due to OCR failure — filter batch to find flagged submissions", href: "/batch/TE-IT-REPORT", highlight: "Filter by 'Weak' confidence → Kavitha's submission appears → click Review" },
    ],
  },
  {
    group: "Phase 6 / 8 — Analytics & Audit",
    color: "default" as const,
    items: [
      { id: "P6", label: "Rubric Health Monitor", desc: "Tone & Format criterion has 45% override rate — AI suggests rubric reword with examples", href: "/analytics", highlight: "Scroll to 'Rubric Health Monitor' → high override rate card → click 'Apply Rubric Update'" },
      { id: "P8a", label: "Evaluation Replay — Grammar Drift", desc: "AI scored Grammar 4/5 for Deepak — after instructor override to 5/5, see drift in replay", href: "/audit", highlight: "Click 'Launch Replay Engine' → Deepak Raj — Grammar criterion shows drift 4 → 5" },
      { id: "P8b", label: "Linguistic Bias — Civil Dept Gap", desc: "Civil Dept students scoring 1.8% lower on Vocabulary — cohort effect from less formal English exposure", href: "/audit", highlight: "Click 'Linguistic Bias Index' card → view Civil vs IT/Mech cohort variance" },
    ],
  },
];

export function DemoNavigator() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-full shadow-xl font-bold text-sm transition-colors border ${
          open
            ? "bg-foreground text-background border-foreground/20"
            : "bg-accent text-white border-accent/30 shadow-accent/30"
        }`}
      >
        {open ? "✕" : "▶ Demo Scenarios"}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed bottom-20 right-6 z-[200] w-[380px] max-h-[80vh] overflow-y-auto bg-surface border border-border/60 rounded-2xl shadow-2xl"
          >
            <div className="sticky top-0 bg-surface/95 backdrop-blur-md p-5 border-b border-border/40 z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="size-2 rounded-full bg-accent animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-accent">Demo Navigator</p>
              </div>
              <h3 className="text-base font-bold text-foreground">Scenario Guide</h3>
              <p className="text-xs text-muted mt-0.5">Click any scenario to navigate directly.</p>
            </div>

            <div className="p-4 space-y-6">
              {SCENARIOS.map((group) => (
                <div key={group.group}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      group.color === 'success' ? 'bg-success' :
                      group.color === 'warning' ? 'bg-warning' :
                      group.color === 'danger' ? 'bg-danger' : 'bg-muted'
                    }`} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{group.group}</p>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { router.push(item.href); setOpen(false); }}
                        className="w-full text-left p-3 rounded-xl border border-border/40 bg-background hover:bg-default/30 hover:border-border/60 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-foreground leading-tight">{item.label}</p>
                          <Chip size="sm" variant="soft" color={group.color} className="h-4 text-[9px] font-bold shrink-0 border-none px-1">
                            {item.id}
                          </Chip>
                        </div>
                        <p className="text-[10px] text-muted mb-2 leading-relaxed">{item.desc}</p>
                        <div className="flex items-center gap-1.5 bg-default/30 rounded-lg px-2 py-1.5">
                          <div className="size-1.5 rounded-full bg-accent/60 shrink-0" />
                          <p className="text-[9px] text-muted/80 leading-tight font-mono">{item.highlight}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md p-4 border-t border-border/40">
              <p className="text-[10px] text-muted text-center">
                EducAItors — Module 2 Demo · Sub-team B
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
