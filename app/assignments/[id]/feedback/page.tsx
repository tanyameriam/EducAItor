"use client";

import { useState, useEffect } from "react";
import { Button, Chip } from "@heroui/react";
import { Check, Clock, PaperPlane, Pencil, ChevronLeft, ChevronRight, Eye, Sparkles, ListUl, FileText } from "@gravity-ui/icons";
import { useGradingStore, ReleaseSchedule, Feedback } from "@/lib/store/useGradingStore";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FeedbackSetupPanel,
  RefinementPanel,
  SubmissionViewer,
  RubricPanel,
  FeedbackEditor,
} from "@/app/components/feedback-studio";

// Mobile tab types
type MobileTab = 'submissions' | 'paper' | 'rubric' | 'feedback';

export default function AssignmentFeedback() {
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
  
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<MobileTab>('submissions');
  const [showSetup, setShowSetup] = useState(false);
  const [showRefinement, setShowRefinement] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [scheduleType, setScheduleType] = useState<ReleaseSchedule['type']>('immediate');
  const [isPublishing, setIsPublishing] = useState(false);

  // Initialize selected submission
  useEffect(() => {
    if (submissions.length > 0 && !selectedSubId) {
      const needsFeedback = submissions.find(s => !s.feedback);
      setSelectedSubId(needsFeedback?.id || submissions[0].id);
    }
  }, [submissions, selectedSubId]);

  const selectedSub = store.submissions[selectedSubId];
  const feedback = selectedSub?.feedback;
  const variants = store.getRefinementVariants();

  const getStatusChip = (sub: typeof selectedSub) => {
    if (!sub) return null;
    if (sub.feedbackGenerationState === 'approved') return { label: "Approved", color: "success" as const };
    if (sub.feedback?.isReleased) return { label: "Released", color: "success" as const };
    if (sub.feedback) return { label: "Draft", color: "warning" as const };
    if (sub.status === "Approved") return { label: "Ready for Feedback", color: "accent" as const };
    return { label: "Needs Grading", color: "default" as const };
  };

  const handleStartGeneration = (params: Parameters<typeof store.startFeedbackGeneration>[1]) => {
    store.startFeedbackGeneration(selectedSubId, params);
    // Simulate generation delay
    setTimeout(() => {
      store.generateFeedback(selectedSubId);
      setShowSetup(false);
    }, 1500);
  };

  const handleApplyRefinement = () => {
    if (selectedVariantId) {
      store.applyRefinement(selectedSubId, selectedVariantId);
      setShowRefinement(false);
      setSelectedVariantId(null);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      if (scheduleType === 'immediate') {
        store.releaseFeedback(selectedSubId);
      } else {
        store.scheduleFeedbackRelease(selectedSubId, {
          type: scheduleType,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      setIsPublishing(false);
    }, 500);
  };

  // Handle feedback editor updates
  const handleUpdateFeedbackItem = (type: 'strength' | 'gap' | 'improvement' | 'suggestion', index: number, text: string) => {
    const feedbackType = type === 'strength' ? 'strengths' : 
                        type === 'gap' ? 'gaps' : 
                        type === 'improvement' ? 'improvements' : 'suggestions';
    store.updateFeedbackText(selectedSubId, feedbackType, index, text);
  };

  const handleAddFeedbackItem = (type: 'strength' | 'gap' | 'improvement' | 'suggestion') => {
    // This would need to be added to the store - for now we'll just update local state
    // In a full implementation, add an action to the store
    const feedbackType = type === 'strength' ? 'strengths' : 
                        type === 'gap' ? 'gaps' : 
                        type === 'improvement' ? 'improvements' : 'suggestions';
    const currentItems = feedback?.[feedbackType] || [];
    store.updateFeedbackText(selectedSubId, feedbackType, currentItems.length, 'New item...');
  };

  const handleRemoveFeedbackItem = (type: 'strength' | 'gap' | 'improvement' | 'suggestion', index: number) => {
    // This would need a remove action in the store
    // For now, just set to empty string
    const feedbackType = type === 'strength' ? 'strengths' : 
                        type === 'gap' ? 'gaps' : 
                        type === 'improvement' ? 'improvements' : 'suggestions';
    store.updateFeedbackText(selectedSubId, feedbackType, index, '');
  };

  const handleLinkEvidence = (feedbackType: string, feedbackIndex: number, highlightId: string) => {
    store.linkEvidence(selectedSubId, {
      highlightId,
      feedbackType: feedbackType as 'strength' | 'gap' | 'improvement' | 'suggestion',
      feedbackIndex,
      rationale: 'Evidence from submission',
    });
  };

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex w-72 border-r border-border/40 bg-surface/30 flex-col">
        <div className="p-4 border-b border-border/40">
          <h3 className="font-semibold text-foreground">Submissions</h3>
          <p className="text-xs text-muted">{submissions.length} total</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {submissions.map((sub) => {
            const chip = getStatusChip(sub);
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubId(sub.id);
                  setMobileTab('paper');
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors touch-target-min ${
                  selectedSubId === sub.id 
                    ? "bg-accent/10 border border-accent/30" 
                    : "hover:bg-default/40 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-foreground">{sub.studentName}</p>
                    <p className="text-xs text-muted font-mono">{sub.paperId}</p>
                  </div>
                  {chip && (
                    <Chip size="sm" variant="soft" color={chip.color} className="text-[10px] border-none h-5">
                      {chip.label}
                    </Chip>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {selectedSub ? (
          <>
            {/* Desktop: Three-Column Layout when feedback exists */}
            <div className="hidden lg:flex flex-1">
              {feedback ? (
                <>
                  {/* Column 1: Submission Viewer */}
                  <div className="w-1/3 border-r border-border/40 flex flex-col">
                    <div className="p-3 border-b border-border/40 flex justify-between items-center">
                      <h4 className="font-semibold text-sm text-foreground">Submission</h4>
                      <span className="text-xs text-muted">{selectedSub.paperId}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <SubmissionViewer
                        content={selectedSub.ocrContent}
                        highlights={feedback.highlights || []}
                        selectedHighlightId={selectedHighlightId}
                        onHighlightClick={setSelectedHighlightId}
                        onTextSelect={(start, end, text) => {
                          console.log('Text selected:', { start, end, text });
                        }}
                      />
                    </div>
                  </div>

                  {/* Column 2: Rubric Panel */}
                  <div className="w-1/4 border-r border-border/40 flex flex-col">
                    <div className="p-3 border-b border-border/40">
                      <h4 className="font-semibold text-sm text-foreground">Rubric</h4>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <RubricPanel
                        rubric={assignment.rubricSnapshot}
                        criteria={selectedSub.criteria}
                      />
                    </div>
                  </div>

                  {/* Column 3: Feedback Editor */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-3 border-b border-border/40 flex justify-between items-center">
                      <h4 className="font-semibold text-sm text-foreground">Feedback Editor</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRefinement(true)}
                          className="text-xs px-3 py-1.5 rounded border border-border/50 hover:border-accent text-foreground flex items-center gap-1 touch-target-min"
                        >
                          <Sparkles className="size-3" />
                          Refine
                        </button>
                        <button
                          onClick={() => setShowPreview(true)}
                          className="text-xs px-3 py-1.5 rounded border border-border/50 hover:border-accent text-foreground flex items-center gap-1 touch-target-min"
                        >
                          <Eye className="size-3" />
                          Preview
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <FeedbackEditor
                        feedback={feedback}
                        highlights={feedback.highlights || []}
                        linkedEvidence={feedback.linkedEvidence || []}
                        onUpdateStrength={(idx, text) => handleUpdateFeedbackItem('strength', idx, text)}
                        onUpdateGap={(idx, text) => handleUpdateFeedbackItem('gap', idx, text)}
                        onUpdateImprovement={(idx, text) => handleUpdateFeedbackItem('improvement', idx, text)}
                        onUpdateSuggestion={(idx, text) => handleUpdateFeedbackItem('suggestion', idx, text)}
                        onUpdateOverallSummary={(text) => store.updateOverallSummary(selectedSubId, text)}
                        onUpdatePersonalNote={(text) => store.updatePersonalNote(selectedSubId, text)}
                        onAddItem={handleAddFeedbackItem}
                        onRemoveItem={handleRemoveFeedbackItem}
                        onLinkEvidence={handleLinkEvidence}
                        selectedHighlightId={selectedHighlightId}
                      />
                    </div>
                    
                    {/* Bottom Action Bar */}
                    <div className="p-3 border-t border-border/40 bg-surface/50">
                      <div className="flex gap-3">
                        <select
                          value={scheduleType}
                          onChange={(e) => setScheduleType(e.target.value as ReleaseSchedule['type'])}
                          className="px-3 py-2 rounded-lg border border-border/50 text-sm bg-surface"
                        >
                          <option value="immediate">Release Now</option>
                          <option value="scheduled">Schedule</option>
                          <option value="manual">Hold</option>
                        </select>
                        <Button
                          onPress={() => store.approveFeedback(selectedSubId)}
                          variant="secondary"
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          onPress={handlePublish}
                          isDisabled={isPublishing || selectedSub.feedbackGenerationState !== 'approved'}
                          className="flex-1 bg-accent text-white font-semibold"
                        >
                          {isPublishing ? 'Publishing...' : 'Publish'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Setup State - No feedback yet */
                <div className="flex-1 flex items-center justify-center p-8">
                  {showSetup ? (
                    <FeedbackSetupPanel
                      onStartGeneration={handleStartGeneration}
                      onCancel={() => setShowSetup(false)}
                    />
                  ) : (
                    <div className="text-center max-w-md">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="size-16 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4 mx-auto"
                      >
                        <Sparkles className="size-8" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Generate Feedback for {selectedSub.studentName}
                      </h3>
                      <p className="text-muted mb-6">
                        AI will analyze the rubric scores and submission content to create personalized feedback.
                      </p>
                      <Button
                        onPress={() => setShowSetup(true)}
                        className="bg-accent text-white font-semibold px-6"
                      >
                        Configure & Generate
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: Tab-Based Layout */}
            <div className="flex-1 flex flex-col lg:hidden">
              {feedback ? (
                <>
                  {/* Mobile Tab Bar */}
                  <div className="flex border-b border-border/40 bg-surface/50">
                    {[
                      { id: 'submissions', label: 'Students', icon: ListUl },
                      { id: 'paper', label: 'Paper', icon: FileText },
                      { id: 'rubric', label: 'Rubric', icon: FileText },
                      { id: 'feedback', label: 'Feedback', icon: Eye },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setMobileTab(tab.id as MobileTab)}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 touch-target-min transition-colors
                            ${mobileTab === tab.id 
                              ? 'text-accent bg-accent/5' 
                              : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {mobileTab === tab.id && (
                            <span className="absolute top-0 w-full h-0.5 bg-accent" />
                          )}
                          <Icon className="size-4" />
                          <span className="text-[10px] font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Tab Content */}
                  <div className="flex-1 overflow-hidden">
                    {/* Submissions Tab */}
                    {mobileTab === 'submissions' && (
                      <div className="h-full overflow-y-auto p-2 space-y-1">
                        {submissions.map((sub) => {
                          const chip = getStatusChip(sub);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setSelectedSubId(sub.id);
                                setMobileTab('paper');
                              }}
                              className={`w-full text-left p-3 rounded-lg transition-colors touch-target-min ${
                                selectedSubId === sub.id 
                                  ? "bg-accent/10 border border-accent/30" 
                                  : "hover:bg-default/40 border border-transparent"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm text-foreground">{sub.studentName}</p>
                                  <p className="text-xs text-muted font-mono">{sub.paperId}</p>
                                </div>
                                {chip && (
                                  <Chip size="sm" variant="soft" color={chip.color} className="text-[10px] border-none h-5">
                                    {chip.label}
                                  </Chip>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Paper Tab */}
                    {mobileTab === 'paper' && (
                      <div className="h-full overflow-y-auto">
                        <div className="p-3 border-b border-border/40 flex justify-between items-center">
                          <h4 className="font-semibold text-sm text-foreground">{selectedSub.studentName}</h4>
                          <span className="text-xs text-muted">{selectedSub.paperId}</span>
                        </div>
                        <div className="p-4">
                          <SubmissionViewer
                            content={selectedSub.ocrContent}
                            highlights={feedback.highlights || []}
                            selectedHighlightId={selectedHighlightId}
                            onHighlightClick={setSelectedHighlightId}
                            onTextSelect={(start, end, text) => {
                              console.log('Text selected:', { start, end, text });
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rubric Tab */}
                    {mobileTab === 'rubric' && (
                      <div className="h-full overflow-y-auto">
                        <div className="p-3 border-b border-border/40">
                          <h4 className="font-semibold text-sm text-foreground">Rubric</h4>
                        </div>
                        <div className="p-4">
                          <RubricPanel
                            rubric={assignment.rubricSnapshot}
                            criteria={selectedSub.criteria}
                          />
                        </div>
                      </div>
                    )}

                    {/* Feedback Tab */}
                    {mobileTab === 'feedback' && (
                      <div className="h-full flex flex-col">
                        <div className="p-3 border-b border-border/40 flex justify-between items-center">
                          <h4 className="font-semibold text-sm text-foreground">Feedback</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowRefinement(true)}
                              className="text-xs px-3 py-1.5 rounded border border-border/50 hover:border-accent text-foreground flex items-center gap-1 touch-target-min"
                            >
                              <Sparkles className="size-3" />
                            </button>
                            <button
                              onClick={() => setShowPreview(true)}
                              className="text-xs px-3 py-1.5 rounded border border-border/50 hover:border-accent text-foreground flex items-center gap-1 touch-target-min"
                            >
                              <Eye className="size-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <FeedbackEditor
                            feedback={feedback}
                            highlights={feedback.highlights || []}
                            linkedEvidence={feedback.linkedEvidence || []}
                            onUpdateStrength={(idx, text) => handleUpdateFeedbackItem('strength', idx, text)}
                            onUpdateGap={(idx, text) => handleUpdateFeedbackItem('gap', idx, text)}
                            onUpdateImprovement={(idx, text) => handleUpdateFeedbackItem('improvement', idx, text)}
                            onUpdateSuggestion={(idx, text) => handleUpdateFeedbackItem('suggestion', idx, text)}
                            onUpdateOverallSummary={(text) => store.updateOverallSummary(selectedSubId, text)}
                            onUpdatePersonalNote={(text) => store.updatePersonalNote(selectedSubId, text)}
                            onAddItem={handleAddFeedbackItem}
                            onRemoveItem={handleRemoveFeedbackItem}
                            onLinkEvidence={handleLinkEvidence}
                            selectedHighlightId={selectedHighlightId}
                          />
                        </div>
                        
                        {/* Mobile Action Bar - Fixed above bottom nav */}
                        <div className="p-3 border-t border-border/40 bg-surface/50">
                          <div className="flex gap-2">
                            <select
                              value={scheduleType}
                              onChange={(e) => setScheduleType(e.target.value as ReleaseSchedule['type'])}
                              className="px-3 py-2 rounded-lg border border-border/50 text-sm bg-surface flex-1"
                            >
                              <option value="immediate">Release Now</option>
                              <option value="scheduled">Schedule</option>
                              <option value="manual">Hold</option>
                            </select>
                            <Button
                              onPress={() => store.approveFeedback(selectedSubId)}
                              variant="secondary"
                              className="flex-1 text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              onPress={handlePublish}
                              isDisabled={isPublishing || selectedSub.feedbackGenerationState !== 'approved'}
                              className="flex-1 bg-accent text-white font-semibold text-xs"
                            >
                              {isPublishing ? '...' : 'Publish'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Mobile Setup State - No feedback yet */
                <div className="flex-1 flex items-center justify-center p-8">
                  {showSetup ? (
                    <FeedbackSetupPanel
                      onStartGeneration={handleStartGeneration}
                      onCancel={() => setShowSetup(false)}
                    />
                  ) : (
                    <div className="text-center max-w-md">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="size-16 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4 mx-auto"
                      >
                        <Sparkles className="size-8" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        Generate Feedback for {selectedSub.studentName}
                      </h3>
                      <p className="text-muted mb-6 text-sm">
                        AI will analyze the rubric scores and submission content to create personalized feedback.
                      </p>
                      <Button
                        onPress={() => setShowSetup(true)}
                        className="bg-accent text-white font-semibold px-6"
                      >
                        Configure & Generate
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted">Select a submission to view feedback</p>
          </div>
        )}
      </div>

      {/* Refinement Modal */}
      <AnimatePresence>
        {showRefinement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowRefinement(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-xl shadow-xl w-full max-w-md"
            >
              <RefinementPanel
                variants={variants}
                selectedVariantId={selectedVariantId}
                onSelectVariant={setSelectedVariantId}
                onApply={handleApplyRefinement}
                onCancel={() => setShowRefinement(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border/40 flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Student Preview</h3>
                <button onClick={() => setShowPreview(false)} className="text-muted hover:text-foreground">
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {feedback.strengths.length > 0 && (
                  <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                    <h4 className="font-semibold text-success mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.gaps.length > 0 && (
                  <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                    <h4 className="font-semibold text-warning-600 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {feedback.gaps.map((g, i) => (
                        <li key={i} className="text-sm text-foreground">• {g}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.improvements.length > 0 && (
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <h4 className="font-semibold text-accent mb-2">Action Items</h4>
                    <ul className="space-y-1">
                      {feedback.improvements.map((imp, i) => (
                        <li key={i} className="text-sm text-foreground">• {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.overallSummary && (
                  <div className="border border-border/40 rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">Overall Summary</h4>
                    <p className="text-sm text-foreground">{feedback.overallSummary}</p>
                  </div>
                )}
                {feedback.personalNote && (
                  <div className="border border-border/40 rounded-xl p-4 bg-surface/50">
                    <h4 className="font-semibold text-foreground mb-2">Personal Note</h4>
                    <p className="text-sm text-foreground">{feedback.personalNote}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
