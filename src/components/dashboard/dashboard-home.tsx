import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  BookOpen, 
  Brain, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  GraduationCap
} from "lucide-react";

interface UserProfile {
  gender: string;
  degree: string;
  major: string;
  year: number;
  session: number;
  units: string[];
}

interface DashboardHomeProps {
  user: any;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        // Convert units from JSON to string array and handle nullable fields
        const profileData: UserProfile = {
          gender: data.gender || '',
          degree: data.degree || '',
          major: data.major || '',
          year: data.year || 1,
          session: data.session || 1,
          units: Array.isArray(data.units) ? data.units.filter(unit => typeof unit === 'string') : []
        };
        
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Mock data for demo
  const mockAssignments = [
    { unit: "COMP1010", name: "Programming Assignment 2", dueDate: "2024-09-20", status: "pending" },
    { unit: "MATH1020", name: "Calculus Quiz 3", dueDate: "2024-09-18", status: "overdue" },
    { unit: "PHYS1001", name: "Lab Report 4", dueDate: "2024-09-25", status: "completed" },
  ];

  const mockClasses = [
    { unit: "COMP1010", name: "Introduction to Programming", time: "9:00 AM", room: "E7A 146" },
    { unit: "MATH1020", name: "Calculus I", time: "2:00 PM", room: "E7A 205" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">
          {getGreeting()}, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome back to your MacTrack dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.units?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.degree} • Year {profile?.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 assignments, 1 quiz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:00 PM</div>
            <p className="text-xs text-muted-foreground">
              MATH1020 • E7A 205
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Assignments
            </CardTitle>
            <CardDescription>
              Your latest assignment updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAssignments.map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{assignment.name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.unit} • Due {assignment.dueDate}</p>
                </div>
                <Badge variant={
                  assignment.status === 'completed' ? 'default' :
                  assignment.status === 'overdue' ? 'destructive' : 'secondary'
                }>
                  {assignment.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {assignment.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {assignment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  {assignment.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Assignments
            </Button>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your classes for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{classItem.name}</p>
                  <p className="text-sm text-muted-foreground">{classItem.unit} • {classItem.room}</p>
                </div>
                <Badge variant="outline">
                  {classItem.time}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Full Timetable
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Preview */}
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Features
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Intelligent features to enhance your academic experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 opacity-60">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <h4 className="font-medium">Smart Resource Finder</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically find and organize course materials, textbooks, and unit guides based on your enrolled units.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 opacity-60">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <h4 className="font-medium">Assignment Tracker</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered assignment tracking that automatically syncs with your unit outlines and reminds you of due dates.
              </p>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              These AI features will be available soon to help streamline your academic journey.
            </p>
            <Button variant="outline" disabled>
              <Brain className="mr-2 h-4 w-4" />
              Get Notified When Available
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}