"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { GenerationParams } from "@/lib/store/useGradingStore";

interface FeedbackSetupPanelProps {
  onStartGeneration: (params: GenerationParams) => void;
  onCancel: () => void;
}

export function FeedbackSetupPanel({ onStartGeneration, onCancel }: FeedbackSetupPanelProps) {
  const [params, setParams] = useState<GenerationParams>({
    tone: 'Supportive',
    length: 'Standard',
    style: 'Paragraphs',
    suggestions: 'Struggling students only',
    improvementTips: 'Embedded',
    standards: 'CEFR',
  });

  const toneOptions: GenerationParams['tone'][] = ['Supportive', 'Direct', 'Motivational', 'Socratic'];
  const lengthOptions: GenerationParams['length'][] = ['Brief', 'Standard', 'Detailed'];
  const styleOptions: GenerationParams['style'][] = ['Paragraphs', 'Bullet points', 'Mixed'];
  const suggestionOptions: GenerationParams['suggestions'][] = ['None', 'Struggling students only', 'All students'];
  const tipOptions: GenerationParams['improvementTips'][] = ['Embedded', 'Separate section', 'None'];
  const standardOptions: GenerationParams['standards'][] = ['CEFR', 'IELTS', 'None'];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Configure Feedback Generation</h2>
        <p className="text-sm text-muted">
          Customize how AI generates personalized feedback for this submission
        </p>
      </div>

      <div className="space-y-4">
        {/* Tone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Feedback Tone</label>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((tone) => (
              <button
                key={tone}
                onClick={() => setParams({ ...params, tone })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  params.tone === tone
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border/50 hover:border-border text-foreground'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Feedback Length</label>
          <div className="flex flex-wrap gap-2">
            {lengthOptions.map((length) => (
              <button
                key={length}
                onClick={() => setParams({ ...params, length })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  params.length === length
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border/50 hover:border-border text-foreground'
                }`}
              >
                {length}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Writing Style</label>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((style) => (
              <button
                key={style}
                onClick={() => setParams({ ...params, style })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  params.style === style
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border/50 hover:border-border text-foreground'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Extension Suggestions</label>
          <div className="flex flex-wrap gap-2">
            {suggestionOptions.map((suggestions) => (
              <button
                key={suggestions}
                onClick={() => setParams({ ...params, suggestions })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  params.suggestions === suggestions
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border/50 hover:border-border text-foreground'
                }`}
              >
                {suggestions}
              </button>
            ))}
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Improvement Tips Format</label>
          <div className="flex flex-wrap gap-2">
            {tipOptions.map((improvementTips) => (
              <button
                key={improvementTips}
                onClick={() => setParams({ ...params, improvementTips })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  params.improvementTips === improvementTips
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border/50 hover:border-border text-foreground'
                }`}
              >
                {improvementTips}
              </button>
            ))}
          </div>
        </div>

        {/* Standards */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Reference Standards</label>
          <div className="flex flex-wrap gap-2">
            {standardOptions.map((standards) => (
              <button
                key={standards}
                onClick={() => setParams({ ...params, standards })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  params.standards === standards
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface border-border/50 hover:border-border text-foreground'
                }`}
              >
                {standards}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border/40">
        <Button variant="secondary" onPress={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onPress={() => onStartGeneration(params)}
          className="flex-1 bg-accent text-white font-semibold"
        >
          Generate Feedback
        </Button>
      </div>
    </div>
  );
}
