import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  role: string | null;
  token: string | null;
  login: (userData: User, userRole: string, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

const readStoredAuth = () => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const storedRole = localStorage.getItem('role');

  if (!storedToken || !storedUser || !storedRole) {
    return { token: null, user: null, role: null };
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(storedUser) as User,
      role: storedRole,
    };
  } catch {
    clearStoredAuth();
    return { token: null, user: null, role: null };
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storedAuth = readStoredAuth();
  const [user, setUser] = useState<User | null>(storedAuth.user);
  const [role, setRole] = useState<string | null>(storedAuth.role);
  const [token, setToken] = useState<string | null>(storedAuth.token);

  useEffect(() => {
    if (!token) return;

    // M10: Verify the stored token is still valid by calling the backend.
    apiFetch('/api/auth/profile', {}, token)
      .then(res => {
        if (!res.ok) {
          // Token is expired, revoked, or account is disabled — force logout.
          setUser(null);
          setRole(null);
          setToken(null);
          clearStoredAuth();
        }
      })
      .catch(() => {
        // Network error — keep local state but don't crash.
        // The user will see failures when they try to do authenticated actions.
      });
  }, [token]);

  const login = (userData: User, userRole: string, jwtToken: string) => {
    setUser(userData);
    setRole(userRole);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
