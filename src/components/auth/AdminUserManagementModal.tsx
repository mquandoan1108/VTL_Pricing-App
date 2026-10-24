import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserCheck,
  RefreshCw,
  Plus,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Bell,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { ADMIN_EMAIL, DEFAULT_PASSWORD } from '../../data/initialUsers';

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserApprovedOrUpdated?: () => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  isOpen,
  onClose,
  onUserApprovedOrUpdated,
}) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'create' | 'notifications'>('pending');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');

  // Create user form
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch users & notifications
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingUsers = users.filter((u) => u.status === 'pending');

  const handleApprove = async (email: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action, adminEmail: ADMIN_EMAIL }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: action === 'approve'
            ? `Đã phê duyệt và cấp quyền cho tài khoản ${email}.`
            : `Đã từ chối tài khoản ${email}.`,
        });
        loadData();
        onUserApprovedOrUpdated?.();
      } else {
        setActionMessage({ type: 'error', text: data.message });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Thao tác không thành công.' });
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adminEmail: ADMIN_EMAIL, newPassword: DEFAULT_PASSWORD }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Đã khôi phục mật khẩu của ${email} về mặc định (${DEFAULT_PASSWORD}).`,
        });
        loadData();
      } else {
        setActionMessage({ type: 'error', text: data.message });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Không thể đặt lại mật khẩu.' });
    }
  };

  const handleCreateDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newFullName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/auth/admin-create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          fullName: newFullName.trim(),
          adminEmail: ADMIN_EMAIL,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Đã cấp tài khoản thành công cho ${newEmail} (Mật khẩu mặc định: ${DEFAULT_PASSWORD}).`,
        });
        setNewEmail('');
        setNewFullName('');
        loadData();
        setActiveTab('all');
        onUserApprovedOrUpdated?.();
      } else {
        setActionMessage({ type: 'error', text: data.message });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Lỗi khi tạo tài khoản.' });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EE0033] flex items-center justify-center border border-red-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Bảng Quản Trị &amp; Phê Duyệt Tài Khoản
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EE0033] text-white">
                  Admin: {ADMIN_EMAIL.split('@')[0]}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Xác thực, mở quyền truy cập và quản lý danh sách tài khoản Viettel Logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-slate-700 hover:bg-stone-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div
            className={`p-3 text-xs flex items-center justify-between border-b ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="font-bold text-[10px] hover:underline"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'pending'
                ? 'bg-white border-[#EE0033] text-[#EE0033] shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Chờ phê duyệt</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'all'
                ? 'bg-white border-[#EE0033] text-[#EE0033] shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tất cả tài khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'create'
                ? 'bg-white border-[#EE0033] text-[#EE0033] shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tài khoản trực tiếp</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-3 rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'notifications'
                ? 'bg-white border-[#EE0033] text-[#EE0033] shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Nhật ký xác thực ({notifications.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PENDING APPROVAL */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  Các yêu cầu tạo tài khoản mới từ người dùng. Khi bạn bấm{' '}
                  <strong>&quot;Phê duyệt mở quyền&quot;</strong>, người dùng sẽ có thể đăng nhập vào hệ thống.
                </div>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs space-y-2 border border-dashed border-stone-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="font-bold text-slate-700">Không có yêu cầu nào đang chờ duyệt!</div>
                  <p>Tất cả tài khoản đã được xử lý xong.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-red-300 transition shadow-2xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{u.fullName}</span>
                            <span className="font-mono text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {u.email}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Vai trò: <span className="font-semibold text-slate-700">Nhân viên</span> • Gửi lúc:{' '}
                            {new Date(u.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(u.email, 'reject')}
                            className="px-3 py-1.5 rounded-xl border border-stone-200 text-slate-600 hover:bg-stone-100 font-bold text-xs transition"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApprove(u.email, 'approve')}
                            className="px-3.5 py-1.5 rounded-xl bg-[#EE0033] hover:bg-red-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Phê duyệt mở quyền</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL USERS */}
          {activeTab === 'all' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo email hoặc họ tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50"
                  />
                </div>
                <button
                  onClick={loadData}
                  className="p-2 text-slate-600 hover:bg-stone-100 rounded-xl border border-stone-200"
                  title="Tải lại"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white text-xs">
                {filteredUsers.map((u, i) => {
                  const isMainAdmin = u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                  return (
                    <div
                      key={u.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{i + 1}. {u.fullName}</span>
                          <span className="font-mono text-slate-600 font-semibold">{u.email}</span>
                          {isMainAdmin ? (
                            <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold text-[9px]">
                              Quản trị viên
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[9px]">
                              Nhân viên
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : u.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-stone-100 text-slate-500'
                            }`}
                          >
                            {u.status === 'active' ? 'Đã cấp quyền' : u.status === 'pending' ? 'Chờ duyệt' : u.status}
                          </span>
                        </div>
                      </div>

                      {!isMainAdmin && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleResetPassword(u.email)}
                            className="px-2 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition"
                            title="Đặt lại mật khẩu về mặc định"
                          >
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Reset pass</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE DIRECT */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                Thêm nhanh tài khoản mới cho cán bộ nhân viên Viettel Logistics. Tài khoản tạo bởi Admin sẽ được tự động kích hoạt ngay.
              </div>

              <form onSubmit={handleCreateDirect} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ Gmail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Nhập địa chỉ Gmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white bg-[#EE0033] hover:bg-red-700 transition disabled:opacity-50 text-xs sm:text-sm shadow-md"
                >
                  {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Tạo &amp; Cấp Quyền Truy Cập Ngay</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS LOG */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Nhật ký các thông báo xác thực đăng ký tài khoản gửi tới hòm thư Admin (<strong>{ADMIN_EMAIL}</strong>):
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-2xl">
                  Chưa có thông báo xác thực phát sinh.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-red-600">
                          <Bell className="w-3.5 h-3.5" />
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-slate-600">{n.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Tổng tài khoản: <strong>{users.length}</strong> | Chờ duyệt: <strong>{pendingUsers.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
