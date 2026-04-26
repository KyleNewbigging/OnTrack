export const ONBOARDING_STORAGE_KEY = "ontrack-onboarding-complete";

export const shouldShowOnboarding = ({
  hasCompletedOnboarding,
  hasExistingGoals,
}: {
  hasCompletedOnboarding: boolean;
  hasExistingGoals: boolean;
}) => !hasCompletedOnboarding && !hasExistingGoals;
