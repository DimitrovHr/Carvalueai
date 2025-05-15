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
            target: '.cta-button',
            content: 'Click here to start your car valuation. You\'ll need your VIN number and basic vehicle information to get an accurate estimate.',
            placement: 'bottom',
          },
          {
            target: '.how-it-works',
            content: 'Our 3-step process makes it easy to get an accurate valuation based on actual Bulgarian market data.',
            placement: 'top',
          },
          {
            target: '.pricing-section',
            content: 'Choose from three different pricing plans. We\'re currently offering a 60-day trial for the first 50 registered users!',
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
            content: 'Enter your Vehicle Identification Number (VIN) found on your registration card or windshield. This 17-character code uniquely identifies your vehicle.',
            placement: 'bottom',
          },
          {
            target: '.mileage-input',
            content: 'Your current mileage is crucial for an accurate valuation. Higher mileage typically reduces value, while lower mileage can increase it.',
            placement: 'bottom',
          },
          {
            target: '.submit-button',
            content: 'After filling in all required details, click here to proceed to the next step where you\'ll select your valuation plan.',
            placement: 'bottom',
          },
        ];
      case 'results':
        return [
          {
            target: '.valuation-result',
            content: 'Congratulations! Here\'s your car valuation result based on current Bulgarian market data and our proprietary algorithm.',
            disableBeacon: true,
          },
          {
            target: '.market-value',
            content: 'This is the estimated market value of your vehicle. This figure represents what your car would likely sell for in the current Bulgarian market.',
            placement: 'bottom',
          },
          {
            target: '.validity-period',
            content: 'Market insights show historical trends and future predictions for your vehicle\'s value. These trends help you decide the best time to sell.',
            placement: 'bottom',
          },
          {
            target: '.report-actions',
            content: 'You can download a detailed PDF report or have it emailed to you for future reference. The report includes comprehensive market analysis and comparable vehicles.',
            placement: 'top',
          },
        ];
      case 'admin':
        return [
          {
            target: '.admin-panel',
            content: 'Welcome to the admin panel. This secure area is only accessible to administrators and provides tools to manage the application.',
            disableBeacon: true,
          },
          {
            target: '.inquiries-list',
            content: 'Here you can view and manage all car valuation inquiries submitted by users. Track status, view details, and manage customer valuations.',
            placement: 'bottom',
          },
          {
            target: '.settings-section',
            content: 'Configure notification emails to receive alerts about new valuations. You can also adjust the AI model settings used for generating valuations.',
            placement: 'top',
          },
          {
            target: '.testing',
            content: 'This section allows you to test the valuation algorithm with sample data. Useful for verifying the accuracy of valuations before implementing changes.',
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
    // Check if it's the user's first time using the app
    const isFirstVisit = localStorage.getItem('firstVisit') === null;
    
    if (isFirstVisit) {
      // Mark that the user has visited the app before
      localStorage.setItem('firstVisit', 'false');
      
      // Show a welcome toast for first-time users
      toast({
        title: "Welcome to CarValueAI!",
        description: "We've prepared a guided tour to help you get started. Click the help icons for guidance anytime.",
      });
    }
    
    // Determine which tour to start based on the current path
    if (location === '/' && !completedTours.includes('homepage')) {
      // Delay slightly to ensure elements are rendered
      setTimeout(() => startTour('homepage'), 1500);
    } else if (location === '/valuation' && !completedTours.includes('valuation')) {
      setTimeout(() => startTour('valuation'), 1500);
    } else if (location.includes('/admin') && !completedTours.includes('admin')) {
      setTimeout(() => startTour('admin'), 1500);
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