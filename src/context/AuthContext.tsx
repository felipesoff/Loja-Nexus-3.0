import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { toast } from 'sonner';
import { supabaseService } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    const initAuth = async () => {
      const localUser = localStorage.getItem('nexus_mock_user');
      if (localUser) {
        const u = JSON.parse(localUser) as User;
        setUser(u);
        
        // Try to fetch latest profile from Supabase if configured
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabaseService.getClient()
              .from('profiles')
              .select('*')
              .eq('id', u.id)
              .single();
            if (data && !error) {
              setUser(data as User);
              localStorage.setItem('nexus_mock_user', JSON.stringify(data));
            }
          } catch (e) {
            console.warn('Supabase fetch user profile error:', e);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [isSupabaseConfigured]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (user && (user.role === 'admin' || user.email === 'felipesantos020418@gmail.com' || user.email === 'coelhohardff@gmail.com')) {
        if (isSupabaseConfigured) {
          try {
            const snap = await supabaseService.getClient().from('profiles').select('*');
            if (snap.data && snap.data.length > 0) {
              setUsers(snap.data as User[]);
              return;
            }
          } catch (supaErr) {
            console.warn('Supabase fetch users failed, using local:', supaErr);
          }
        }
        
        // Fallback to local registered users
        const localUsers = JSON.parse(localStorage.getItem('nexus_mock_users') || '[]');
        setUsers(localUsers);
      } else {
        setUsers([]);
      }
    };
    fetchAllUsers();
  }, [user, isSupabaseConfigured]);

  const login = async (email: string, password: string) => {
    // 1. Check default admin credentials
    if (email === 'admin@nexus.com' || email === 'felipesantos020418@gmail.com' || email === 'coelhohardff@gmail.com') {
      if (password === 'admin' || password === '123456') {
        const mockAdmin: User = {
          id: 'mock-admin',
          name: 'Administrador (Offline)',
          email: email,
          role: 'admin'
        };
        setUser(mockAdmin);
        localStorage.setItem('nexus_mock_user', JSON.stringify(mockAdmin));
        
        // Sync with Supabase if configured
        if (isSupabaseConfigured) {
          supabaseService.upsertProfile(mockAdmin).catch(() => {});
        }
        
        toast.success('Logado localmente como Administrador!');
        return;
      }
    }
    
    // 2. Check local registered users in localStorage
    const savedUsers = JSON.parse(localStorage.getItem('nexus_mock_users') || '[]');
    const localUser = savedUsers.find((u: any) => u.email === email && u.password === password);
    if (localUser) {
      const uObj: User = {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        role: localUser.role
      };
      setUser(uObj);
      localStorage.setItem('nexus_mock_user', JSON.stringify(uObj));
      toast.success(`Logado com sucesso como ${localUser.name}!`);
      return;
    }
    
    throw new Error('E-mail ou senha incorretos.');
  };

  const signup = async (name: string, email: string, password: string) => {
    const newLocalUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role: (email === 'felipesantos020418@gmail.com' || email === 'coelhohardff@gmail.com') ? 'admin' : 'user'
    };
    
    // Save to local registered users list
    const savedUsers = JSON.parse(localStorage.getItem('nexus_mock_users') || '[]');
    if (savedUsers.some((u: any) => u.email === email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    savedUsers.push(newLocalUser);
    localStorage.setItem('nexus_mock_users', JSON.stringify(savedUsers));
    
    const userProfile: User = {
      id: newLocalUser.id,
      name: newLocalUser.name,
      email: newLocalUser.email,
      role: newLocalUser.role as 'admin' | 'user'
    };
    
    setUser(userProfile);
    localStorage.setItem('nexus_mock_user', JSON.stringify(userProfile));
    
    // Sync with Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertProfile(userProfile);
      } catch (e) {
        console.warn('Supabase profile sync failed during signup:', e);
      }
    }
    
    toast.success('Conta criada com sucesso!');
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('nexus_mock_user');
    toast.success('Deslogado com sucesso!');
  };

  const signInWithGoogle = async () => {
    // Mock Google sign in
    const mockGoogleUser: User = {
      id: 'google-' + Math.random().toString(36).substr(2, 9),
      name: 'Usuário Google',
      email: 'usuario.google@gmail.com',
      role: 'user'
    };
    setUser(mockGoogleUser);
    localStorage.setItem('nexus_mock_user', JSON.stringify(mockGoogleUser));
    
    // Sync with Supabase if configured
    if (isSupabaseConfigured) {
      supabaseService.upsertProfile(mockGoogleUser).catch(e => console.warn('Supabase sync error:', e));
    }
    
    toast.success('Logado via Google (Mock)!');
  };

  const deleteUser = async (id: string) => {
    if (!isAdmin) return;
    
    // Remove from local list
    const savedUsers = JSON.parse(localStorage.getItem('nexus_mock_users') || '[]');
    const updatedUsers = savedUsers.filter((u: any) => u.id !== id);
    localStorage.setItem('nexus_mock_users', JSON.stringify(updatedUsers));
    setUsers(prev => prev.filter(u => u.id !== id));
    
    // Try to delete from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabaseService.getClient().from('profiles').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete profile error:', e);
      }
    }
    
    toast.success('Usuário excluído!');
  };

  const resetPassword = async (email: string) => {
    toast.info('Instruções de redefinição de senha enviadas por e-mail (Simulado)!');
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'felipesantos020418@gmail.com' || user?.email === 'coelhohardff@gmail.com';

  return (
    <AuthContext.Provider value={{ user, users, login, signup, signInWithGoogle, logout, deleteUser, resetPassword, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
