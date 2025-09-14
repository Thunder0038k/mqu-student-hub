import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Mail } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function EmailCapture() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic email validation
      const emailTrim = email.trim().toLowerCase()

      if (!emailTrim) {
        toast({
          title: "Validation Error",
          description: "Please enter your email address.",
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
            email: emailTrim,
            source: 'email-capture'
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
    <section className="py-20 bg-primary/5">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Want early access to{" "}
                <span className="gradient-hero bg-clip-text text-transparent">
                  MacTrack?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Be the first to experience the future of student life management at Macquarie University. 
                Join our exclusive waitlist today.
              </p>
            </div>

            {/* Form or Success State */}
            <div className="max-w-md mx-auto">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 shadow-card"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading}
                    className="shadow-elegant px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Adding..." : "Get Early Access"}
                  </Button>
                </form>
              ) : (
                <div className="bg-card p-6 rounded-xl border border-primary/20 shadow-card">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Welcome to the waitlist!</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll be in touch soon with your early access invite.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Built for MQ students</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Privacy focused</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}