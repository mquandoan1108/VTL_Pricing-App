import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { PriceResultCard } from './components/PriceResultCard';
import { PvoilTable } from './components/PvoilTable';
import { PvoilApiChecker } from './components/PvoilApiChecker';
import { PetrolimexApiChecker } from './components/PetrolimexApiChecker';
import { VehicleComparisonModal } from './components/VehicleComparisonModal';
import { QuotationModal } from './components/QuotationModal';
import { HistoryDrawer, HistoryItem } from './components/HistoryDrawer';
import { PhuLucViewerModal } from './components/PhuLucViewerModal';
import { LoginView } from './components/auth/LoginView';
import { AdminUserManagementModal } from './components/auth/AdminUserManagementModal';
import { PersonnelTableView } from './components/PersonnelTableView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CalculationInput, VehicleOption, VehicleCategory } from './types/logistics';
import {
  BASE_DIESEL_PRICE,
  getEffectiveVehicleOptions,
  saveEffectiveVehicleOptions,
  resetEffectiveVehicleOptions,
} from './data/pricingData';
import { calculateFreightPrice } from './utils/calculator';
import {
  Fuel,
  Calculator,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Users,
} from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Vehicle options state (customizable via Phụ lục 1 & 2 modal)
  const [vehicles, setVehicles] = useState<VehicleOption[]>(() => getEffectiveVehicleOptions());

  // Input state
  const [input, setInput] = useState<CalculationInput>({
    vehicleCategory: 'truck_reefer',
    vehicleId: 'reefer_2d_bn_28000kg', // Phụ lục 2 Viettel Logistics - Tuyến Trục 28 tấn 2 lái
    driverCount: 2,
    connectionCategory: 'bac_nam_can_vung',
    connectionType: 'truc_bac_nam',
    direction: 'chieu_ra',
    fromProvinceId: 'SG',
    toProvinceId: 'HN', // Mẫu Nam -> Bắc (1.720km)
    km: 1720,
    currentDieselPrice: 29200, // Dầu DO 0,05S-II từ máy chủ PVOIL (103.21.120.100)
    baseDieselPrice: BASE_DIESEL_PRICE, // 21860
    coolingHours: 0,
    retentionDays: 0,
    vatRate: 8,
    petrolimexZone: 1,
    profitMarginPercent: 10,
  });

  // Modal / Drawer visibility states
  const [activeTab, setActiveTab] = useState<'calculator' | 'pvoil' | 'personnel'>('calculator');
  const [isApiCheckerOpen, setIsApiCheckerOpen] = useState(false);
  const [isPetrolimexCheckerOpen, setIsPetrolimexCheckerOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [quotationMode, setQuotationMode] = useState<'customer' | 'internal'>('customer');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPhuLucOpen, setIsPhuLucOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [usersCount, setUsersCount] = useState(15);
  const [phuLucInitialTab, setPhuLucInitialTab] = useState<VehicleCategory>('truck_dry');
  const [isRefreshingFuel, setIsRefreshingFuel] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vt_logistics_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vt_logistics_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Lấy dữ liệu giá dầu trực tiếp từ API PVOIL khi khởi động
  useEffect(() => {
    fetch('/api/pvoil/prices')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.products) {
          const do05 = data.products.find((p: any) => p.code.includes('0,05S'));
          if (do05) {
            setInput((prev) => ({
              ...prev,
              currentDieselPrice: prev.petrolimexZone === 1 ? do05.zone1 : do05.zone2,
            }));
          }
        }
      })
      .catch(() => {
        // Fallback default 29.200đ is already preset in state
      });
  }, []);

  // Fetch pending registrations and total user count for Admin
  const fetchPendingCount = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsersCount(data.users.length);
        const pending = data.users.filter((u: any) => u.status === 'pending');
        setPendingCount(pending.length);
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 8000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchPendingCount]);

  // Compute calculation result with memoization using active vehicles list
  const result = useMemo(() => {
    return calculateFreightPrice(input, vehicles);
  }, [input, vehicles]);

  // Phụ lục 1 save/reset handlers
  const handleSavePhuLuc1 = (updated: VehicleOption[]) => {
    saveEffectiveVehicleOptions(updated);
    setVehicles(updated);
  };

  const handleResetPhuLuc1 = () => {
    resetEffectiveVehicleOptions();
    setVehicles(getEffectiveVehicleOptions());
  };

  // Handlers
  const handleSelectPrice = (price: number) => {
    setInput((prev) => ({
      ...prev,
      currentDieselPrice: price,
    }));
  };

  const handleSelectZone = (zone: 1 | 2) => {
    setInput((prev) => ({
      ...prev,
      petrolimexZone: zone,
      currentDieselPrice: zone === 1 ? 29200 : 29780,
    }));
  };

  const handleRefreshPrices = async () => {
    setIsRefreshingFuel(true);
    try {
      const res = await fetch('/api/pvoil/prices');
      const data = await res.json();
      if (data && data.products) {
        const do05 = data.products.find((p: any) => p.code.includes('0,05S'));
        if (do05) {
          setInput((prev) => ({
            ...prev,
            currentDieselPrice: prev.petrolimexZone === 1 ? do05.zone1 : do05.zone2,
          }));
        }
      }
    } catch {
      // fallback
    } finally {
      setTimeout(() => setIsRefreshingFuel(false), 500);
    }
  };

  const handleSaveToHistory = () => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      input: { ...input },
      result: { ...result },
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setInput(item.input);
  };

  // If user is not authenticated, show the login view
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-800 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <Header
        currentDieselPrice={input.currentDieselPrice}
        baseDieselPrice={input.baseDieselPrice}
        petrolimexZone={input.petrolimexZone}
        user={user}
        isAdmin={isAdmin}
        pendingCount={pendingCount}
        onOpenFuelTable={() => setActiveTab('pvoil')}
        onOpenApiChecker={() => setIsApiCheckerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenPhuLuc1={() => {
          setPhuLucInitialTab('truck_dry');
          setIsPhuLucOpen(true);
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={logout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (Mobile & Desktop friendly) */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-1 sm:gap-2 bg-white p-1 rounded-2xl border border-stone-200 flex-wrap shadow-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-[#EE0033] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Tính Giá Cước Vận Chuyển</span>
            </button>
            <button
              onClick={() => setActiveTab('pvoil')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pvoil'
                  ? 'bg-[#EE0033] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
              }`}
            >
              <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Biểu Giá Xăng Dầu PVOIL</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('personnel')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'personnel'
                    ? 'bg-[#EE0033] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Danh Sách Nhân Sự ({usersCount})</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5"></span>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setPhuLucInitialTab('truck_dry');
                setIsPhuLucOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition hover:border-red-300"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bảng Đơn Giá Gốc (Phụ Lục 1 &amp; 2)</span>
            </button>

            <button
              onClick={() => setIsPetrolimexCheckerOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition hover:border-amber-400"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Kiểm tra API Petrolimex</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Calculator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Form (Left 7 Cols) */}
            <div className="lg:col-span-7">
              <CalculatorForm
                input={input}
                onChange={setInput}
                currentDieselPrice={input.currentDieselPrice}
                vehicles={vehicles}
                onOpenPhuLucModal={(category) => {
                  if (category) setPhuLucInitialTab(category);
                  setIsPhuLucOpen(true);
                }}
              />
            </div>

            {/* Result & Actions (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <PriceResultCard
                result={result}
                input={input}
                onOpenQuotation={(mode) => {
                  if (mode) setQuotationMode(mode);
                  setIsQuotationOpen(true);
                }}
                onSaveToHistory={handleSaveToHistory}
                onOpenComparison={() => setIsComparisonOpen(true)}
                onSelectProfitMargin={(margin) =>
                  setInput((prev) => ({ ...prev, profitMarginPercent: margin }))
                }
              />

              {/* Quick Info Cards */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quy Tắc Tính Bù Trừ Nhiên Liệu Viettel Logistics:</span>
                </div>
                <p className="leading-relaxed">
                  Đơn giá cơ sở ban đầu được xây dựng tại mức dầu DO 0,05S là{' '}
                  <strong className="text-slate-900 font-semibold">21.860 đồng/lít</strong>. Tỷ lệ điều chỉnh cước phụ thuộc vào mức tiêu hao của từng loại xe theo Phụ lục 3.
                </p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-slate-500">
                  <span>Trạng thái kết nối PVOIL:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    Tầng 0 (Bypass Cloudflare)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fuel Pricing Table */}
        {activeTab === 'pvoil' && (
          <div className="space-y-4">
            <PvoilTable
              currentDieselPrice={input.currentDieselPrice}
              selectedZone={input.petrolimexZone}
              onSelectZone={handleSelectZone}
              onSelectPrice={handleSelectPrice}
              onRefreshPrices={handleRefreshPrices}
              isRefreshing={isRefreshingFuel}
            />
          </div>
        )}

        {/* Tab 3: Personnel Management Table (Admin only) */}
        {activeTab === 'personnel' && isAdmin && (
          <div className="space-y-4">
            <PersonnelTableView
              onOpenCreateUserModal={() => setIsAdminModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Viettel Logistics. Xây dựng &amp; số hoá biểu mẫu tính cước theo Phụ lục 1, 2, 3.
          </div>
          <div className="flex items-center gap-3">
            <span>Admin chính: <strong className="text-slate-700">doanminhquan1108@gmail.com</strong></span>
            <span>•</span>
            <span className="text-slate-600">phát triển bởi <strong className="text-slate-800 font-semibold">Minh Quan Doan</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PhuLucViewerModal
        isOpen={isPhuLucOpen}
        onClose={() => setIsPhuLucOpen(false)}
        vehicles={vehicles}
        onSaveVehicles={handleSavePhuLuc1}
        onResetVehicles={handleResetPhuLuc1}
        currentDieselPrice={input.currentDieselPrice}
        initialTab={phuLucInitialTab}
        onSelectVehicle={(vehicleId) => {
          const v = vehicles.find((item) => item.id === vehicleId);
          if (v) {
            setInput((prev) => ({
              ...prev,
              vehicleId: v.id,
              vehicleCategory: v.category,
              driverCount: v.driverCount,
              connectionCategory: v.connectionCategory,
              isReeferCoolingOff: v.specialType === 'ngat_lanh',
            }));
          }
        }}
      />

      <PvoilApiChecker
        isOpen={isApiCheckerOpen}
        onClose={() => setIsApiCheckerOpen(false)}
      />

      <PetrolimexApiChecker
        isOpen={isPetrolimexCheckerOpen}
        onClose={() => setIsPetrolimexCheckerOpen(false)}
      />

      <VehicleComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        input={input}
        vehicles={vehicles}
        onSelectVehicle={(vehicleId) => {
          const v = vehicles.find((item) => item.id === vehicleId);
          if (v) {
            setInput((prev) => ({
              ...prev,
              vehicleId: v.id,
              vehicleCategory: v.category,
              driverCount: v.driverCount,
            }));
          }
        }}
      />

      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        result={result}
        input={input}
        initialMode={quotationMode}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Admin Management Modal */}
      {isAdmin && (
        <AdminUserManagementModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onUserApprovedOrUpdated={fetchPendingCount}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
