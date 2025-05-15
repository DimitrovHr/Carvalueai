import React, { useState, useContext } from "react";
import { useLocation, useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LanguageContext } from "@/context/LanguageContext";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Login() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  
  const translations = {
    en: {
      title: "Account Access",
      loginTab: "Login",
      registerTab: "Register",
      loginDescription: "Sign in to your account",
      registerDescription: "Create a new account",
      username: "Username",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm Password",
      loginButton: "Sign In",
      registerButton: "Create account",
      adminLoginSuccess: "Admin login successful",
      adminCredentials: "Admin credentials",
      adminUsername: "Username: admin",
      adminPassword: "Password: admin123",
      adminNote: "These are default admin credentials",
      forgotPassword: "Forgot your password?",
      orContinueWith: "Or continue with"
    },
    bg: {
      title: "Достъп до акаунт",
      loginTab: "Вход",
      registerTab: "Регистрация",
      loginDescription: "Влезте във вашия акаунт",
      registerDescription: "Създайте нов акаунт",
      username: "Потребителско име",
      email: "Имейл адрес",
      password: "Парола",
      confirmPassword: "Потвърди паролата",
      loginButton: "Вход",
      registerButton: "Създаване на акаунт",
      adminLoginSuccess: "Успешен вход на администратор",
      adminCredentials: "Администраторски данни",
      adminUsername: "Потребителско име: admin",
      adminPassword: "Парола: admin123",
      adminNote: "Това са администраторските данни по подразбиране",
      forgotPassword: "Забравена парола?",
      orContinueWith: "Или продължете с"
    }
  };

  const t = translations[language];

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onSubmitLogin = (data: z.infer<typeof loginSchema>) => {
    // Check if admin credentials
    if (data.username === "admin" && data.password === "admin123") {
      toast({
        title: t.adminLoginSuccess,
        description: "Welcome to the admin dashboard",
        duration: 3000,
      });
      navigate("/admin");
    } else {
      // Mock login - would normally call an API
      toast({
        title: "Success",
        description: "You have logged in successfully",
        duration: 3000,
      });
      navigate("/");
    }
  };

  // Handle register form submission
  const onSubmitRegister = (data: z.infer<typeof registerSchema>) => {
    // Mock registration - would normally call an API
    toast({
      title: "Account created",
      description: "Your account has been created successfully",
      duration: 3000,
    });
    navigate("/");
  };

  return (
    <>
      <Helmet>
        <title>Login & Register | CarValueAI</title>
        <meta name="description" content="Login or create an account to access CarValueAI services" />
      </Helmet>
      
      <div className="container mx-auto py-12">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
              </CardHeader>
              
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
                  <TabsTrigger value="register">{t.registerTab}</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login">
                  <CardContent className="pt-4">
                    <CardDescription className="text-center mb-4">{t.loginDescription}</CardDescription>
                    
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.username}</FormLabel>
                              <FormControl>
                                <Input placeholder="admin" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.password}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">{t.loginButton}</Button>
                      </form>
                    </Form>
                    
                    <div className="text-sm text-center mt-4">
                      <a href="#" className="text-primary hover:text-primary-dark">
                        {t.forgotPassword}
                      </a>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <div className="w-full space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            {t.adminCredentials}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-center text-muted-foreground">
                        <p>{t.adminUsername}</p>
                        <p>{t.adminPassword}</p>
                        <p className="mt-1 italic">{t.adminNote}</p>
                      </div>
                    </div>
                  </CardFooter>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register">
                  <CardContent className="pt-4">
                    <CardDescription className="text-center mb-4">{t.registerDescription}</CardDescription>
                    
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.username}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.email}</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.password}</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.confirmPassword}</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">{t.registerButton}</Button>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}