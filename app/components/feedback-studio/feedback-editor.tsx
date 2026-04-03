"use client";

import { useState } from "react";
import { Feedback, TextHighlight, EvidenceLink } from "@/lib/store/useGradingStore";
import { Button, TextArea } from "@heroui/react";

interface FeedbackEditorProps {
  feedback: Feedback;
  highlights: TextHighlight[];
  linkedEvidence: EvidenceLink[];
  onUpdateStrength: (index: number, text: string) => void;
  onUpdateGap: (index: number, text: string) => void;
  onUpdateImprovement: (index: number, text: string) => void;
  onUpdateSuggestion: (index: number, text: string) => void;
  onUpdateOverallSummary: (text: string) => void;
  onUpdatePersonalNote: (text: string) => void;
  onAddItem: (type: 'strength' | 'gap' | 'improvement' | 'suggestion') => void;
  onRemoveItem: (type: 'strength' | 'gap' | 'improvement' | 'suggestion', index: number) => void;
  onLinkEvidence: (feedbackType: 'strength' | 'gap' | 'improvement' | 'suggestion', feedbackIndex: number, highlightId: string) => void;
  selectedHighlightId: string | null;
}

export function FeedbackEditor({
  feedback,
  highlights,
  linkedEvidence,
  onUpdateStrength,
  onUpdateGap,
  onUpdateImprovement,
  onUpdateSuggestion,
  onUpdateOverallSummary,
  onUpdatePersonalNote,
  onAddItem,
  onRemoveItem,
  onLinkEvidence,
  selectedHighlightId,
}: FeedbackEditorProps) {
  const [activeSection, setActiveSection] = useState<'strengths' | 'gaps' | 'improvements' | 'suggestions' | 'summary'>('strengths');

  const getLinkedHighlights = (type: string, index: number) => {
    return linkedEvidence.filter(link => link.feedbackType === type && link.feedbackIndex === index);
  };

  const renderItemList = (
    items: string[],
    type: 'strength' | 'gap' | 'improvement' | 'suggestion',
    onUpdate: (index: number, text: string) => void,
    title: string,
    colorClass: string
  ) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className={`font-semibold ${colorClass}`}>{title}</h4>
        <button
          onClick={() => onAddItem(type)}
          className="text-xs px-2 py-1 rounded border border-border/50 hover:border-accent text-foreground"
        >
          + Add
        </button>
      </div>
      {items.map((item, index) => {
        const links = getLinkedHighlights(type, index);
        return (
          <div key={index} className="space-y-2">
            <div className="flex gap-2">
              <TextArea
                value={item}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="flex-1 text-sm"
                rows={2}
              />
              <button
                onClick={() => onRemoveItem(type, index)}
                className="px-2 text-danger hover:opacity-70"
              >
                ×
              </button>
            </div>
            {links.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {links.map(link => {
                  const highlight = highlights.find(h => h.id === link.highlightId);
                  return (
                    <span key={link.id} className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                      Linked: {highlight?.text.slice(0, 20)}...
                    </span>
                  );
                })}
              </div>
            )}
            {selectedHighlightId && !links.find(l => l.highlightId === selectedHighlightId) && (
              <button
                onClick={() => onLinkEvidence(type, index, selectedHighlightId)}
                className="text-xs px-2 py-1 rounded border border-accent text-accent hover:bg-accent/10"
              >
                Link to selected highlight
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Section Tabs */}
      <div className="flex border-b border-border/40">
        {[
          { id: 'strengths', label: 'Strengths', count: feedback.strengths.length },
          { id: 'gaps', label: 'Gaps', count: feedback.gaps.length },
          { id: 'improvements', label: 'Improvements', count: feedback.improvements.length },
          { id: 'suggestions', label: 'Suggestions', count: feedback.suggestions?.length ?? 0 },
          { id: 'summary', label: 'Summary', count: 0 },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as typeof activeSection)}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === section.id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {section.label} {section.count > 0 && `(${section.count})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'strengths' && renderItemList(
          feedback.strengths,
          'strength',
          onUpdateStrength,
          'Strengths',
          'text-success'
        )}
        
        {activeSection === 'gaps' && renderItemList(
          feedback.gaps,
          'gap',
          onUpdateGap,
          'Areas for Improvement',
          'text-warning'
        )}
        
        {activeSection === 'improvements' && renderItemList(
          feedback.improvements,
          'improvement',
          onUpdateImprovement,
          'Action Items',
          'text-accent'
        )}
        
        {activeSection === 'suggestions' && renderItemList(
          feedback.suggestions ?? [],
          'suggestion',
          onUpdateSuggestion,
          'Suggestions',
          'text-muted'
        )}
        
        {activeSection === 'summary' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Overall Summary</label>
              <TextArea
                value={feedback.overallSummary ?? ''}
                onChange={(e) => onUpdateOverallSummary(e.target.value)}
                className="w-full text-sm"
                rows={4}
                placeholder="Provide an overall summary of the submission..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Personal Note (Optional)</label>
              <TextArea
                value={feedback.personalNote ?? ''}
                onChange={(e) => onUpdatePersonalNote(e.target.value)}
                className="w-full text-sm"
                rows={3}
                placeholder="Add a personal note for the student..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
