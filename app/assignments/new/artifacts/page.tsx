'use client';

import { useAssignmentWizard } from '../components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Xmark } from '@gravity-ui/icons';

export default function ArtifactsStepPage() {
  const { state, updateState, completeStep, goToStep } = useAssignmentWizard();
  const router = useRouter();

  const addArtifact = () => {
    const newArtifact = {
      id: Date.now().toString(),
      name: 'New artifact',
      required: true,
      evaluation: 'evaluable' as const,
      source: 'student' as const,
    };
    updateState({ artifacts: [...state.artifacts, newArtifact] });
  };

  const updateArtifact = (id: string, updates: Partial<typeof state.artifacts[0]>) => {
    updateState({
      artifacts: state.artifacts.map(a => a.id === id ? { ...a, ...updates } : a),
    });
  };

  const removeArtifact = (id: string) => {
    updateState({ artifacts: state.artifacts.filter(a => a.id !== id) });
  };

  const requiredCount = state.artifacts.filter(a => a.required).length;
  const rejectionRate = Math.min(55, Math.round(6 + requiredCount * 6 + (state.diagramMode === 'hand-drawn' ? 5 : 0)));

  const handleNext = () => {
    completeStep(4);
    goToStep(5);
    router.push('/assignments/new/rubric');
  };

  const handleBack = () => {
    goToStep(3);
    router.push('/assignments/new/output');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 4 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Required Artifacts
        </h2>
        <p className="text-muted-foreground">
          Define what students must submit and how each item will be evaluated.
        </p>
      </div>

      <div className="space-y-6">
        {/* Artifacts Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Artifact</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Required</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Evaluation</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.artifacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No artifacts added yet. Click "+ Add artifact" to begin.
                    </td>
                  </tr>
                ) : (
                  state.artifacts.map((artifact) => (
                    <tr key={artifact.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={artifact.name}
                          onChange={(e) => updateArtifact(artifact.id, { name: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={artifact.required ? 'yes' : 'no'}
                          onChange={(e) => updateArtifact(artifact.id, { required: e.target.value === 'yes' })}
                          className="px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                          <option value="yes">Required</option>
                          <option value="no">Optional</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={artifact.evaluation}
                          onChange={(e) => updateArtifact(artifact.id, { evaluation: e.target.value as typeof artifact.evaluation })}
                          className="px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                          <option value="evaluable">Evaluable</option>
                          <option value="partial">Partially AI-evaluable</option>
                          <option value="manual">Manual review</option>
                          <option value="collect">Collected only</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={artifact.source}
                          onChange={(e) => updateArtifact(artifact.id, { source: e.target.value as typeof artifact.source })}
                          className="px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeArtifact(artifact.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Xmark className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={addArtifact}
          className="w-full py-3 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors font-medium"
        >
          + Add artifact
        </button>

        {/* Rejection Rate Indicator */}
        <div className={`rounded-xl p-4 border-l-4 ${rejectionRate > 20 ? 'bg-warning/10 border-warning' : 'bg-success/10 border-success'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Projected Rejection Rate
              </p>
              <p className="text-sm text-muted-foreground">
                ~{rejectionRate}% based on {requiredCount} required artifact{requiredCount !== 1 ? 's' : ''}
              </p>
            </div>
            {rejectionRate > 20 && (
              <span className="text-sm font-medium text-warning">
                Consider reducing requirements
              </span>
            )}
          </div>
        </div>

        {/* Artifact Tips */}
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            Artifact Tips
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Use specific names (not generic terms like "document" or "file")</li>
            <li>Mark items as "Collected only" if they won't be graded</li>
            <li>"Instructor-added" artifacts are supplied by you, not students</li>
          </ul>
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
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 shadow-lg shadow-accent/20 transition-all"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
