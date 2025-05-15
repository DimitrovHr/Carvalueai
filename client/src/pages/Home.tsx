import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PricingCards from "@/components/PricingCards";
import SEOMetadata from "@/components/SEOMetadata";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();
  
  // Schema data for homepage
  const pageTitle = "CarValueAI - Expert Car Valuations in Bulgaria";
  const pageDescription = "Find the exact value of your car with our AI-powered valuation system. Based on real Bulgarian market data and latest trends.";
  
  const homepageSchema = {
    "@type": "Service",
    name: "CarValueAI Car Valuation",
    description: pageDescription,
    provider: {
      "@type": "Organization",
      name: "CarValueAI",
      sameAs: "https://carvalueai.bg"
    },
    areaServed: {
      "@type": "Country",
      name: "Bulgaria"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Car Valuation Plans",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Regular Car Valuation"
          },
          price: "15.99",
          priceCurrency: "EUR"
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Premium Car Valuation"
          },
          price: "29.99",
          priceCurrency: "EUR"
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Business Car Valuation"
          },
          price: "49.99",
          priceCurrency: "EUR"
        }
      ]
    }
  };
  
  return (
    <>
      <SEOMetadata 
        title={pageTitle}
        description={pageDescription}
        schemaData={homepageSchema}
      />
      
      <div className="homepage-content">
        <Hero />
        <div id="how-it-works" className="how-it-works">
          <HowItWorks />
        </div>
        <div id="pricing" className="pricing-section">
          <PricingCards />
        </div>
      </div>
    </>
  );
}
