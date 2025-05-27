import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Loader2 } from "lucide-react";
import SEOMetadata from "@/components/SEOMetadata";
import { useTranslation } from "@/hooks/use-translation";

// Form schemas for Supabase auth
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function SupabaseAuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useSupabaseAuth();
  const [_, navigate] = useLocation();
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      title: "Welcome to RactAI",
      description: "Professional Car Valuation Service",
      loginTab: "Login",
      registerTab: "Register",
      loginTitle: "Login to Your Account",
      loginDescription: "Enter your credentials to access your account",
      registerTitle: "Create New Account",
      registerDescription: "Sign up to start using our car valuation services",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      username: "Username",
      usernamePlaceholder: "Choose a username",
      loginButton: "Login",
      registerButton: "Create Account",
      loggingIn: "Logging in...",
      registering: "Creating account...",
      heroTitle: "Accurate Car Valuations",
      heroSubtitle: "Get professional vehicle assessments powered by AI technology for the Bulgarian market.",
      heroFeature1: "AI-Powered Analysis",
      heroFeature2: "Market Data Integration",
      heroFeature3: "Professional Reports",
    },
    bg: {
      title: "Добре дошли в RactAI",
      description: "Професионална услуга за оценка на автомобили",
      loginTab: "Вход",
      registerTab: "Регистрация",
      loginTitle: "Влезте в профила си",
      loginDescription: "Въведете данните си за достъп до профила",
      registerTitle: "Създайте нов профил",
      registerDescription: "Регистрирайте се, за да започнете да използвате нашите услуги",
      email: "Имейл",
      emailPlaceholder: "Въведете вашия имейл",
      password: "Парола",
      passwordPlaceholder: "Въведете вашата парола",
      confirmPassword: "Потвърдете паролата",
      confirmPasswordPlaceholder: "Потвърдете вашата парола",
      username: "Потребителско име",
      usernamePlaceholder: "Изберете потребителско име",
      loginButton: "Вход",
      registerButton: "Създайте профил",
      loggingIn: "Влизане...",
      registering: "Създаване на профил...",
      heroTitle: "Точни оценки на автомобили",
      heroSubtitle: "Получете професионални оценки на превозни средства с AI технология за българския пазар.",
      heroFeature1: "AI анализ",
      heroFeature2: "Пазарни данни",
      heroFeature3: "Професионални отчети",
    }
  };

  const t = translations[language as "en" | "bg"];

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      username: values.username,
    });
  };

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <SEOMetadata 
        title={t.title}
        description={t.description}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Authentication Forms */}
          <div className="w-full max-w-md mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
                <TabsTrigger value="register">{t.registerTab}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.loginTitle}</CardTitle>
                    <CardDescription>{t.loginDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.email}</FormLabel>
                              <FormControl>
                                <Input placeholder={t.emailPlaceholder} {...field} />
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
                                <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t.loggingIn}
                            </>
                          ) : (
                            t.loginButton
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.registerTitle}</CardTitle>
                    <CardDescription>{t.registerDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.username}</FormLabel>
                              <FormControl>
                                <Input placeholder={t.usernamePlaceholder} {...field} />
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
                                <Input placeholder={t.emailPlaceholder} {...field} />
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
                                <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
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
                                <Input type="password" placeholder={t.confirmPasswordPlaceholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t.registering}
                            </>
                          ) : (
                            t.registerButton
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right side - Hero Content */}
          <div className="hidden lg:block">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">{t.heroTitle}</h1>
              <p className="text-xl text-gray-600">{t.heroSubtitle}</p>
              
              <div className="grid grid-cols-1 gap-4 mt-8">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-blue-600">{t.heroFeature1}</h3>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-blue-600">{t.heroFeature2}</h3>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-blue-600">{t.heroFeature3}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}