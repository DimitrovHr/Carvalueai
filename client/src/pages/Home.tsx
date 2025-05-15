import { Helmet } from "react-helmet";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PricingCards from "@/components/PricingCards";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>CarValueAI - Get Your Car's Market Value in Bulgaria</title>
        <meta 
          name="description" 
          content="Get an accurate market valuation for your car based on the Bulgarian used car market. Choose between our Regular and Premium plans." 
        />
        <meta property="og:title" content="CarValueAI - Get Your Car's Market Value" />
        <meta 
          property="og:description" 
          content="Get an accurate market valuation for your car based on the Bulgarian used car market." 
        />
        <meta property="og:type" content="website" />
      </Helmet>
      
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
