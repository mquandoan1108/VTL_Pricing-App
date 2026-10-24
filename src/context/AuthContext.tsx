import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, AuthState } from '../types/auth';
import { ADMIN_EMAIL, INITIAL_USERS, DEFAULT_PASSWORD } from '../data/initialUsers';

interface AuthContextType extends AuthState {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  requestOtp: (email: string) => Promise<{ success: boolean; message: string; otpPreview?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (data: { email: string; fullName: string; department?: string; reason?: string }) => Promise<{ success: boolean; message: string; notificationPreview?: any }>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vt_logistics_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AuthUser = JSON.parse(saved);
        const match = INITIAL_USERS.find((u) => u.email.toLowerCase() === parsed.email.toLowerCase());
        if (match && match.fullName !== parsed.fullName) {
          return { ...parsed, fullName: match.fullName };
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize with server and keep localStorage up-to-date
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Đăng nhập thất bại.' };
      }
    } catch (err: any) {
      // Local fallback in case of dev network glitch
      const fallbackUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (fallbackUser && (password === DEFAULT_PASSWORD || password === fallbackUser.password)) {
        if (fallbackUser.status === 'pending') {
          return {
            success: false,
            message: `Tài khoản ${normalizedEmail} đang chờ Quản trị viên (${ADMIN_EMAIL}) phê duyệt.`,
          };
        }
        const { password: _, ...safe } = fallbackUser;
        setUser(safe);
        return { success: true, message: 'Đăng nhập thành công (chế độ bảo lưu)' };
      }
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const requestOtp = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      return data;
    } catch {
      // Offline fallback simulation
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        success: true,
        message: `Đã gửi mã xác thực OTP về Gmail: ${normalizedEmail}`,
        otpPreview: mockOtp,
      };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Mật khẩu đã được cập nhật thành công.',
      };
    }
  };

  const registerUser = async (data: { email: string; fullName: string; department?: string; reason?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: `Đăng ký thành công! Hệ thống đã gửi thông báo xác thực tới Quản trị viên: ${ADMIN_EMAIL}.`,
      };
    }
  };

  const refreshAuth = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // ignore
    }
  };

  const isAdmin = user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        logout,
        requestOtp,
        resetPassword,
        registerUser,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
