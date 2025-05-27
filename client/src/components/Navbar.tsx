import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Globe, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LanguageContext } from "../context/LanguageContext";
import { useSimpleAuth } from "@/hooks/use-simple-auth";
import OnboardingButton from "./OnboardingButton";
import { useTranslation } from "@/hooks/use-translation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { language, setLanguage } = useContext(LanguageContext);
  const { user, logoutMutation } = useSimpleAuth();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bg" : "en");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { name: t.common.home, path: "/" },
    { name: t.common.howItWorks || "How It Works", path: "/" },
    { name: t.common.pricing || "Pricing", path: "/" },
    { name: t.common.contact, path: "/" },
  ];
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm navbar">
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
              className="ml-3 p-1 px-3 border border-primary rounded-full hover:bg-primary/10 focus:outline-none flex items-center transition-all duration-200"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5 text-primary" />
              <span className="ml-1.5 font-medium text-primary">{language === "en" ? "EN" : "BG"}</span>
            </button>
            {/* Help button */}
            <OnboardingButton tourType="homepage" className="ml-2" />
            {/* Trial badge */}
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t.common.trial}
            </span>
          </div>
          
          {/* Navigation links moved to the right */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-8">
              {navLinks.map((link, index) => {
                // Define section IDs based on index
                const sectionIds = ["", "how-it-works", "pricing", "footer"];
                const sectionId = sectionIds[index];
                
                return (
                  <a 
                    key={link.name} 
                    href={link.path} 
                    className={`
                      ${location === link.path && index === 0
                        ? "border-primary text-neutral-dark"
                        : "border-transparent text-neutral hover:text-neutral-dark"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    onClick={index > 0 ? (e) => handleNavClick(e, sectionId) : undefined}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
            
            {/* User account menu */}
            <div className="ml-8 flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {user ? user.username : t.common.login}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        {t.common.welcome}, {user.username}
                      </div>
                      <DropdownMenuSeparator />
                      {user.isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full">
                            {t.common.adminPanel}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/valuation" className="w-full">
                          {t.common.dashboard}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t.common.logout}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/auth" className="w-full">
                        {t.common.login}
                      </Link>
                    </DropdownMenuItem>
                  )}
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
            {navLinks.map((link, index) => {
              // Define section IDs based on index
              const sectionIds = ["", "how-it-works", "pricing", "footer"];
              const sectionId = sectionIds[index];
              
              return (
                <a 
                  key={link.name} 
                  href={link.path}
                  className={`${
                    location === link.path && index === 0
                      ? "bg-neutral-light text-primary block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium"
                      : "border-transparent text-neutral-dark hover:bg-gray-50 hover:border-gray-300 hover:text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  }`}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (index > 0) {
                      handleNavClick(e, sectionId);
                    }
                  }}
                >
                  {link.name}
                </a>
              );
            })}
            <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
              {/* Language switcher for mobile */}
              <button 
                onClick={() => {
                  toggleLanguage(); 
                  setIsMenuOpen(false);
                }}
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-primary w-full text-left"
              >
                <Globe className="h-5 w-5 mr-2" />
                {language === "en" ? "Switch to Bulgarian" : "Превключи на английски"}
              </button>
              
              {user ? (
                <>
                  {user.isAdmin && (
                    <Link 
                      href="/admin"
                      className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-neutral-dark"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.common.adminPanel}
                    </Link>
                  )}
                  <Link 
                    href="/valuation"
                    className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-neutral-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.common.dashboard}
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-red-500 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.common.logout}
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-neutral-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.common.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
