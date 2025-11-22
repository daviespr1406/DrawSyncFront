import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserProfile = {
  username?: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

type UserContextValue = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  fetchUser: (opts?: { token?: string }) => Promise<UserProfile | null>;
  clearUser: () => void;
};

const STORAGE_KEY = 'drawsync_user';
const TOKEN_KEY = 'drawsync_access_token';

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // keep localStorage in sync
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, [user]);

  const setUser = (u: UserProfile | null) => {
    setUserState(u);
  };

  async function fetchUser(opts?: { token?: string }) {
    // If a token is provided, use Authorization header. Otherwise use credentials (cookie)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const fetchOpts: RequestInit = {
        method: 'GET',
        headers,
      };

      if (opts?.token) {
        headers['Authorization'] = `Bearer ${opts.token}`;
      } else {
        // if backend uses httpOnly cookie for session/token
        (fetchOpts as any).credentials = 'include';
      }

      const res = await fetch('/api/auth/users/me', fetchOpts);
      if (!res.ok) {
        // clear user on 401/403
        if (res.status === 401 || res.status === 403) {
          setUser(null);
        }
        return null;
      }

      const body = await res.json();
      // normalize shape (depends on your backend)
      const profile: UserProfile = {
        username: body.username || body.userName || body.name || body.email?.split?.('@')?.[0],
        email: body.email || body.mail || body.userEmail,
        name: body.name || body.fullName,
        ...body,
      };
      setUser(profile);
      return profile;
    } catch (e) {
      console.warn('fetchUser error', e);
      return null;
    }
  }

  function clearUser() {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      // optionally remove stored token if you saved it
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      // ignore
    }
  }

  return React.createElement(
    UserContext.Provider,
    { value: { user, setUser, fetchUser, clearUser } },
    children
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

// Helpers to manage token (optional) - example if you want to store token in localStorage
export function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {}
}

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}
