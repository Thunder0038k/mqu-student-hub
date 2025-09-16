import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "./AppLayout";
import AppDashboard from "./AppDashboard";
import AppCalendar from "./AppCalendar";
import AppAssignments from "./AppAssignments";
import ProfileSetup from "./ProfileSetup";
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

export default function AppContainer() {
  return (
    <ProtectedRoute>
      {(user, session, profile, isLoadingProfile, onProfileUpdate) => {
        // Check if profile needs setup (missing essential info)
        const needsProfileSetup = !profile?.full_name || !profile?.degree || !profile?.year || !profile?.session;

        if (needsProfileSetup) {
          return (
            <ProfileSetup 
              user={user} 
              onComplete={() => {
                window.location.reload();
              }}
            />
          );
        }

        return (
          <AppLayout user={user} profile={profile}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <AppDashboard 
                    user={user} 
                    profile={profile} 
                    onProfileUpdate={onProfileUpdate} 
                  />
                } 
              />
              <Route 
                path="/calendar" 
                element={<AppCalendar user={user} />} 
              />
              <Route 
                path="/assignments" 
                element={<AppAssignments user={user} />} 
              />
            </Routes>
          </AppLayout>
        );
      }}
    </ProtectedRoute>
  );
}