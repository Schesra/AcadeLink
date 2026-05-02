import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  bio?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  activeMode: 'student' | 'instructor';
  setActiveMode: (mode: 'student' | 'instructor') => void;
  login: (token: string, user: User, refreshToken?: string) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveModeState] = useState<'student' | 'instructor'>('student');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    const savedUser = sessionStorage.getItem('user');
    const savedMode = localStorage.getItem('activeMode') as 'student' | 'instructor' | null;

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (savedMode && parsedUser.roles?.includes(savedMode)) {
          setActiveModeState(savedMode);
        }
      } catch {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    // Lắng nghe khi refresh token cập nhật roles mới (ví dụ sau khi becomeInstructor)
    const handleUserUpdated = (e: Event) => {
      const updated = (e as CustomEvent).detail;
      if (updated) {
        setUser(updated);
        sessionStorage.setItem('user', JSON.stringify(updated));
      }
    };
    window.addEventListener('session-expired', handleExpired);
    window.addEventListener('user-updated', handleUserUpdated);
    return () => {
      window.removeEventListener('session-expired', handleExpired);
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []);

  const login = (token: string, userData: User, refreshToken?: string) => {
    sessionStorage.setItem('accessToken', token);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setActiveModeState('student');
  };

  const updateUser = (partial: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    // Gọi API logout để xóa refresh token khỏi DB (fire-and-forget)
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('activeMode');
    setUser(null);
    setActiveModeState('student');
  };

  const handleGoToLogin = () => {
    logout();
    setSessionExpired(false);
    window.location.href = '/login';
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
      updateUser,
      logout,
      loading
    }}>
      {children}

      {sessionExpired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Phiên đăng nhập đã hết hạn</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Vui lòng đăng nhập lại để tiếp tục sử dụng.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
            >
              Quay về trang đăng nhập
            </button>
          </div>
        </div>
      )}
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
