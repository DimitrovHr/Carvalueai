import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";
import Joyride, { CallBackProps, Step, STATUS } from "react-joyride";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";

interface OnboardingContextType {
  startTour: (tourType: TourType) => void;
  skipTour: () => void;
  resetTours: () => void;
  isTourActive: boolean;
}

export type TourType = 'homepage' | 'valuation' | 'results' | 'admin';

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // State for the tour
  const [isTourActive, setIsTourActive] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [completedTours, setCompletedTours] = useLocalStorage<TourType[]>("completedTours", []);
  const [currentTour, setCurrentTour] = useState<TourType | null>(null);

  // Tour steps for different pages
  const getSteps = (tourType: TourType): Step[] => {
    switch (tourType) {
      case 'homepage':
        return [
          {
            target: '.navbar',
            content: 'Welcome to CarValueAI! This is the navigation bar where you can access all sections of the application.',
            disableBeacon: true,
            placement: 'bottom',
          },
          {
            target: '.pricing-section',
            content: 'Check out our different pricing plans to find one that suits your needs.',
            placement: 'top',
          },
          {
            target: '.cta-button',
            content: 'Click here to get started with your car valuation.',
            placement: 'bottom',
          },
          {
            target: '.how-it-works',
            content: 'Learn more about our valuation process and what makes our service special.',
            placement: 'top',
          },
        ];
      case 'valuation':
        return [
          {
            target: '.car-details-section',
            content: 'Enter your car details here. The more accurate the information, the better your valuation will be.',
            disableBeacon: true,
          },
          {
            target: '.vin-input',
            content: 'Enter your Vehicle Identification Number (VIN) for the most accurate valuation.',
            placement: 'bottom',
          },
          {
            target: '.mileage-input',
            content: 'Your current mileage helps us determine the condition and value of your vehicle.',
            placement: 'bottom',
          },
          {
            target: '.submit-button',
            content: 'After filling in all the details, click here to proceed to the payment step.',
            placement: 'bottom',
          },
        ];
      case 'results':
        return [
          {
            target: '.valuation-result',
            content: 'Here\'s your car valuation result based on current market data.',
            disableBeacon: true,
          },
          {
            target: '.market-value',
            content: 'This is the estimated market value of your vehicle.',
            placement: 'bottom',
          },
          {
            target: '.report-actions',
            content: 'You can download or email your valuation report for future reference.',
            placement: 'top',
          },
          {
            target: '.validity-period',
            content: 'Your valuation is valid for this period. Market values can change over time.',
            placement: 'bottom',
          },
        ];
      case 'admin':
        return [
          {
            target: '.admin-panel',
            content: 'Welcome to the admin panel. Here you can manage all car valuations and settings.',
            disableBeacon: true,
          },
          {
            target: '.inquiries-list',
            content: 'This is a list of all car valuation inquiries submitted by users.',
            placement: 'bottom',
          },
          {
            target: '.settings-section',
            content: 'Configure application settings like notification emails and API integrations.',
            placement: 'top',
          },
          {
            target: '.stats-dashboard',
            content: 'View statistics about valuations, user activity, and revenue.',
            placement: 'bottom',
          },
        ];
      default:
        return [];
    }
  };

  // Start a specific tour
  const startTour = (tourType: TourType) => {
    // If tour already completed and not forced, don't start
    if (completedTours.includes(tourType)) {
      return;
    }

    // Set steps based on tour type
    const tourSteps = getSteps(tourType);
    if (tourSteps.length === 0) {
      return;
    }

    setCurrentTour(tourType);
    setSteps(tourSteps);
    setIsTourActive(true);
  };

  // Skip the current tour
  const skipTour = () => {
    setIsTourActive(false);
    if (currentTour) {
      setCompletedTours([...completedTours, currentTour]);
    }
  };

  // Reset all completed tours
  const resetTours = () => {
    setCompletedTours([]);
    toast({
      title: "Tour Reset",
      description: "All guided tours have been reset and will show again on next visit.",
    });
  };

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setIsTourActive(false);
      
      // Mark tour as completed
      if (currentTour && !completedTours.includes(currentTour)) {
        setCompletedTours([...completedTours, currentTour]);
      }
    }
  };

  // Auto-start tour when path changes if not completed
  useEffect(() => {
    // Determine which tour to start based on the current path
    if (location === '/' && !completedTours.includes('homepage')) {
      // Delay slightly to ensure elements are rendered
      setTimeout(() => startTour('homepage'), 1000);
    } else if (location === '/valuation' && !completedTours.includes('valuation')) {
      setTimeout(() => startTour('valuation'), 1000);
    } else if (location.includes('/admin') && !completedTours.includes('admin')) {
      setTimeout(() => startTour('admin'), 1000);
    }
    // Results tour is typically started after payment completion, not on path change
  }, [location]);

  return (
    <OnboardingContext.Provider
      value={{
        startTour,
        skipTour,
        resetTours,
        isTourActive,
      }}
    >
      <Joyride
        steps={steps}
        run={isTourActive}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: '#3b82f6', // blue-500
            textColor: '#1f2937', // gray-800
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
          },
          spotlight: {
            backgroundColor: 'transparent',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonBack: {
            marginRight: 10,
          },
          buttonSkip: {
            color: '#6b7280', // gray-500
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip tour',
        }}
        callback={handleJoyrideCallback}
      />
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};