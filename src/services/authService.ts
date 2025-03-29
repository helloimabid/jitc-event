import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Interface for admin user
export interface AdminUser {
  id: string;
  username: string;
  created_at: string;
  email?: string;
  role?: string;
}

// Login function with proper password hashing
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, password_hash, created_at')
      .eq('username', username)
      .single();

    if (error || !data) {
      console.error('Login error:', error || 'User not found');
      return false;
    }

    // For backward compatibility with plain text passwords
    if (data.password_hash === password) {
      // If we find a plain text password, hash it and update it
      const hashedPassword = await hashPassword(password);
      await updatePasswordHash(data.id, hashedPassword);
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_id', data.id);
      localStorage.setItem('admin_username', data.username);
      return true;
    }

    // Compare with bcrypt
    const passwordMatch = await bcrypt.compare(password, data.password_hash);

    if (passwordMatch) {
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_id', data.id);
      localStorage.setItem('admin_username', data.username);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export function logoutAdmin(): void {
  localStorage.removeItem('admin_authenticated');
  localStorage.removeItem('admin_id');
  localStorage.removeItem('admin_username');
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem('admin_authenticated') === 'true';
}

export function getCurrentAdmin(): { id: string; username: string } | null {
  const id = localStorage.getItem('admin_id');
  const username = localStorage.getItem('admin_username');
  
  if (id && username) {
    return { id, username };
  }
  
  return null;
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Update password hash in database
async function updatePasswordHash(adminId: string, hashedPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ password_hash: hashedPassword })
      .eq('id', adminId);
    
    if (error) {
      console.error('Error updating password hash:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating password hash:', error);
    return false;
  }
}

// Initialize admin account if it doesn't exist
export async function initializeAdmin(): Promise<void> {
  try {
   

    const { data, error } = await supabase
      .from('admins')
      .select('*');

    if (error) {
      console.error('Error checking for admin accounts:', error);
      return;
    }

    
    if (!data?.length) {
      // Create default admin account with hashed password
      
      
      const hashedPassword = await hashPassword('password');

      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          username: 'admin',
          password_hash: hashedPassword,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating admin account:', insertError);
      } else {
    
      }
    }
  } catch (error) {
    console.error('Error in initializeAdmin:', error);
  }
}

// Get all admin users
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, created_at, email, role')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

// Create a new admin user
export async function createAdminUser(username: string, password: string, email?: string, role?: string): Promise<boolean> {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      console.error('Username already exists');
      return false;
    }
    
    const hashedPassword = await hashPassword(password);
    
    const { error } = await supabase
      .from('admins')
      .insert({
        username,
        password_hash: hashedPassword,
        email,
        role,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}

// Delete an admin user
export async function deleteAdminUser(adminId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', adminId);
    
    if (error) {
      console.error('Error deleting admin user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return false;
  }
}

// Update admin user password
export async function updateAdminPassword(adminId: string, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const { error } = await supabase
      .from('admins')
      .update({ password_hash: hashedPassword })
      .eq('id', adminId);
    
    if (error) {
      console.error('Error updating admin password:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating admin password:', error);
    return false;
  }
}

// Get current admin's full details including role
export async function getCurrentAdminDetails(): Promise<AdminUser | null> {
  try {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) return null;
    
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, created_at, email, role')
      .eq('id', currentAdmin.id)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data as AdminUser;
  } catch (error) {
    return null;
  }
}

// Check if current admin is a super admin
export async function isCurrentAdminSuperAdmin(): Promise<boolean> {
  const adminDetails = await getCurrentAdminDetails();
  return adminDetails?.role === 'super_admin';
}
