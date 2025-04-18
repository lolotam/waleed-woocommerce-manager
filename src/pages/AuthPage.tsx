
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/activation`
          }
        });

        if (error) throw error;

        toast.success('Check your email for verification', {
          description: 'A verification email has been sent'
        });
      } else {
        // Sign in flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Check if user needs activation
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('activated, activation_serial')
          .eq('id', data.user?.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData.activated) {
          navigate('/activation', { 
            state: { 
              email, 
              activationSerial: profileData.activation_serial 
            } 
          });
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Authentication Error', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Sign Up' : 'Login'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create a new account' 
              : 'Sign in to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div>
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            <div className="text-center">
              <Button 
                type="button" 
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp 
                  ? 'Already have an account? Login' 
                  : 'Need an account? Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
