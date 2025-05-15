import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PricingCards from "@/components/PricingCards";
import SEOMetadata from "@/components/SEOMetadata";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();
  
  // Schema data for homepage
  const homepageSchema = {
    "@type": "Service",
    name: "CarValueAI Car Valuation",
    description: t.seo.homepageDescription,
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
        title={t.seo.homepageTitle}
        description={t.seo.homepageDescription}
        schemaData={homepageSchema}
      />
      
      <div className="homepage-content">
        <Hero />
        <div className="how-it-works">
          <HowItWorks />
        </div>
        <div className="pricing-section">
          <PricingCards />
        </div>
      </div>
    </>
  );
}
