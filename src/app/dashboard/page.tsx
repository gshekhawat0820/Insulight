"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import { LogOut, Home, LineChart, Settings, Upload } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, supabase.auth]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-beige-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pine-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-beige-50">
      {/* Sidebar */}
      <aside className="bg-pine-green-700 text-beige-100 w-16 md:w-64 flex flex-col">
        <div className="p-4 border-b border-pine-green-600">
          <h1 className="hidden md:block text-xl font-bold">Insulight</h1>
          <span className="md:hidden text-xl font-bold">T1D</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center p-3 rounded-md ${
              pathname === "/dashboard" 
                ? "bg-pine-green-500 text-white" 
                : "hover:bg-pine-green-600"
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link 
            href="/dashboard/glucose/add" 
            className={`flex items-center p-3 rounded-md ${
              pathname === "/dashboard/glucose/add" 
                ? "bg-pine-green-500 text-white" 
                : "hover:bg-pine-green-600"
            }`}
          >
            <Upload className="h-5 w-5 mr-3" />
            <span className="hidden md:inline">Upload Data</span>
          </Link>
          <Link 
            href="/dashboard/insights" 
            className={`flex items-center p-3 rounded-md ${
              pathname === "/dashboard/insights" 
                ? "bg-pine-green-500 text-white" 
                : "hover:bg-pine-green-600"
            }`}
          >
            <LineChart className="h-5 w-5 mr-3" />
            <span className="hidden md:inline">Insights</span>
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center p-3 rounded-md ${
              pathname === "/dashboard/settings" 
                ? "bg-pine-green-500 text-white" 
                : "hover:bg-pine-green-600"
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span className="hidden md:inline">Settings</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-pine-green-600">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-beige-100 hover:bg-pine-green-600 hover:text-beige-50" 
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-beige-50">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow p-6 border border-beige-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}