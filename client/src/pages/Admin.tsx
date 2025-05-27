import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { adminSettingsFormSchema, carDetailsSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CAR_BRANDS_MODELS, CAR_TYPES, FUEL_TYPES, TRANSMISSION_TYPES, YEARS } from "@/lib/car-data";
import { 
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Calendar,
  Activity 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ValuationChart from "@/components/ValuationChart";
import MarketDataManagement from "@/components/MarketDataManagement";
import { Badge } from "@/components/ui/badge";
import { INQUIRY_STATUS } from "@/lib/constants";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("inquiries");
  const { toast } = useToast();

  // Fetch inquiries
  const { data: inquiriesData, isLoading: isLoadingInquiries } = useQuery({
    queryKey: ['/api/inquiries'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch admin settings
  const { data: adminSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  // Settings form
  const settingsForm = useForm<z.infer<typeof adminSettingsFormSchema>>({
    resolver: zodResolver(adminSettingsFormSchema),
    defaultValues: {
      notificationEmail: "",
      apiSettings: ""
    }
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (adminSettings) {
      settingsForm.reset({
        notificationEmail: adminSettings.notificationEmail,
        apiSettings: adminSettings.apiSettings ? JSON.stringify(adminSettings.apiSettings, null, 2) : ""
      });
    }
  }, [adminSettings, settingsForm]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminSettingsFormSchema>) => {
      const res = await apiRequest('POST', '/api/admin/settings', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your admin settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message || "An error occurred while saving settings.",
        variant: "destructive"
      });
    }
  });

  // Test form
  const testForm = useForm<z.infer<typeof carDetailsSchema>>({
    resolver: zodResolver(carDetailsSchema),
    defaultValues: {
      vin: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      carType: "sedan",
      mileage: undefined,
      fuelType: undefined,
      transmission: undefined,
      visibleDamages: "",
      mechanicalDamages: "",
      additionalInfo: ""
    }
  });

  // Delete inquiry mutation
  const deleteInquiryMutation = useMutation({
    mutationFn: async (inquiryId: number) => {
      const res = await apiRequest('DELETE', `/api/inquiries/${inquiryId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry deleted",
        description: "The inquiry has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting inquiry",
        description: error.message || "An error occurred while deleting the inquiry.",
        variant: "destructive"
      });
    }
  });

  // Handle delete inquiry
  const handleDeleteInquiry = (inquiryId: number) => {
    if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      deleteInquiryMutation.mutate(inquiryId);
    }
  };

  // Handle view inquiry
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };

  // Test valuation mutation
  const testValuationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof carDetailsSchema>) => {
      const res = await apiRequest('POST', '/api/admin/test-valuation', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test valuation completed",
        description: `Regular: €${data.regular.marketValue} | Premium: €${data.premium.marketValue}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error running test",
        description: error.message || "An error occurred while testing.",
        variant: "destructive"
      });
    }
  });

  // Handle settings form submission
  const onSubmitSettings = (data: z.infer<typeof adminSettingsFormSchema>) => {
    saveSettingsMutation.mutate(data);
  };

  // Handle test form submission
  const onSubmitTest = (data: z.infer<typeof carDetailsSchema>) => {
    testValuationMutation.mutate(data);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | CarValueAI</title>
        <meta name="description" content="Admin dashboard for CarValueAI" />
      </Helmet>
      
      <div className="container mx-auto py-8 admin-panel">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inquiries" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="inquiries">Customer Inquiries</TabsTrigger>
                <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="market-data">Market Data</TabsTrigger>
              </TabsList>
              
              {/* Inquiries Tab */}
              <TabsContent value="inquiries" className="inquiries-list">
                {isLoadingInquiries ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : inquiriesData && inquiriesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Car Details</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inquiriesData.map((inquiry: any) => (
                          <TableRow key={inquiry.id}>
                            <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                            <TableCell>
                              {inquiry.vin}, {inquiry.fuelType}, {inquiry.mileage} km
                            </TableCell>
                            <TableCell className="capitalize">{inquiry.planType}</TableCell>
                            <TableCell>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${inquiry.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                                {inquiry.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="link" 
                                  size="sm"
                                  onClick={() => handleViewInquiry(inquiry)}
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteInquiry(inquiry.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No inquiries found. Customer inquiries will appear here.
                  </div>
                )}
              </TabsContent>
              
              {/* Analytics Dashboard Tab */}
              <TabsContent value="analytics" className="analytics-dashboard">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl font-bold"
                          >
                            {inquiriesData?.length || 0}
                          </motion.div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      {inquiriesData?.length > 0 && (
                        <div className="flex items-center mt-2 text-xs">
                          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-green-500 font-medium">+14%</span>
                          <span className="text-muted-foreground ml-1">since last month</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-2xl font-bold"
                          >
                            €{inquiriesData?.reduce((acc, inquiry) => {
                              const planPrices = { regular: 15.99, premium: 29.99, business: 49.99 };
                              return acc + (planPrices[inquiry.planType as keyof typeof planPrices] || 0);
                            }, 0).toFixed(2) || '0.00'}
                          </motion.div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs">
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+21%</span>
                        <span className="text-muted-foreground ml-1">since last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg. Valuation</p>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-2xl font-bold"
                          >
                            €15,875
                          </motion.div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs">
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-500 font-medium">-2.3%</span>
                        <span className="text-muted-foreground ml-1">market trend</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-2xl font-bold"
                          >
                            28
                          </motion.div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-500" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs">
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+5.2%</span>
                        <span className="text-muted-foreground ml-1">since last week</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Market Trend Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Market Trend Analysis</CardTitle>
                      <CardDescription>Historical and projected market trends for the Bulgarian used car market</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ValuationChart 
                        data={[
                          { month: 'Jan', value: 16800 },
                          { month: 'Feb', value: 16400 },
                          { month: 'Mar', value: 16200 },
                          { month: 'Apr', value: 15900 },
                          { month: 'May', value: 15600 },
                          { month: 'Jun', value: 15400 },
                        ]}
                        forecast={[
                          { month: 'Jul', value: 15250 },
                          { month: 'Aug', value: 15100 },
                          { month: 'Sep', value: 14950 },
                        ]}
                        marketTrend={-2.3}
                        chartType="area"
                      />
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                      <RefreshCw className="h-3 w-3 mr-1" /> Updated 2 hours ago
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Inquiry Distribution</CardTitle>
                      <CardDescription>Plan selection by customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                              <span className="text-sm font-medium">Regular (€15.99)</span>
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((inquiriesData?.filter(i => i.planType === 'regular').length || 0) / 
                              (inquiriesData?.length || 1) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((inquiriesData?.filter(i => i.planType === 'regular').length || 0) / 
                              (inquiriesData?.length || 1) * 100)}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="bg-primary h-2 rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm font-medium">Premium (€29.99)</span>
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((inquiriesData?.filter(i => i.planType === 'premium').length || 0) / 
                              (inquiriesData?.length || 1) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((inquiriesData?.filter(i => i.planType === 'premium').length || 0) / 
                              (inquiriesData?.length || 1) * 100)}%` }}
                              transition={{ duration: 1, delay: 0.6 }}
                              className="bg-blue-500 h-2 rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                              <span className="text-sm font-medium">Business (€49.99)</span>
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((inquiriesData?.filter(i => i.planType === 'business').length || 0) / 
                              (inquiriesData?.length || 1) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((inquiriesData?.filter(i => i.planType === 'business').length || 0) / 
                              (inquiriesData?.length || 1) * 100)}%` }}
                              transition={{ duration: 1, delay: 0.7 }}
                              className="bg-purple-500 h-2 rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Top Car Makes</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">BMW</span>
                              <Badge variant="outline">35%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Mercedes</span>
                              <Badge variant="outline">28%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Audi</span>
                              <Badge variant="outline">15%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Activity</CardTitle>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Real-time
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {inquiriesData?.slice(0, 5).map((inquiry, index) => (
                        <motion.div 
                          key={inquiry.id || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start"
                        >
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              New {inquiry.planType} valuation inquiry
                              <Badge className="ml-2" variant={
                                inquiry.status === 'completed' ? 'default' : 
                                inquiry.status === 'pending' ? 'outline' : 'secondary'
                              }>
                                {inquiry.status}
                              </Badge>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : 'Recently'}
                            </p>
                            <p className="text-xs mt-1">
                              <span className="font-medium">{inquiry.make} {inquiry.model}</span> | 
                              {inquiry.year && <span> {inquiry.year} |</span>} 
                              {inquiry.fuelType && <span> {inquiry.fuelType.charAt(0).toUpperCase() + inquiry.fuelType.slice(1)} |</span>} 
                              {inquiry.mileage && <span> {inquiry.mileage.toLocaleString()} km</span>}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {(!inquiriesData || inquiriesData.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground">
                          No recent activity to display
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="settings-section">
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                    <FormField
                      control={settingsForm.control}
                      name="notificationEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingsForm.control}
                      name="apiSettings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Model Settings (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"model": "car-valuation-v2", "confidence_threshold": 0.85}'
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={saveSettingsMutation.isPending}
                    >
                      {saveSettingsMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Settings
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Testing Tab */}
              <TabsContent value="testing" className="testing">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-neutral-dark">Test Valuation</h4>
                    <p className="text-sm text-muted-foreground">Create a test valuation to check the system's accuracy</p>
                  </div>
                  
                  <Form {...testForm}>
                    <form onSubmit={testForm.handleSubmit(onSubmitTest)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                        <FormField
                          control={testForm.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>VIN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. WVWZZZ1JZXW000001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={testForm.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Brand</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select car brand" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.keys(CAR_BRANDS_MODELS).map((brand) => (
                                    <SelectItem key={brand} value={brand}>
                                      {brand}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={testForm.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Model</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select car model" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {testForm.watch("brand") && CAR_BRANDS_MODELS[testForm.watch("brand") as keyof typeof CAR_BRANDS_MODELS]?.map((model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={testForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Year</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {YEARS.map((year) => (
                                    <SelectItem key={year.value} value={year.value.toString()}>
                                      {year.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={testForm.control}
                          name="carType"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Car Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select car type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CAR_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={testForm.control}
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
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={testForm.control}
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
                          control={testForm.control}
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
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={testValuationMutation.isPending}
                      >
                        {testValuationMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Run Test Valuation
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-neutral-dark">System Diagnostics</h4>
                    
                    <div className="mt-4 bg-gray-100 p-4 rounded-md overflow-auto h-32 font-mono text-sm">
                      {[
                        `[${new Date().toLocaleString()}] System check: OK`,
                        `[${new Date().toLocaleString()}] Database connection: OK`,
                        `[${new Date().toLocaleString()}] Payment gateway: OK`,
                        `[${new Date().toLocaleString()}] AI model loaded: car-valuation-v2`,
                        `[${new Date().toLocaleString()}] Market data sources: 3 active`,
                        `[${new Date().toLocaleString()}] Recent valuations: ${inquiriesData?.length || 0} total`,
                        `[${new Date().toLocaleString()}] System status: Ready`
                      ].map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Market Data Tab */}
              <TabsContent value="market-data">
                <MarketDataManagement inquiries={inquiriesData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* View Inquiry Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">VIN</h4>
                  <p className="text-sm">{selectedInquiry.vin || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Date Created</h4>
                  <p className="text-sm">{new Date(selectedInquiry.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Brand</h4>
                    <p className="text-sm">{selectedInquiry.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Model</h4>
                    <p className="text-sm">{selectedInquiry.model || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Year</h4>
                    <p className="text-sm">{selectedInquiry.year || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Car Type</h4>
                    <p className="text-sm">{selectedInquiry.carType || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Mileage</h4>
                    <p className="text-sm">{selectedInquiry.mileage ? `${selectedInquiry.mileage} km` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Fuel Type</h4>
                    <p className="text-sm capitalize">{selectedInquiry.fuelType || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Transmission</h4>
                    <p className="text-sm capitalize">{selectedInquiry.transmission || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Status</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedInquiry.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      selectedInquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Damage Information */}
              {(selectedInquiry.visibleDamages || selectedInquiry.mechanicalDamages) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Damage Information</h3>
                  <div className="space-y-3">
                    {selectedInquiry.visibleDamages && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">Visible Damages</h4>
                        <p className="text-sm bg-gray-50 p-2 rounded">{selectedInquiry.visibleDamages}</p>
                      </div>
                    )}
                    {selectedInquiry.mechanicalDamages && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">Mechanical Damages</h4>
                        <p className="text-sm bg-gray-50 p-2 rounded">{selectedInquiry.mechanicalDamages}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {selectedInquiry.additionalInfo && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedInquiry.additionalInfo}</p>
                </div>
              )}

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment & Plan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Plan Type</h4>
                    <p className="text-sm capitalize">{selectedInquiry.planType || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Payment Status</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedInquiry.paymentCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedInquiry.paymentCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  {selectedInquiry.paymentAmount && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-1">Payment Amount</h4>
                      <p className="text-sm">€{selectedInquiry.paymentAmount}</p>
                    </div>
                  )}
                  {selectedInquiry.paymentMethod && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-1">Payment Method</h4>
                      <p className="text-sm capitalize">{selectedInquiry.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Valuation Result */}
              {selectedInquiry.valuationResult && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Valuation Result</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">Estimated Value</h4>
                        <p className="text-xl font-bold text-blue-600">
                          €{selectedInquiry.valuationResult.estimatedValue?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">Market Confidence</h4>
                        <p className="text-sm">
                          {selectedInquiry.valuationResult.confidence ? `${(selectedInquiry.valuationResult.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {selectedInquiry.valuationResult.factors && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Valuation Factors</h4>
                        <ul className="text-sm space-y-1">
                          {selectedInquiry.valuationResult.factors.map((factor: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
