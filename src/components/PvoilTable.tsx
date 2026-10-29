import React, { useState } from 'react';
import { Fuel, RefreshCw, CheckCircle2, ArrowUpRight, ArrowDownRight, Edit3, ShieldCheck, ExternalLink, Calendar, Sparkles } from 'lucide-react';
import { PetrolimexProduct } from '../types/logistics';
import { PVOIL_PRODUCTS as DEFAULT_PRODUCTS, PVOIL_METADATA } from '../data/pvoilData';
import { BASE_DIESEL_PRICE } from '../data/pricingData';
import { formatCurrency } from '../utils/calculator';

interface PvoilTableProps {
  currentDieselPrice: number;
  selectedZone: 1 | 2;
  products?: PetrolimexProduct[];
  effectiveTime?: string;
  sourceUrl?: string;
  dateOptions?: Array<{ value: string; label: string }>;
  selectedDate?: string;
  onSelectDate?: (dateVal: string) => void;
  onSelectZone: (zone: 1 | 2) => void;
  onSelectPrice: (price: number, productName?: string) => void;
  onRefreshPrices: () => Promise<void>;
  isRefreshing?: boolean;
}

export const PvoilTable: React.FC<PvoilTableProps> = ({
  currentDieselPrice,
  selectedZone,
  products = DEFAULT_PRODUCTS,
  effectiveTime = 'Giá điều chỉnh lúc 15:00 ngày 29/10/2026',
  sourceUrl = 'https://www.pvoil.com.vn/tin-gia-xang-dau',
  dateOptions = [],
  selectedDate = '',
  onSelectDate,
  onSelectZone,
  onSelectPrice,
  onRefreshPrices,
  isRefreshing = false,
}) => {
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [activeProductId, setActiveProductId] = useState<string>('pvoil_do_0_05s');

  const diffFromBase = currentDieselPrice - BASE_DIESEL_PRICE;
  const diffPercent = (diffFromBase / BASE_DIESEL_PRICE) * 100;

  const handleApplyCustom = () => {
    const val = parseFloat(customPrice.replace(/[^0-9]/g, ''));
    if (!isNaN(val) && val > 0) {
      onSelectPrice(val, 'Giá tùy chỉnh');
      setIsEditingCustom(false);
    }
  };

  const handleResetToStandard = () => {
    const primary = products.find((p) => p.id === activeProductId) || products[0];
    const standardPrice = selectedZone === 1 ? primary.zone1Price : primary.zone2Price;
    onSelectPrice(standardPrice, primary.code);
    setIsEditingCustom(false);
    setCustomPrice('');
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EE0033]/10 border border-[#EE0033]/20 text-[#EE0033] flex items-center justify-center shrink-0 font-black text-base shadow-xs">
            PV
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Bảng Giá Xăng Dầu PVOIL Thời Gian Thực</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Live: pvoil.com.vn/tin-gia-xang-dau
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span>{effectiveTime}</span>
              <span>•</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#EE0033] hover:underline font-semibold"
              >
                <span>Xem link gốc PVOIL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Historical Date Select */}
          {dateOptions.length > 0 && onSelectDate && (
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="pvoil-date-select" className="text-slate-500 hidden sm:inline font-medium">Kỳ:</label>
              <select
                id="pvoil-date-select"
                value={selectedDate}
                onChange={(e) => onSelectDate(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="">-- Mới nhất (Tự động) --</option>
                {dateOptions.slice(0, 30).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Zone Selector */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => {
                onSelectZone(1);
                const p = products.find((x) => x.id === activeProductId) || products[0];
                onSelectPrice(p.zone1Price, p.code);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedZone === 1
                  ? 'bg-[#EE0033] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vùng 1
            </button>
            <button
              onClick={() => {
                onSelectZone(2);
                const p = products.find((x) => x.id === activeProductId) || products[0];
                onSelectPrice(p.zone2Price, p.code);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedZone === 2
                  ? 'bg-[#EE0033] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vùng 2
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 border border-stone-200 text-xs font-bold transition disabled:opacity-50 shadow-xs cursor-pointer"
            title="Làm mới giá trực tiếp từ https://www.pvoil.com.vn/tin-gia-xang-dau"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#EE0033]' : 'text-slate-600'}`} />
            <span>{isRefreshing ? 'Đang đồng bộ...' : 'Làm mới PVOIL'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF8F5] border-b border-stone-200 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-slate-500">Giá dầu vốn cơ sở (P₀):</span>
          <span className="font-bold text-slate-800">{formatCurrency(BASE_DIESEL_PRICE)}/lít</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-slate-500">Giá dầu PVOIL áp dụng (P₁):</span>
          <span className="font-bold text-[#EE0033] text-sm">{formatCurrency(currentDieselPrice)}/lít</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-slate-500">Biến động so với vốn (Δ):</span>
          <div className="flex items-center gap-1 font-bold">
            {diffFromBase >= 0 ? (
              <span className="text-rose-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{formatCurrency(diffFromBase)} (+{diffPercent.toFixed(2)}%)
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {formatCurrency(diffFromBase)} ({diffPercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between gap-2 text-xs text-amber-900">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Dữ liệu được cập nhật tự động từ trang <strong>https://www.pvoil.com.vn/tin-gia-xang-dau</strong> mỗi khi PVOIL công bố giá mới.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md hidden md:inline">
          Áp dụng cho Phụ lục 3 bù trừ nhiên liệu
        </span>
      </div>

      {/* Fuel Price Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-stone-50 text-slate-600 font-semibold border-b border-stone-200">
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Tên mặt hàng xăng dầu PVOIL</th>
              <th className="py-3 px-4 text-center">Đơn vị</th>
              <th className="py-3 px-4 text-right">
                <span className={selectedZone === 1 ? 'text-[#EE0033] font-bold' : ''}>Giá Vùng 1</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className={selectedZone === 2 ? 'text-[#EE0033] font-bold' : ''}>Giá Vùng 2</span>
              </th>
              <th className="py-3 px-4 text-right">Điều chỉnh kỳ này</th>
              <th className="py-3 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product, idx) => {
              const isSelected = activeProductId === product.id;
              const activePrice = selectedZone === 1 ? product.zone1Price : product.zone2Price;
              const isIncrease = product.adjustmentDiff?.startsWith('+');
              const isDecrease = product.adjustmentDiff?.startsWith('-');

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-red-50/60 hover:bg-red-50/80'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      {product.isPrimaryFuelForLogistics && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EE0033] text-white shadow-2xs">
                          Chuẩn Tính Cước Viettel
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{product.code}</div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">{product.unit}</td>
                  <td className={`py-3 px-4 text-right font-medium ${selectedZone === 1 ? 'text-[#EE0033] font-black text-sm' : 'text-slate-700'}`}>
                    {formatCurrency(product.zone1Price)} đ
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${selectedZone === 2 ? 'text-[#EE0033] font-black text-sm' : 'text-slate-700'}`}>
                    {formatCurrency(product.zone2Price)} đ
                  </td>
                  <td className="py-3 px-4 text-right">
                    {product.adjustmentDiff ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isIncrease
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isDecrease
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-50 text-slate-600'
                        }`}
                      >
                        {product.adjustmentDiff} đ
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setActiveProductId(product.id);
                        onSelectPrice(activePrice, product.code);
                        setIsEditingCustom(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected && !isEditingCustom && currentDieselPrice === activePrice
                          ? 'bg-[#EE0033] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-stone-100 border border-stone-200 shadow-2xs'
                      }`}
                    >
                      {isSelected && !isEditingCustom && currentDieselPrice === activePrice ? (
                        <span className="flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang dùng tính cước
                        </span>
                      ) : (
                        'Chọn giá này'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Architecture strip & custom price override */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {!isEditingCustom ? (
            <button
              onClick={() => {
                setIsEditingCustom(true);
                setCustomPrice(currentDieselPrice.toString());
              }}
              className="flex items-center gap-1 text-slate-600 hover:text-[#EE0033] font-medium transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tự nhập giá dầu theo hóa đơn thực tế...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-bold">Giá dầu thực tế:</span>
              <input
                type="text"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="30240"
                className="w-28 px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-slate-900 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <span className="text-slate-500 font-medium">đồng/lít</span>
              <button
                onClick={handleApplyCustom}
                className="px-2.5 py-1 rounded-lg bg-[#EE0033] text-white font-bold hover:bg-red-700 transition shadow-2xs cursor-pointer"
              >
                Áp dụng
              </button>
              <button
                onClick={handleResetToStandard}
                className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Quy định Vùng 2:</span>
          <span className="font-semibold text-slate-700">Giá Vùng 1 + 2%</span>
          <span>•</span>
          <span>Nguồn chính thức:</span>
          <a
            href="https://www.pvoil.com.vn/tin-gia-xang-dau"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#EE0033] hover:underline"
          >
            pvoil.com.vn
          </a>
        </div>
      </div>
    </div>
  );
};
