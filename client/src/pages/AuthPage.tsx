import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      title: "Authentication",
      login: {
        title: "Sign in to your account",
        description: "Enter your credentials to access your dashboard",
        username: "Username",
        password: "Password",
        button: "Sign in",
      },
      register: {
        title: "Create a new account",
        description: "Fill in your details to create your account",
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        button: "Create account",
      },
      heroTitle: "Welcome to CarValueAI",
      heroDescription: "Get accurate car valuations based on current Bulgarian market data. Choose between Regular, Premium and Business plans for detailed analytics and insights about your vehicle's value.",
    },
    bg: {
      title: "Вход / Регистрация",
      login: {
        title: "Влезте във вашия акаунт",
        description: "Въведете вашите данни за достъп до таблото",
        username: "Потребителско име",
        password: "Парола",
        button: "Вход",
      },
      register: {
        title: "Създайте нов акаунт",
        description: "Попълнете вашите данни, за да създадете акаунт",
        username: "Потребителско име",
        email: "Имейл",
        password: "Парола",
        confirmPassword: "Потвърдете паролата",
        button: "Създаване на акаунт",
      },
      heroTitle: "Добре дошли в CarValueAI",
      heroDescription: "Получете точни оценки на автомобили, базирани на текущите данни от българския пазар. Изберете между Regular, Premium и Business планове за подробен анализ и информация за стойността на вашия автомобил.",
    }
  };

  const t = translations[language === "en" ? "en" : "bg"];

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // Handle register form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  };

  return (
    <>
      <Helmet>
        <title>CarValueAI - {t.title}</title>
      </Helmet>
      <div className="flex min-h-screen">
        {/* Auth Forms */}
        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.login.title}</TabsTrigger>
              <TabsTrigger value="register">{t.register.title}</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t.login.title}</CardTitle>
                  <CardDescription>{t.login.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.login.username}</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>{t.login.password}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-4"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.login.button}</>
                        ) : (
                          t.login.button
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t.register.title}</CardTitle>
                  <CardDescription>{t.register.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.register.username}</FormLabel>
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
                            <FormLabel>{t.register.email}</FormLabel>
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
                            <FormLabel>{t.register.password}</FormLabel>
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
                            <FormLabel>{t.register.confirmPassword}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-4"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.register.button}</>
                        ) : (
                          t.register.button
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col w-1/2 bg-primary text-white p-12 justify-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">{t.heroTitle}</h1>
            <p className="text-lg mb-8">{t.heroDescription}</p>
            <div className="border-l-4 border-white pl-4 py-2 bg-primary-dark bg-opacity-20 rounded">
              <p className="italic">Get accurate valuations in just minutes!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}