import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppDashboard from "./AppDashboard";
import ProfileSetup from "./ProfileSetup";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  gender: string | null;
  degree: string | null;
  year: number | null;
  session: number | null;
  is_admin: boolean;
}

export default function AppContainer() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchProfile = async (userId: string) => {
    setIsLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      
      // Check if profile needs setup (missing essential info)
      const needsSetup = !data?.full_name || !data?.degree || !data?.year || !data?.session;
      setNeedsProfileSetup(needsSetup);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setIsLoadingProfile(false);
  };

  const handleProfileComplete = () => {
    setNeedsProfileSetup(false);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  return (
    <ProtectedRoute>
      {(user: User, session: Session) => (
        <AppContent
          user={user}
          profile={profile}
          needsProfileSetup={needsProfileSetup}
          isLoadingProfile={isLoadingProfile}
          onProfileComplete={handleProfileComplete}
          onProfileUpdate={handleProfileUpdate}
          fetchProfile={fetchProfile}
        />
      )}
    </ProtectedRoute>
  );
}

interface AppContentProps {
  user: User;
  profile: Profile | null;
  needsProfileSetup: boolean;
  isLoadingProfile: boolean;
  onProfileComplete: () => void;
  onProfileUpdate: (profile: Profile) => void;
  fetchProfile: (userId: string) => void;
}

function AppContent({ 
  user, 
  profile, 
  needsProfileSetup, 
  isLoadingProfile, 
  onProfileComplete, 
  onProfileUpdate, 
  fetchProfile 
}: AppContentProps) {
  // Fetch profile when user changes
  useEffect(() => {
    if (user.id) {
      fetchProfile(user.id);
    }
  }, [user.id, fetchProfile]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (needsProfileSetup || !profile) {
    return (
      <ProfileSetup 
        user={user} 
        onComplete={() => {
          onProfileComplete();
          fetchProfile(user.id); // Refetch profile after completion
        }} 
      />
    );
  }

  return (
    <AppDashboard 
      user={user} 
      profile={profile}
      onProfileUpdate={onProfileUpdate}
    />
  );
}