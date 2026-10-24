import React from 'react';
import {
  Fuel,
  Activity,
  History,
  ArrowRightLeft,
  ShieldCheck,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { formatCurrency } from '../utils/calculator';
import { AuthUser } from '../types/auth';

interface HeaderProps {
  currentDieselPrice: number;
  baseDieselPrice: number;
  petrolimexZone: 1 | 2;
  user?: AuthUser | null;
  isAdmin?: boolean;
  pendingCount?: number;
  onOpenFuelTable: () => void;
  onOpenApiChecker: () => void;
  onOpenHistory: () => void;
  onOpenComparison: () => void;
  onOpenPhuLuc1?: () => void;
  onOpenAdminModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDieselPrice,
  baseDieselPrice,
  petrolimexZone,
  user,
  isAdmin,
  pendingCount = 0,
  onOpenFuelTable,
  onOpenApiChecker,
  onOpenHistory,
  onOpenComparison,
  onOpenAdminModal,
  onLogout,
}) => {
  const diffPercent = ((currentDieselPrice - baseDieselPrice) / baseDieselPrice) * 100;
  const isUp = diffPercent >= 0;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200 text-slate-800 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#EE0033] via-red-600 to-rose-700 flex items-center justify-center shadow-xs shadow-red-600/25 border border-red-400/40 shrink-0">
              <span className="text-white font-black text-xs sm:text-sm tracking-wider">VT</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-extrabold tracking-tight text-slate-900 leading-none truncate">
                  Viettel Logistics
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200/90 shadow-2xs shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EE0033] animate-pulse"></span>
                  <span className="hidden sm:inline">Phát triển bởi </span>
                  <span>Minh Quan Doan</span>
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate hidden sm:block">
                Hệ thống tính giá cước vận chuyển &amp; dầu PVOIL
              </div>
            </div>
          </div>

          {/* Quick Fuel Price Badge & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Fuel Price Pill */}
            <button
              onClick={onOpenFuelTable}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-red-300 transition-all text-left shadow-2xs group shrink-0"
              title="Xem bảng giá xăng dầu PVOIL chi tiết"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-red-50 text-[#EE0033] flex items-center justify-center shrink-0 border border-red-100">
                <Fuel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    <span className="hidden md:inline">PVOIL </span>DO 0,05S (V{petrolimexZone})
                  </span>
                  <span
                    className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded ${
                      isUp ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {isUp ? '+' : ''}{diffPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-red-600 mt-0.5">
                  {formatCurrency(currentDieselPrice)}
                </div>
              </div>
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenComparison}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-stone-50 rounded-lg sm:rounded-xl border border-stone-200 transition shadow-2xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-red-600" />
                <span>So sánh xe</span>
              </button>

              <button
                onClick={onOpenApiChecker}
                className="hidden lg:flex p-1.5 sm:px-2.5 sm:py-1.5 items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 rounded-lg sm:rounded-xl border border-stone-200 transition shadow-2xs"
                title="Kiểm tra kết nối API PVOIL 103.21.120.100"
              >
                <Activity className="w-3.5 h-3.5 text-red-600" />
                <span>API PVOIL</span>
              </button>

              <button
                onClick={onOpenHistory}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-stone-100 rounded-lg sm:rounded-xl transition"
                title="Lịch sử tính cước"
              >
                <History className="w-4 h-4" />
              </button>

              {/* Admin Management Button (Visible if admin is logged in) */}
              {isAdmin && (
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg sm:rounded-xl transition shadow-xs relative"
                  title="Quản trị người dùng & Phê duyệt tài khoản"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Quản trị TK</span>
                  {pendingCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Identity Chip & Logout */}
              {user && (
                <div className="flex items-center pl-1 sm:pl-2 border-l border-stone-200 gap-1 sm:gap-2">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg sm:rounded-xl bg-white border border-stone-200 text-slate-800"
                    title={`Đang đăng nhập: ${user.fullName} (${user.email})`}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-100 text-[#EE0033] flex items-center justify-center font-bold text-[10px]">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden md:block text-left text-[11px] leading-tight">
                      <div className="font-bold text-slate-800 truncate max-w-[120px]">
                        {user.fullName || user.email.split('@')[0]}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono truncate max-w-[120px]">
                        {isAdmin ? 'Admin Chính' : 'Nhân sự'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-1.5 sm:p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition"
                    title="Đăng xuất khỏi hệ thống"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
