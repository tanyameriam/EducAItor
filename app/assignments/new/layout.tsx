'use client';

import { AssignmentWizardProvider } from './components/assignment-wizard-context';
import { WizardProgress } from './components/wizard-progress';

export default function AssignmentWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssignmentWizardProvider>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/50 bg-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  New Assignment
                </p>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Create Assignment
                </h1>
              </div>
              <WizardProgress />
            </div>
          </div>
        </div>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </AssignmentWizardProvider>
  );
}
