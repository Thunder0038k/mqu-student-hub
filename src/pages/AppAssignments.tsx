import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Plus, Calendar, BookOpen, Edit, Trash2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AssignmentSetup } from "@/components/dashboard/assignments-setup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { User } from '@supabase/supabase-js';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  priority: string;
  unit_id: string;
  units?: {
    unit_code: string;
    unit_name: string;
  };
}

interface Unit {
  id: string;
  unit_code: string;
  unit_name: string;
}

interface AppAssignmentsProps {
  user: User;
}

export default function AppAssignments({ user }: AppAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAssignmentSetup, setShowAssignmentSetup] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchUnits();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          units:unit_id (
            unit_code,
            unit_name
          )
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching assignments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUnits(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching units",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: newStatus }
          : assignment
      ));

      toast({
        title: `Assignment marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating assignment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      toast({
        title: "Assignment deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting assignment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, ...updates }
          : assignment
      ));

      setEditingAssignment(null);
      toast({
        title: "Assignment updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating assignment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let dueSuffix = '';
    if (diffDays < 0) {
      dueSuffix = ` (${Math.abs(diffDays)} days overdue)`;
    } else if (diffDays === 0) {
      dueSuffix = ' (Due today)';
    } else if (diffDays === 1) {
      dueSuffix = ' (Due tomorrow)';
    } else if (diffDays <= 7) {
      dueSuffix = ` (Due in ${diffDays} days)`;
    }

    return { formattedDate, formattedTime, dueSuffix, isOverdue: diffDays < 0 };
  };

  const getStatusBadge = (status: string) => {
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
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "destructive"
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Setup Form Modal */}
      {showAssignmentSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <AssignmentSetup 
            units={units} 
            userId={user.id}
            onClose={() => {
              setShowAssignmentSetup(false);
              fetchAssignments();
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            Assignments
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your assignments
          </p>
        </div>
        <Button onClick={() => setShowAssignmentSetup(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first assignment to start tracking your work.
              </p>
              <Button onClick={() => setShowAssignmentSetup(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const { formattedDate, formattedTime, dueSuffix, isOverdue } = formatDueDate(assignment.due_date);
            
            return (
              <Card key={assignment.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-destructive' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        {getStatusBadge(assignment.status)}
                        {getPriorityBadge(assignment.priority)}
                      </div>
                      {assignment.units && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {assignment.units.unit_code} - {assignment.units.unit_name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                          {formattedDate} at {formattedTime}{dueSuffix}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assignment.status !== 'submitted' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-green-600 hover:text-green-600"
                          onClick={() => updateAssignmentStatus(assignment.id, 'submitted')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingAssignment(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Assignment</DialogTitle>
                          </DialogHeader>
                          {editingAssignment && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={editingAssignment.title}
                                  onChange={(e) => setEditingAssignment({
                                    ...editingAssignment,
                                    title: e.target.value
                                  })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editingAssignment.description || ''}
                                  onChange={(e) => setEditingAssignment({
                                    ...editingAssignment,
                                    description: e.target.value
                                  })}
                                  rows={3}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Status</Label>
                                  <Select
                                    value={editingAssignment.status}
                                    onValueChange={(value) => setEditingAssignment({
                                      ...editingAssignment,
                                      status: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="submitted">Submitted</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <Select
                                    value={editingAssignment.priority}
                                    onValueChange={(value) => setEditingAssignment({
                                      ...editingAssignment,
                                      priority: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingAssignment(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => updateAssignment(editingAssignment.id, {
                                    title: editingAssignment.title,
                                    description: editingAssignment.description,
                                    status: editingAssignment.status,
                                    priority: editingAssignment.priority
                                  })}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {assignment.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}