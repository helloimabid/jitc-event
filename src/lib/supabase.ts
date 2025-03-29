import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Use the values from .env or fallback to the hardcoded values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Make sure we have values before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Check your .env file.');
  throw new Error('Missing Supabase configuration');
}



// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Add a simple test function to verify the connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('admins').select('count', { count: 'exact' });
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}
