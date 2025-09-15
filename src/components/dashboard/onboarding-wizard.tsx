import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
  userId: string;
}

interface OnboardingData {
  gender: string;
  degree: string;
  major: string;
  year: number;
  session: number;
  units: string[];
}

export function OnboardingWizard({ onComplete, userId }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [newUnit, setNewUnit] = useState("");
  const { toast } = useToast();
  
  const [data, setData] = useState<OnboardingData>({
    gender: "",
    degree: "",
    major: "",
    year: 1,
    session: 1,
    units: []
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addUnit = () => {
    if (newUnit.trim() && !data.units.includes(newUnit.trim())) {
      setData(prev => ({
        ...prev,
        units: [...prev.units, newUnit.trim()]
      }));
      setNewUnit("");
    }
  };

  const removeUnit = (unitToRemove: string) => {
    setData(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit !== unitToRemove)
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          gender: data.gender,
          degree: data.degree,
          major: data.major,
          year: data.year,
          session: data.session,
          units: data.units,
          onboarding_completed: true
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Welcome to MacTrack!",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.gender !== "";
      case 2: return data.degree !== "" && data.major !== "";
      case 3: return data.year > 0 && data.session > 0;
      case 4: return data.units.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">Welcome to MacTrack!</CardTitle>
            <CardDescription>Let's set up your student profile</CardDescription>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Gender */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">What's your gender?</h3>
                <p className="text-sm text-muted-foreground">This helps us personalize your experience</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={data.gender} onValueChange={(value) => setData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Degree & Major */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">What are you studying?</h3>
                <p className="text-sm text-muted-foreground">Tell us about your degree and major</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Select value={data.degree} onValueChange={(value) => setData(prev => ({ ...prev, degree: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field</Label>
                  <Input
                    id="major"
                    value={data.major}
                    onChange={(e) => setData(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="e.g. Computer Science, Business, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Year & Session */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">What year are you in?</h3>
                <p className="text-sm text-muted-foreground">Help us understand your academic progress</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={data.year.toString()} onValueChange={(value) => setData(prev => ({ ...prev, year: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session">Current Session</Label>
                  <Select value={data.session.toString()} onValueChange={(value) => setData(prev => ({ ...prev, session: parseInt(value) }))}>
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
            </div>
          )}

          {/* Step 4: Units */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">What units are you taking?</h3>
                <p className="text-sm text-muted-foreground">Add the units you're currently enrolled in</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. COMP1010, MATH1020, etc."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUnit())}
                  />
                  <Button onClick={addUnit} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {data.units.map((unit) => (
                    <Badge key={unit} variant="secondary" className="flex items-center gap-1">
                      {unit}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeUnit(unit)}
                      />
                    </Badge>
                  ))}
                </div>
                
                {data.units.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No units added yet. Add at least one unit to continue.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
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