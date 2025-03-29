
import { supabase } from '@/lib/supabase';
import { Registration } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Get all registrations
export async function getRegistrations(): Promise<Registration[]> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }
    
    return data.map(reg => ({
      id: reg.id,
      eventId: reg.event_id,
      segmentId: reg.segment_id || undefined,
      userData: reg.user_data as Record<string, any>,
      timestamp: reg.timestamp,
      paymentStatus: reg.payment_status || undefined,
      paymentMethod: reg.payment_method || undefined,
      transactionId: reg.transaction_id || undefined
    }));
  } catch (error) {
    console.error('Error in getRegistrations:', error);
    return [];
  }
}

// Create a registration
export async function createRegistration(registration: Omit<Registration, 'id'>): Promise<Registration | null> {
  try {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from('registrations')
      .insert({
        id,
        event_id: registration.eventId,
        segment_id: registration.segmentId || null,
        user_data: registration.userData,
        timestamp,
        payment_status: registration.paymentStatus || null,
        payment_method: registration.paymentMethod || null,
        transaction_id: registration.transactionId || null
      });
    
    if (error) {
      console.error('Error creating registration:', error);
      return null;
    }
    
    return {
      id,
      ...registration,
      timestamp
    };
  } catch (error) {
    console.error('Error in createRegistration:', error);
    return null;
  }
}

// Update a registration
export async function updateRegistration(registration: Registration): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({
        event_id: registration.eventId,
        segment_id: registration.segmentId || null,
        user_data: registration.userData,
        payment_status: registration.paymentStatus || null,
        payment_method: registration.paymentMethod || null,
        transaction_id: registration.transactionId || null
      })
      .eq('id', registration.id);
    
    if (error) {
      console.error('Error updating registration:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateRegistration:', error);
    return false;
  }
}

// Delete a registration
export async function deleteRegistration(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting registration:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteRegistration:', error);
    return false;
  }
}
