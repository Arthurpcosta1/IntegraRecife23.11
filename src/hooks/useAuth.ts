/**
 * Custom Hook: useAuth
 * Gerencia autenticação e sessão do usuário
 */

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { User, UserProfile } from '../types';
import { toast } from 'sonner@2.0.3';

interface UseAuthReturn {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (credentials: { email: string; name: string; type: 'admin' | 'cidadao'; accessToken?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Verificar sessão persistente ao carregar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsCheckingSession(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        return;
      }

      if (session?.user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          const authenticatedUser: User = {
            id: userData.id,
            email: session.user.email,
            name: userData.nome || session.user.email.split('@')[0],
            type: userData.tipo === 'admin' ? 'admin' : 'cidadao',
            accessToken: session.access_token,
            avatar: userData.avatar
          };

          setUser(authenticatedUser);
          setUserProfile(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const login = async (credentials: { email: string; name: string; type: 'admin' | 'cidadao'; accessToken?: string }) => {
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', credentials.email)
        .single();

      if (userData) {
        const authenticatedUser: User = {
          id: userData.id,
          email: credentials.email,
          name: userData.nome || credentials.name,
          type: userData.tipo === 'admin' ? 'admin' : 'cidadao',
          accessToken: credentials.accessToken,
          avatar: userData.avatar
        };

        setUser(authenticatedUser);
        setUserProfile(userData);
        setIsAuthenticated(true);
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return {
    user,
    userProfile,
    isAuthenticated,
    isCheckingSession,
    login,
    logout,
    checkSession
  };
};
