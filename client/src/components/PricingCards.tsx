import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingCards() {
  return (
    <div className="bg-neutral-light py-12" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
            Choose the Right Plan for You
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-dark lg:mx-auto">
            We offer two plans tailored to different needs. Pay with Revolut or PayPal.
          </p>
        </div>

        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 justify-center">
          {/* Regular Plan Card */}
          <Card className="bg-white overflow-hidden md:w-1/2 lg:w-1/3 flex flex-col">
            <CardContent className="p-0">
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6 flex-grow">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-100 text-primary">
                    Regular Plan
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  €15.99
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  Get a current market valuation for your car
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark">Current market value analysis</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark">Based on Bulgarian market data</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark">Valid for 1 week</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark text-opacity-70">Historical trend analysis</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark text-opacity-70">Future value prediction</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/valuation">
                    <Button 
                      variant="outline" 
                      className="w-full bg-neutral-light hover:bg-blue-100 text-primary"
                      data-plan="regular"
                      data-price="15.99"
                    >
                      Select Regular Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan Card */}
          <Card className="bg-white overflow-hidden md:w-1/2 lg:w-1/3 flex flex-col transform md:scale-105 border-2 border-primary">
            <CardContent className="p-0">
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6 flex-grow">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-accent">
                    Premium Plan
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  €29.99
                </div>
                <p className="mt-5 text-lg text-neutral-dark">
                  Comprehensive analysis with trends and forecasts
                </p>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark">Current market value analysis</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark">Based on Bulgarian market data</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark">Valid for 1 week</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark font-medium">3-month historical trend analysis</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-neutral-dark font-medium">1-month future value prediction</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/valuation">
                    <Button 
                      className="w-full" 
                      data-plan="premium"
                      data-price="29.99"
                    >
                      Select Premium Plan
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
