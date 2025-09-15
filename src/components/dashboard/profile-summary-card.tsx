import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  gender: string;
  degree: string;
  year: string;
  session: string;
}

export function ProfileSummaryCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    gender: "Prefer not to say",
    degree: "Bachelor of Information Technology",
    year: "3rd Year",
    session: "Session 2, 2024"
  });
  const [editData, setEditData] = useState<ProfileData>(profileData);
  const { toast } = useToast();

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Placeholder for Supabase update
      // await supabase.from('profiles').update(editData).eq('id', user.id);
      
      setProfileData(editData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Profile Summary</CardTitle>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          {isEditing ? (
            <Select 
              value={editData.gender} 
              onValueChange={(value) => setEditData({...editData, gender: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium p-2 bg-muted rounded-md">{profileData.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree">Degree (Major)</Label>
          {isEditing ? (
            <Input
              value={editData.degree}
              onChange={(e) => setEditData({...editData, degree: e.target.value})}
              placeholder="Enter your degree"
            />
          ) : (
            <p className="text-sm font-medium p-2 bg-muted rounded-md">{profileData.degree}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          {isEditing ? (
            <Select 
              value={editData.year} 
              onValueChange={(value) => setEditData({...editData, year: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Year">1st Year</SelectItem>
                <SelectItem value="2nd Year">2nd Year</SelectItem>
                <SelectItem value="3rd Year">3rd Year</SelectItem>
                <SelectItem value="4th Year">4th Year</SelectItem>
                <SelectItem value="Postgraduate">Postgraduate</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium p-2 bg-muted rounded-md">{profileData.year}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="session">Session</Label>
          {isEditing ? (
            <Select 
              value={editData.session} 
              onValueChange={(value) => setEditData({...editData, session: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Session 1, 2024">Session 1, 2024</SelectItem>
                <SelectItem value="Session 2, 2024">Session 2, 2024</SelectItem>
                <SelectItem value="Session 3, 2024">Session 3, 2024</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium p-2 bg-muted rounded-md">{profileData.session}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}