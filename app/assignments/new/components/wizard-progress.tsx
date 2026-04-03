'use client';

import { useAssignmentWizard } from './assignment-wizard-context';
import { Check } from '@gravity-ui/icons';

export function WizardProgress() {
  const { currentStep, maxCompletedStep, steps, goToStep, canAccessStep } = useAssignmentWizard();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {steps.map((step, index) => {
        const isCompleted = maxCompletedStep >= step.id;
        const isCurrent = currentStep === step.id;
        const isAccessible = canAccessStep(step.id);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isAccessible && goToStep(step.id)}
              disabled={!isAccessible}
              className={`
                flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all
                ${isCurrent 
                  ? 'bg-accent text-white shadow-md' 
                  : isCompleted 
                    ? 'bg-accent/10 text-accent hover:bg-accent/20' 
                    : isAccessible
                      ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                      : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                }
              `}
            >
              <span className={`
                w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                ${isCurrent 
                  ? 'bg-white text-accent' 
                  : isCompleted 
                    ? 'bg-accent text-white' 
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }
              `}>
                {isCompleted && !isCurrent ? (
                  <Check className="w-3 h-3" />
                ) : (
                  step.id
                )}
              </span>
              <span className="hidden sm:inline">{step.name}</span>
            </button>
            {!isLast && (
              <div className={`
                w-4 sm:w-8 h-0.5 mx-1
                ${isCompleted ? 'bg-accent' : 'bg-border'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
