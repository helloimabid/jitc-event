import { supabase } from "@/lib/supabase"
import type { Event, FormField, FestSegment } from "@/types"
import { v4 as uuidv4 } from "uuid"

// Fetch all events
export async function getEvents(): Promise<Event[]> {
  try {


    // Get all events
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })

    if (eventsError) {
      console.error("Error fetching events:", eventsError)
      return []
    }


    if (!eventsData || eventsData.length === 0) {
    
      return []
    }

    // Transform events into our application model
    const events: Event[] = await Promise.all(
      eventsData.map(async (eventData) => {
        // Get form fields for this event
        const { data: formFieldsData, error: formFieldsError } = await supabase
          .from("event_form_fields")
          .select("*")
          .eq("event_id", eventData.id)

        if (formFieldsError) {
          console.error("Error fetching form fields:", formFieldsError)
          return null
        }

        const formFields: FormField[] = formFieldsData.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options || undefined,
        }))

        let segments: FestSegment[] | undefined

        // If this is a fest, get its segments
        if (eventData.category === "fest") {
          const { data: segmentsData, error: segmentsError } = await supabase
            .from("fest_segments")
            .select("*")
            .eq("event_id", eventData.id)

          if (segmentsError) {
            console.error("Error fetching segments:", segmentsError)
          } else if (segmentsData) {
            // Get form fields for each segment
            segments = await Promise.all(
              segmentsData.map(async (segmentData) => {
                const { data: segmentFieldsData, error: segmentFieldsError } = await supabase
                  .from("segment_form_fields")
                  .select("*")
                  .eq("segment_id", segmentData.id)

                if (segmentFieldsError) {
                  console.error("Error fetching segment form fields:", segmentFieldsError)
                  return null
                }

                const segmentFormFields: FormField[] = segmentFieldsData.map((field) => ({
                  id: field.id,
                  label: field.label,
                  type: field.type,
                  required: field.required,
                  options: field.options || undefined,
                }))

                return {
                  id: segmentData.id,
                  name: segmentData.name,
                  description: segmentData.description,
                  rules: segmentData.rules || undefined,
                  fee: segmentData.fee || undefined,
                  capacity: segmentData.capacity || undefined,
                  formFields: segmentFormFields,
                }
              }),
            ).then((results) => results.filter(Boolean) as FestSegment[])
          }
        }

        return {
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
          segments,
        }
      }),
    )

    const validEvents = events.filter(Boolean) as Event[]
   
    return validEvents
  } catch (error) {
    console.error("Error in getEvents:", error)
    return []
  }
}

// Create or update an event
export async function saveEvent(event: Event): Promise<Event | null> {
  try {
    const isNewEvent = !event.id || event.id.startsWith("e")
    const eventId = isNewEvent ? uuidv4() : event.id

    // Insert or update event
    const { error: eventError } = await supabase.from("events").upsert({
      id: eventId,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      location: event.location,
      image: event.image || null,
      rules: event.rules || null,
      fee: event.fee || null,
      capacity: event.capacity || null,
      created_at: isNewEvent ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })

    if (eventError) {
      console.error("Error saving event:", eventError)
      return null
    }

    // If updating, delete existing form fields
    if (!isNewEvent) {
      await supabase.from("event_form_fields").delete().eq("event_id", eventId)
    }

    // Insert form fields
    const formFieldsToInsert = event.formFields.map((field) => ({
      id: field.id.startsWith("field_") ? uuidv4() : field.id,
      event_id: eventId,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || null,
      created_at: new Date().toISOString(),
    }))

    if (formFieldsToInsert.length > 0) {
      const { error: formFieldsError } = await supabase.from("event_form_fields").insert(formFieldsToInsert)

      if (formFieldsError) {
        console.error("Error saving form fields:", formFieldsError)
      }
    }

    // If this is a fest, handle segments
    if (event.category === "fest" && event.segments?.length) {
      // For updates, keep track of existing segments to detect deletions
      const existingSegmentIds = new Set<string>()

      if (!isNewEvent) {
        const { data: existingSegments } = await supabase.from("fest_segments").select("id").eq("event_id", eventId)

        existingSegments?.forEach((seg) => existingSegmentIds.add(seg.id))
      }

      // Process each segment
      for (const segment of event.segments) {
        const isNewSegment = !segment.id || segment.id.startsWith("s")
        const segmentId = isNewSegment ? uuidv4() : segment.id

        // Remove from existing set (remaining ids will be deleted)
        existingSegmentIds.delete(segmentId)

        // Insert or update segment
        const { error: segmentError } = await supabase.from("fest_segments").upsert({
          id: segmentId,
          event_id: eventId,
          name: segment.name,
          description: segment.description,
          rules: segment.rules || null,
          fee: segment.fee || null,
          capacity: segment.capacity || null,
          created_at: isNewSegment ? new Date().toISOString() : undefined,
        })

        if (segmentError) {
          console.error("Error saving segment:", segmentError)
          continue
        }

        // If updating, delete existing segment form fields
        if (!isNewSegment) {
          await supabase.from("segment_form_fields").delete().eq("segment_id", segmentId)
        }

        // Insert segment form fields
        const segmentFieldsToInsert = segment.formFields.map((field) => ({
          id: field.id.startsWith("field_") ? uuidv4() : field.id,
          segment_id: segmentId,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options || null,
          created_at: new Date().toISOString(),
        }))

        if (segmentFieldsToInsert.length > 0) {
          const { error: segmentFieldsError } = await supabase.from("segment_form_fields").insert(segmentFieldsToInsert)

          if (segmentFieldsError) {
            console.error("Error saving segment form fields:", segmentFieldsError)
          }
        }
      }

      // Delete segments that no longer exist
      if (existingSegmentIds.size > 0) {
        for (const idToDelete of existingSegmentIds) {
          // Delete segment form fields first
          await supabase.from("segment_form_fields").delete().eq("segment_id", idToDelete)

          // Then delete the segment
          await supabase.from("fest_segments").delete().eq("id", idToDelete)
        }
      }
    }

    // Return updated event
    return {
      ...event,
      id: eventId,
    }
  } catch (error) {
    console.error("Error in saveEvent:", error)
    return null
  }
}

// Delete an event
export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    // For fest events, delete segments and their form fields first
    const { data: segments } = await supabase.from("fest_segments").select("id").eq("event_id", eventId)

    if (segments && segments.length > 0) {
      for (const segment of segments) {
        // Delete segment form fields
        await supabase.from("segment_form_fields").delete().eq("segment_id", segment.id)
      }

      // Delete segments
      await supabase.from("fest_segments").delete().eq("event_id", eventId)
    }

    // Delete event form fields
    await supabase.from("event_form_fields").delete().eq("event_id", eventId)

    // Delete registrations
    await supabase.from("registrations").delete().eq("event_id", eventId)

    // Delete the event
    const { error } = await supabase.from("events").delete().eq("id", eventId)

    if (error) {
      console.error("Error deleting event:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteEvent:", error)
    return false
  }
}

// Delete a segment
export async function deleteSegment(segmentId: string): Promise<boolean> {
  try {
    // Delete segment form fields first
    await supabase.from("segment_form_fields").delete().eq("segment_id", segmentId)

    // Delete registrations for this segment
    await supabase.from("registrations").delete().eq("segment_id", segmentId)

    // Delete the segment
    const { error } = await supabase.from("fest_segments").delete().eq("id", segmentId)

    if (error) {
      console.error("Error deleting segment:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteSegment:", error)
    return false
  }
}

