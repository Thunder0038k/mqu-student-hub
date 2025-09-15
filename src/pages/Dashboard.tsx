import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/dashboard/login-form";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user needs onboarding
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('onboarding_completed')
                .eq('user_id', session.user.id)
                .single();

              if (error && error.code !== 'PGRST116') {
                console.error('Error checking onboarding status:', error);
              }
              
              setNeedsOnboarding(!profile?.onboarding_completed);
            } catch (error) {
              console.error('Error checking onboarding:', error);
            }
          }, 100);
        } else {
          setNeedsOnboarding(false);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You've been successfully signed in.",
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check onboarding status for existing session
        setTimeout(async () => {
          try {
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('user_id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Error checking onboarding status:', error);
            }
            
            setNeedsOnboarding(!profile?.onboarding_completed);
          } catch (error) {
            console.error('Error checking onboarding:', error);
          } finally {
            setIsLoading(false);
          }
        }, 100);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleLogin = () => {
    // Auth state change will handle the login automatically
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    toast({
      title: "Setup complete!",
      description: "Welcome to MacTrack. Let's get started!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!session || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show onboarding if needed
  if (needsOnboarding) {
    return (
      <OnboardingWizard 
        onComplete={handleOnboardingComplete}
        userId={user.id}
      />
    );
  }

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar 
        onLogout={handleLogout} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <DashboardHome user={user} />
        </div>
      </main>
    </div>
  );
}