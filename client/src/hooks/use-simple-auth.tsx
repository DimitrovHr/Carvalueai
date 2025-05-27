import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  username: string;
};

export const SimpleAuthContext = createContext<AuthContextType | null>(null);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Check for existing user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('simple-auth-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('simple-auth-user');
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password combination
      // In a real app, this would make an API call to verify credentials
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        username: credentials.email.split('@')[0],
      };
      
      // Save to localStorage
      localStorage.setItem('simple-auth-user', JSON.stringify(user));
      setUser(user);
      setIsLoading(false);
      
      return user;
    },
    onSuccess: (user: User) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('simple-auth-users') || '[]');
      if (existingUsers.find((u: User) => u.email === credentials.email)) {
        throw new Error('User already exists with this email');
      }
      
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        username: credentials.username,
      };
      
      // Save user to users list
      existingUsers.push(user);
      localStorage.setItem('simple-auth-users', JSON.stringify(existingUsers));
      
      // Save current user session
      localStorage.setItem('simple-auth-user', JSON.stringify(user));
      setUser(user);
      setIsLoading(false);
      
      return user;
    },
    onSuccess: (user: User) => {
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      setIsLoading(false);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.removeItem('simple-auth-user');
      setUser(null);
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
}