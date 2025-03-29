"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  PlusCircle,
  User,
  Users,
  BarChart,
  Calendar,
  Settings,
  LogOut,
  Menu,
  Check,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  Event,
  EventCategory,
  FormField,
  FestSegment,
  Registration,
} from "@/types";
import {
  loginAdmin,
  logoutAdmin,
  isAdminAuthenticated,
  initializeAdmin,
  getCurrentAdmin,
} from "@/services/authService";
import {
  getEvents,
  saveEvent,
  deleteEvent,
  deleteSegment,
} from "@/services/eventService";
import {
  getRegistrations,
  deleteRegistration,
  updateRegistration,
} from "@/services/registrationService";
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";
import SettingsPanel from "@/components/admin/settings/SettingsPanel";
// Import the new form components
import { EventForm } from "@/components/admin/event-form";
import { SegmentForm } from "@/components/admin/segment-form";

const Admin = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Data state
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentSegment, setCurrentSegment] = useState<FestSegment | null>(
    null
  );

  // UI state
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserDataDialog, setShowUserDataDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "event" | "segment" | "registration";
    id: string;
  } | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [segmentFormFields, setSegmentFormFields] = useState<FormField[]>([]);
  const [activeTab, setActiveTab] = useState("events");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState({
    event: "all",
    segment: "all",
    status: "all",
  });

  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Initialize admin and check authentication
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize admin account
        await initializeAdmin();

        // Check if user is already logged in
        const isAuth = isAdminAuthenticated();
        setIsAuthenticated(isAuth);

        // If authenticated, fetch data
        if (isAuth) {
          // Fetch events and registrations data
          fetchData();

          // Set the active tab based on URL hash if present
          const hash = window.location.hash.replace("#", "");
          if (
            hash &&
            ["events", "registrations", "analytics", "settings"].includes(hash)
          ) {
            setActiveTab(hash);
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to initialize application", {
          description: "Please try refreshing the page.",
        });
      }
    };

    init();

    // Set up theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  // Fetch events and registrations
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, registrationsData] = await Promise.all([
        getEvents(),
        getRegistrations(),
      ]);

      setEvents(eventsData);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await loginAdmin(username, password);

      if (success) {
        setIsAuthenticated(true);
        setUsername("");
        setPassword("");
        fetchData();

        // Ensure the URL is updated to reflect we're on the admin page
        window.history.pushState(null, "Admin Dashboard", "/admin");
      } else {
        console.error("Login failed: Invalid credentials");
        toast.error("Invalid credentials", {
          description: "Please check your username and password.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);

    // Update URL hash for direct linking
    window.location.hash = tab;
  };

  // Create or update event
  const handleEventSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const eventData: Event = {
        id: currentEvent?.id || `e${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category as EventCategory,
        date: data.date,
        location: data.location,
        image: data.image,
        rules: data.rules,
        fee: data.fee ? Number(data.fee) : undefined,
        capacity: data.capacity ? Number(data.capacity) : undefined,
        formFields: formFields,
        ...(data.category === "fest" && currentEvent?.segments
          ? { segments: currentEvent.segments }
          : {}),
      };

      const savedEvent = await saveEvent(eventData);

      if (savedEvent) {
        // If this is an edit, update the event in the list
        if (currentEvent) {
          setEvents(
            events.map((event) =>
              event.id === currentEvent.id ? savedEvent : event
            )
          );
          toast.success("Event updated", {
            description: `${savedEvent.title} has been updated successfully.`,
          });
        } else {
          // If this is a new event, add it to the list
          setEvents([...events, savedEvent]);
          toast.success("Event created", {
            description: `${savedEvent.title} has been created successfully.`,
          });
        }

        setShowEventDialog(false);
        setCurrentEvent(null);
        setFormFields([]);
        reset();
      } else {
        toast.error("Failed to save event", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update segment
  const handleSegmentSubmit = async (data: any) => {
    if (!currentEvent) return;

    setIsLoading(true);

    try {
      const segmentData: FestSegment = {
        id: currentSegment?.id || `s${Date.now()}`,
        name: data.name,
        description: data.description,
        rules: data.rules,
        fee: data.fee ? Number(data.fee) : undefined,
        capacity: data.capacity ? Number(data.capacity) : undefined,
        formFields: segmentFormFields,
      };

      let updatedEvent: Event;

      if (currentSegment) {
        // Update existing segment
        const updatedSegments =
          currentEvent.segments?.map((segment) =>
            segment.id === currentSegment.id ? segmentData : segment
          ) || [];

        updatedEvent = {
          ...currentEvent,
          segments: updatedSegments,
        };
      } else {
        // Create new segment
        updatedEvent = {
          ...currentEvent,
          segments: [...(currentEvent.segments || []), segmentData],
        };
      }

      const savedEvent = await saveEvent(updatedEvent);

      if (savedEvent) {
        setEvents(
          events.map((event) =>
            event.id === currentEvent.id ? savedEvent : event
          )
        );
        setCurrentEvent(savedEvent);

        if (currentSegment) {
          toast.success("Segment updated", {
            description: `${segmentData.name} has been updated successfully.`,
          });
        } else {
          toast.success("Segment created", {
            description: `${segmentData.name} has been created successfully.`,
          });
        }

        setShowSegmentDialog(false);
        setCurrentSegment(null);
        setSegmentFormFields([]);
        reset();
      } else {
        toast.error("Failed to save segment", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving segment:", error);
      toast.error("Failed to save segment", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event, segment, or registration
  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);

    try {
      if (itemToDelete.type === "event") {
        // Delete event
        const success = await deleteEvent(itemToDelete.id);
        if (success) {
          setEvents(events.filter((event) => event.id !== itemToDelete.id));
          toast.success("Event deleted", {
            description: "The event has been deleted successfully.",
          });
        } else {
          toast.error("Failed to delete event", {
            description: "Please try again.",
          });
        }
      } else if (itemToDelete.type === "segment" && currentEvent) {
        // Delete segment
        const success = await deleteSegment(itemToDelete.id);
        if (success) {
          const updatedEvent = {
            ...currentEvent,
            segments: currentEvent.segments?.filter(
              (segment) => segment.id !== itemToDelete.id
            ),
          };

          setEvents(
            events.map((event) =>
              event.id === currentEvent.id ? updatedEvent : event
            )
          );
          setCurrentEvent(updatedEvent);

          toast.success("Segment deleted", {
            description: "The segment has been deleted successfully.",
          });
        } else {
          toast.error("Failed to delete segment", {
            description: "Please try again.",
          });
        }
      } else if (itemToDelete.type === "registration") {
        // Delete registration
        const success = await deleteRegistration(itemToDelete.id);
        if (success) {
          setRegistrations(
            registrations.filter((reg) => reg.id !== itemToDelete.id)
          );
          toast.success("Registration deleted", {
            description: "The registration has been deleted successfully.",
          });
        } else {
          toast.error("Failed to delete registration", {
            description: "Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("Delete operation failed", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  // Update registration status
  const handleUpdateRegistrationStatus = async (
    registrationId: string,
    status: "pending" | "completed" | "failed"
  ) => {
    const registration = registrations.find((r) => r.id === registrationId);
    if (!registration) return;

    try {
      const updatedRegistration: Registration = {
        ...registration,
        paymentStatus: status,
      };

      const success = await updateRegistration(updatedRegistration);

      if (success) {
        setRegistrations(
          registrations.map((r) =>
            r.id === registrationId ? updatedRegistration : r
          )
        );
        toast.success("Registration updated", {
          description: `Payment status set to ${status}.`,
        });
      } else {
        toast.error("Failed to update registration", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Update failed", {
        description: "An unexpected error occurred.",
      });
    }
  };

  // Add form field
  const addFormField = (isSegment = false) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
    };

    if (isSegment) {
      setSegmentFormFields([...segmentFormFields, newField]);
    } else {
      setFormFields([...formFields, newField]);
    }
  };

  // Update form field
  const updateFormField = (
    index: number,
    field: Partial<FormField>,
    isSegment = false
  ) => {
    if (isSegment) {
      const updatedFields = [...segmentFormFields];
      updatedFields[index] = { ...updatedFields[index], ...field };
      setSegmentFormFields(updatedFields);
    } else {
      const updatedFields = [...formFields];
      updatedFields[index] = { ...updatedFields[index], ...field };
      setFormFields(updatedFields);
    }
  };

  // Remove form field
  const removeFormField = (index: number, isSegment = false) => {
    if (isSegment) {
      setSegmentFormFields(segmentFormFields.filter((_, i) => i !== index));
    } else {
      setFormFields(formFields.filter((_, i) => i !== index));
    }
  };

  // Edit event
  const editEvent = (event: Event) => {
    setCurrentEvent(event);
    setFormFields(event.formFields);

    // Set form values
    Object.entries(event).forEach(([key, value]) => {
      // Skip nested objects and arrays
      if (typeof value !== "object" && key !== "segments") {
        setValue(key, value);
      }
    });

    setShowEventDialog(true);
  };

  // Edit segment
  const editSegment = (event: Event, segment: FestSegment) => {
    setCurrentEvent(event);
    setCurrentSegment(segment);
    setSegmentFormFields(segment.formFields);

    // Set form values
    Object.entries(segment).forEach(([key, value]) => {
      // Skip nested objects and arrays
      if (typeof value !== "object") {
        setValue(key, value);
      }
    });

    setShowSegmentDialog(true);
  };

  // Function to get event title by ID
  const getEventTitle = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    return event ? event.title : "Unknown Event";
  };

  // Function to get segment name by ID
  const getSegmentName = (eventId: string, segmentId: string | undefined) => {
    if (!segmentId) return "";

    const event = events.find((e) => e.id === eventId);
    const segment = event?.segments?.find((s) => s.id === segmentId);
    return segment ? segment.name : "";
  };

  const handleFilterChange = (
    type: "event" | "segment" | "status",
    value: string
  ) => {
    setFilter((prevFilter) => ({ ...prevFilter, [type]: value }));
  };

  const handleExportRegistrations = () => {
    const filteredRegistrations = registrations.filter((registration) => {
      if (filter.event !== "all" && registration.eventId !== filter.event)
        return false;
      if (filter.segment !== "all" && registration.segmentId !== filter.segment)
        return false;
      if (
        filter.status !== "all" &&
        registration.paymentStatus !== filter.status
      )
        return false;
      return true;
    });

    // Collect all unique user data fields across all registrations
    const userDataFields = new Set<string>();
    filteredRegistrations.forEach((registration) => {
      if (typeof registration.userData === "object") {
        // Extract only genuine user form data, excluding system fields
        const systemFields = [
          "paymentMethod",
          "paymentStatus",
          "transactionId",
          "segment_",
          "Segment_",
          "segmentId",
          "SegmentId",
        ];

        Object.keys(registration.userData).forEach((key) => {
          // Skip if it's a system field
          const isSystemField = systemFields.some(
            (field) =>
              key.includes(field) ||
              // Skip UUID-like strings
              key.match(
                /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
              )
          );

          if (!isSystemField) {
            userDataFields.add(key);
          }
        });
      }
    });

    // Convert the Set to Array and sort alphabetically
    const sortedUserDataFields = Array.from(userDataFields).sort();

    // Create CSV header with standard fields + all user data fields
    const standardFields = [
      "Registration ID",
      "Event",
      "Segment",
      "Registration Date",
      "Payment Status",
      "Transaction ID",
    ];
    const csvHeader = [...standardFields, ...sortedUserDataFields];

    // Create CSV rows
    const csvRows = filteredRegistrations.map((registration) => {
      const standardValues = [
        registration.id,
        getEventTitle(registration.eventId),
        getSegmentName(registration.eventId, registration.segmentId) || "N/A",
        new Date(registration.timestamp).toLocaleDateString(),
        registration.paymentStatus || "N/A",
        registration.transactionId || "N/A",
      ];

      // Add values for user data fields
      const userDataValues = sortedUserDataFields.map((field) => {
        if (
          typeof registration.userData === "object" &&
          registration.userData[field] !== undefined
        ) {
          // Handle potential commas in the data by wrapping in quotes
          const value = String(registration.userData[field]);
          return value.includes(",") ? `"${value}"` : value;
        }
        return "";
      });

      return [...standardValues, ...userDataValues];
    });

    // Create the full CSV content
    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a link to download the CSV file
    const link = document.createElement("a");
    const filename = `registrations_export_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Please sign in to access the admin panel
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const currentAdmin = getCurrentAdmin();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-screen">
          <div className="p-6 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="p-4 flex-grow">
            <div className="space-y-1">
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                  activeTab === "events"
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => handleTabChange("events")}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Events
              </button>
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                  activeTab === "registrations"
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => handleTabChange("registrations")}
              >
                <Users className="mr-3 h-5 w-5" />
                Registrations
              </button>
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                  activeTab === "analytics"
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => handleTabChange("analytics")}
              >
                <BarChart className="mr-3 h-5 w-5" />
                Analytics
              </button>
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                  activeTab === "settings"
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => handleTabChange("settings")}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </div>
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{currentAdmin?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top bar */}
          <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <button
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-bold ml-4 md:hidden">Admin Panel</h1>
            </div>

            <div className="flex items-center ml-auto">
              <div className="md:hidden">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
              <div className="hidden md:flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">
                  {currentAdmin?.username}
                </span>
              </div>
            </div>
          </header>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <nav className="p-4">
                <div className="space-y-1">
                  <button
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                      activeTab === "events"
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => handleTabChange("events")}
                  >
                    <Calendar className="mr-3 h-5 w-5" />
                    Events
                  </button>
                  <button
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                      activeTab === "registrations"
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => handleTabChange("registrations")}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    Registrations
                  </button>
                  <button
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                      activeTab === "analytics"
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => handleTabChange("analytics")}
                  >
                    <BarChart className="mr-3 h-5 w-5" />
                    Analytics
                  </button>
                  <button
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                      activeTab === "settings"
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => handleTabChange("settings")}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </button>
                </div>
              </nav>
            </div>
          )}

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-6">
            {isLoading && (
              <div className="fixed inset-0 bg-black/20 dark:bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
                  <div className="h-4 w-4 border-2 border-t-transparent border-gray-900 dark:border-gray-300 rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="hidden">
                <TabsList>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="registrations">Registrations</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="events" className="space-y-6">
                {/* Events content from original component */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Events Management</h2>
                  <Button
                    onClick={() => {
                      setCurrentEvent(null);
                      setFormFields([]);
                      reset();
                      setShowEventDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Event
                  </Button>
                </div>

                {/* Rest of the events content */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {event.image ? (
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600" />
                        )}
                      </div>

                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              {event.category.charAt(0).toUpperCase() +
                                event.category.slice(1)}
                            </div>
                            <CardTitle>{event.title}</CardTitle>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({
                                  type: "event",
                                  id: event.id,
                                });
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center mb-1">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>

                          <div
                            className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 prose prose-sm dark:prose-invert"
                            dangerouslySetInnerHTML={{
                              __html: event.description,
                            }}
                          />

                          {event.category === "fest" && event.segments && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">
                                Segments ({event.segments.length})
                              </h4>
                              <div className="space-y-2">
                                {event.segments.map((segment) => (
                                  <div
                                    key={segment.id}
                                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm"
                                  >
                                    <span>{segment.name}</span>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          editSegment(event, segment)
                                        }
                                        className="h-6 w-6"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setCurrentEvent(event);
                                          setItemToDelete({
                                            type: "segment",
                                            id: segment.id,
                                          });
                                          setShowDeleteDialog(true);
                                        }}
                                        className="h-6 w-6 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between">
                        {event.category === "fest" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentEvent(event);
                              setCurrentSegment(null);
                              setSegmentFormFields([]);
                              reset();
                              setShowSegmentDialog(true);
                            }}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Segment
                          </Button>
                        )}

                        <div className="ml-auto text-sm">
                          {event.fee !== undefined
                            ? event.fee > 0
                              ? `Fee: ৳${event.fee}`
                              : "Free"
                            : "No fee set"}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {events.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Calendar className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No events yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Get started by creating your first event.
                    </p>
                    <Button
                      onClick={() => {
                        setCurrentEvent(null);
                        setFormFields([]);
                        reset();
                        setShowEventDialog(true);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="registrations">
                {/* Registrations content from original component */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Registrations</h2>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => handleExportRegistrations()}
                      className="flex items-center"
                      disabled={registrations.length === 0}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="eventFilter"
                        className="text-sm font-medium mb-2 block"
                      >
                        Filter by Event
                      </Label>
                      <select
                        id="eventFilter"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        onChange={(e) =>
                          handleFilterChange("event", e.target.value)
                        }
                        defaultValue="all"
                      >
                        <option value="all">All Events</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="segmentFilter"
                        className="text-sm font-medium mb-2 block"
                      >
                        Filter by Segment
                      </Label>
                      <select
                        id="segmentFilter"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        onChange={(e) =>
                          handleFilterChange("segment", e.target.value)
                        }
                        defaultValue="all"
                      >
                        <option value="all">All Segments</option>
                        {events
                          .filter(
                            (event) =>
                              event.segments && event.segments.length > 0
                          )
                          .flatMap((event) =>
                            (event.segments || []).map((segment) => ({
                              id: segment.id,
                              name: `${event.title} - ${segment.name}`,
                            }))
                          )
                          .map((segment) => (
                            <option key={segment.id} value={segment.id}>
                              {segment.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="statusFilter"
                        className="text-sm font-medium mb-2 block"
                      >
                        Filter by Payment Status
                      </Label>
                      <select
                        id="statusFilter"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                        defaultValue="all"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rest of the registrations content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Segment
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Registered On
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {registrations
                          .filter((registration) => {
                            if (
                              filter.event !== "all" &&
                              registration.eventId !== filter.event
                            )
                              return false;
                            if (
                              filter.segment !== "all" &&
                              registration.segmentId !== filter.segment
                            )
                              return false;
                            if (
                              filter.status !== "all" &&
                              registration.paymentStatus !== filter.status
                            )
                              return false;
                            return true;
                          })
                          .map((registration) => (
                            <tr
                              key={registration.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">
                                  {(typeof registration.userData === "object" &&
                                    Object.entries(registration.userData)
                                      .filter(([key]) =>
                                        key.toLowerCase().includes("name")
                                      )
                                      .map(([key, value]) => value)
                                      .join(" ")) ||
                                    "-"}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {(typeof registration.userData === "object" &&
                                    Object.entries(registration.userData)
                                      .filter(([key]) =>
                                        key.toLowerCase().includes("email")
                                      )
                                      .map(([key, value]) => value)
                                      .join(" ")) ||
                                    "-"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getEventTitle(registration.eventId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getSegmentName(
                                  registration.eventId,
                                  registration.segmentId
                                ) || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {new Date(
                                  registration.timestamp
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.paymentStatus ? (
                                  <div className="flex flex-col space-y-2">
                                    <div
                                      className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        registration.paymentStatus ===
                                          "completed"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                          : registration.paymentStatus ===
                                            "pending"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      )}
                                    >
                                      {registration.paymentStatus
                                        .charAt(0)
                                        .toUpperCase() +
                                        registration.paymentStatus.slice(1)}
                                    </div>
                                    {registration.transactionId && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        TXN: {registration.transactionId}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRegistration(registration);
                                      setShowUserDataDialog(true);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                  {registration.paymentStatus &&
                                    registration.paymentStatus !==
                                      "completed" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-500 hover:text-green-700"
                                        onClick={() =>
                                          handleUpdateRegistrationStatus(
                                            registration.id,
                                            "completed"
                                          )
                                        }
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    )}
                                  {registration.paymentStatus &&
                                    registration.paymentStatus !== "failed" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() =>
                                          handleUpdateRegistrationStatus(
                                            registration.id,
                                            "failed"
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => {
                                      setItemToDelete({
                                        type: "registration",
                                        id: registration.id,
                                      });
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {registrations.length === 0 && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <Users className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        No registrations yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Registrations will appear here once users sign up for
                        events.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to{" "}
              {currentEvent ? "update the" : "create a new"} event.
            </DialogDescription>
          </DialogHeader>

          <EventForm
            event={currentEvent}
            formFields={formFields}
            onSubmit={handleEventSubmit}
            onAddFormField={() => addFormField()}
            onUpdateFormField={(index, field) => updateFormField(index, field)}
            onRemoveFormField={(index) => removeFormField(index)}
          />
        </DialogContent>
      </Dialog>

      {/* Segment Dialog */}
      <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentSegment ? "Edit Segment" : "Create New Segment"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to{" "}
              {currentSegment ? "update the" : "create a new"} segment.
            </DialogDescription>
          </DialogHeader>

          <SegmentForm
            segment={currentSegment}
            formFields={segmentFormFields}
            onSubmit={handleSegmentSubmit}
            onAddFormField={() => addFormField(true)}
            onUpdateFormField={(index, field) =>
              updateFormField(index, field, true)
            }
            onRemoveFormField={(index) => removeFormField(index, true)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p>
              Are you sure you want to delete this{" "}
              {itemToDelete?.type === "event"
                ? "event"
                : itemToDelete?.type === "segment"
                ? "segment"
                : "registration"}
              ?
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Data Dialog */}
      <Dialog open={showUserDataDialog} onOpenChange={setShowUserDataDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Registration Details</DialogTitle>
            <DialogDescription>
              All data submitted by the user during registration.
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Event</h3>
                <p className="text-sm">
                  {getEventTitle(selectedRegistration.eventId)}
                </p>
              </div>

              {selectedRegistration.segmentId && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Segment</h3>
                  <p className="text-sm">
                    {getSegmentName(
                      selectedRegistration.eventId,
                      selectedRegistration.segmentId
                    ) || "N/A"}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-2">Registration Date</h3>
                <p className="text-sm">
                  {new Date(selectedRegistration.timestamp).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Payment Status</h3>
                <div
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    selectedRegistration.paymentStatus === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : selectedRegistration.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : selectedRegistration.paymentStatus === "failed"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {selectedRegistration.paymentStatus
                    ? selectedRegistration.paymentStatus
                        .charAt(0)
                        .toUpperCase() +
                      selectedRegistration.paymentStatus.slice(1)
                    : "Not Available"}
                </div>
              </div>

              {selectedRegistration.transactionId && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Transaction ID</h3>
                  <p className="text-sm">
                    {selectedRegistration.transactionId}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-4">User Data</h3>

                {(() => {
                  // Extract only genuine user form data, excluding system fields
                  const genuineUserData = {};

                  if (typeof selectedRegistration.userData === "object") {
                    // Known system fields to exclude
                    const systemFields = [
                      "paymentMethod",
                      "paymentStatus",
                      "transactionId",
                      "segment_",
                      "Segment_",
                      "segmentId",
                      "SegmentId",
                    ];

                    // Process each field in userData
                    Object.entries(selectedRegistration.userData).forEach(
                      ([key, value]) => {
                        // Skip if it's a system field
                        const isSystemField = systemFields.some(
                          (field) =>
                            key.includes(field) ||
                            // Skip UUID-like strings
                            key.match(
                              /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
                            ) ||
                            // Skip long hex strings
                            key.match(/^[0-9a-f]{16,}$/i)
                        );

                        if (!isSystemField) {
                          // Format the key for display (convert camelCase to Title Case)
                          const displayKey = key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/_/g, " ")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim();

                          genuineUserData[displayKey] = value;
                        }
                      }
                    );
                  }

                  const userDataEntries = Object.entries(genuineUserData);

                  if (userDataEntries.length === 0) {
                    return (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md p-4">
                        <p className="text-amber-700 dark:text-amber-400 text-sm">
                          No form data found. This may be because:
                        </p>
                        <ul className="list-disc list-inside text-sm text-amber-600 dark:text-amber-500 mt-2 space-y-1">
                          <li>The user didn't submit any form fields</li>
                          <li>The form data wasn't properly saved</li>
                          <li>
                            This is an older registration before form data was
                            collected
                          </li>
                        </ul>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
                      {userDataEntries.map(([key, value], index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                        >
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key}
                          </div>
                          <div className="text-sm col-span-2 text-gray-900 dark:text-gray-100">
                            {String(value) || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
