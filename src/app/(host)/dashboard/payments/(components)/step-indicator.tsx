"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n-context";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { t } = useLanguage();
  const stepText = t("dashboard.payments.stepLabel")
    .replace("{{step}}", String(currentStep))
    .replace("{{total}}", String(totalSteps));

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={`step-${index}`}>
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                  currentStep >= index + 1
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-transparent text-gray-400 border-gray-300 dark:border-gray-700"
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`h-px w-8 mx-2 ${
                    currentStep > index + 1
                      ? "bg-black dark:bg-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {stepText}
        </div>
      </div>
    </div>
  );
}
