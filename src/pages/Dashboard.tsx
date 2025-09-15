import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { WelcomePanel } from "@/components/dashboard/welcome-panel";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";
import { AssignmentsTracker } from "@/components/dashboard/assignments-tracker";
import { TimetableSection } from "@/components/dashboard/timetable-section";
import { ResourcesSection } from "@/components/dashboard/resources-section";
import { LoginForm } from "@/components/dashboard/login-form";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("mactrack-auth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("mactrack-auth", "authenticated");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("mactrack-auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <WelcomePanel />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfileSummaryCard />
          </div>
          
          <div className="lg:col-span-2">
            <AssignmentsTracker />
          </div>
        </div>
        
        <TimetableSection />
        
        <ResourcesSection />
      </main>
    </div>
  );
}