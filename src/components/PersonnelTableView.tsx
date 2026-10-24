import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  User,
  KeyRound,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Lock,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { ADMIN_EMAIL, DEFAULT_PASSWORD, INITIAL_USERS } from '../data/initialUsers';

interface PersonnelTableViewProps {
  onOpenCreateUserModal?: () => void;
}

export const PersonnelTableView: React.FC<PersonnelTableViewProps> = ({
  onOpenCreateUserModal,
}) => {
  const [users, setUsers] = useState<AuthUser[]>(() => INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && data.users && data.users.length > 0) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
          text: `Đã khôi phục mật khẩu tài khoản ${email} về mặc định (${DEFAULT_PASSWORD}).`,
        });
        loadUsers();
      } else {
        setActionMessage({ type: 'error', text: data.message });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Không thể đặt lại mật khẩu.' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || u.role === 'admin'
        : u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && u.role !== 'admin';
    return matchesQuery && matchesRole;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;
  const pendingCount = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-stone-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>Cổng Quản Trị Hệ Thống Viettel Logistics</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Danh Sách Nhân Sự &amp; Cấp Quyền Đăng Nhập
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hệ thống quản lý 15 tài khoản nhân sự với định danh Gmail chính thức. Mật khẩu mặc định toàn hệ thống là{' '}
              <span className="font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-amber-400/30">
                {DEFAULT_PASSWORD}
              </span>
              . Quản trị viên: <strong className="text-white">{ADMIN_EMAIL}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-xl sm:text-2xl font-black text-white">{users.length}</div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-medium">Tổng nhân sự</div>
            </div>
            <div className="bg-emerald-500/15 backdrop-blur-xs p-3 rounded-2xl border border-emerald-400/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-300">{activeCount}</div>
              <div className="text-[10px] sm:text-xs text-emerald-200 font-medium">Đã cấp quyền</div>
            </div>
            <div className="bg-amber-500/15 backdrop-blur-xs p-3 rounded-2xl border border-amber-400/20 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</div>
              <div className="text-[10px] sm:text-xs text-amber-200 font-medium">Chờ duyệt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action feedback message */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border shadow-2xs ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="font-bold text-[11px] text-slate-600 hover:text-slate-900 hover:underline ml-3"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Toolbar: Search, Role filter, Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh theo họ tên nhân sự hoặc Gmail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-stone-50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          >
            <option value="all">Tất cả vai trò ({users.length})</option>
            <option value="admin">Quản trị viên (1)</option>
            <option value="user">Nhân viên ({users.length - 1})</option>
          </select>

          <button
            onClick={loadUsers}
            className="p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 rounded-xl border border-stone-200 transition flex items-center gap-1.5"
            title="Tải lại danh sách từ máy chủ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {onOpenCreateUserModal && (
            <button
              onClick={onOpenCreateUserModal}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#EE0033] hover:bg-red-700 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm tài khoản</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Personnel Table */}
      <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100/90 border-b border-stone-200 text-slate-700 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Nhân sự</th>
                <th className="py-3.5 px-4">Gmail đăng nhập</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Mật khẩu mặc định</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhân sự phù hợp với từ khóa &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const isMainAdmin = u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-red-50/40 transition ${
                        isMainAdmin ? 'bg-amber-50/40 font-medium' : ''
                      }`}
                    >
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {i + 1}
                      </td>

                      {/* Họ và tên + Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              isMainAdmin
                                ? 'bg-red-100 text-[#EE0033] border border-red-300'
                                : 'bg-stone-100 text-slate-700 border border-stone-200'
                            }`}
                          >
                            {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {u.fullName}
                            </div>
                            {isMainAdmin && (
                              <div className="text-[10px] text-[#EE0033] font-bold">
                                Quản trị viên hệ thống
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Gmail đăng nhập */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-800 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-200 text-xs font-semibold">
                          {u.email}
                        </span>
                      </td>

                      {/* Vai trò */}
                      <td className="py-3.5 px-4">
                        {isMainAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EE0033] text-white shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                            Quản trị viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            Nhân viên
                          </span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              : 'bg-stone-100 text-slate-500'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã cấp quyền
                            </>
                          ) : u.status === 'pending' ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Chờ duyệt
                            </>
                          ) : (
                            u.status
                          )}
                        </span>
                      </td>

                      {/* Mật khẩu mặc định */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-stone-100 px-2 py-1 rounded-md">
                          {DEFAULT_PASSWORD}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        {!isMainAdmin && (
                          <button
                            onClick={() => handleResetPassword(u.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-xs font-bold text-slate-700 transition shadow-2xs hover:border-amber-300"
                            title={`Khôi phục mật khẩu tài khoản ${u.email} về ${DEFAULT_PASSWORD}`}
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reset MK</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
