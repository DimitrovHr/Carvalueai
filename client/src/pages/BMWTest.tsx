import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Mail, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ValuationChart from "@/components/ValuationChart";

export default function BMWTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [valuationData, setValuationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("regular");
  const { toast } = useToast();

  useEffect(() => {
    const fetchValuation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/bmw-test-valuation");
        if (!response.ok) {
          throw new Error("Failed to fetch valuation data");
        }
        const data = await response.json();
        console.log("Valuation data:", data);
        setValuationData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load valuation data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchValuation();
  }, [toast]);

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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Format date to display only the date part
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading valuation...</span>
      </div>
    );
  }

  // If there's no data, show an error message
  if (!valuationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-500">Failed to load valuation data</h2>
        <p className="mt-2">Please try again later.</p>
      </div>
    );
  }

  // For the active tab, get the correct valuation data
  const currentValuation = valuationData[activeTab] || {};

  return (
    <>
      <Helmet>
        <title>BMW 530d Valuation Test | CarValueAI</title>
        <meta name="description" content="Test valuation results for a BMW 530d station wagon from 2017 with 193,000 km." />
      </Helmet>

      <div className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Test Valuation</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
              BMW 530d Station Wagon (2017)
            </p>
            <p className="mt-4 max-w-2xl text-xl text-neutral-dark mx-auto">
              Automatic Transmission | 193,000 km | Diesel
            </p>
          </div>

          <Card className="shadow-lg mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Valuation Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="regular" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="regular">Regular (€15.99)</TabsTrigger>
                  <TabsTrigger value="premium">Premium (€29.99)</TabsTrigger>
                  <TabsTrigger value="business">Business (€49.99)</TabsTrigger>
                </TabsList>

                {/* Regular Plan */}
                <TabsContent value="regular">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Vehicle Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">VIN:</span> {currentValuation.vehicleDetails?.vin || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Mileage:</span> {(currentValuation.vehicleDetails?.mileage || 0).toLocaleString()} km
                            </div>
                            <div>
                              <span className="font-medium">Fuel Type:</span> {
                                currentValuation.vehicleDetails?.fuelType 
                                  ? currentValuation.vehicleDetails.fuelType.charAt(0).toUpperCase() + 
                                    currentValuation.vehicleDetails.fuelType.slice(1)
                                  : 'N/A'
                              }
                            </div>
                            <div>
                              <span className="font-medium">Transmission:</span> {
                                currentValuation.vehicleDetails?.transmission
                                  ? currentValuation.vehicleDetails.transmission.charAt(0).toUpperCase() + 
                                    currentValuation.vehicleDetails.transmission.slice(1)
                                  : 'N/A'
                              }
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Market Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-primary">
                              {formatCurrency(currentValuation.marketValue || 0)}
                            </div>
                            <div className="mt-2 text-sm text-neutral">
                              Valid until: {currentValuation.validUntil ? formatDate(currentValuation.validUntil) : 'N/A'}
                            </div>
                          </div>
                          
                          <div className="flex justify-center mt-4 space-x-4">
                            <Button variant="outline" onClick={downloadReport}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Report
                            </Button>
                            <Button variant="outline" onClick={emailReport}>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Report
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Premium Plan */}
                <TabsContent value="premium">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Market Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary">
                            {formatCurrency(currentValuation.marketValue || 0)}
                          </div>
                          <div className="mt-2 text-sm text-neutral">
                            Valid until: {currentValuation.validUntil ? formatDate(currentValuation.validUntil) : 'N/A'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {currentValuation.marketInsights && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Market Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="font-medium">Historical Trend:</span> {currentValuation.marketInsights.historicalTrendPercentage}%
                            </div>
                            <div>
                              <span className="font-medium">Best Time to Sell:</span> {currentValuation.marketInsights.bestTimeToSell}
                            </div>
                            <div>
                              <span className="font-medium">Market Condition:</span> {currentValuation.marketInsights.marketCondition}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="md:col-span-2 flex justify-center space-x-4">
                      <Button variant="outline" onClick={downloadReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                      <Button variant="outline" onClick={emailReport}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Report
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Business Plan */}
                <TabsContent value="business">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Market Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary">
                            {formatCurrency(currentValuation.marketValue || 0)}
                          </div>
                          <div className="mt-2 text-sm text-neutral">
                            Valid until: {currentValuation.validUntil ? formatDate(currentValuation.validUntil) : 'N/A'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {currentValuation.marketDemand && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Market Demand</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="font-medium">Demand Level:</span> {currentValuation.marketDemand.demandLevel}
                            </div>
                            <div>
                              <span className="font-medium">Demand Score:</span> {currentValuation.marketDemand.demandScore}/10
                            </div>
                            {currentValuation.marketDemand.seasonalTrends && (
                              <div>
                                <span className="font-medium">Seasonal Trends:</span> {currentValuation.marketDemand.seasonalTrends}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="md:col-span-2 flex justify-center space-x-4">
                      <Button variant="outline" onClick={downloadReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                      <Button variant="outline" onClick={emailReport}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Report
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}