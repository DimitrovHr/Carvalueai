import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { useTranslations } from "@/lib/translations";

export function useTranslation() {
  const { language } = useContext(LanguageContext);
  const translations = useTranslations(language);
  
  return {
    t: translations,
    language
  };
}