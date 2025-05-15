import { useState, useEffect } from "react";
import { useLocation, useRouter } from 'wouter';
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import OnboardingButton from "@/components/OnboardingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { carDetailsSchema, paymentSchema } from "@shared/schema";
import { z } from "zod";
import ProgressSteps from "@/components/ProgressSteps";
import { useToast } from "@/hooks/use-toast";
import { Check, Download, Mail, Loader2, CheckCircle } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import ValuationChart from "@/components/ValuationChart";

export default function CarValuationForm() {
  const [step, setStep] = useState(0);
  const [inquiryId, setInquiryId] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'regular' | 'premium'>('regular');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'revolut' | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const steps = ["Car Details", "Plan Selection", "Payment", "Results"];

  // Setup form for car details
  const carDetailsForm = useForm<z.infer<typeof carDetailsSchema>>({
    resolver: zodResolver(carDetailsSchema),
    defaultValues: {
      vin: "",
      mileage: undefined,
      fuelType: undefined,
      transmission: undefined,
      visibleDamages: "",
      mechanicalDamages: "",
      additionalInfo: ""
    }
  });

  // Create inquiry mutation
  const createInquiryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof carDetailsSchema>) => {
      const res = await apiRequest('POST', '/api/inquiries', data);
      return res.json();
    },
    onSuccess: (data) => {
      setInquiryId(data.id);
      setStep(1); // Move to plan selection
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "There was a problem submitting your car details.",
        variant: "destructive"
      });
    }
  });

  // Complete payment mutation
  const completePaymentMutation = useMutation({
    mutationFn: async (data: { 
      inquiryId: number; 
      planType: 'regular' | 'premium'; 
      paymentMethod: 'paypal' | 'revolut';
      paymentId: string;
      amount: number;
    }) => {
      const res = await apiRequest('POST', '/api/payment/complete', data);
      return res.json();
    },
    onSuccess: (data) => {
      setStep(3); // Move to results
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/${inquiryId}`] });
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: error.message || "There was a problem processing your payment.",
        variant: "destructive"
      });
    }
  });

  // Fetch inquiry data for results
  const { data: inquiryData, isLoading: isLoadingInquiry } = useQuery({
    queryKey: [`/api/inquiries/${inquiryId}`],
    enabled: step === 3 && inquiryId !== null,
  });

  // Handle car details form submission
  const onSubmitCarDetails = (data: z.infer<typeof carDetailsSchema>) => {
    createInquiryMutation.mutate(data);
  };

  // Handle plan selection
  const selectPlan = (plan: 'regular' | 'premium') => {
    setSelectedPlan(plan);
  };

  // Handle payment method selection
  const selectPaymentMethod = (method: 'paypal' | 'revolut') => {
    setPaymentMethod(method);
  };

  // Handle payment completion
  const completePayment = (paymentId: string) => {
    if (!inquiryId) return;
    
    completePaymentMutation.mutate({
      inquiryId,
      planType: selectedPlan,
      paymentMethod: paymentMethod || 'paypal',
      paymentId,
      amount: selectedPlan === 'regular' ? 15.99 : 29.99
    });
  };

  // Mock functions for downloading and emailing report
  const downloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your valuation report has been downloaded."
    });
  };

  const emailReport = () => {
    toast({
      title: "Report Sent",
      description: "Your valuation report has been sent to your email."
    });
  };

  // Handle navigation between steps
  const goToStep = (newStep: number) => {
    if (newStep >= 0 && newStep <= 3) {
      setStep(newStep);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Get amount based on selected plan
  const getAmount = () => {
    return selectedPlan === 'regular' ? '15.99' : '29.99';
  };

  return (
    <>
      <Helmet>
        <title>Car Valuation Form | CarValueAI</title>
        <meta name="description" content="Fill out the form to get an accurate valuation of your car based on the Bulgarian market." />
      </Helmet>
      
      <div className="bg-white py-12" id="valuation-form">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Valuation</h2>
            <div className="flex items-center justify-center mt-2">
              <p className="text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
                Get Your Car's Value
              </p>
              <OnboardingButton tourType="valuation" className="ml-2" />
            </div>
            <p className="mt-4 max-w-2xl text-xl text-neutral-dark mx-auto">
              Fill out the form below to receive an accurate valuation based on the Bulgarian used car market.
            </p>
          </div>

          {/* Multi-step form with progress indicator */}
          <Card className="shadow overflow-hidden rounded-lg">
            {/* Progress Steps */}
            <ProgressSteps currentStep={step} steps={steps} />
            
            {/* Form Steps */}
            <CardContent className="px-4 py-5 sm:p-6">
              {/* Step 1: Car Details */}
              {step === 0 && (
                <div className="form-step car-details-section">
                  <Form {...carDetailsForm}>
                    <form onSubmit={carDetailsForm.handleSubmit(onSubmitCarDetails)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <FormField
                          control={carDetailsForm.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>VIN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. WVWZZZ1JZXW000001" {...field} className="vin-input" />
                              </FormControl>
                              <FormDescription>
                                Vehicle Identification Number (17 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={carDetailsForm.control}
                          name="mileage"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Mileage (km)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 120000" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  className="mileage-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={carDetailsForm.control}
                          name="fuelType"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Fuel Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fuel type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="petrol">Petrol</SelectItem>
                                  <SelectItem value="diesel">Diesel</SelectItem>
                                  <SelectItem value="electric">Electric</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                  <SelectItem value="lpg">LPG</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={carDetailsForm.control}
                          name="transmission"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Transmission</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select transmission type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="automatic">Automatic</SelectItem>
                                  <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={carDetailsForm.control}
                          name="visibleDamages"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-6">
                              <FormLabel>Visible Damages</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe any visible damages, scratches, dents, etc."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={carDetailsForm.control}
                          name="mechanicalDamages"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-6">
                              <FormLabel>Known Mechanical Issues</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe any known mechanical issues, warning lights, noises, etc."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={carDetailsForm.control}
                          name="additionalInfo"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-6">
                              <FormLabel>Additional Information</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any other relevant information about your vehicle"
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-5">
                        <div className="flex justify-end">
                          <Button 
                            type="submit"
                            className="submit-button"
                            disabled={createInquiryMutation.isPending}
                          >
                            {createInquiryMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Next: Select Plan
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {/* Step 2: Plan Selection */}
              {step === 1 && (
                <div className="form-step space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-neutral-dark">Select Your Plan</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Choose the plan that best fits your needs</p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    <div 
                      className={`relative rounded-lg border ${selectedPlan === 'regular' ? 'border-primary border-2' : 'border-gray-300'} bg-white p-6 shadow-sm hover:border-primary focus:outline-none cursor-pointer`}
                      onClick={() => selectPlan('regular')}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 text-primary text-2xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-neutral-dark">Regular Plan</h4>
                          <p className="mt-1 text-sm text-muted-foreground">Current market valuation</p>
                          <p className="mt-2 text-2xl font-bold text-neutral-dark">€15.99</p>
                          <ul className="mt-3 space-y-1 text-sm text-neutral-dark">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Current market value</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Valid for 1 week</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      {selectedPlan === 'regular' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>

                    <div 
                      className={`relative rounded-lg border ${selectedPlan === 'premium' ? 'border-primary border-2' : 'border-gray-300'} bg-white p-6 shadow-sm hover:border-primary focus:outline-none cursor-pointer`}
                      onClick={() => selectPlan('premium')}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 text-accent text-2xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-line-chart"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-neutral-dark">Premium Plan</h4>
                          <p className="mt-1 text-sm text-muted-foreground">Complete market analysis</p>
                          <p className="mt-2 text-2xl font-bold text-neutral-dark">€29.99</p>
                          <ul className="mt-3 space-y-1 text-sm text-neutral-dark">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Everything in Regular</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>3-month historical trends</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>1-month future prediction</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      {selectedPlan === 'premium' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => goToStep(0)}>
                        Back
                      </Button>
                      <Button onClick={() => goToStep(2)}>
                        Next: Payment
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 2 && (
                <div className="form-step space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-neutral-dark">Complete Your Payment</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Select your preferred payment method</p>
                  </div>

                  <div className="bg-neutral-light rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-dark">Selected Plan:</span>
                        <span className="ml-2 text-primary font-medium capitalize">{selectedPlan} Plan</span>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-dark">Price:</span>
                        <span className="ml-2 text-primary font-medium">€{getAmount()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-neutral-dark mb-3">Payment Method</div>
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                      <div 
                        className={`relative rounded-lg border ${paymentMethod === 'revolut' ? 'border-primary border-2' : 'border-gray-300'} bg-white p-4 shadow-sm hover:border-primary focus:outline-none cursor-pointer`}
                        onClick={() => selectPaymentMethod('revolut')}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 text-blue-600 text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-base font-medium text-neutral-dark">Revolut</h4>
                            <p className="mt-1 text-sm text-muted-foreground">Pay with your Revolut account</p>
                          </div>
                        </div>
                        {paymentMethod === 'revolut' && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>

                      <div 
                        className={`relative rounded-lg border ${paymentMethod === 'paypal' ? 'border-primary border-2' : 'border-gray-300'} bg-white p-4 shadow-sm hover:border-primary focus:outline-none cursor-pointer`}
                        onClick={() => selectPaymentMethod('paypal')}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 text-blue-800 text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19.554 9.488c.121.563.106 1.246-.04 2.051-.582 2.978-2.477 4.466-5.683 4.466h-.442a.666.666 0 0 0-.444.166.72.72 0 0 0-.239.427l-.041.189-.553 3.479-.021.151a.706.706 0 0 1-.247.426.666.666 0 0 1-.447.166H8.874a.395.395 0 0 1-.331-.15.395.395 0 0 1-.072-.337l.896-5.708 1.64-10.046a.394.394 0 0 1 .403-.316h5.317c2.42 0 4.217 1.083 4.827 3.037zM10.028 2h7.457c.695 0 1.456.08 2.116.299.88.001.161.006.24.009 1.065.322 1.879.946 2.335 1.93.457.992.478 2.177.062 3.535l-.031.103c-.916 4.104-3.606 6.292-8.105 6.292h-1.076l.209 1.331-1.711 10.792A1.428 1.428 0 0 1 9.99 22h-2.54a1.356 1.356 0 0 1-1.198-.731 1.392 1.392 0 0 1-.156-1.211L9.69 3.239A1.42 1.42 0 0 1 11.1 2h-1.072z"/></svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-base font-medium text-neutral-dark">PayPal</h4>
                            <p className="mt-1 text-sm text-muted-foreground">Pay with your PayPal account</p>
                          </div>
                        </div>
                        {paymentMethod === 'paypal' && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {paymentMethod === 'revolut' && (
                      <div className="payment-form mt-5">
                        <div className="bg-white p-4 rounded-md border border-gray-300">
                          <div className="text-sm font-medium text-neutral-dark mb-3">Revolut Payment Details</div>
                          <p className="text-sm text-neutral-dark mb-4">Complete your payment through the Revolut app after clicking "Pay Now".</p>
                          <div className="text-center">
                            <img src="https://cdn.pixabay.com/photo/2021/10/19/10/56/revolut-logo-6723617_1280.jpg" alt="Revolut payment illustration" className="mx-auto h-20 object-contain rounded" />
                          </div>
                          
                          <div className="mt-4 flex justify-center">
                            <Button 
                              onClick={() => {
                                // Mock Revolut payment process
                                if (!inquiryId) return;
                                
                                const mockPaymentId = `rev_${Date.now()}`;
                                setPaymentId(mockPaymentId);
                                
                                completePaymentMutation.mutate({
                                  inquiryId,
                                  planType: selectedPlan,
                                  paymentMethod: 'revolut',
                                  paymentId: mockPaymentId,
                                  amount: selectedPlan === 'regular' ? 15.99 : 29.99
                                });
                              }}
                              disabled={completePaymentMutation.isPending}
                            >
                              {completePaymentMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Pay with Revolut
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'paypal' && (
                      <div className="payment-form mt-5">
                        <div className="bg-white p-4 rounded-md border border-gray-300">
                          <div className="text-sm font-medium text-neutral-dark mb-3">PayPal Payment Details</div>
                          <p className="text-sm text-neutral-dark mb-4">You will be redirected to PayPal to complete your payment.</p>
                          
                          <div className="flex justify-center mt-4">
                            <PayPalButton 
                              amount={getAmount()}
                              currency="EUR"
                              intent="CAPTURE"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => goToStep(1)}>
                        Back
                      </Button>
                      <Button 
                        disabled={!paymentMethod || completePaymentMutation.isPending}
                        onClick={() => {
                          // This button would normally be handled by the PayPal payment process
                          // For Revolut, we have a separate button within the payment form section
                        }}
                      >
                        {completePaymentMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Results */}
              {step === 3 && (
                <div className="form-step text-center space-y-6 valuation-result">
                  {isLoadingInquiry ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : inquiryData ? (
                    <>
                      <div>
                        <CheckCircle className="text-green-500 text-6xl mx-auto" />
                        <h3 className="mt-2 text-2xl font-bold text-neutral-dark">Valuation Complete!</h3>
                        <p className="mt-1 text-neutral">Thank you for using CarValueAI</p>
                      </div>

                      <div className="bg-neutral-light p-6 rounded-lg">
                        <div className="result-section">
                          <div className="flex items-center justify-center">
                            <h4 className="text-xl font-semibold text-neutral-dark">Your Car's Market Value</h4>
                            <OnboardingButton tourType="results" className="ml-2" />
                          </div>
                          <div className="mt-4 flex justify-center market-value">
                            <div className="text-5xl font-bold text-primary">
                              {formatCurrency(inquiryData.valuationResult.marketValue)}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-neutral">Based on current Bulgarian market data</p>
                          <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
                            <h5 className="font-medium text-neutral-dark">Vehicle Details</h5>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div className="text-neutral">VIN:</div>
                              <div className="text-neutral-dark font-medium">{inquiryData.vin}</div>
                              <div className="text-neutral">Mileage:</div>
                              <div className="text-neutral-dark font-medium">{inquiryData.mileage} km</div>
                              <div className="text-neutral">Fuel Type:</div>
                              <div className="text-neutral-dark font-medium capitalize">{inquiryData.fuelType}</div>
                              <div className="text-neutral">Transmission:</div>
                              <div className="text-neutral-dark font-medium capitalize">{inquiryData.transmission}</div>
                            </div>
                          </div>
                        </div>

                        {inquiryData.planType === 'premium' && inquiryData.valuationResult.historicalData && (
                          <div className="mt-6 border-t border-gray-300 pt-6">
                            <h4 className="text-xl font-semibold text-neutral-dark">Market Trend Analysis</h4>
                            <div className="mt-4">
                              <ValuationChart data={inquiryData.valuationResult.historicalData} />
                              
                              <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
                                <h5 className="font-medium text-neutral-dark">Market Insights</h5>
                                <p className="mt-2 text-sm text-neutral-dark">
                                  Based on our analysis, your vehicle value has 
                                  <span className={`${inquiryData.valuationResult.marketInsights.historicalTrendPercentage > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                    {' '}{inquiryData.valuationResult.marketInsights.historicalTrendPercentage > 0 ? 'increased' : 'decreased'} by {Math.abs(inquiryData.valuationResult.marketInsights.historicalTrendPercentage)}%
                                  </span> 
                                  {' '}over the past 3 months. We predict a 
                                  <span className={`${inquiryData.valuationResult.futurePrediction.trendPercentage > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                    {' '}{inquiryData.valuationResult.futurePrediction.trendPercentage > 0 ? 'further' : ''} {Math.abs(inquiryData.valuationResult.futurePrediction.trendPercentage)}% {inquiryData.valuationResult.futurePrediction.trendPercentage > 0 ? 'increase' : 'decrease'}
                                  </span> 
                                  {' '}in the next month.
                                </p>
                                <p className="mt-2 text-sm text-neutral-dark">
                                  The best time to sell would be 
                                  <span className="font-medium">
                                    {' '}{inquiryData.valuationResult.marketInsights.bestTimeToSell}
                                  </span> 
                                  {' '}based on seasonal market trends.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-5">
                        <div className="flex justify-center space-x-4">
                          <Button 
                            onClick={downloadReport}
                            className="inline-flex items-center"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download Report
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={emailReport}
                            className="inline-flex items-center"
                          >
                            <Mail className="mr-2 h-4 w-4" /> Email Report
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Result data not available. Please try again.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
