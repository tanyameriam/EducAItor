'use client';

import { useAssignmentWizard } from '../components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from '@gravity-ui/icons';

export default function OutputStepPage() {
  const { state, updateState, completeStep, goToStep } = useAssignmentWizard();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('');

  // Determine if we need per-component tabs
  const needsComponentTabs = state.assignmentType === 'mixed' || state.assignmentType === 'custom';
  
  const components = needsComponentTabs
    ? state.assignmentType === 'mixed'
      ? Object.entries(state.mixedComponents)
          .filter(([_, checked]) => checked)
          .map(([key]) => ({ id: key, label: key.charAt(0).toUpperCase() + key.slice(1) }))
      : [{ id: 'custom', label: 'Custom Component' }]
    : [];

  // Initialize active tab
  useEffect(() => {
    if (components.length > 0 && !activeTab) {
      setActiveTab(components[0].id);
    }
  }, [components, activeTab]);

  const handleFormatChange = (componentId: string, value: string) => {
    updateState({
      componentFormats: {
        ...state.componentFormats,
        [componentId]: value,
      },
    });
  };

  const handleNamingChange = (componentId: string, value: string) => {
    updateState({
      componentNaming: {
        ...state.componentNaming,
        [componentId]: value,
      },
    });
  };

  const calculateScope = () => {
    const wordCountValue = parseInt(state.wordCount) || 600;
    const baseHours = wordCountValue / 200 + (state.artifacts?.length || 0) * 0.85;
    const diagramCost = state.diagramMode === 'hand-drawn' ? 1.25 : state.diagramMode === 'digital' ? 0.45 : 0;
    const total = Math.max(1, baseHours + diagramCost);
    const bench = 1.5 * state.creditWeight + 1.5;
    return { total, bench };
  };

  const scope = calculateScope();
  const isOverScope = scope.total > scope.bench * 2;

  const handleNext = () => {
    completeStep(3);
    goToStep(4);
    router.push('/assignments/new/artifacts');
  };

  const handleBack = () => {
    goToStep(2);
    router.push('/assignments/new/details');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 3 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Output Format
        </h2>
        <p className="text-muted-foreground">
          Configure how students should submit their work.
        </p>
      </div>

      <div className="space-y-6">
        {/* Global Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Word or Page Guidance
            </label>
            <input
              type="text"
              value={state.wordCount}
              onChange={(e) => updateState({ wordCount: e.target.value })}
              placeholder="600-800 words"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Diagram Format
            </label>
            <select
              value={state.diagramMode}
              onChange={(e) => updateState({ diagramMode: e.target.value as typeof state.diagramMode })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="na">N/A — Not a diagram task</option>
              <option value="hand-drawn">Hand-drawn + scanned</option>
              <option value="digital">Digital diagram</option>
            </select>
          </div>
        </div>

        {/* Component Tabs for Mixed/Custom */}
        {needsComponentTabs && components.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">
              Per-Component Format
            </h3>
            
            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {components.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setActiveTab(comp.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === comp.id
                      ? 'bg-accent text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {comp.label}
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            {components.map((comp) => (
              <div
                key={comp.id}
                className={`space-y-4 ${activeTab === comp.id ? 'block' : 'hidden'}`}
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Format for {comp.label}
                  </label>
                  <input
                    type="text"
                    value={state.componentFormats[comp.id] || ''}
                    onChange={(e) => handleFormatChange(comp.id, e.target.value)}
                    placeholder={comp.id === 'code' ? 'Source zip + README' : comp.id === 'diagram' ? 'PNG/PDF diagram' : 'PDF, typed'}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Naming Convention
                  </label>
                  <input
                    type="text"
                    value={state.componentNaming[comp.id] || ''}
                    onChange={(e) => handleNamingChange(comp.id, e.target.value)}
                    placeholder={`${state.courseId.toUpperCase()}_${comp.id}_RollNo`}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scope Indicator */}
        <div className={`rounded-xl p-4 border-l-4 ${isOverScope ? 'bg-warning/10 border-warning' : 'bg-success/10 border-success'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Scope Indicator
              </p>
              <p className="text-sm text-muted-foreground">
                {scope.total.toFixed(1)} hours projected (typical for {state.creditWeight}-credit: {scope.bench.toFixed(1)} ±1 h)
              </p>
            </div>
            {isOverScope && (
              <span className="text-sm font-medium text-warning">
                Consider reducing scope
              </span>
            )}
          </div>
          {isOverScope && (
            <div className="mt-3 text-sm text-muted-foreground">
              Help me reduce scope: lower word count, fewer required uploads, prefer digital diagrams, or split into two smaller tasks.
            </div>
          )}
        </div>

        {/* Scalability Warning */}
        {state.classSize >= 100 && (
          <div className="rounded-xl p-4 bg-info/10 border-l-4 border-info">
            <p className="text-sm font-medium text-foreground">
              Large Class Mode Active
            </p>
            <p className="text-sm text-muted-foreground">
              {state.classSize} students detected. Estimated manual review: ~{(state.classSize * 0.04).toFixed(1)} hours
            </p>
          </div>
        )}
      </div>

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
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 shadow-lg shadow-accent/20 transition-all"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
