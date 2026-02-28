import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Pill,
  LogOut,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const cartCount = cart?.items?.length || 0;

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl glass-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            data-testid="navbar-logo"
          >
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-heading text-xl font-bold text-slate-900 tracking-tight">
              MediCore
            </span>
          </Link>
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                data-testid="navbar-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines, brands..."
                className="pl-10 h-10 rounded-full border-slate-200 bg-slate-50/80 focus:bg-white shadow-sm"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-5">
            <Link
              to="/"
              className="group relative text-sm font-medium text-slate-600 hover:text-brand transition-colors py-1"
              data-testid="nav-home"
            >
              Home
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/medicines"
              className="group relative text-sm font-medium text-slate-600 hover:text-brand transition-colors py-1"
              data-testid="nav-medicines"
            >
              Medicines
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {user && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                data-testid="nav-cart"
              >
                <ShoppingCart
                  className="w-5 h-5 text-slate-600"
                  strokeWidth={1.5}
                />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-blue-600 text-[10px] font-bold border-2 border-white rounded-full transition-all">
                    {" "}
                    {cartCount}
                  </Badge>
                )}
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-slate-100"
                    data-testid="user-menu-trigger"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                      <User
                        className="w-4 h-4 text-emerald-700"
                        strokeWidth={2}
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-slate-200 shadow-xl p-1.5 rounded-xl"
                >
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="bg-slate-100" />
                  {user.role !== "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      data-testid="nav-dashboard"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/admin")}
                      data-testid="nav-admin"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 focus:bg-slate-100 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-slate-100" />

                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    data-testid="nav-logout"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium h-9 px-4 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
                    data-testid="nav-login"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full px-5 h-9 shadow-sm"
                    data-testid="nav-register"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search medicines..."
                  className="pl-10 rounded-full"
                />
              </div>
            </form>
            <Link
              to="/"
              className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/medicines"
              className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Medicines
            </Link>
            {user && (
              <Link
                to="/cart"
                className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Cart ({cartCount})
              </Link>
            )}
            {user && user.role !== "admin" && (
              <Link
                to="/dashboard"
                className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg" // Added grey hover
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {!user && (
              <div className="flex gap-2 pt-2 px-3">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="rounded-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="block w-full text-left py-2.5 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
