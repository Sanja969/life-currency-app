import { createContext, useContext } from "react";

type OnboardingContextValue = {
  markOnboardingCompleted: () => void;
};

export const OnboardingContext =
  createContext<OnboardingContextValue | null>(null);

export function useOnboardingCompletion() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("OnboardingContext is missing");
  }

  return context;
}