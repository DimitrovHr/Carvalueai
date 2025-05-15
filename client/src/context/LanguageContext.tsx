import React, { createContext, useState, useEffect, ReactNode } from "react";

interface LanguageContextType {
  language: "en" | "bg";
  setLanguage: (lang: "en" | "bg") => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {}
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<"en" | "bg">("en");

  // Try to get stored language preference from localStorage
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage === "en" || storedLanguage === "bg") {
      setLanguage(storedLanguage);
    }
  }, []);

  // Update localStorage when language changes
  const handleSetLanguage = (lang: "en" | "bg") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};