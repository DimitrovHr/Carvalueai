import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Loader2, 
  RefreshCw, 
  Check, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  LineChart, 
  Line, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

interface MarketDataManagementProps {
  inquiries?: any[];
}

export default function MarketDataManagement({ inquiries = [] }: MarketDataManagementProps) {
  const { toast } = useToast();
  
  // Fetch market data status
  const { data: marketStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/admin/market-data/status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/market-data/status');
      return await res.json();
    }
  });
  
  // Mutation for refining all valuations
  const refineAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/market-data/refine-all');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Refinement complete",
        description: data.message,
      });
      
      // Refetch status and inquiries data
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Refinement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for refining a single valuation
  const refineSingleMutation = useMutation({
    mutationFn: async (inquiryId: number) => {
      const res = await apiRequest('POST', `/api/admin/market-data/refine/${inquiryId}`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Valuation refined",
        description: "The valuation has been successfully updated with the latest market data.",
      });
      
      // Refetch status and inquiries data
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Refinement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Get valuations that need refinement
  const valuationsNeedingRefinement = inquiries?.filter(inquiry => {
    if (inquiry.status !== 'completed' || !inquiry.valuationResult) return false;
    
    const lastUpdated = inquiry.valuationResult?.marketInsights?.lastUpdated;
    if (!lastUpdated) return true; // Never updated
    
    // Check if it's been more than 7 days since the last update
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(lastUpdated) < sevenDaysAgo;
  }) || [];
  
  // Calculate statistics
  const completedValuations = inquiries?.filter(inquiry => 
    inquiry.status === 'completed' && inquiry.valuationResult
  ).length || 0;
  
  const percentNeedingRefinement = completedValuations === 0 
    ? 0 
    : Math.round((valuationsNeedingRefinement.length / completedValuations) * 100);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-1">Market Data Management</h3>
          <p className="text-muted-foreground mb-6">Monitor and update market valuations based on latest data</p>
        </div>
        
        <Button 
          onClick={() => refineAllMutation.mutate()} 
          disabled={refineAllMutation.isPending || isLoadingStatus}
        >
          {refineAllMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refine All Valuations
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valuations Needing Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {isLoadingStatus ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  marketStatus?.needsRefinement || valuationsNeedingRefinement.length
                )}
              </div>
              <Badge variant={percentNeedingRefinement > 50 ? "destructive" : "outline"}>
                {percentNeedingRefinement}% of total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Valuations older than 7 days that need refinement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recently Refined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStatus ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                marketStatus?.recentlyRefined || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Valuations updated in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Scheduled Refinement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium">
              {isLoadingStatus ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                "Midnight (00:00)"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Automated system runs daily at midnight
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Valuations That Need Refinement */}
      <div>
        <h4 className="text-lg font-medium mb-4">Valuations Needing Refinement</h4>
        
        {valuationsNeedingRefinement.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-md border border-gray-200">
            <div className="text-muted-foreground mb-2">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <p className="text-lg font-medium">All valuations are up to date!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              There are no valuations currently needing refinement. Check back later.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Market Trend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valuationsNeedingRefinement.slice(0, 5).map((inquiry) => {
                  const valuationResult = inquiry.valuationResult || {};
                  const marketValue = valuationResult.marketValue || 0;
                  const lastUpdated = valuationResult.marketInsights?.lastUpdated || inquiry.createdAt;
                  const marketTrend = valuationResult.marketInsights?.historicalTrendPercentage || 0;
                  
                  return (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {valuationResult.vehicleDetails?.vin || inquiry.vin}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {valuationResult.vehicleDetails?.mileage || inquiry.mileage} km
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(marketValue)}</TableCell>
                      <TableCell>
                        {formatDate(lastUpdated, { 
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {marketTrend > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : marketTrend < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          ) : (
                            <RefreshCw className="h-4 w-4 text-gray-500 mr-1" />
                          )}
                          {marketTrend > 0 ? "+" : ""}{marketTrend}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refineSingleMutation.mutate(inquiry.id)}
                          disabled={refineSingleMutation.isPending}
                        >
                          {refineSingleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Refine"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {valuationsNeedingRefinement.length > 5 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      +{valuationsNeedingRefinement.length - 5} more valuations needing refinement
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Market Data Insights */}
      <div>
        <h4 className="text-lg font-medium mb-4">Market Data Insights</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Price Trends</CardTitle>
              <CardDescription>Average changes in the last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "3 months ago", value: -1.2 },
                      { month: "2 months ago", value: -0.8 },
                      { month: "1 month ago", value: 0.5 },
                      { month: "Current", value: 1.2 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, "Change"]} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      dot={{ strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Brands Market Share</CardTitle>
              <CardDescription>Distribution of valuations by brand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "BMW", value: 35 },
                        { name: "Mercedes", value: 30 },
                        { name: "Audi", value: 20 },
                        { name: "Volkswagen", value: 10 },
                        { name: "Other", value: 5 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#8884d8" />
                      <Cell fill="#82ca9d" />
                      <Cell fill="#ffc658" />
                      <Cell fill="#ff8042" />
                      <Cell fill="#0088fe" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Market Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}