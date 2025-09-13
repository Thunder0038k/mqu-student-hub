import { ThemeToggle } from "./theme-toggle"
import macquarieLogo from "@/assets/macquarie-logo.png"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={macquarieLogo} alt="Macquarie University" className="h-8 w-8" />
          <span className="text-xl font-bold">MacTrack</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}