import { Car, CreditCard, LineChart } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="py-12 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Process</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
            How CarValueAI Works
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-dark lg:mx-auto">
            Get a precise market valuation of your car in just a few simple steps.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Car className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-dark">Enter Your Car Details</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-neutral-dark">
                Provide your car's VIN, mileage, fuel type, transmission type, and other relevant details.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-dark">Choose Your Plan</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-neutral-dark">
                Select between our Regular (€15.99) or Premium (€29.99) plan based on your needs.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <LineChart className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-dark">Get Your Valuation</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-neutral-dark">
                Receive an accurate market valuation based on Bulgarian used car market data.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
