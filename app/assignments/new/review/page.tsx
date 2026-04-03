'use client';

import { useState } from 'react';
import { useAssignmentWizard } from '../components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Rocket, Calendar, Check, Eye } from '@gravity-ui/icons';

export default function ReviewStepPage() {
  const { state, updateState, resetWizard } = useAssignmentWizard();
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalWeight = state.rubricCriteria.reduce((sum, c) => sum + c.weight, 0);
  const requiredArtifacts = state.artifacts.filter(a => a.required).length;

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPublishing(false);
    setShowSuccess(true);
  };

  const handleScheduleChange = (date: string, time: string) => {
    updateState({ 
      scheduledDate: date, 
      scheduledTime: time 
    });
  };

  const formatScheduledDate = () => {
    if (!state.scheduledDate || !state.scheduledTime) return '';
    const date = new Date(`${state.scheduledDate}T${state.scheduledTime}`);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
          <Check className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {state.publishMode === 'schedule' ? 'Assignment Scheduled!' : 'Assignment Published!'}
        </h2>
        <p className="text-muted-foreground mb-8">
          {state.publishMode === 'schedule' 
            ? `Your assignment will go live on ${formatScheduledDate()}.`
            : 'Your assignment is now live and students can begin submitting.'
          }
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/50 text-left max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Assignment Summary</p>
            <p className="font-medium text-foreground">{state.title}</p>
            <p className="text-sm text-muted-foreground">{state.rubricCriteria.length} criteria · {totalWeight}% weighted</p>
            <p className="text-sm text-muted-foreground">{requiredArtifacts} required artifact{requiredArtifacts !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => {
              resetWizard();
              router.push('/assignments');
            }}
            className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 7 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review & Publish
        </h2>
        <p className="text-muted-foreground">
          Check everything looks right, then choose when to publish.
        </p>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Assignment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Title</p>
              <p className="font-medium text-foreground">{state.title || 'Untitled'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Course</p>
              <p className="font-medium text-foreground">{state.courseId || 'Not selected'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Deadline</p>
              <p className="font-medium text-foreground">
                {state.dueDate 
                  ? new Date(state.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Not set'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
              <p className="font-medium text-foreground capitalize">{state.assignmentType || 'Not selected'}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Rubric Criteria</p>
            <div className="flex flex-wrap gap-2">
              {state.rubricCriteria.map((criterion) => (
                <span 
                  key={criterion.id}
                  className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium"
                >
                  {criterion.name} ({criterion.weight}%)
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {state.rubricCriteria.length} criteria · {totalWeight}% total weight
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Response Types</p>
            <div className="flex flex-wrap gap-2">
              {state.artifacts.filter(a => a.required).map((artifact) => (
                <span 
                  key={artifact.id}
                  className="px-3 py-1.5 bg-muted text-foreground rounded-full text-sm"
                >
                  {artifact.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Publish Options */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">When do you want to publish?</h3>
          
          <div className="space-y-4">
            <label className={`
              flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${state.publishMode === 'now' 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/30'
              }
            `}>
              <input
                type="radio"
                name="publishMode"
                value="now"
                checked={state.publishMode === 'now'}
                onChange={() => updateState({ publishMode: 'now' })}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-accent" />
                  <span className="font-medium text-foreground">Publish now</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Students can see and submit immediately after you click Publish.
                </p>
              </div>
            </label>

            <label className={`
              flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${state.publishMode === 'schedule' 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/30'
              }
            `}>
              <input
                type="radio"
                name="publishMode"
                value="schedule"
                checked={state.publishMode === 'schedule'}
                onChange={() => updateState({ publishMode: 'schedule' })}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="font-medium text-foreground">Schedule for later</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Set a date and time — the assignment goes live automatically.
                </p>
                
                {state.publishMode === 'schedule' && (
                  <div className="mt-4 flex gap-3">
                    <input
                      type="date"
                      value={state.scheduledDate}
                      onChange={(e) => handleScheduleChange(e.target.value, state.scheduledTime)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="time"
                      value={state.scheduledTime}
                      onChange={(e) => handleScheduleChange(state.scheduledDate, e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                )}
                
                {state.publishMode === 'schedule' && state.scheduledDate && state.scheduledTime && (
                  <p className="mt-3 text-sm text-accent font-medium">
                    Will go live on {formatScheduledDate()}
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Notice */}
        <div className="rounded-xl bg-accent/10 border border-accent/20 p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Rubric is ready</p>
              <p className="text-sm text-muted-foreground">
                The AI will use these criteria to score student submissions. You stay in control and can override any score at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Once published:</p>
              <p className="text-sm text-muted-foreground">
                Students can immediately view the rubric and begin submitting. The deadline and rubric criteria cannot be changed after publishing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => {
            router.push('/assignments/new/calibration');
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Save as draft
              alert('Draft saved (demo)');
            }}
            className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
          >
            Save as Draft
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isPublishing || (state.publishMode === 'schedule' && (!state.scheduledDate || !state.scheduledTime))}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all
              ${isPublishing || (state.publishMode === 'schedule' && (!state.scheduledDate || !state.scheduledTime))
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/20'
              }
            `}
          >
            {isPublishing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                {state.publishMode === 'schedule' ? 'Schedule →' : 'Publish →'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
