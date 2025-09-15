import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  name: string;
  email: string;
  degree: string;
  year: string;
  session: string;
}

export function WelcomePanel() {
  const [userData, setUserData] = useState<UserData>({
    name: "Admin User",
    email: "admin@mq.edu.au",
    degree: "Bachelor of Information Technology",
    year: "3rd Year",
    session: "Session 2, 2024"
  });

  useEffect(() => {
    // Placeholder function to fetch user data from Supabase
    const fetchUserData = async () => {
      try {
        // This is a placeholder - in real implementation, you'd fetch actual user data
        // const { data, error } = await supabase.from('profiles').select('*').single();
        // if (data) setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Card className="gradient-card shadow-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              {getGreeting()}, {userData.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back to your MacTrack dashboard
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Degree</p>
              <p className="font-medium">{userData.degree}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">{userData.year}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Session</p>
              <p className="font-medium">{userData.session}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}