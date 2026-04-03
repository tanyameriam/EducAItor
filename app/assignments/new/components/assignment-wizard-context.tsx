'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type EntryPath = 'scratch' | 'upload' | 'multi' | 'import';
type AssignmentType = 'written' | 'code' | 'diagram' | 'lab' | 'mixed' | 'case-study' | 'custom';
type ArtifactSource = 'student' | 'instructor';
type ArtifactEvaluation = 'evaluable' | 'partial' | 'manual' | 'collect';

interface Artifact {
  id: string;
  name: string;
  required: boolean;
  evaluation: ArtifactEvaluation;
  source: ArtifactSource;
}

interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  descriptions: {
    excellent: string;
    good: string;
    adequate: string;
    poor: string;
    missing: string;
  };
  aiSuggested?: boolean;
}

interface AssignmentWizardState {
  // Step 1: Entry
  entryPath: EntryPath | null;
  
  // Step 2: Details
  title: string;
  courseId: string;
  sectionIds: string[];
  assignmentType: AssignmentType | null;
  mixedComponents: {
    written: boolean;
    code: boolean;
    diagram: boolean;
    lab: boolean;
  };
  customDescription: string;
  backgroundContext: string;
  taskDescription: string;
  dueDate: string;
  creditWeight: number;
  classSize: number;
  estimatedTime: string;
  
  // Step 3: Output
  wordCount: string;
  diagramMode: 'hand-drawn' | 'digital' | 'na';
  componentFormats: Record<string, string>;
  componentNaming: Record<string, string>;
  
  // Step 4: Artifacts
  artifacts: Artifact[];
  
  // Step 5: Rubric
  rubricMethod: 'marks' | 'upload' | 'ai' | 'manual' | null;
  rubricCriteria: RubricCriterion[];
  
  // Step 6: Calibration
  calibrationGrades: Record<string, string>;
  
  // Step 7: Publish
  publishMode: 'now' | 'schedule';
  scheduledDate: string;
  scheduledTime: string;
}

const initialState: AssignmentWizardState = {
  entryPath: null,
  title: '',
  courseId: '',
  sectionIds: [],
  assignmentType: null,
  mixedComponents: {
    written: true,
    code: false,
    diagram: true,
    lab: false,
  },
  customDescription: '',
  backgroundContext: '',
  taskDescription: '',
  dueDate: '',
  creditWeight: 2,
  classSize: 60,
  estimatedTime: '4-5 hours',
  wordCount: '600-800',
  diagramMode: 'na',
  componentFormats: {},
  componentNaming: {},
  artifacts: [],
  rubricMethod: null,
  rubricCriteria: [],
  calibrationGrades: {},
  publishMode: 'now',
  scheduledDate: '',
  scheduledTime: '',
};

const STEPS = [
  { id: 1, name: 'Entry', path: '/assignments/new' },
  { id: 2, name: 'Details', path: '/assignments/new/details' },
  { id: 3, name: 'Output', path: '/assignments/new/output' },
  { id: 4, name: 'Artifacts', path: '/assignments/new/artifacts' },
  { id: 5, name: 'Rubric', path: '/assignments/new/rubric' },
  { id: 6, name: 'Calibration', path: '/assignments/new/calibration' },
  { id: 7, name: 'Review', path: '/assignments/new/review' },
];

interface AssignmentWizardContextType {
  state: AssignmentWizardState;
  currentStep: number;
  maxCompletedStep: number;
  visitedSteps: number[];
  updateState: (updates: Partial<AssignmentWizardState>) => void;
  goToStep: (step: number) => void;
  completeStep: (step: number) => void;
  canAccessStep: (step: number) => boolean;
  resetWizard: () => void;
  steps: typeof STEPS;
}

const AssignmentWizardContext = createContext<AssignmentWizardContextType | undefined>(undefined);

export function AssignmentWizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AssignmentWizardState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);

  const updateState = useCallback((updates: Partial<AssignmentWizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
      setVisitedSteps(prev => [...new Set([...prev, step])]);
    }
  }, []);

  const completeStep = useCallback((step: number) => {
    setMaxCompletedStep(prev => Math.max(prev, step));
  }, []);

  const canAccessStep = useCallback((step: number) => {
    // Step 1 always accessible
    if (step === 1) return true;
    // Can access if previous step is completed
    return maxCompletedStep >= step - 1;
  }, [maxCompletedStep]);

  const resetWizard = useCallback(() => {
    setState(initialState);
    setCurrentStep(1);
    setMaxCompletedStep(0);
    setVisitedSteps([1]);
  }, []);

  return (
    <AssignmentWizardContext.Provider
      value={{
        state,
        currentStep,
        maxCompletedStep,
        visitedSteps,
        updateState,
        goToStep,
        completeStep,
        canAccessStep,
        resetWizard,
        steps: STEPS,
      }}
    >
      {children}
    </AssignmentWizardContext.Provider>
  );
}

export function useAssignmentWizard() {
  const context = useContext(AssignmentWizardContext);
  if (context === undefined) {
    throw new Error('useAssignmentWizard must be used within AssignmentWizardProvider');
  }
  return context;
}
