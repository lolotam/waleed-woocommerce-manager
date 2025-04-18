
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ActivationPage = () => {
  const [activationSerial, setActivationSerial] = useState('');
  const [inputSerial, setInputSerial] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the activation serial from the navigation state or previous signup
    const serial = location.state?.activationSerial;
    if (serial) {
      setActivationSerial(serial);
    }
  }, [location]);

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Verify the activation serial
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error('Please log in first');
        return;
      }

      // Check if the entered serial matches the user's activation serial
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('activation_serial, serial_used, activated')
        .eq('id', user.user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData.activated) {
        toast.error('Account already activated');
        navigate('/');
        return;
      }

      if (profileData.serial_used) {
        toast.error('Activation serial has already been used');
        return;
      }

      if (inputSerial.toUpperCase() !== profileData.activation_serial) {
        // Log the activation attempt
        await supabase.from('activation_attempts').insert({
          user_id: user.user.id,
          serial: inputSerial,
          device_info: navigator.userAgent,
          ip_address: await fetchIPAddress(),
          success: false
        });

        toast.error('Invalid activation serial');
        return;
      }

      // Update profile to mark as activated
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          activated: true, 
          serial_used: true, 
          activation_date: new Date().toISOString() 
        })
        .eq('id', user.user.id);

      if (updateError) throw updateError;

      // Log successful activation attempt
      await supabase.from('activation_attempts').insert({
        user_id: user.user.id,
        serial: inputSerial,
        device_info: navigator.userAgent,
        ip_address: await fetchIPAddress(),
        success: true
      });

      toast.success('Account successfully activated');
      navigate('/');

    } catch (error) {
      toast.error('Activation Error', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  // Helper function to fetch IP address
  const fetchIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unable to fetch IP';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activate Your Account</CardTitle>
          <CardDescription>
            Enter the activation serial sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivation} className="space-y-4">
            <div>
              <Input 
                type="text" 
                placeholder="Activation Serial" 
                value={inputSerial}
                onChange={(e) => setInputSerial(e.target.value)}
                required 
              />
              {activationSerial && (
                <p className="text-xs text-muted-foreground mt-2">
                  Your unique activation serial was generated during signup
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Activate Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivationPage;
