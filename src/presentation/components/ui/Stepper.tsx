import React from 'react';

interface Step {
  id: number;
  label: string;
  icon: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
      <div className="flex justify-between relative min-w-[500px] px-4">
        {/* Progress line */}
        <div className="absolute top-5 left-12 right-12 h-[2px] bg-zinc-100 dark:bg-zinc-800 -z-0">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center gap-3 relative z-10 bg-white dark:bg-zinc-900 px-4"
            >
              {/* Step circle */}
              <div
                className={`
                  size-10 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : isCurrent
                        ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }
                `}
              >
                <span className="material-symbols-outlined text-xl">
                  {isCompleted ? 'done' : step.icon}
                </span>
              </div>

              {/* Step label */}
              <div className="text-center">
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    isCurrent ? 'text-primary' : 'text-zinc-400'
                  }`}
                >
                  Etape {step.id}
                </p>
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
