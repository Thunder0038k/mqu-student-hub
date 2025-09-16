import React from "react";
import { Home, Calendar, CheckSquare, BookOpen, ExternalLink, Settings, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import macquarieLogo from "@/assets/macquarie-logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  isAdmin?: boolean;
}

const navigationItems = [
  { title: "Dashboard", url: "/app", icon: Home },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Assignments", url: "/app/assignments", icon: CheckSquare },
];

const resourceItems = [
  { title: "iLearn", url: "https://ilearn.mq.edu.au", icon: BookOpen, external: true },
  { title: "Unit Guides", url: "https://unitguides.mq.edu.au", icon: BookOpen, external: true },
  { title: "Library", url: "https://libguides.mq.edu.au", icon: BookOpen, external: true },
  { title: "Student Portal", url: "https://students.mq.edu.au", icon: ExternalLink, external: true },
];

export function AppSidebar({ isAdmin }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const { toast } = useToast();
  
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === "/app") {
      return currentPath === "/app";
    }
    return currentPath.startsWith(path);
  };
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <img src={macquarieLogo} alt="MacTrack" className="h-8 w-8" />
          {state !== "collapsed" && (
            <div>
              <h1 className="font-bold text-lg text-primary">MacTrack</h1>
              <p className="text-xs text-muted-foreground">Student Hub</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/app"}
                      className={getNavCls}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-muted/50"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && (
                        <>
                          <span>{item.title}</span>
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin" className="hover:bg-muted/50">
                  <Settings className="mr-2 h-4 w-4" />
                  {state !== "collapsed" && <span>Admin</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {state !== "collapsed" && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}