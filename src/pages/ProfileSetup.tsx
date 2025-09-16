import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft } from "lucide-react";
import macquarieLogo from "@/assets/macquarie-logo.png";
import type { User } from '@supabase/supabase-js';

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

interface ProfileData {
  full_name: string;
  gender: string;
  degree: string;
  year: number | null;
  session: number | null;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    gender: '',
    degree: '',
    year: null,
    session: null
  });
  
  const { toast } = useToast();

  const steps = [
    {
      title: "Welcome to MacTrack!",
      description: "Let's set up your profile to get started."
    },
    {
      title: "Personal Information",
      description: "Tell us about yourself."
    },
    {
      title: "Academic Details",
      description: "Your degree and study information."
    },
    {
      title: "Study Timeline",
      description: "What year and session are you in?"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!profileData.full_name.trim()) {
      toast({
        title: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name.trim(),
          gender: profileData.gender || null,
          degree: profileData.degree || null,
          year: profileData.year,
          session: profileData.session
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile setup complete!",
        description: "Welcome to MacTrack",
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return profileData.full_name.trim().length > 0;
      case 3:
        return profileData.degree.length > 0;
      case 4:
        return profileData.year !== null && profileData.session !== null;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={macquarieLogo} alt="MacTrack" className="h-12 w-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Hi {user.email}! We're excited to have you on MacTrack. 
                Let's quickly set up your profile so we can personalize your experience.
              </p>
              <p className="text-sm text-muted-foreground">
                This will only take a minute.
              </p>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    full_name: e.target.value
                  })}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(value) => setProfileData({
                    ...profileData,
                    gender: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Academic Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="degree">Degree / Major *</Label>
                <Input
                  id="degree"
                  value={profileData.degree}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    degree: e.target.value
                  })}
                  placeholder="e.g. Bachelor of Computer Science"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                This helps us provide relevant resources and information for your course.
              </p>
            </div>
          )}

          {/* Step 4: Study Timeline */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="year">Current Year *</Label>
                <Select
                  value={profileData.year?.toString() || ""}
                  onValueChange={(value) => setProfileData({
                    ...profileData,
                    year: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current year" />
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
                <Label htmlFor="session">Current Session *</Label>
                <Select
                  value={profileData.session?.toString() || ""}
                  onValueChange={(value) => setProfileData({
                    ...profileData,
                    session: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select current session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Session 1</SelectItem>
                    <SelectItem value="2">Session 2</SelectItem>
                    <SelectItem value="3">Session 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}