import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, FileText, Globe, Calculator } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "handbook" | "guide" | "portal" | "tool";
  url: string;
  unitCode?: string;
}

export function ResourcesSection() {
  const resources: Resource[] = [
    {
      id: "1",
      title: "Student Handbook 2024",
      description: "Complete guide to university policies and procedures",
      type: "handbook",
      url: "#"
    },
    {
      id: "2",
      title: "COMP2670 Unit Guide",
      description: "Software Engineering unit information and assessment details",
      type: "guide",
      url: "#",
      unitCode: "COMP2670"
    },
    {
      id: "3",
      title: "iLearn Portal",
      description: "Access course materials, submissions, and announcements",
      type: "portal",
      url: "#"
    },
    {
      id: "4",
      title: "COMP3780 Unit Guide",
      description: "Database Systems unit information and resources",
      type: "guide",
      url: "#",
      unitCode: "COMP3780"
    },
    {
      id: "5",
      title: "Academic Calculator",
      description: "Calculate GPA and track your academic progress",
      type: "tool",
      url: "#"
    },
    {
      id: "6",
      title: "Library Resources",
      description: "Access digital library, databases, and research tools",
      type: "portal",
      url: "#"
    }
  ];

  const getResourceIcon = (type: Resource["type"]) => {
    const icons = {
      handbook: BookOpen,
      guide: FileText,
      portal: Globe,
      tool: Calculator
    };
    
    const Icon = icons[type];
    return <Icon className="h-5 w-5" />;
  };

  const getResourceColor = (type: Resource["type"]) => {
    const colors = {
      handbook: "text-blue-600 dark:text-blue-400",
      guide: "text-green-600 dark:text-green-400",
      portal: "text-purple-600 dark:text-purple-400",
      tool: "text-orange-600 dark:text-orange-400"
    };
    return colors[type];
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resources</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick access to unit guides, handbooks, and useful tools
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`${getResourceColor(resource.type)}`}>
                    {getResourceIcon(resource.type)}
                  </div>
                  {resource.unitCode && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {resource.unitCode}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    // Placeholder for opening resource
                    console.log(`Opening ${resource.title}`);
                  }}
                >
                  Open Resource
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border-dashed border-2">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Need more resources?</p>
            <p className="text-xs text-muted-foreground">
              Resources are automatically added based on your enrolled units
            </p>
            <Button variant="outline" size="sm">
              Refresh Resources
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}