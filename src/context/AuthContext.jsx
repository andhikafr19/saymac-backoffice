import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Check if previously logged in via local storage demo mode
      const savedDemoUser = localStorage.getItem('saymac_admin_demo');
      if (savedDemoUser) {
        setUser(JSON.parse(savedDemoUser));
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            setIsDemoMode(false);
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsDemoMode(false);
          localStorage.removeItem('saymac_admin_demo');
        } else if (!localStorage.getItem('saymac_admin_demo')) {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase belum terkonfigurasi. Silakan gunakan Mode Demo Admin.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    setIsDemoMode(false);
    localStorage.removeItem('saymac_admin_demo');
    return data.user;
  };

  const loginAsDemoAdmin = () => {
    const demoUser = {
      id: 'demo-admin-id',
      email: 'admin@saymacaroni.id',
      role: 'authenticated',
      user_metadata: { name: 'Admin Say Macaroni' }
    };
    setUser(demoUser);
    setIsDemoMode(true);
    localStorage.setItem('saymac_admin_demo', JSON.stringify(demoUser));
    return demoUser;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem('saymac_admin_demo');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemoMode,
      isSupabaseConfigured,
      loginWithSupabase,
      loginAsDemoAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
