'use client';

import { useAssignmentWizard } from '../components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Code, Picture, Flask, Folder, Briefcase, MagicWand } from '@gravity-ui/icons';

const assignmentTypes = [
  { id: 'written', label: 'Written / Essay', icon: BookOpen },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'diagram', label: 'Diagram / Visual', icon: Picture },
  { id: 'lab', label: 'Lab Report', icon: Flask },
  { id: 'mixed', label: 'Mixed', icon: Folder },
  { id: 'case-study', label: 'Case Study', icon: Briefcase },
  { id: 'custom', label: 'Something else (Custom)', icon: MagicWand },
];

export default function DetailsStepPage() {
  const { state, updateState, completeStep, goToStep } = useAssignmentWizard();
  const router = useRouter();
  const [showMixedComponents, setShowMixedComponents] = useState(state.assignmentType === 'mixed');
  const [showCustomInput, setShowCustomInput] = useState(state.assignmentType === 'custom');

  const handleTypeSelect = (type: string) => {
    updateState({ assignmentType: type as typeof state.assignmentType });
    setShowMixedComponents(type === 'mixed');
    setShowCustomInput(type === 'custom');
  };

  const handleMixedComponentChange = (component: keyof typeof state.mixedComponents) => {
    updateState({
      mixedComponents: {
        ...state.mixedComponents,
        [component]: !state.mixedComponents[component],
      },
    });
  };

  const canProceed = () => {
    if (!state.title.trim()) return false;
    if (!state.courseId) return false;
    if (!state.assignmentType) return false;
    if (state.assignmentType === 'mixed') {
      const hasComponent = Object.values(state.mixedComponents).some(v => v);
      if (!hasComponent) return false;
    }
    if (state.assignmentType === 'custom' && !state.customDescription.trim()) return false;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    completeStep(2);
    goToStep(3);
    router.push('/assignments/new/output');
  };

  const handleBack = () => {
    goToStep(1);
    router.push('/assignments/new');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 2 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Assignment Details
        </h2>
        <p className="text-muted-foreground">
          Tell students — and the AI — what this assignment is about.
        </p>
      </div>

      <div className="space-y-6">
        {/* Title and Course Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Assignment Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => updateState({ title: e.target.value })}
              placeholder="e.g., Software Design Report"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Course <span className="text-destructive">*</span>
            </label>
            <select
              value={state.courseId}
              onChange={(e) => updateState({ courseId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">Select course...</option>
              <option value="cs401">CS401 - Software Engineering</option>
              <option value="cs301">CS301 - Operating Systems</option>
              <option value="cs201">CS201 - Data Structures</option>
            </select>
          </div>
        </div>

        {/* Batch and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Batch
            </label>
            <input
              type="text"
              value={state.sectionIds.join(', ')}
              onChange={(e) => updateState({ sectionIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g., 2024-A, 2024-B"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Submission Deadline
            </label>
            <input
              type="datetime-local"
              value={state.dueDate}
              onChange={(e) => updateState({ dueDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Assignment Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Assignment Type <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {assignmentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = state.assignmentType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border bg-card hover:border-accent/30'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mixed Components */}
        {showMixedComponents && (
          <div className="p-4 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5">
            <p className="text-sm font-medium text-foreground mb-3">
              Mixed · pick what students submit
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(state.mixedComponents).map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 p-3 rounded-lg bg-card cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleMixedComponentChange(key as keyof typeof state.mixedComponents)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm capitalize">{key.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Custom Description */}
        {showCustomInput && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Custom · describe in 1–2 sentences
            </label>
            <textarea
              value={state.customDescription}
              onChange={(e) => updateState({ customDescription: e.target.value })}
              placeholder="e.g., Students build a small CLI tool plus a 2-page reflection."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>
        )}

        {/* Background Context */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Background / Context <span className="text-muted-foreground font-normal">(optional — not AI-evaluated)</span>
          </label>
          <textarea
            value={state.backgroundContext}
            onChange={(e) => updateState({ backgroundContext: e.target.value })}
            placeholder="Use equilibrium and free-body diagram principles from class."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        {/* Assignment Task */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Assignment Task <span className="text-muted-foreground font-normal">(AI-evaluated)</span>
          </label>
          <textarea
            value={state.taskDescription}
            onChange={(e) => updateState({ taskDescription: e.target.value })}
            placeholder="Solve two numerical problems and submit one labeled free-body diagram with assumptions."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Credit Weight
            </label>
            <input
              type="number"
              min="1"
              max="6"
              step="0.5"
              value={state.creditWeight}
              onChange={(e) => updateState({ creditWeight: parseFloat(e.target.value) || 2 })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Class Size
            </label>
            <input
              type="number"
              min="1"
              value={state.classSize}
              onChange={(e) => updateState({ classSize: parseInt(e.target.value) || 60 })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Estimated Time
            </label>
            <input
              type="text"
              value={state.estimatedTime}
              onChange={(e) => updateState({ estimatedTime: e.target.value })}
              placeholder="4-5 hours"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>
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
          disabled={!canProceed()}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${canProceed()
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
