import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, LogOut, Settings, Calendar, CheckSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import macquarieLogo from "@/assets/macquarie-logo.png";
import type { User } from '@supabase/supabase-js';
import { CalendarSetup } from "@/components/dashboard/calendar-setup";
import { AssignmentSetup } from "@/components/dashboard/assignments-setup";

interface Profile {
  id: string;
  full_name: string | null;
  gender: string | null;
  degree: string | null;
  year: number | null;
  session: number | null;
  is_admin: boolean;
}

interface Unit {
  id: string;
  unit_code: string;
  unit_name: string;
  unit_prefix?: string;
  unit_number?: string;
}

interface AppDashboardProps {
  user: User;
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export default function AppDashboard({ user, profile, onProfileUpdate }: AppDashboardProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendarSetup, setShowCalendarSetup] = useState(false);
  const [showAssignmentSetup, setShowAssignmentSetup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnits(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching units",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addUnit = async () => {
    if (!newUnitCode.trim() || !newUnitName.trim()) {
      toast({
        title: "Please fill in both fields",
        variant: "destructive",
      });
      return;
    }

    // Extract prefix and number from unit code (e.g., MATH1007 -> MATH, 1007)
    const unitCodeUpper = newUnitCode.trim().toUpperCase();
    const unitPrefix = unitCodeUpper.replace(/[0-9]+$/, '');
    const unitNumber = unitCodeUpper.replace(/^[A-Za-z]+/, '');

    try {
      const { data, error } = await supabase
        .from('units')
        .insert([{
          user_id: user.id,
          unit_code: unitCodeUpper,
          unit_prefix: unitPrefix,
          unit_number: unitNumber,
          unit_name: newUnitName.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      setUnits([data, ...units]);
      setNewUnitCode("");
      setNewUnitName("");
      
      toast({
        title: "Unit added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error adding unit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          gender: editedProfile.gender,
          degree: editedProfile.degree,
          year: editedProfile.year,
          session: editedProfile.session
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      setIsEditingProfile(false);
      
      toast({
        title: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={macquarieLogo} alt="MacTrack" className="h-8 w-8" />
            <div>
              <h1 className="font-bold text-lg text-primary">MacTrack</h1>
              <p className="text-xs text-muted-foreground">Student Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {profile.is_admin && (
              <Button variant="outline" size="sm" asChild>
                <a href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile.full_name || user.email}!
          </h2>
          <p className="text-muted-foreground">
            Here's your MacTrack dashboard. Manage your units and track your progress.
          </p>
        </div>

        {/* Setup Forms */}
        {showCalendarSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <CalendarSetup 
              units={units} 
              userId={user.id}
              onClose={() => setShowCalendarSetup(false)}
            />
          </div>
        )}

        {showAssignmentSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <AssignmentSetup 
              units={units} 
              userId={user.id}
              onClose={() => setShowAssignmentSetup(false)}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editedProfile.full_name || ""}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          full_name: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={editedProfile.gender || ""}
                        onValueChange={(value) => setEditedProfile({
                          ...editedProfile,
                          gender: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        placeholder="e.g. Bachelor of Computer Science"
                        value={editedProfile.degree || ""}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          degree: e.target.value
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={editedProfile.year?.toString() || ""}
                          onValueChange={(value) => setEditedProfile({
                            ...editedProfile,
                            year: parseInt(value)
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Year 1</SelectItem>
                            <SelectItem value="2">Year 2</SelectItem>
                            <SelectItem value="3">Year 3</SelectItem>
                            <SelectItem value="4">Year 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="session">Session</Label>
                        <Select
                          value={editedProfile.session?.toString() || ""}
                          onValueChange={(value) => setEditedProfile({
                            ...editedProfile,
                            session: parseInt(value)
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Session" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Session 1</SelectItem>
                            <SelectItem value="2">Session 2</SelectItem>
                            <SelectItem value="3">Session 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={updateProfile} disabled={isLoading}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditingProfile(false);
                        setEditedProfile(profile);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {profile.gender && (
                      <div>
                        <p className="text-sm font-medium">Gender</p>
                        <p className="text-sm text-muted-foreground capitalize">{profile.gender}</p>
                      </div>
                    )}
                    {profile.degree && (
                      <div>
                        <p className="text-sm font-medium">Degree</p>
                        <p className="text-sm text-muted-foreground">{profile.degree}</p>
                      </div>
                    )}
                    {(profile.year || profile.session) && (
                      <div>
                        <p className="text-sm font-medium">Year & Session</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.year && `Year ${profile.year}`}
                          {profile.year && profile.session && ", "}
                          {profile.session && `Session ${profile.session}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Units Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Units
                </CardTitle>
                <CardDescription>
                  Manage the units you're currently studying.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Unit Form */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Unit Code (e.g. MATH1007)"
                      value={newUnitCode}
                      onChange={(e) => setNewUnitCode(e.target.value)}
                      className="flex-1 bg-background"
                    />
                    <Input
                      placeholder="Unit Name"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      className="flex-2 bg-background"
                    />
                    <Button onClick={addUnit} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {(newUnitCode || newUnitName) && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                      Preview: {newUnitCode} - {newUnitName}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Units List */}
                <div className="space-y-2">
                  {units.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No units added yet. Add your first unit above.
                    </p>
                  ) : (
                    units.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {unit.unit_prefix || unit.unit_code.replace(/[0-9]+$/, '')}
                            </span>
                            <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                              {unit.unit_number || unit.unit_code.replace(/^[A-Za-z]+/, '')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{unit.unit_name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => setShowCalendarSetup(true)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Calendar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => setShowAssignmentSetup(true)}
                          >
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Assignments
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}