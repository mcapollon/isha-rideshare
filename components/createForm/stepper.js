
  
  export function Stepper({ currentStep, steps }) {
    return (
      <div className="w-full py-4 flex justify-center">
        <div className="w-[93%] relative">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-300 -translate-y-1/2" />
            {steps.map((step, index) => (
              <div key={step} className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white z-10 ${
                    index < currentStep
                      ? 'border-primary'
                      : 'border-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="absolute top-12 text-sm font-medium text-gray-500 whitespace-nowrap">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  