import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "../ui/icons";
import { Menu, Bell } from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/photographers", label: "Browse Photographers", active: location === "/photographers" },
    { href: "/#how-it-works", label: "How It Works", active: location === "/#how-it-works" },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n ? n[0] : "")
      .join("");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    
    switch(user.role) {
      case "admin":
        return "/dashboard/admin";
      case "photographer":
        return "/dashboard/photographer";
      default:
        return "/dashboard/customer";
    }
  };

  const renderAuthButtons = () => {
    if (isLoading) {
      return (
        <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md"></div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:text-gray-600"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user ? user.profileImageUrl : ""}
                    alt={`${user ? user.firstName ?? "" : ""} ${user ? user.lastName ?? "" : ""}`}
                  />
                  <AvatarFallback>
                    {getInitials(`${user ? user.firstName ?? "" : ""} ${user ? user.lastName ?? "" : ""}`)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getDashboardLink()}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/logout">Logout</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <Button 
          asChild
          variant="default"
        >
          <a href="/login">Login</a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="text-primary border-primary hover:bg-primary/10"
          style={{display: 'none'}}
        >
          <a href="/api/login">Sign Up</a>
        </Button>
      </div>
    );
  };


  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-heading font-bold text-2xl">ClickPro</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    link.active
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {renderAuthButtons()}
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="mt-6 flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className={`${
                        link.active
                          ? "bg-primary-50 border-primary-500 text-primary-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="flex items-center px-4 space-x-3 sm:px-6">
                      {isAuthenticated ? (
                        <>
                          <Link href={getDashboardLink()}>
                            <Button 
                              className="flex-grow"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Dashboard
                            </Button>
                          </Link>
                          <Button 
                            variant="outline"
                            className="flex-grow"
                            asChild
                          >
                            <a href="/api/logout">Logout</a>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="flex-grow"
                            asChild
                          >
                            <a href="/login">Login</a>
                          </Button>
                          
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
