"use client";

import { TextHighlight } from "@/lib/store/useGradingStore";

interface SubmissionViewerProps {
  content: string;
  highlights: TextHighlight[];
  selectedHighlightId: string | null;
  onHighlightClick: (highlightId: string) => void;
  onTextSelect: (startOffset: number, endOffset: number, text: string) => void;
}

export function SubmissionViewer({
  content,
  highlights,
  selectedHighlightId,
  onHighlightClick,
  onTextSelect,
}: SubmissionViewerProps) {
  // Simple text rendering without complex highlighting for now
  // In a full implementation, this would render highlights as clickable spans
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
          {content}
        </pre>
      </div>
      
      {highlights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-xs font-medium text-muted mb-2">Highlights ({highlights.length})</p>
          <div className="space-y-1">
            {highlights.map((highlight) => (
              <button
                key={highlight.id}
                onClick={() => onHighlightClick(highlight.id)}
                className={`w-full text-left p-2 rounded text-xs border transition-colors ${
                  selectedHighlightId === highlight.id
                    ? 'bg-accent/10 border-accent'
                    : 'bg-surface border-border/30 hover:border-border'
                }`}
              >
                <span 
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    highlight.color === 'yellow' ? 'bg-yellow-400' :
                    highlight.color === 'green' ? 'bg-green-400' :
                    highlight.color === 'red' ? 'bg-red-400' :
                    'bg-blue-400'
                  }`}
                />
                {highlight.text.slice(0, 60)}{highlight.text.length > 60 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
