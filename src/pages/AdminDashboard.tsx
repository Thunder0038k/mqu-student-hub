import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import macquarieLogo from "@/assets/macquarie-logo.png";

interface Profile {
  id: string;
  full_name: string | null;
  gender: string | null;
  degree: string | null;
  year: number | null;
  session: number | null;
  is_admin: boolean;
  created_at: string;
}

interface Unit {
  id: string;
  user_id: string;
  unit_code: string;
  unit_name: string;
}

interface UserWithUnits extends Profile {
  email: string;
  units: Unit[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithUnits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all units
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*');

      if (unitsError) throw unitsError;

      // Get auth users (this may fail in production, handle gracefully)
      let authUsers: any[] = [];
      try {
        const { data: authData } = await supabase.auth.admin.listUsers();
        authUsers = authData?.users || [];
      } catch (authError) {
        console.error('Auth API not accessible in client:', authError);
        // Continue without auth data
      }

      // Combine data
      const usersWithUnits: UserWithUnits[] = (profiles || []).map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id);
        const userUnits = (units || []).filter(unit => unit.user_id === profile.id);
        
        return {
          ...profile,
          email: authUser?.email || 'N/A',
          units: userUnits
        };
      });

      setUsers(usersWithUnits);
    } catch (error: any) {
      toast({
        title: "Error fetching users data",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={macquarieLogo} alt="MacTrack" className="h-8 w-8" />
            <div>
              <h1 className="font-bold text-lg text-primary">MacTrack Admin</h1>
              <p className="text-xs text-muted-foreground">Administrator Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/app">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.units.length, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.is_admin).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complete Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(user => user.degree && user.year).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Complete overview of all registered users, their profiles, and enrolled units.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Profile Info</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {user.gender && (
                          <Badge variant="secondary" className="text-xs">
                            {user.gender}
                          </Badge>
                        )}
                        {user.degree && (
                          <p className="text-sm">{user.degree}</p>
                        )}
                        {(user.year || user.session) && (
                          <p className="text-xs text-muted-foreground">
                            {user.year && `Year ${user.year}`}
                            {user.year && user.session && ", "}
                            {user.session && `Session ${user.session}`}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {user.units.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No units</p>
                        ) : (
                          user.units.map((unit) => (
                            <div key={unit.id} className="text-sm">
                              <span className="font-mono text-xs bg-muted px-1 rounded">
                                {unit.unit_code}
                              </span>
                              <span className="ml-2 text-muted-foreground">
                                {unit.unit_name}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={user.is_admin ? "default" : "secondary"}>
                        {user.is_admin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}