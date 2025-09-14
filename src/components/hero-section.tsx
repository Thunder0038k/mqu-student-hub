import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, BookOpen, Users } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      const emailTrim = email.trim().toLowerCase()
      const nameTrim = name.trim()

      if (!emailTrim || !nameTrim) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields.",
          variant: "destructive"
        })
        return
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailTrim)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('email_signups')
        .insert([
          {
            name: nameTrim,
            email: emailTrim,
            source: 'hero-form'
          }
        ])

      if (error) {
        // Handle duplicate email error specifically
        if (error.code === '23505' && error.message.includes('unique_email')) {
          toast({
            title: "Already Registered",
            description: "This email is already on our waitlist!",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to join waitlist. Please try again.",
            variant: "destructive"
          })
        }
      } else {
        setIsSubmitted(true)
        toast({
          title: "Success!",
          description: "You've been added to the waitlist."
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Elements: push behind with negative z */}
      <div className="absolute inset-0 gradient-hero opacity-5 -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              {/* Headline elevated above illustration with z-20 */}
              <h1 className="relative z-20 text-4xl md:text-6xl font-bold leading-tight break-words">
                MacTrack –{" "}
                <span className="inline-block gradient-hero bg-clip-text text-transparent whitespace-normal">
                  Your All-in-One
                </span>{" "}
                Student Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Stay on top of assignments, classes, and grades at Macquarie University. 
                The smartest way to manage your student life.
              </p>
            </div>

            {/* Quick Features */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-primary" />
                Never miss deadlines
              </div>
              <div className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
                Track your grades
              </div>
              <div className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-full">
                <Users className="h-4 w-4 text-primary" />
                Built for MQ students
              </div>
            </div>

            {/* Email Form */}
            <div className="max-w-md">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="shadow-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@students.mq.edu.au"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="shadow-card"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading}
                    className="w-full shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Joining..." : "Join the Waitlist"}
                  </Button>
                </form>
              ) : (
                <div className="bg-secondary/50 p-6 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">You're on the list!</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll notify you when MacTrack launches.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Illustration - keep it behind the headline but above backgrounds */}
          <div className="relative z-10 animate-fade-in">
            <div className="bg-gradient-card rounded-2xl p-8 shadow-elegant">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Today's Schedule</h3>
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <div className="h-3 w-3 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">COMP1010 Lecture</p>
                      <p className="text-xs text-muted-foreground">9:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                    <div className="h-3 w-3 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Assignment Due</p>
                      <p className="text-xs text-muted-foreground">Database Project</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="h-3 w-3 bg-muted-foreground rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Study Group</p>
                      <p className="text-xs text-muted-foreground">3:00 PM - Library</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </section>
  )
}
