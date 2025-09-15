import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Brain,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import macquarieLogo from "@/assets/macquarie-logo.png";

interface DashboardSidebarProps {
  onLogout: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Assignments", href: "/dashboard/assignments", icon: BookOpen },
  { name: "Timetable", href: "/dashboard/timetable", icon: Calendar },
  { name: "Resources", href: "/dashboard/resources", icon: FileText },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Brain, badge: "Soon" },
];

export function DashboardSidebar({ onLogout, collapsed = false, onToggle }: DashboardSidebarProps) {
  const location = useLocation();
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <img src={macquarieLogo} alt="MacTrack" className="h-8 w-8 flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1">
            <h2 className="font-bold text-lg text-primary">MacTrack</h2>
            <p className="text-xs text-muted-foreground">Student Hub</p>
          </div>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="flex-shrink-0"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors relative group",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-muted-foreground/20 text-muted-foreground rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-1 py-0.5 text-xs bg-muted rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-2">
        <NavLink
          to="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            location.pathname === "/dashboard/profile"
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "px-3"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}