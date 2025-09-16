import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: (user: User, session: Session) => ReactNode;
  fallback?: ReactNode;
  requireAdmin?: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
  gender: string | null;
  degree: string | null;
  year: number | null;
  session: number | null;
  is_admin: boolean;
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, 'Session:', !!session, 'User:', !!session?.user);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              console.log('Fetching profile for user:', session.user.id);
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              console.log('Profile fetch result:', { profileData, error });

              if (error) {
                console.error('Error fetching profile:', error);
                toast({
                  title: "Error loading profile",
                  description: error.message,
                  variant: "destructive",
                });
                setProfile(null);
                setIsLoading(false);
                return;
              }

              // If no profile exists, create one automatically
              if (!profileData) {
                console.log('No profile found, creating one...');
                try {
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
                    })
                    .select()
                    .single();
                    
                  if (createError) {
                    console.error('Error creating profile:', createError);
                    setProfile(null);
                  } else {
                    console.log('Profile created:', newProfile);
                    setProfile(newProfile);
                  }
                } catch (createError) {
                  console.error('Error creating profile:', createError);
                  setProfile(null);
                }
              } else {
                setProfile(profileData);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } finally {
              console.log('Setting loading to false');
              setIsLoading(false);
            }
          }, 100);
        } else {
          console.log('No session, setting loading to false');
          setProfile(null);
          setIsLoading(false);
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
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile for existing session
        setTimeout(async () => {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
              setIsLoading(false);
              return;
            }

            // If no profile exists, create one automatically
            if (!profileData) {
              try {
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
                  })
                  .select()
                  .single();
                  
                if (createError) {
                  console.error('Error creating profile:', createError);
                  setProfile(null);
                } else {
                  setProfile(newProfile);
                }
              } catch (createError) {
                console.error('Error creating profile:', createError);
                setProfile(null);
              }
            } else {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!session || !user || !profile) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access this page.</p>
          <a href="/" className="text-primary hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Admin check
  if (requireAdmin && !profile.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <a href="/app" className="text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children(user, session)}</>;
}