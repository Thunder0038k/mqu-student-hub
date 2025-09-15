import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface ClassSession {
  id: string;
  unitCode: string;
  unitName: string;
  type: "lecture" | "tutorial" | "lab" | "workshop";
  time: string;
  location: string;
  instructor: string;
}

interface DaySchedule {
  day: string;
  date: string;
  classes: ClassSession[];
}

export function TimetableSection() {
  const weekData: DaySchedule[] = [
    {
      day: "Monday",
      date: "Sep 16",
      classes: [
        {
          id: "1",
          unitCode: "COMP2670",
          unitName: "Software Engineering",
          type: "lecture",
          time: "9:00 - 11:00",
          location: "E7B T3",
          instructor: "Dr. Smith"
        }
      ]
    },
    {
      day: "Tuesday",
      date: "Sep 17",
      classes: [
        {
          id: "2",
          unitCode: "COMP3780",
          unitName: "Database Systems",
          type: "lecture",
          time: "10:00 - 12:00",
          location: "E7B T1",
          instructor: "Prof. Johnson"
        },
        {
          id: "3",
          unitCode: "COMP3780",
          unitName: "Database Systems",
          type: "tutorial",
          time: "14:00 - 15:00",
          location: "E7B C1",
          instructor: "Dr. Wilson"
        }
      ]
    },
    {
      day: "Wednesday",
      date: "Sep 18",
      classes: [
        {
          id: "4",
          unitCode: "STAT2170",
          unitName: "Statistics",
          type: "lecture",
          time: "11:00 - 13:00",
          location: "E7B T2",
          instructor: "Dr. Brown"
        }
      ]
    },
    {
      day: "Thursday",
      date: "Sep 19",
      classes: [
        {
          id: "5",
          unitCode: "COMP1010",
          unitName: "Programming Fundamentals",
          type: "lab",
          time: "9:00 - 12:00",
          location: "E7B Lab",
          instructor: "Dr. Davis"
        }
      ]
    },
    {
      day: "Friday",
      date: "Sep 20",
      classes: []
    }
  ];

  const getTypeColor = (type: ClassSession["type"]) => {
    const colors = {
      lecture: "default",
      tutorial: "secondary",
      lab: "outline",
      workshop: "destructive"
    } as const;
    return colors[type];
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Timetable</CardTitle>
        <p className="text-sm text-muted-foreground">Week of September 16-20, 2024</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {weekData.map((day) => (
            <div key={day.day} className="space-y-3">
              <div className="text-center pb-2 border-b">
                <h3 className="font-semibold text-sm">{day.day}</h3>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>
              
              <div className="space-y-2">
                {day.classes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-xs">No classes</p>
                  </div>
                ) : (
                  day.classes.map((classSession) => (
                    <div
                      key={classSession.id}
                      className="p-3 rounded-md border bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={getTypeColor(classSession.type)} className="text-xs">
                            {classSession.type}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm">{classSession.unitCode}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {classSession.unitName}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {classSession.time}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {classSession.location}
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{classSession.instructor}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}