import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar } from "lucide-react";

interface Assignment {
  id: string;
  unitCode: string;
  name: string;
  dueDate: string;
  status: "pending" | "in-progress" | "submitted" | "overdue";
}

export function AssignmentsTracker() {
  const [assignments] = useState<Assignment[]>([
    {
      id: "1",
      unitCode: "COMP2670",
      name: "Software Engineering Project",
      dueDate: "2024-09-20",
      status: "in-progress"
    },
    {
      id: "2",
      unitCode: "COMP3780",
      name: "Database Systems Assignment",
      dueDate: "2024-09-25",
      status: "pending"
    },
    {
      id: "3",
      unitCode: "COMP1010",
      name: "Programming Fundamentals Quiz",
      dueDate: "2024-09-18",
      status: "submitted"
    },
    {
      id: "4",
      unitCode: "STAT2170",
      name: "Statistics Report",
      dueDate: "2024-09-12",
      status: "overdue"
    }
  ]);

  const getStatusBadge = (status: Assignment["status"]) => {
    const variants = {
      pending: "secondary",
      "in-progress": "default",
      submitted: "outline",
      overdue: "destructive"
    } as const;

    const labels = {
      pending: "Pending",
      "in-progress": "In Progress",
      submitted: "Submitted",
      overdue: "Overdue"
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAddAssignment = () => {
    // Placeholder function for adding new assignment
    console.log("Add new assignment");
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Assignments Tracker</CardTitle>
        <Button onClick={handleAddAssignment} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Assignment
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Code</TableHead>
                <TableHead>Assignment Name</TableHead>
                <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{assignment.unitCode}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{assignment.name}</p>
                      <p className="text-sm text-muted-foreground sm:hidden flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(assignment.dueDate)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDueDate(assignment.dueDate)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(assignment.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {assignments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No assignments found</p>
            <p className="text-sm">Click "Add Assignment" to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}