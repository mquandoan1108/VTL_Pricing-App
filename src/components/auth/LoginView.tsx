import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../../data/initialUsers';

export const LoginView: React.FC = () => {
  const { login, requestOtp, resetPassword, registerUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'forgot' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ type: 'error' | 'success'; message: string; otpPreview?: string } | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Register state (No department, no prefilled password)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStatus, setRegStatus] = useState<{ type: 'error' | 'success'; message: string; notificationPreview?: any } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ địa chỉ Gmail và mật khẩu.');
      return;
    }

    setIsLoggingIn(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (!result.success) {
      setLoginError(result.message);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    if (!forgotEmail) {
      setForgotStatus({ type: 'error', message: 'Vui lòng nhập địa chỉ Gmail tài khoản của bạn.' });
      return;
    }

    setIsRequestingOtp(true);
    const res = await requestOtp(forgotEmail);
    setIsRequestingOtp(false);

    if (res.success) {
      setForgotStep(2);
      setForgotStatus({
        type: 'success',
        message: res.message,
        otpPreview: res.otpPreview,
      });
      if (res.otpPreview) {
        setForgotOtp(res.otpPreview);
      }
    } else {
      setForgotStatus({ type: 'error', message: res.message });
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) {
      setForgotStatus({ type: 'error', message: 'Vui lòng nhập mã OTP và mật khẩu mới.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotStatus({ type: 'error', message: 'Xác nhận mật khẩu mới không trùng khớp.' });
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(forgotEmail, forgotOtp, newPassword);
    setIsResetting(false);

    if (res.success) {
      setForgotStatus({
        type: 'success',
        message: 'Mật khẩu đã được cập nhật thành công! Bạn có thể chuyển sang đăng nhập.',
      });
      setTimeout(() => {
        setLoginEmail(forgotEmail);
        setLoginPassword(newPassword);
        setActiveTab('login');
      }, 1500);
    } else {
      setForgotStatus({ type: 'error', message: res.message });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ họ tên, địa chỉ Gmail và mật khẩu.' });
      return;
    }

    setIsRegistering(true);
    const res = await registerUser({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
    });
    setIsRegistering(false);

    if (res.success) {
      setRegStatus({
        type: 'success',
        message: res.message,
        notificationPreview: res.notificationPreview,
      });
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
    } else {
      setRegStatus({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Viettel Brand Icon & Title */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EE0033] to-red-700 text-white shadow-xl shadow-red-500/25 border-2 border-white mb-4">
          <span className="font-black text-2xl tracking-wider">VT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Viettel Logistics
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
          Hệ thống Quản trị &amp; Tính Giá Cước Vận Chuyển VTL
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 shadow-xl rounded-3xl border border-stone-200">
          {/* Tab Navigation */}
          <div className="flex rounded-2xl bg-stone-100 p-1 mb-6 border border-stone-200 text-xs sm:text-sm font-bold">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition text-center ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setActiveTab('forgot');
                setForgotStatus(null);
              }}
              className={`flex-1 py-2 rounded-xl transition text-center ${
                activeTab === 'forgot'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quên mật khẩu
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegStatus(null);
              }}
              className={`flex-1 py-2 rounded-xl transition text-center ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng ký mới
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4 animate-fade-in">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="leading-relaxed">{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ Gmail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Nhập địa chỉ Gmail"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[#EE0033] hover:bg-red-700 transition shadow-lg shadow-red-600/25 disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập vào Hệ Thống'}</span>
                </button>

                {/* Quên mật khẩu button placed below the login button */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setActiveTab('forgot');
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                Nhập địa chỉ Gmail của bạn để nhận mã xác thực OTP 6 chữ số, sau đó tiến hành đặt lại mật khẩu mới.
              </div>

              {forgotStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    forgotStatus.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {forgotStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div className="leading-relaxed">
                    <div>{forgotStatus.message}</div>
                    {forgotStatus.otpPreview && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-300 font-mono text-emerald-700 font-bold text-xs flex items-center justify-between">
                        <span>Mã xác thực OTP gửi về Gmail:</span>
                        <span className="text-sm font-black tracking-widest text-[#EE0033]">
                          {forgotStatus.otpPreview}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa chỉ Gmail cần khôi phục
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Nhập địa chỉ Gmail"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRequestingOtp}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[#EE0033] hover:bg-red-700 transition disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {isRequestingOtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Gửi mã xác thực về Gmail</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mã xác thực OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Nhập mã 6 số"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50/50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-slate-700 hover:bg-stone-50"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white bg-[#EE0033] hover:bg-red-700 transition disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {isResetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Xác nhận đổi mật khẩu</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                Sau khi tạo tài khoản, hệ thống sẽ gửi thông báo xác thực tới Quản trị viên (<strong className="font-mono text-slate-900 font-bold">{ADMIN_EMAIL}</strong>) để xác nhận thì mới được phép mở tài khoản.
              </div>

              {regStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    regStatus.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {regStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    )}
                    <div className="leading-relaxed">
                      <div>{regStatus.message}</div>
                      {regStatus.notificationPreview && (
                        <div className="mt-2 p-2.5 bg-white rounded-lg border border-emerald-200 text-[11px] text-slate-700 space-y-1">
                          <div className="font-bold text-emerald-700">Thông báo gửi tới Admin:</div>
                          <div>Tiêu đề: {regStatus.notificationPreview.title}</div>
                          <div className="text-slate-500 text-[10px]">Thời gian: {new Date(regStatus.notificationPreview.timestamp).toLocaleString('vi-VN')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ Gmail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Nhập địa chỉ Gmail"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[#EE0033] hover:bg-red-700 transition disabled:opacity-50 text-xs sm:text-sm shadow-md"
                >
                  {isRegistering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Tạo tài khoản</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Góc phải bên dưới màn hình */}
      <div className="fixed bottom-3 right-4 text-xs text-slate-500 font-medium z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        <span>phát triển bởi <strong className="text-slate-800 font-semibold">Minh Quan Doan</strong></span>
      </div>
    </div>
  );
};
