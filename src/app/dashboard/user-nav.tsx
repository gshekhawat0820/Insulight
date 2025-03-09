"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      <Button
        variant="ghost"
        className="relative flex items-center gap-2 text-beige-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <User className="h-5 w-5" />
        <span>Account</span>
      </Button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu" 
          aria-orientation="vertical"
        >
          <div className="py-1">
            <Link 
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-sm text-pine-green-700 hover:bg-beige-100" 
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-beige-100"
              role="menuitem"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}