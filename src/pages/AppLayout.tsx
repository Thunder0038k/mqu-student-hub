import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  gender: string | null;
  degree: string | null;
  year: number | null;
  session: number | null;
  is_admin: boolean;
}

interface AppLayoutProps {
  user: User;
  profile: Profile;
  children: React.ReactNode;
}

export default function AppLayout({ user, profile, children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar isAdmin={profile.is_admin} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background">
            <SidebarTrigger className="ml-2" />
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}