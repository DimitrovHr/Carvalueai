import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="bg-neutral-light px-4 py-5 border-b border-gray-200 sm:px-6">
      <div className="flex justify-between items-center">
        <div className="w-full">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={index} className="step-indicator flex-1 flex items-center relative">
                <div className={`step-circle h-10 w-10 flex items-center justify-center rounded-full 
                  ${index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-300 text-white'} 
                  text-lg font-medium`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div className={`step-label ml-2 text-sm font-medium 
                  ${index <= currentStep ? 'text-primary' : 'text-gray-500'} 
                  hidden sm:block`}
                >
                  {step}
                </div>
                {index < steps.length - 1 && (
                  <div className={`progress-line h-1 
                    ${index < currentStep ? 'bg-primary' : 'bg-gray-300'} 
                    flex-1 mx-2 sm:mx-4`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
