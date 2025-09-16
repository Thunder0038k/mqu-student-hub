import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, MapPin, BookOpen, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarSetup } from "@/components/dashboard/calendar-setup";
import type { User } from '@supabase/supabase-js';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  event_type: string;
  unit_id: string | null;
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

interface AppCalendarProps {
  user: User;
}

export default function AppCalendar({ user }: AppCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showEventSetup, setShowEventSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchUnits();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          units:unit_id (
            unit_code,
            unit_name
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
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

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "Event deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getEventTypeBadge = (type: string) => {
    const variants = {
      lecture: "default",
      tutorial: "secondary",
      exam: "destructive",
      assignment: "outline",
      general: "secondary"
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || "secondary"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Setup Form Modal */}
      {showEventSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <CalendarSetup 
            units={units} 
            userId={user.id}
            onClose={() => {
              setShowEventSetup(false);
              fetchEvents();
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your schedule and important dates
          </p>
        </div>
        <Button onClick={() => setShowEventSetup(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first event to get started with organizing your schedule.
              </p>
              <Button onClick={() => setShowEventSetup(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const startDateTime = formatDateTime(event.start_time);
            const endDateTime = formatDateTime(event.end_time);
            
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {getEventTypeBadge(event.event_type)}
                      </div>
                      {event.units && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {event.units.unit_code} - {event.units.unit_name}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{startDateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm ml-6">
                        <span>{startDateTime.time} - {endDateTime.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <div className="text-sm text-muted-foreground">
                        {event.description}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}