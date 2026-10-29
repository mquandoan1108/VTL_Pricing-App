import { PetrolimexProduct } from '../types/logistics';

export const PVOIL_PRODUCTS: PetrolimexProduct[] = [
  {
    id: 'pvoil_do_0_05s',
    code: 'DO 0,05S-II',
    name: 'Dầu Điêzen DO 0,05S-II (PVOIL)',
    unit: 'đồng/lít',
    zone1Price: 30240, // Cập nhật trực tiếp từ link https://www.pvoil.com.vn/tin-gia-xang-dau
    zone2Price: 30840,
    priceDiff: 600,
    isPrimaryFuelForLogistics: true,
    adjustmentDiff: '+1040',
    description: 'Nhiên liệu tiêu chuẩn quy định tính cước xe tải và xe cont kéo cảng theo Phụ lục 3 Viettel Logistics.',
  },
  {
    id: 'pvoil_do_0_001s',
    code: 'DO 0,001S-V',
    name: 'Dầu Điêzen DO 0,001S-V (Euro 5)',
    unit: 'đồng/lít',
    zone1Price: 31640,
    zone2Price: 32270,
    priceDiff: 630,
    isPrimaryFuelForLogistics: false,
    adjustmentDiff: '+1040',
    description: 'Dầu Diesel Euro 5 chất lượng cao giảm thiểu phát thải.',
  },
  {
    id: 'pvoil_ron_95',
    code: 'RON 95-III',
    name: 'Xăng E10 RON 95-III (PVOIL)',
    unit: 'đồng/lít',
    zone1Price: 25730,
    zone2Price: 26240,
    priceDiff: 510,
    isPrimaryFuelForLogistics: false,
    adjustmentDiff: '+870',
    description: 'Xăng cao cấp mạng lưới PVOil.',
  },
  {
    id: 'pvoil_ron_92',
    code: 'E5 RON 92-II',
    name: 'Xăng sinh học E5 RON 92-II',
    unit: 'đồng/lít',
    zone1Price: 26020,
    zone2Price: 26540,
    priceDiff: 520,
    isPrimaryFuelForLogistics: false,
    adjustmentDiff: '+1010',
    description: 'Xăng sinh học mạng lưới PVOil.',
  },
];

export const PVOIL_METADATA = {
  announcementDate: '2026-10-29',
  effectiveTime: 'Giá điều chỉnh lúc 15:00 ngày 29/10/2026',
  sourceName: 'Tổng công ty Dầu Việt Nam - CTCP (PVOIL)',
  sourceUrl: 'https://www.pvoil.com.vn/tin-gia-xang-dau',
  originIp: '103.21.120.100',
  tierArchitecture: {
    tier0: 'HTTP fetch trực tiếp máy chủ gốc PVOil (IP 103.21.120.100 + Header Host www.pvoil.com.vn)',
    tier1: 'Bóc tách tự động trang tin giá xăng dầu https://www.pvoil.com.vn/tin-gia-xang-dau',
    tier2: 'API nạp lịch sử giá xăng dầu /api/oilprice/load-view',
  },
  statusMessage: 'Đồng bộ thời gian thực từ trang Tin giá xăng dầu PVOIL (https://www.pvoil.com.vn/tin-gia-xang-dau)',
};
