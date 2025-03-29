"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  AlertCircle,
  Users,
  CreditCard,
  Info,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/layout/Navbar";
import Footer from "@/components/ui/layout/Footer";
import FadeIn from "@/components/ui/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Define interfaces for the data structure
interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface FestSegment {
  id: string;
  name: string;
  description: string;
  rules?: string;
  fee?: number;
  capacity?: number;
  formFields: FormField[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  image?: string;
  rules?: string;
  fee?: number;
  capacity?: number;
  formFields: FormField[];
  segments?: FestSegment[];
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<FestSegment | null>(
    null
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isPastEvent, setIsPastEvent] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      if (!id) {
        setError("Event ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) {
          setError("Failed to load event details");
          setIsLoading(false);
          return;
        }

        if (!eventData) {
          setError("Event not found");
          setIsLoading(false);
          return;
        }

        // Fetch the event form fields
        const { data: formFieldsData, error: formFieldsError } = await supabase
          .from("event_form_fields")
          .select("*")
          .eq("event_id", id);

        if (formFieldsError) {
          setError("Failed to load event form fields");
          setIsLoading(false);
          return;
        }

        const formFields: FormField[] =
          formFieldsData?.map((field) => ({
            id: field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options || undefined,
          })) || [];

        // Initialize the event object
        const fetchedEvent: Event = {
          id: eventData.id,
          title: eventData.title,
          description: eventData.description,
          category: eventData.category,
          date: eventData.date,
          location: eventData.location,
          image: eventData.image || undefined,
          rules: eventData.rules || undefined,
          fee: eventData.fee || undefined,
          capacity: eventData.capacity || undefined,
          formFields,
        };

        // If this is a fest, fetch its segments
        if (eventData.category === "fest") {
          const { data: segmentsData, error: segmentsError } = await supabase
            .from("fest_segments")
            .select("*")
            .eq("event_id", id);

          if (segmentsError) {
            setError("Failed to load fest segments");
            setIsLoading(false);
            return;
          } else if (segmentsData && segmentsData.length > 0) {
            // Fetch form fields for each segment
            const segments = await Promise.all(
              segmentsData.map(async (segmentData) => {
                const { data: segmentFieldsData, error: segmentFieldsError } =
                  await supabase
                    .from("segment_form_fields")
                    .select("*")
                    .eq("segment_id", segmentData.id);

                if (segmentFieldsError) {
                  setError("Failed to load fest segment form fields");
                  setIsLoading(false);
                  return;
                }

                const segmentFormFields: FormField[] =
                  segmentFieldsData?.map((field) => ({
                    id: field.id,
                    label: field.label,
                    type: field.type,
                    required: field.required,
                    options: field.options || undefined,
                  })) || [];

                return {
                  id: segmentData.id,
                  name: segmentData.name,
                  description: segmentData.description,
                  rules: segmentData.rules || undefined,
                  fee: segmentData.fee || undefined,
                  capacity: segmentData.capacity || undefined,
                  formFields: segmentFormFields,
                };
              })
            );

            fetchedEvent.segments = segments;

            // Set the first segment as selected by default
            if (segments.length > 0) {
              setSelectedSegment(segments[0]);
            }
          }
        }

        setEvent(fetchedEvent);
      } catch (error) {
        console.error("Error:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
      setIsPastEvent(isPast(new Date(event.date)));
    }
  }, [event]);

  const formattedDate = event
    ? (() => {
        try {
          return format(new Date(event.date), "MMMM d, yyyy");
        } catch (error) {
          return event.date;
        }
      })()
    : "";

  const onSubmit = async (data: any) => {
    // Process the form data to get user-friendly labels
    const processedData: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      // Skip system fields that should be stored separately
      if (["paymentStatus", "paymentMethod", "transactionId"].includes(key)) {
        processedData[key] = value;
        return;
      }

      // Variable to store the display key
      let displayKey = key;

      // Handle segment-specific fields
      if (key.startsWith("segment_") && selectedSegment) {
        const fieldId = key.replace("segment_", "");
        const fieldDef = selectedSegment.formFields.find(
          (f) => f.id === fieldId
        );
        if (fieldDef) {
          displayKey = fieldDef.label;
        }
      } else {
        // For regular event fields
        const fieldDef = event?.formFields.find((f) => f.id === key);
        if (fieldDef) {
          displayKey = fieldDef.label;
        } else {
          // Format camelCase or snake_case to Title Case
          displayKey = key
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
        }
      }

      processedData[displayKey] = value;
    });

    setFormData({
      raw: data,
      processed: processedData,
    });
    setShowConfirmationDialog(true);
  };

  const handleConfirmation = async () => {
    // Store the registration data for payment processing if needed
    setRegistrationData(formData.raw);

    // If there's a fee, show the payment dialog
    if (
      (event?.fee && event.fee > 0) ||
      (selectedSegment?.fee && selectedSegment.fee > 0)
    ) {
      setShowPaymentDialog(true);
    } else {
      // If no fee, process the registration directly
      await handleRegistration(formData.raw);
    }

    // Close the confirmation dialog
    setShowConfirmationDialog(false);
  };

  const handlePayment = async (transactionId: string) => {
    // Combine registration data with payment info
    const completeData = {
      ...registrationData,
      paymentStatus: "pending",
      paymentMethod: "bkash",
      transactionId,
    };

    await handleRegistration(completeData);
    setShowPaymentDialog(false);

    // Show a message explaining that the payment is pending admin approval
    toast.success("Registration submitted", {
      description:
        "Your registration has been submitted and is pending payment approval from the administrator.",
    });
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title || "Event",
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  const handleRegistration = async (data: any) => {
    try {
      if (!event) {
        toast.error("Event information is missing");
        return;
      }

      // Separate actual user form input data from system fields
      const userData = {};

      // Process the form data to extract actual user input fields
      Object.entries(data).forEach(([key, value]) => {
        // Skip system fields that should be stored separately
        if (["paymentStatus", "paymentMethod", "transactionId"].includes(key)) {
          return;
        }

        // Handle segment-specific fields (rename them to remove the segment_ prefix)
        if (key.startsWith("segment_") && selectedSegment) {
          const fieldId = key.replace("segment_", "");
          const fieldDef = selectedSegment.formFields.find(
            (f) => f.id === fieldId
          );
          if (fieldDef) {
            userData[fieldDef.label] = value;
          } else {
            userData[key] = value;
          }
        } else {
          // For regular event fields
          const fieldDef = event.formFields.find((f) => f.id === key);
          if (fieldDef) {
            userData[fieldDef.label] = value;
          } else {
            userData[key] = value;
          }
        }
      });

      // Check if payment is needed but no payment status provided
      const needsPayment =
        (event.fee && event.fee > 0) ||
        (selectedSegment?.fee && selectedSegment.fee > 0);
      let paymentStatus = data.paymentStatus;

      // If payment is needed but no status provided, set to pending
      if (needsPayment && !paymentStatus) {
        paymentStatus = "pending";
      }

      // Prepare the registration data
      const registrationData = {
        event_id: event.id,
        segment_id: selectedSegment?.id || null,
        user_data: userData,
        payment_status: paymentStatus,
        payment_method: data.paymentMethod || null,
        transaction_id: data.transactionId || null,
        timestamp: new Date().toISOString(),
      };

      // Insert the registration into Supabase
      const { error } = await supabase
        .from("registrations")
        .insert(registrationData);

      if (error) {
        console.error("Error registering:", error);
        toast.error("Registration failed");
        return;
      }

      // Show success message based on payment status
      if (needsPayment) {
        toast.success("Registration submitted", {
          description:
            "Your registration has been submitted and is pending payment approval.",
        });
      } else {
        toast.success("Registration successful", {
          description: "You have been registered for the event. Thank you!",
        });
      }

      // Reset the form
      reset();
    } catch (error) {
      console.error("Error processing registration:", error);
      toast.error("Registration failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-60" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-3xl my-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
            <Info className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {error ||
                "The event you are looking for does not exist or has been removed."}
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link to="/events">Browse Events</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Return the full UI with the event details
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* Back button and share */}
        <div className="contained py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
          >
            <Link to="/events">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to events</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={shareEvent}
            title="Share this event"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Hero Section */}
        <section className="relative h-[300px] md:h-[400px] lg:h-[500px]">
          <div className="absolute inset-0">
            {event.image ? (
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-700 to-purple-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          </div>

          <div className="absolute inset-0 flex items-end">
            <div className="contained py-12">
              <FadeIn direction="up">
                <div className="inline-block px-3 py-1 text-sm font-medium tracking-wide text-white bg-primary/90 backdrop-blur-sm rounded-full mb-4 shadow-sm">
                  {event.category.charAt(0).toUpperCase() +
                    event.category.slice(1)}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 shadow-text">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-white">
                  <div className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    <Calendar className="h-5 w-5 mr-2 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
                    <span className="text-sm font-medium">{formattedDate}</span>
                  </div>
                  <div className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    <MapPin className="h-5 w-5 mr-2 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
                    <span className="text-sm font-medium">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    <Users className="h-5 w-5 mr-2 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
                    <span className="text-sm font-medium">
                      {event.capacity
                        ? `Capacity: ${event.capacity}`
                        : "Open capacity"}
                    </span>
                  </div>
                  {event.fee !== undefined && (
                    <div className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                      <CreditCard className="h-5 w-5 mr-2 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
                      <span className="text-sm font-medium">
                        {event.fee > 0 ? `Fee: ৳${event.fee}` : "Free Entry"}
                      </span>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section className="py-8 bg-white dark:bg-gray-950">
          <div className="contained">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent
                    className={
                      event.category === "fest" &&
                      event.segments &&
                      event.segments.length > 0
                        ? "p-0"
                        : "p-6"
                    }
                  >
                    {event.category === "fest" &&
                    event.segments &&
                    event.segments.length > 0 ? (
                      <Tabs
                        defaultValue="details"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="w-full grid grid-cols-2 rounded-none">
                          <TabsTrigger value="details">
                            Event Details
                          </TabsTrigger>
                          <TabsTrigger value="segments">Segments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="p-6">
                          <FadeIn>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                              <h2 className="text-2xl font-bold mb-4">
                                About the Event
                              </h2>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: event.description,
                                }}
                              />

                              {event.rules && (
                                <>
                                  <h3 className="text-xl font-semibold mt-8 mb-4">
                                    Rules & Guidelines
                                  </h3>
                                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: event.rules,
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </FadeIn>
                        </TabsContent>

                        <TabsContent value="segments" className="p-6">
                          <FadeIn>
                            <h2 className="text-2xl font-bold mb-6">
                              Fest Segments
                            </h2>
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full"
                            >
                              {event.segments.map((segment) => (
                                <AccordionItem
                                  key={segment.id}
                                  value={segment.id}
                                  className="border border-gray-200 dark:border-gray-800 rounded-lg mb-3 overflow-hidden"
                                >
                                  <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                    <div className="flex flex-col items-start text-left">
                                      <span>{segment.name}</span>
                                      {segment.fee !== undefined && (
                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                          {segment.fee > 0
                                            ? `Fee: ৳${segment.fee}`
                                            : "Free Entry"}
                                        </span>
                                      )}
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-4">
                                    <div className="py-2">
                                      <div
                                        className="mb-4 text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{
                                          __html: segment.description,
                                        }}
                                      />
                                      {segment.rules && (
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mt-2 mb-4 border border-gray-200 dark:border-gray-800">
                                          <h4 className="font-medium mb-2 text-sm text-gray-900 dark:text-gray-100">
                                            Rules:
                                          </h4>
                                          <div
                                            className="prose prose-sm dark:prose-invert"
                                            dangerouslySetInnerHTML={{
                                              __html: segment.rules,
                                            }}
                                          />
                                        </div>
                                      )}
                                      <Button
                                        onClick={() => {
                                          setSelectedSegment(segment);
                                          setActiveTab("details"); // Switch back to details tab where registration form is
                                          setTimeout(() => {
                                            document
                                              .getElementById(
                                                "registration-form"
                                              )
                                              ?.scrollIntoView({
                                                behavior: "smooth",
                                              });
                                          }, 100);
                                        }}
                                        className="mt-2"
                                      >
                                        Register for this segment
                                      </Button>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </FadeIn>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <FadeIn>
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                          <h2 className="text-2xl font-bold mb-4">
                            About the Event
                          </h2>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: event.description,
                            }}
                          />

                          {event.rules && (
                            <>
                              <h3 className="text-xl font-semibold mt-8 mb-4">
                                Rules & Guidelines
                              </h3>
                              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: event.rules,
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </FadeIn>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Registration Form */}
              <div className="lg:col-span-1" id="registration-form">
                <FadeIn direction="left">
                  <Card className="sticky top-24">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-6">
                        {event.category === "fest" && selectedSegment
                          ? `Register for ${selectedSegment.name}`
                          : "Register for this Event"}
                      </h2>

                      {isPastEvent ? (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                          <Info className="h-10 w-10 mx-auto text-primary mb-3" />
                          <p className="mb-4 text-gray-700 dark:text-gray-300">
                            This event has already passed.
                          </p>
                        </div>
                      ) : event.category === "fest" &&
                        event.segments &&
                        event.segments.length > 0 ? (
                        selectedSegment ? (
                          <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                          >
                            {/* First render the main event fields */}
                            {/* {event.formFields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                  <Label htmlFor={field.id} className="text-sm font-medium">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  
                                  {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                                    <Input
                                      id={field.id}
                                      type={field.type}
                                      {...register(field.id, { required: field.required })}
                                      className={errors[field.id] ? 'border-red-500' : ''}
                                    />
                                  ) : field.type === 'select' && field.options ? (
                                    <Select 
                                      onValueChange={(value) => register(field.id).onChange({ target: { value, name: field.id } })}
                                      defaultValue=""
                                    >
                                      <SelectTrigger className={errors[field.id] ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select an option" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map(option => (
                                          <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : field.type === 'checkbox' ? (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={field.id} 
                                        {...register(field.id, { required: field.required })}
                                      />
                                      <label htmlFor={field.id} className="text-sm text-gray-600 dark:text-gray-300">
                                        {field.label}
                                      </label>
                                    </div>
                                  ) : null}
                                  
                                  {errors[field.id] && (
                                    <p className="text-red-500 text-xs">This field is required</p>
                                  )}
                                </div>
                              ))} */}

                            {/* Then render the segment-specific fields */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              {/* <h3 className="text-lg font-medium mb-4">{selectedSegment.name} Details</h3> */}

                              {selectedSegment.formFields.map((field) => (
                                <div key={field.id} className="space-y-2 mb-4">
                                  <Label
                                    htmlFor={`segment_${field.id}`}
                                    className="text-sm font-medium"
                                  >
                                    {field.label}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">
                                        *
                                      </span>
                                    )}
                                  </Label>

                                  {field.type === "text" ||
                                  field.type === "email" ||
                                  field.type === "number" ? (
                                    <Input
                                      id={`segment_${field.id}`}
                                      type={field.type}
                                      {...register(`segment_${field.id}`, {
                                        required: field.required,
                                      })}
                                      className={
                                        errors[`segment_${field.id}`]
                                          ? "border-red-500"
                                          : ""
                                      }
                                    />
                                  ) : field.type === "select" &&
                                    field.options ? (
                                    <Select
                                      onValueChange={(value) =>
                                        register(
                                          `segment_${field.id}`
                                        ).onChange({
                                          target: {
                                            value,
                                            name: `segment_${field.id}`,
                                          },
                                        })
                                      }
                                      defaultValue=""
                                    >
                                      <SelectTrigger
                                        className={
                                          errors[`segment_${field.id}`]
                                            ? "border-red-500"
                                            : ""
                                        }
                                      >
                                        <SelectValue placeholder="Select an option" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option) => (
                                          <SelectItem
                                            key={option}
                                            value={option}
                                          >
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : field.type === "checkbox" ? (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`segment_${field.id}`}
                                        {...register(`segment_${field.id}`, {
                                          required: field.required,
                                        })}
                                      />
                                      <label
                                        htmlFor={`segment_${field.id}`}
                                        className="text-sm text-gray-600 dark:text-gray-300"
                                      >
                                        {field.label}
                                      </label>
                                    </div>
                                  ) : null}

                                  {errors[`segment_${field.id}`] && (
                                    <p className="text-red-500 text-xs">
                                      This field is required
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="pt-4">
                              {selectedSegment.fee !== undefined &&
                                selectedSegment.fee > 0 && (
                                  <div className="flex items-start p-3 rounded-lg mb-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900">
                                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                      This segment requires a payment of ৳
                                      {selectedSegment.fee}. You'll be prompted
                                      to complete payment after submitting this
                                      form.
                                    </p>
                                  </div>
                                )}
                              <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                              >
                                Review Registration
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                            <Info className="h-10 w-10 mx-auto text-primary mb-3" />
                            <p className="mb-4 text-gray-700 dark:text-gray-300">
                              Please select a segment from the list to register.
                            </p>
                            <Button
                              onClick={() => {
                                setSelectedSegment(event.segments![0]);
                                setActiveTab("segments");
                              }}
                              className="mt-2"
                              variant="secondary"
                            >
                              View Segments
                            </Button>
                          </div>
                        )
                      ) : (
                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="space-y-4"
                        >
                          {event.formFields.map((field) => (
                            <div key={field.id} className="space-y-2">
                              <Label
                                htmlFor={field.id}
                                className="text-sm font-medium"
                              >
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </Label>

                              {field.type === "text" ||
                              field.type === "email" ||
                              field.type === "number" ? (
                                <Input
                                  id={field.id}
                                  type={field.type}
                                  {...register(field.id, {
                                    required: field.required,
                                  })}
                                  className={
                                    errors[field.id] ? "border-red-500" : ""
                                  }
                                />
                              ) : field.type === "select" && field.options ? (
                                <Select
                                  onValueChange={(value) =>
                                    register(field.id).onChange({
                                      target: { value, name: field.id },
                                    })
                                  }
                                  defaultValue=""
                                >
                                  <SelectTrigger
                                    className={
                                      errors[field.id] ? "border-red-500" : ""
                                    }
                                  >
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "checkbox" ? (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={field.id}
                                    {...register(field.id, {
                                      required: field.required,
                                    })}
                                  />
                                  <label
                                    htmlFor={field.id}
                                    className="text-sm text-gray-600 dark:text-gray-300"
                                  >
                                    {field.label}
                                  </label>
                                </div>
                              ) : null}

                              {errors[field.id] && (
                                <p className="text-red-500 text-xs">
                                  This field is required
                                </p>
                              )}
                            </div>
                          ))}

                          {event.fee !== undefined && event.fee > 0 && (
                            <div className="flex items-start p-3 rounded-lg mb-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900">
                              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                This event requires a payment of ৳{event.fee}.
                                You'll be prompted to complete payment after
                                submitting this form.
                              </p>
                            </div>
                          )}

                          <Button type="submit" className="w-full" size="lg">
                            Review Registration
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Please complete your payment to finalize your registration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <div className="font-medium">{event.title}</div>
              {selectedSegment && (
                <div className="text-sm text-gray-500">
                  Segment: {selectedSegment.name}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="font-medium text-lg">
                ৳{selectedSegment?.fee || event.fee}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="bkash">bKash Transaction ID</Label>
              <Input id="bkash" placeholder="e.g., TXN123456789" />
              <p className="text-xs text-gray-500">
                Please send the payment to 01712345678 via bKash and enter the
                transaction ID here.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handlePayment("TXN" + Math.floor(Math.random() * 1000000))
              }
            >
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Please review your registration details before submitting. If
              anything is incorrect, click Cancel to go back and make changes.
            </DialogDescription>
          </DialogHeader>

          {formData && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold">Event Information</h3>
                <div className="font-medium">{event?.title}</div>
                {selectedSegment && (
                  <div className="text-sm text-gray-500">
                    Segment: {selectedSegment.name}
                  </div>
                )}
                {((event?.fee && event.fee > 0) ||
                  (selectedSegment?.fee && selectedSegment.fee > 0)) && (
                  <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                    Fee: ৳{selectedSegment?.fee || event?.fee}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Your Registration Details</h3>

                {Object.entries(formData?.processed || {}).map(
                  ([key, value]) => {
                    // Skip payment-related fields as they'll be shown separately
                    if (
                      [
                        "paymentMethod",
                        "paymentStatus",
                        "transactionId",
                      ].includes(key)
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={key}
                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md"
                      >
                        <div className="text-sm font-medium">{key}</div>
                        <div className="text-gray-700 dark:text-gray-300 break-words">
                          {value ? (
                            String(value)
                          ) : (
                            <span className="text-gray-400 italic">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Payment section if applicable */}
                {(formData?.processed?.paymentMethod ||
                  formData?.processed?.transactionId) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Payment Information</h3>

                      {formData.processed.paymentMethod && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                          <div className="text-sm font-medium">
                            Payment Method
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            {formData.processed.paymentMethod}
                          </div>
                        </div>
                      )}

                      {formData.processed.transactionId && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                          <div className="text-sm font-medium">
                            Transaction ID
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            {formData.processed.transactionId}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmationDialog(false)}
            >
              Go Back & Edit
            </Button>
            <Button
              onClick={handleConfirmation}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetail;
