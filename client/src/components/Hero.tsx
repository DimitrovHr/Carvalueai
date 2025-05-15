import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-neutral-dark sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Discover your car's</span>{' '}
                <span className="block text-primary xl:inline">true market value</span>
              </h1>
              <p className="mt-3 text-base text-neutral-dark sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                CarValueAI gives you accurate market valuations based on the Bulgarian used car market. Get started today with our advanced AI-powered car valuation tool.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow cta-button">
                  <Link href="/valuation">
                    <Button size="lg" className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/#how-it-works">
                    <Button variant="outline" size="lg" className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10 text-primary bg-neutral-light hover:bg-blue-100">
                      How It Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img 
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
          src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&h=1000" 
          alt="Modern car with valuation overlay" 
        />
      </div>
    </div>
  );
}
