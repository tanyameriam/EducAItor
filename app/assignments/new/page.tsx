'use client';

import { useAssignmentWizard } from './components/assignment-wizard-context';
import { useRouter } from 'next/navigation';
import { 
  Pencil, 
  Camera, 
  Layers, 
  FolderOpen,
  ArrowRight 
} from '@gravity-ui/icons';

const entryOptions = [
  {
    id: 'scratch' as const,
    icon: Pencil,
    title: 'Type from scratch',
    description: 'Fill in the details manually. Best when you have the brief clear in your mind.',
    tag: null,
  },
  {
    id: 'upload' as const,
    icon: Camera,
    title: 'Upload question paper',
    description: 'Photo or PDF of your printed paper. We\'ll read it and suggest the details.',
    tag: 'Most used',
  },
  {
    id: 'multi' as const,
    icon: Layers,
    title: 'Multiple sources',
    description: 'Combine up to 5 different sources into one assignment brief.',
    tag: null,
  },
  {
    id: 'import' as const,
    icon: FolderOpen,
    title: 'Import from library',
    description: 'Import from a past assignment — details, rubric, and all — then update what\'s changed.',
    tag: null,
  },
];

export default function EntryStepPage() {
  const { state, updateState, completeStep, goToStep } = useAssignmentWizard();
  const router = useRouter();

  const handleSelect = (entryPath: typeof entryOptions[number]['id']) => {
    updateState({ entryPath });
    completeStep(1);
    goToStep(2);
    router.push('/assignments/new/details');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Step 1 of 7</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          How do you want to start?
        </h2>
        <p className="text-muted-foreground">
          Choose your preferred method to create the assignment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entryOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = state.entryPath === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`
                relative text-left p-6 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10' 
                  : 'border-border bg-card hover:border-accent/50 hover:shadow-md'
                }
              `}
            >
              {option.tag && (
                <span className="absolute -top-3 left-4 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {option.tag}
                </span>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                  ${isSelected ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                
                <ArrowRight className={`
                  w-5 h-5 shrink-0 transition-transform
                  ${isSelected ? 'text-accent translate-x-1' : 'text-muted-foreground'}
                `} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <p className="text-sm text-muted-foreground">
          Select an option above to continue
        </p>
      </div>
    </div>
  );
}
