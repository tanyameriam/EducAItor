"use client";

import { RubricSnapshot, Criterion } from "@/lib/store/useGradingStore";

interface RubricPanelProps {
  rubric: RubricSnapshot;
  criteria: Criterion[];
  onCriterionClick?: (criterionId: string) => void;
}

export function RubricPanel({ rubric, criteria, onCriterionClick }: RubricPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{rubric.id}</h3>
        <p className="text-xs text-muted">Version {rubric.version} • {rubric.totalPoints} points</p>
      </div>

      <div className="space-y-3">
        {rubric.criteria.map((rubricCriterion) => {
          const submissionCriterion = criteria.find(c => c.id === rubricCriterion.id);
          const score = submissionCriterion?.score ?? 0;
          const maxScore = rubricCriterion.maxScore;
          const percentage = (score / maxScore) * 100;

          return (
            <div
              key={rubricCriterion.id}
              onClick={() => onCriterionClick?.(rubricCriterion.id)}
              className="p-3 rounded-lg border border-border/50 bg-surface cursor-pointer hover:border-accent transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-sm text-foreground">{rubricCriterion.title}</p>
                <span className={`text-xs font-semibold ${
                  percentage >= 80 ? 'text-success' :
                  percentage >= 60 ? 'text-warning' :
                  'text-danger'
                }`}>
                  {score}/{maxScore}
                </span>
              </div>
              <p className="text-xs text-muted line-clamp-2">{rubricCriterion.description}</p>
              {submissionCriterion?.evidence && (
                <p className="text-xs text-accent mt-1 line-clamp-1">
                  Evidence: {submissionCriterion.evidence}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Total Score</span>
          <span className="text-lg font-bold text-foreground">
            {criteria.reduce((sum, c) => sum + c.score, 0)} / {rubric.totalPoints}
          </span>
        </div>
      </div>
    </div>
  );
}
