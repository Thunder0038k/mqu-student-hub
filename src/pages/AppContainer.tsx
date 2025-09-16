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
  return (
    <ProtectedRoute>
      {(user: User, session: Session, profile: Profile | null, isLoadingProfile: boolean) => {
        // Check if profile needs setup (missing essential info)
        const needsProfileSetup = !profile?.full_name || !profile?.degree || !profile?.year || !profile?.session;

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
                // Force page reload to refresh profile data
                window.location.reload();
              }} 
            />
          );
        }

        return (
          <AppDashboard 
            user={user} 
            profile={profile}
            onProfileUpdate={(updatedProfile: Profile) => {
              // Handle profile updates if needed
              console.log('Profile updated:', updatedProfile);
            }}
          />
        );
      }}
    </ProtectedRoute>
  );
}