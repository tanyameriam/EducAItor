'use client';

import { useAssignmentWizard } from '../components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Target, Check } from '@gravity-ui/icons';

// Sample submissions for calibration
const calibrationSamples = [
  { id: 1, label: 'Strong', quality: 'strong', badge: 'bg-success/10 text-success', score: 91 },
  { id: 2, label: 'Good', quality: 'good', badge: 'bg-accent/10 text-accent', score: 74 },
  { id: 3, label: 'Average', quality: 'average', badge: 'bg-warning/10 text-warning', score: 58 },
  { id: 4, label: 'Weak', quality: 'weak', badge: 'bg-destructive/10 text-destructive', score: 42 },
  { id: 5, label: 'Weak', quality: 'weak', badge: 'bg-destructive/10 text-destructive', score: 38 },
];

const criteria = [
  { id: 'intro', name: 'Introduction', weight: 10 },
  { id: 'analysis', name: 'Problem Analysis', weight: 25 },
  { id: 'design', name: 'Solution Design', weight: 30 },
  { id: 'conclusion', name: 'Conclusion', weight: 15 },
  { id: 'refs', name: 'References', weight: 10 },
  { id: 'presentation', name: 'Presentation', weight: 10 },
];

const levels = ['Excellent', 'Good', 'Adequate', 'Poor', 'Missing'];

export default function CalibrationStepPage() {
  const { state, updateState, completeStep, goToStep } = useAssignmentWizard();
  const router = useRouter();
  const [activeSample, setActiveSample] = useState(0);
  const [showDelta, setShowDelta] = useState(false);

  const currentSample = calibrationSamples[activeSample];
  const gradedCount = Object.keys(state.calibrationGrades).length;
  const isComplete = gradedCount >= criteria.length * calibrationSamples.length;

  const handleGrade = (criterionId: string, level: string) => {
    const key = `${currentSample.id}-${criterionId}`;
    updateState({
      calibrationGrades: {
        ...state.calibrationGrades,
        [key]: level,
      },
    });
  };

  const handleNextSample = () => {
    if (activeSample < calibrationSamples.length - 1) {
      setActiveSample(activeSample + 1);
    } else {
      setShowDelta(true);
    }
  };

  const handlePrevSample = () => {
    if (activeSample > 0) {
      setActiveSample(activeSample - 1);
    }
  };

  const calculateAlignment = () => {
    // Mock alignment calculation
    const totalCriteria = criteria.length * calibrationSamples.length;
    const agreedCriteria = Math.floor(totalCriteria * 0.91); // 91% alignment
    return { total: totalCriteria, agreed: agreedCriteria, percentage: 91 };
  };

  const alignment = calculateAlignment();

  const handleNext = () => {
    completeStep(6);
    goToStep(7);
    router.push('/assignments/new/review');
  };

  const handleBack = () => {
    goToStep(5);
    router.push('/assignments/new/rubric');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 6 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Calibrate the AI to Your Grading Style
        </h2>
        <p className="text-muted-foreground">
          Grade 5 sample submissions. The AI will compare and align to your standard.
        </p>
      </div>

      {!showDelta ? (
        <div className="space-y-6">
          {/* Sample Tabs */}
          <div className="flex flex-wrap gap-2">
            {calibrationSamples.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => setActiveSample(idx)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeSample === idx
                    ? 'bg-accent text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                Sample {idx + 1} · {sample.label}
              </button>
            ))}
          </div>

          {/* Sample Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submission Viewer */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${currentSample.badge}`}>
                    {currentSample.label} submission
                  </span>
                  <h3 className="font-semibold text-foreground mt-2">
                    Case Study: Digital Transformation Strategy
                  </h3>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p><strong>Introduction:</strong> This study examines Infosys&apos;s digital transformation journey between 2017-2023, focusing on the challenge of repositioning from a traditional IT services provider to a digital-native consulting firm.</p>
                <p><strong>Problem Analysis:</strong> The root cause of Infosys&apos;s challenge was a fundamental misalignment between its service portfolio and client demand. Revenue from legacy services declined 12% annually while cloud and AI engagements grew 34%.</p>
                <p><strong>Solution Design:</strong> A three-horizon transformation roadmap is proposed with clear implementation phases and resource allocation.</p>
              </div>
            </div>

            {/* Grading Panel */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Grade this submission</h3>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(state.calibrationGrades).filter(k => k.startsWith(`${currentSample.id}-`)).length} / {criteria.length} graded
                </span>
              </div>

              <div className="space-y-4">
                {criteria.map((criterion) => {
                  const key = `${currentSample.id}-${criterion.id}`;
                  const selectedGrade = state.calibrationGrades[key];

                  return (
                    <div key={criterion.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{criterion.name}</span>
                        <span className="text-xs text-muted-foreground">{criterion.weight}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {levels.map((level) => (
                          <button
                            key={level}
                            onClick={() => handleGrade(criterion.id, level)}
                            className={`
                              px-3 py-1.5 rounded text-xs font-medium transition-all
                              ${selectedGrade === level
                                ? 'bg-accent text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }
                            `}
                          >
                            {level.charAt(0)}
                          </button>
                        ))}
                      </div>
                      {selectedGrade && (
                        <p className="mt-2 text-xs text-success flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Graded: {selectedGrade}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevSample}
              disabled={activeSample === 0}
              className="px-4 py-2 rounded-lg border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextSample}
              className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-all"
            >
              {activeSample < calibrationSamples.length - 1 ? 'Next Sample →' : 'Finish Grading →'}
            </button>
          </div>
        </div>
      ) : (
        /* Delta Comparison View */
        <div className="space-y-6">
          <div className="rounded-xl bg-success/10 border border-success/20 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  Overall Alignment: {alignment.percentage}% — Very Good
                </h3>
                <p className="text-muted-foreground mt-1">
                  You and the AI agreed on {alignment.agreed} of {alignment.total} criterion-level pairings across all {calibrationSamples.length} samples.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Score Comparison — All {calibrationSamples.length} Samples</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3">Criterion</th>
                    {calibrationSamples.map((s) => (
                      <th key={s.id} className="text-center py-2 px-3">S{s.id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((criterion) => (
                    <tr key={criterion.id} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 font-medium">{criterion.name}</td>
                      {calibrationSamples.map((sample) => {
                        const key = `${sample.id}-${criterion.id}`;
                        const grade = state.calibrationGrades[key];
                        const aiGrade = ['Excellent', 'Good', 'Adequate', 'Poor'][Math.floor(Math.random() * 4)]; // Mock AI grade
                        const agrees = grade === aiGrade;

                        return (
                          <td key={sample.id} className="text-center py-2 px-3">
                            <span className={agrees ? 'text-success font-medium' : 'text-warning font-medium'}>
                              {grade?.charAt(0) || '-'}
                            </span>
                            {!agrees && (
                              <span className="text-xs text-muted-foreground block">
                                (AI: {aiGrade.charAt(0)})
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">What This Means</h3>
            <p className="text-muted-foreground mb-4">
              The system is now aligned to your grading style. When evaluating your students&apos; submissions, 
              the AI will apply the standard you showed here. You can still override any score.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                ✓ {alignment.percentage}% alignment overall
              </span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                Strongest: Solution Design
              </span>
              <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-medium">
                Watch: Problem Analysis
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowDelta(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              ← Re-grade a sample
            </button>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t border-border">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!showDelta}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${showDelta
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
