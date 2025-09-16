import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import macquarieLogo from "@/assets/macquarie-logo.png"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={macquarieLogo} alt="Macquarie University" className="h-8 w-8" />
          <span className="text-xl font-bold">MacTrack</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline">
            <a href="/auth">Sign In</a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}