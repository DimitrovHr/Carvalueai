import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/#how-it-works" },
    { name: "Pricing", path: "/#pricing" },
    { name: "Contact", path: "/#footer" },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-primary font-bold text-xl">CarValueAI</a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path}>
                  <a
                    className={`${
                      location === link.path
                        ? "border-primary text-neutral-dark"
                        : "border-transparent text-neutral hover:text-neutral-dark"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {link.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link href="/admin">
              <Button>Admin Login</Button>
            </Link>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path}>
                <a
                  className={`${
                    location === link.path
                      ? "bg-neutral-light text-primary block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium"
                      : "border-transparent text-neutral-dark hover:bg-gray-50 hover:border-gray-300 hover:text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <Link href="/admin">
                <a 
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
