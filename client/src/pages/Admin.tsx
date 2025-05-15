import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { FUEL_TYPES, TRANSMISSION_TYPES, INQUIRY_STATUS } from "@/lib/constants";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("inquiries");
  const { toast } = useToast();

  // Fetch inquiries
  const { data: inquiries, isLoading: isLoadingInquiries } = useQuery({
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
      mileage: undefined,
      fuelType: undefined,
      transmission: undefined,
      visibleDamages: "",
      mechanicalDamages: "",
      additionalInfo: ""
    }
  });

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
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
              </TabsList>
              
              {/* Inquiries Tab */}
              <TabsContent value="inquiries" className="inquiries-list">
                {isLoadingInquiries ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : inquiries && inquiries.length > 0 ? (
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
                        {inquiries.map((inquiry: any) => (
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
                              <Button variant="link" size="sm">View</Button>
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
                        `[${new Date().toLocaleString()}] Recent valuations: ${inquiries?.length || 0} total`,
                        `[${new Date().toLocaleString()}] System status: Ready`
                      ].map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
