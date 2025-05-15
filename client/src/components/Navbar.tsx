import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [language, setLanguage] = useState<"en" | "bg">("en");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bg" : "en");
  };

  const translations = {
    en: {
      home: "Home",
      howItWorks: "How It Works",
      pricing: "Pricing",
      contact: "Contact",
      login: "Login",
      adminLogin: "Admin Login",
      trial: "60-Day Trial",
    },
    bg: {
      home: "Начало",
      howItWorks: "Как работи",
      pricing: "Цени",
      contact: "Контакт",
      login: "Вход",
      adminLogin: "Вход за администратор",
      trial: "60-дневен пробен период",
    }
  };

  const t = translations[language];

  const navLinks = [
    { name: t.home, path: "/" },
    { name: t.howItWorks, path: "/#how-it-works" },
    { name: t.pricing, path: "/#pricing" },
    { name: t.contact, path: "/#footer" },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo on the left */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-primary font-bold text-xl">
              CarValueAI
            </Link>
            {/* Language toggle */}
            <button 
              onClick={toggleLanguage}
              className="ml-3 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5 text-primary" />
              <span className="sr-only">Toggle language</span>
              <span className="ml-1 text-xs">{language.toUpperCase()}</span>
            </button>
            {/* Trial badge */}
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t.trial}
            </span>
          </div>
          
          {/* Navigation links moved to the right */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path} className={`
                  ${location === link.path
                    ? "border-primary text-neutral-dark"
                    : "border-transparent text-neutral hover:text-neutral-dark"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Login and Admin buttons */}
            <div className="ml-8 flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {t.login}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/login" className="w-full">
                      {t.login}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/admin" className="w-full">
                      {t.adminLogin}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-dark hover:text-primary hover:bg-gray-100"
              onClick={toggleMenu}
              aria-label="Main menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className={`${
                  location === link.path
                    ? "bg-neutral-light text-primary block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium"
                    : "border-transparent text-neutral-dark hover:bg-gray-50 hover:border-gray-300 hover:text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
              <Link 
                href="/login" 
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-neutral-dark"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.login}
              </Link>
              <Link 
                href="/admin"
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-neutral-dark"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.adminLogin}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
