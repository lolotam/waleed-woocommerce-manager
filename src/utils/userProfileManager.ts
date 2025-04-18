
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  activated: boolean;
  activation_serial?: string;
  settings: Record<string, any>;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      username: data.username,
      full_name: data.full_name,
      activated: data.activated,
      activation_serial: data.activation_serial,
      settings: data.settings || {}
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserSettings = async (settings: Record<string, any>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('id', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
};
