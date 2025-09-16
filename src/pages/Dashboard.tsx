export default function Dashboard() {
  // This route is deprecated - redirect users to the new /app dashboard
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Dashboard Moved</h2>
        <p className="text-muted-foreground">The dashboard has been moved to a new location.</p>
        <div className="space-x-4">
          <a href="/auth" className="text-primary hover:underline">Sign In</a>
          <a href="/app" className="text-primary hover:underline">Go to App</a>
        </div>
      </div>
    </div>
  );
}