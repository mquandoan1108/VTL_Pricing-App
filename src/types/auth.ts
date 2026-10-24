export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'rejected' | 'blocked';
  password?: string;
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  phone?: string;
  department?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PasswordResetRequest {
  email: string;
  otp: string;
  expiresAt: number;
}
