import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";

export default function PricingCards() {
  const { t } = useTranslation();

  return (
    <div className="bg-neutral-light py-12" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">{t.pricing.title}</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
            {t.pricing.subtitle}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-dark lg:mx-auto">
            {t.pricing.description}
          </p>
          <div className="mt-4 flex justify-center">
            <Badge variant="secondary" className="text-sm font-medium py-1">
              {t.pricing.trial}
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
                    {t.pricing.regularName}
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  {t.pricing.regularPrice}
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  {t.pricing.regularDesc}
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {t.pricing.regularFeatures.map((feature, index) => (
                    <li key={`regular-feature-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark">{feature}</p>
                    </li>
                  ))}
                  {t.pricing.regularNotIncluded.map((feature, index) => (
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
                      {t.pricing.regularButton}
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
                    {t.pricing.premiumName}
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  {t.pricing.premiumPrice}
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  {t.pricing.premiumDesc}
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {t.pricing.premiumFeatures.map((feature, index) => (
                    <li key={`premium-feature-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark">{feature}</p>
                    </li>
                  ))}
                  {t.pricing.premiumNotIncluded.map((feature, index) => (
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
                      {t.pricing.premiumButton}
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
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase bg-accent/30 text-accent shadow-sm">
                    {t.pricing.businessName}
                  </h3>
                  <Badge variant="default" className="bg-accent text-white font-medium shadow-sm">{t.pricing.newBadge}</Badge>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold text-neutral-dark">
                  {t.pricing.businessPrice}
                </div>
                <p className="mt-5 text-lg text-neutral-dark font-medium">
                  {t.pricing.businessDesc}
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {t.pricing.businessFeatures.map((feature, index) => (
                    <li key={`business-feature-${index}`} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-neutral-dark font-medium">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/valuation">
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-white font-bold shadow-sm border border-accent" 
                      data-plan="business"
                      data-price="49.99"
                    >
                      {t.pricing.businessButton}
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
