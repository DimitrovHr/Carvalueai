import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  username: string;
  isAdmin?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
};

const FrontendAuthContext = createContext<AuthContextType | null>(null);

export function FrontendAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check for admin credentials
      if (email === 'admin@carvalueai.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin',
          email: 'admin@carvalueai.com',
          username: 'admin',
          isAdmin: true
        };
        setUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        toast({
          title: "Welcome Admin!",
          description: "You have successfully logged in as administrator.",
        });
        return true;
      }

      // Check existing users in storage
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const foundUser = existingUsers.find((u: any) => 
        u.email === email && u.password === password
      );

      if (foundUser) {
        const loggedInUser: User = {
          id: foundUser.id,
          email: foundUser.email,
          username: foundUser.username,
          isAdmin: false
        };
        setUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        return true;
      }

      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (existingUsers.find((u: any) => u.email === email)) {
        toast({
          title: "Registration failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        return false;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        username,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      // Auto-login the new user
      const loggedInUser: User = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        isAdmin: false
      };
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

      toast({
        title: "Registration successful!",
        description: "Your account has been created and you're now logged in.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <FrontendAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </FrontendAuthContext.Provider>
  );
}

export function useFrontendAuth() {
  const context = useContext(FrontendAuthContext);
  if (!context) {
    throw new Error("useFrontendAuth must be used within a FrontendAuthProvider");
  }
  return context;
}