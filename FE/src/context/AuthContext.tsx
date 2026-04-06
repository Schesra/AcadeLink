import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  activeMode: 'student' | 'instructor';
  setActiveMode: (mode: 'student' | 'instructor') => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveModeState] = useState<'student' | 'instructor'>('student');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedMode = localStorage.getItem('activeMode') as 'student' | 'instructor' | null;

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (savedMode && parsedUser.roles?.includes(savedMode)) {
          setActiveModeState(savedMode);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setActiveModeState('student');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeMode');
    setUser(null);
    setActiveModeState('student');
  };

  const setActiveMode = (mode: 'student' | 'instructor') => {
    setActiveModeState(mode);
    localStorage.setItem('activeMode', mode);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      activeMode,
      setActiveMode,
      login,
      logout,
      loading
    }}>
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
