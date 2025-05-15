import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Badge } from "@/components/ui/badge";

export default function PricingCards() {
  const { language } = useContext(LanguageContext);
  
  const translations = {
    en: {
      title: "Pricing",
      subtitle: "Choose the Right Plan for You",
      description: "We offer three plans tailored to different needs. Pay with Revolut or PayPal.",
      regular: {
        name: "Regular Plan",
        price: "€15.99",
        description: "Get a current market valuation for your car",
        button: "Select Regular Plan",
        features: [
          "Current market value analysis",
          "Based on Bulgarian market data",
          "Valid for 1 week"
        ],
        notIncluded: [
          "Historical trend analysis",
          "Future value prediction",
          "Competitor price comparison",
          "Market demand forecast"
        ]
      },
      premium: {
        name: "Premium Plan",
        price: "€29.99",
        description: "Comprehensive analysis with trends and forecasts",
        button: "Select Premium Plan",
        features: [
          "Current market value analysis",
          "Based on Bulgarian market data",
          "Valid for 1 week",
          "3-month historical trend analysis",
          "1-month future value prediction"
        ],
        notIncluded: [
          "Competitor price comparison",
          "Market demand forecast"
        ]
      },
      business: {
        name: "Business Plan",
        price: "€49.99",
        description: "Complete market analysis for professional use",
        button: "Select Business Plan",
        features: [
          "Current market value analysis",
          "Based on Bulgarian market data",
          "Valid for 1 month",
          "3-month historical trend analysis",
          "3-month future value prediction",
          "Competitor price comparison",
          "Market demand forecast",
          "Export to PDF option",
          "Priority support"
        ],
        notIncluded: []
      },
      trial: "60-Day Trial Available"
    },
    bg: {
      title: "Ценоразпис",
      subtitle: "Изберете подходящия план за Вас",
      description: "Предлагаме три плана, съобразени с различни нужди. Платете с Revolut или PayPal.",
      regular: {
        name: "Обикновен План",
        price: "€15.99",
        description: "Получете текуща пазарна оценка за вашия автомобил",
        button: "Изберете Обикновен План",
        features: [
          "Анализ на текущата пазарна стойност",
          "Базирано на данни от българския пазар",
          "Валидно за 1 седмица"
        ],
        notIncluded: [
          "Анализ на исторически тенденции",
          "Прогноза за бъдеща стойност",
          "Сравнение с конкурентни цени",
          "Прогноза за пазарно търсене"
        ]
      },
      premium: {
        name: "Премиум План",
        price: "€29.99",
        description: "Изчерпателен анализ с тенденции и прогнози",
        button: "Изберете Премиум План",
        features: [
          "Анализ на текущата пазарна стойност",
          "Базирано на данни от българския пазар",
          "Валидно за 1 седмица",
          "3-месечен анализ на историческите тенденции",
          "1-месечна прогноза за бъдеща стойност"
        ],
        notIncluded: [
          "Сравнение с конкурентни цени",
          "Прогноза за пазарно търсене"
        ]
      },
      business: {
        name: "Бизнес План",
        price: "€49.99",
        description: "Пълен пазарен анализ за професионална употреба",
        button: "Изберете Бизнес План",
        features: [
          "Анализ на текущата пазарна стойност",
          "Базирано на данни от българския пазар",
          "Валидно за 1 месец",
          "3-месечен анализ на историческите тенденции",
          "3-месечна прогноза за бъдеща стойност",
          "Сравнение с конкурентни цени",
          "Прогноза за пазарно търсене",
          "Опция за експорт в PDF",
          "Приоритетна поддръжка"
        ],
        notIncluded: []
      },
      trial: "Наличен 60-дневен пробен период"
    }
  };

  const t = translations[language === "en" ? "en" : "bg"];

  return (
    <div className="bg-neutral-light py-12" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">{t.title}</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
            {t.subtitle}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-dark lg:mx-auto">
            {t.description}
          </p>
          <div className="mt-4 flex justify-center">
            <Badge variant="secondary" className="text-sm font-medium py-1">
              {t.trial}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-8 justify-center">
          {/* Regular Plan Card */}
          <Card className="bg-white overflow-hidden w-full md:w-1/3 flex flex-col">
            <CardContent className="p-0">
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6 flex-grow">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-100 text-primary">
                    {t.regular.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  {t.regular.price}
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  {t.regular.description}
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {t.regular.features.map((feature, index) => (
                    <li key={`regular-feature-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark">{feature}</p>
                    </li>
                  ))}
                  {t.regular.notIncluded.map((feature, index) => (
                    <li key={`regular-not-included-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark text-opacity-70">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/valuation">
                    <Button 
                      variant="outline" 
                      className="w-full bg-neutral-light hover:bg-blue-100 text-primary"
                      data-plan="regular"
                      data-price="15.99"
                    >
                      {t.regular.button}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan Card */}
          <Card className="bg-white overflow-hidden w-full md:w-1/3 flex flex-col transform md:scale-105 border-2 border-primary">
            <CardContent className="p-0">
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6 flex-grow">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-accent">
                    {t.premium.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  {t.premium.price}
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  {t.premium.description}
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {t.premium.features.map((feature, index) => (
                    <li key={`premium-feature-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark">{feature}</p>
                    </li>
                  ))}
                  {t.premium.notIncluded.map((feature, index) => (
                    <li key={`premium-not-included-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark text-opacity-70">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/valuation">
                    <Button 
                      className="w-full" 
                      data-plan="premium"
                      data-price="29.99"
                    >
                      {t.premium.button}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Plan Card */}
          <Card className="bg-white overflow-hidden w-full md:w-1/3 flex flex-col border-2 border-accent">
            <CardContent className="p-0">
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6 flex-grow">
                <div className="flex justify-between">
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-accent/20 text-accent">
                    {t.business.name}
                  </h3>
                  <Badge variant="default" className="bg-accent text-white">New</Badge>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  {t.business.price}
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  {t.business.description}
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {t.business.features.map((feature, index) => (
                    <li key={`business-feature-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/valuation">
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90" 
                      data-plan="business"
                      data-price="49.99"
                    >
                      {t.business.button}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
