import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "../context/OnboardingContext";
import { TourType } from "../context/OnboardingContext";

interface OnboardingButtonProps {
  tourType: TourType;
  className?: string;
}

export default function OnboardingButton({ tourType, className = "" }: OnboardingButtonProps) {
  const { startTour } = useOnboarding();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`p-1 h-auto hover:bg-gray-100 ${className}`}
      onClick={() => startTour(tourType)}
      title="Show Help"
    >
      <HelpCircle className="h-5 w-5 text-primary" />
      <span className="sr-only">Show help guide</span>
    </Button>
  );
}