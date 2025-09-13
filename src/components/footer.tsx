import { Mail, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card/30">
      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                M
              </div>
              <span className="text-xl font-bold">MacTrack</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              The all-in-one student dashboard designed specifically for Macquarie University students.
            </p>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-semibold">Development Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Currently in development</span>
              </div>
              <p className="text-sm text-muted-foreground">
                MacTrack is being built with love for the MQ community. 
                Be the first to know when we launch!
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Get in Touch</h3>
            <div className="flex gap-4">
              <a 
                href="mailto:hello@mactrack.app" 
                className="flex items-center justify-center w-10 h-10 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center w-10 h-10 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center w-10 h-10 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Questions? Feedback? We'd love to hear from you!
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 MacTrack. Built for Macquarie University students.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}