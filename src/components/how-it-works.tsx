import { UserPlus, Zap, Target } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up",
      description: "Join the waitlist with your Macquarie University email address. Be among the first to access MacTrack.",
      step: "01"
    },
    {
      icon: Zap,
      title: "Get Early Access",
      description: "Receive your exclusive invitation when MacTrack launches. Set up your personalized dashboard in minutes.",
      step: "02"
    },
    {
      icon: Target,
      title: "Stay on Track",
      description: "Manage assignments, track grades, and never miss a deadline. Focus on what matters most - your success.",
      step: "03"
    }
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold">
            How MacTrack{" "}
            <span className="gradient-hero bg-clip-text text-transparent">
              works for you
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting started with MacTrack is simple. Join thousands of MQ students 
            who are already preparing for a more organized academic life.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0"></div>
              )}
              
              <div className="relative z-10 space-y-6">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-sm font-bold rounded-full mb-2">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-card rounded-2xl shadow-card mx-auto border border-border/50">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="bg-gradient-card p-8 rounded-2xl shadow-elegant max-w-2xl mx-auto border border-border/50">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Join the MacTrack community and be notified the moment we launch. 
              Your journey to academic excellence starts here.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                No spam, ever
              </span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                Unsubscribe anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}