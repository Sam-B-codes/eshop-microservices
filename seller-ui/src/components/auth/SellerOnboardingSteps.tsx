"use client";

import { Check } from "lucide-react";

type SellerOnboardingStepsProps = {
  currentStep: 1 | 2 | 3;
};

const steps = [
  "Create Account",
  "Setup Shop",
  "Connect Bank",
];

export default function SellerOnboardingSteps({
  currentStep,
}: SellerOnboardingStepsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;

          const isCompleted =
            stepNumber < currentStep;

          const isActive =
            stepNumber === currentStep;

          return (
            <div
              key={step}
              className="flex min-w-0 flex-1 items-start last:flex-none"
            >
              {/* STEP */}

              <div className="flex shrink-0 flex-col items-center">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                    isCompleted
                      ? "border-[#0b1220] bg-[#0b1220] text-white shadow-[0_8px_20px_rgba(11,18,32,0.16)]"
                      : isActive
                      ? "border-[#0b1220] bg-white text-[#0b1220] shadow-[0_8px_20px_rgba(11,18,32,0.08)] ring-4 ring-black/[0.03]"
                      : "border-black/[0.08] bg-neutral-100 text-neutral-400",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check
                      className="h-4 w-4"
                      strokeWidth={2.2}
                    />
                  ) : (
                    stepNumber
                  )}
                </div>

                <span
                  className={[
                    "mt-2.5 max-w-[90px] text-center text-[11px] font-semibold leading-4 transition-colors sm:max-w-none sm:text-xs",
                    isCompleted || isActive
                      ? "text-neutral-900"
                      : "text-neutral-400",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>

              {/* CONNECTOR */}

              {stepNumber !==
                steps.length && (
                <div className="mx-2 mt-5 min-w-[18px] flex-1 sm:mx-4">
                  <div className="h-[2px] overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stepNumber <
                        currentStep
                          ? "w-full bg-[#0b1220]"
                          : "w-0 bg-[#0b1220]"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}