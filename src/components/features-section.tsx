import { Calendar, Target, TrendingUp, Clock, Bell, BarChart3 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Assignment Tracking",
      description: "Never miss a deadline again. Keep track of all your assignments, projects, and submissions in one organized dashboard.",
      highlights: ["Due date reminders", "Progress tracking", "Submission history"]
    },
    {
      icon: Calendar,
      title: "Timetable View",
      description: "See your classes at a glance with our intuitive timetable interface. Sync with Macquarie's scheduling system.",
      highlights: ["Visual schedule", "Room locations", "Class conflicts detection"]
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor your academic progress with detailed analytics. Watch your grades improve over time with actionable insights.",
      highlights: ["Grade analytics", "Trend analysis", "Goal setting"]
    }
  ]

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to{" "}
            <span className="text-red-600 font-bold">
              excel at MQ
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for Macquarie University students, MacTrack brings together 
            all the tools you need to stay organized and successful.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group bg-card p-8 rounded-2xl shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in-up border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
                
                <ul className="space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Features Grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/30">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Real-time notifications</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/30">
            <Bell className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Smart reminders</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/30">
            <BarChart3 className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Progress insights</span>
          </div>
        </div>
      </div>
    </section>
  )
}
