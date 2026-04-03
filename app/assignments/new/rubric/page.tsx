'use client';

import { useAssignmentWizard } from '../components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, File, Sparkles, Book, Pencil } from '@gravity-ui/icons';

const rubricMethods = [
  {
    id: 'marks' as const,
    icon: File,
    title: 'Import Marks Allocation',
    description: 'Paste your marks breakdown — we will convert it to criteria, levels, and weights automatically.',
    tag: 'Recommended',
  },
  {
    id: 'upload' as const,
    icon: Book,
    title: 'Upload Existing Rubric',
    description: 'Upload your existing rubric document. We will extract the criteria and descriptors for you to review.',
    tag: null,
  },
  {
    id: 'ai' as const,
    icon: Sparkles,
    title: 'AI Suggest from Brief',
    description: 'We will read your assignment brief and suggest relevant rubric criteria for you to accept, modify, or reject.',
    tag: null,
  },
  {
    id: 'manual' as const,
    icon: Pencil,
    title: 'Build Manually',
    description: 'Add criteria one by one, write your own descriptors and assign weights manually.',
    tag: null,
  },
];

export default function RubricStepPage() {
  const { state, updateState, completeStep, goToStep } = useAssignmentWizard();
  const router = useRouter();
  const [marksInput, setMarksInput] = useState('');
  const [parsedCriteria, setParsedCriteria] = useState<Array<{ name: string; marks: number }>>([]);

  const parseMarks = () => {
    const lines = marksInput.split('\n').filter(l => l.trim());
    const items: Array<{ name: string; marks: number }> = [];
    let total = 0;

    lines.forEach(line => {
      const match = line.match(/(.+?)[\-—:\s]+(\d+)/);
      if (match) {
        const marks = parseInt(match[2]);
        items.push({ name: match[1].trim(), marks });
        total += marks;
      }
    });

    setParsedCriteria(items);

    if (total === 100) {
      // Convert to rubric criteria
      const criteria = items.map(item => ({
        id: Date.now().toString() + Math.random(),
        name: item.name,
        weight: item.marks,
        descriptions: {
          excellent: `Outstanding performance on ${item.name.toLowerCase()}`,
          good: `Good performance with minor gaps`,
          adequate: `Meets minimum requirements`,
          poor: `Falls below expected standard`,
          missing: `No evidence provided`,
        },
        aiSuggested: true,
      }));
      updateState({ rubricCriteria: criteria });
    }
  };

  const handleMethodSelect = (method: typeof rubricMethods[number]['id']) => {
    updateState({ rubricMethod: method });
  };

  const handleNext = () => {
    completeStep(5);
    goToStep(6);
    router.push('/assignments/new/calibration');
  };

  const handleBack = () => {
    goToStep(4);
    router.push('/assignments/new/artifacts');
  };

  const totalWeight = state.rubricCriteria.reduce((sum, c) => sum + c.weight, 0);
  const isValid = state.rubricCriteria.length > 0 && totalWeight === 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 5 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Rubric Definition
        </h2>
        <p className="text-muted-foreground">
          Define how submissions will be graded.
        </p>
      </div>

      {/* Method Selection */}
      {!state.rubricMethod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {rubricMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className="relative text-left p-6 rounded-xl border-2 border-border bg-card hover:border-accent/50 hover:shadow-md transition-all"
              >
                {method.tag && (
                  <span className="absolute -top-3 left-4 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {method.tag}
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Marks Allocation Input */}
      {state.rubricMethod === 'marks' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Enter Marks Allocation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Type each assessment area and its marks — one per line. Example: Analysis — 25 marks
            </p>
            <textarea
              value={marksInput}
              onChange={(e) => setMarksInput(e.target.value)}
              rows={8}
              placeholder="Introduction — 10&#10;Problem Analysis — 25&#10;Solution Design — 30&#10;Conclusion — 15&#10;References — 10&#10;Presentation — 10"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => updateState({ rubricMethod: null })}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to methods
              </button>
              <button
                onClick={parseMarks}
                className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90"
              >
                Parse and Preview
              </button>
            </div>
          </div>

          {parsedCriteria.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Parsed Criteria</h3>
              <div className="space-y-2">
                {parsedCriteria.map((criterion, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{criterion.name}</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                      {criterion.marks} marks
                    </span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-3 rounded-lg ${totalWeight === 100 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                Total: {totalWeight} / 100
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Suggest View */}
      {state.rubricMethod === 'ai' && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">AI Suggested Criteria</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your assignment brief, we suggest the following criteria:
          </p>
          <div className="space-y-3">
            {[
              { name: 'Problem Analysis', rationale: 'Matches "root cause" in your description', weight: 30 },
              { name: 'Solution Design', rationale: 'Addresses "feasible solution" requirement', weight: 40 },
              { name: 'Depth of Understanding', rationale: 'Covers "depth of understanding" mentioned', weight: 30 },
            ].map((suggestion, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="font-medium text-foreground">{suggestion.name}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.rationale}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {suggestion.weight}%
                  </span>
                  <button
                    onClick={() => {
                      const newCriterion = {
                        id: Date.now().toString(),
                        name: suggestion.name,
                        weight: suggestion.weight,
                        descriptions: {
                          excellent: `Demonstrates exceptional ${suggestion.name.toLowerCase()}`,
                          good: `Shows good ${suggestion.name.toLowerCase()} with minor gaps`,
                          adequate: `Meets basic ${suggestion.name.toLowerCase()} requirements`,
                          poor: `Inadequate ${suggestion.name.toLowerCase()}`,
                          missing: `No evidence of ${suggestion.name.toLowerCase()}`,
                        },
                        aiSuggested: true,
                      };
                      updateState({ rubricCriteria: [...state.rubricCriteria, newCriterion] });
                    }}
                    className="px-3 py-1 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateState({ rubricMethod: null })}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to methods
          </button>
        </div>
      )}

      {/* Manual Builder View */}
      {state.rubricMethod === 'manual' && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Build Rubric Manually</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add criteria one by one. Start with the "Excellent" descriptor — AI will suggest other levels.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Criterion name (e.g., Problem Analysis)"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <input
              type="number"
              placeholder="Weight %"
              className="w-32 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <textarea
              placeholder="Excellent descriptor: Describe what full-marks work looks like..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
            <div className="flex justify-between">
              <button
                onClick={() => updateState({ rubricMethod: null })}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to methods
              </button>
              <button
                onClick={() => {
                  // Would add criterion in real implementation
                  alert('Criterion added (demo)');
                }}
                className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90"
              >
                + Add Criterion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Rubric Display */}
      {state.rubricCriteria.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Current Rubric</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${totalWeight === 100 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              Total: {totalWeight}%
            </span>
          </div>
          <div className="space-y-2">
            {state.rubricCriteria.map((criterion) => (
              <div key={criterion.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">{criterion.name}</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                  {criterion.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${isValid
              ? 'bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/20'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
