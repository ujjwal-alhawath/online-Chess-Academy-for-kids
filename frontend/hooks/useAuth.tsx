'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AuthService,
  UserSummary,
  RoleProfile,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from '../services/auth.service';

interface AuthContextType {
  user: UserSummary | null;
  profile: RoleProfile | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  linkParent: (parentLinkCode: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<RoleProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await AuthService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    const res = await AuthService.login(payload);
    if (res.success && res.user) {
      setUser(res.user);
      setProfile(res.profile || null);
    }
  };

  const register = async (payload: RegisterPayload) => {
    const res = await AuthService.register(payload);
    if (res.success && res.user) {
      setUser(res.user);
      setProfile(res.profile || null);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setProfile(null);
  };

  const linkParent = async (parentLinkCode: string): Promise<AuthResponse> => {
    const res = await AuthService.linkParent(parentLinkCode);
    await refreshUser();
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        linkParent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
