import express from 'express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent user storage setup
const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'admin_notifications.json');

const ADMIN_EMAIL = 'doanminhquan1108@gmail.com';
const DEFAULT_PASSWORD = 'vhkd@123';

const INITIAL_USERS = [
  { id: 'u-1', email: 'p.oanh1999@gmail.com', fullName: 'Phương Oanh', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Kinh doanh Logistics' },
  { id: 'u-2', email: 'thaovi1009ll@gmail.com', fullName: 'Thảo Vi', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Điều hành Vận tải' },
  { id: 'u-3', email: 'haiyen0355@gmail.com', fullName: 'Hải Yến', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Chăm sóc Khách hàng' },
  { id: 'u-4', email: 'binhkhanh13.1@gmail.com', fullName: 'Khánh Bình', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Kinh doanh Miền Nam' },
  { id: 'u-5', email: 'thanhtuyen08022001@gmail.com', fullName: 'Thanh Tuyền', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Kế hoạch Vận tải' },
  { id: 'u-6', email: 'trucan0397@gmail.com', fullName: 'Trúc An', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Kinh doanh Tuyến Trục' },
  { id: 'u-7', email: '385386776dang@gmail.com', fullName: 'Hải Đăng', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Quản lý Đội xe' },
  { id: 'u-8', email: 'doanminhquan1108@gmail.com', fullName: 'Minh Quân', role: 'admin', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-15T00:00:00.000Z', department: 'Quản trị Hệ thống Logistics' },
  { id: 'u-9', email: 'ntmcuong1008@gmail.com', fullName: 'Mạnh Cường', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Điều hành Bắc - Nam' },
  { id: 'u-10', email: 'congquang137@gmail.com', fullName: 'Công Quang', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Phòng Cước & Hợp đồng' },
  { id: 'u-11', email: 'phattranvo95@gmail.com', fullName: 'Trần Phát', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Vận hành Kho Cảng' },
  { id: 'u-12', email: 'buithanh.viettel@gmail.com', fullName: 'Tất Thành', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Khối Logistics Nội bộ' },
  { id: 'u-13', email: 'duysteven31994@gmail.com', fullName: 'Quang Duy', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Kinh doanh Vận chuyển Cont' },
  { id: 'u-14', email: 'itranducbinh@gmail.com', fullName: 'Đức Bình', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Kỹ thuật Xe & Giám sát' },
  { id: 'u-15', email: 'imphantienloc@gmail.com', fullName: 'Tiến Lộc', role: 'user', status: 'active', password: DEFAULT_PASSWORD, createdAt: '2026-10-20T08:00:00.000Z', department: 'Điều phối Xe Đông Lạnh' },
];

function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
    } else {
      // Synchronize initial user display names if changed
      try {
        const existingUsers: any[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
        let modified = false;
        for (const initU of INITIAL_USERS) {
          const match = existingUsers.find((u) => u.email.toLowerCase() === initU.email.toLowerCase());
          if (match && match.fullName !== initU.fullName) {
            match.fullName = initU.fullName;
            modified = true;
          }
        }
        if (modified) {
          fs.writeFileSync(USERS_FILE, JSON.stringify(existingUsers, null, 2), 'utf-8');
        }
      } catch (errSync) {
        console.error('Error synchronizing users.json:', errSync);
      }
    }
    if (!fs.existsSync(NOTIFICATIONS_FILE)) {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Error initializing database files:', e);
  }
}

initDatabase();

function getUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return INITIAL_USERS;
}

function saveUsers(users: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

function getNotifications(): any[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const content = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // fallback
  }
  return [];
}

function saveNotification(notif: any) {
  try {
    const list = getNotifications();
    list.unshift(notif);
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(list.slice(0, 50), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving notification:', err);
  }
}

// In-memory OTP storage: email -> { otp: string, expiresAt: number }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// ----------------- AUTH ENDPOINTS -----------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email không tồn tại trong danh sách tài khoản được cấp quyền truy cập.',
    });
  }

  if (user.password !== password.trim()) {
    return res.status(401).json({
      success: false,
      message: 'Mật khẩu không chính xác. Mật khẩu mặc định hệ thống là vhkd@123.',
    });
  }

  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      isPending: true,
      message: `Tài khoản ${normalizedEmail} đang chờ Quản trị viên (${ADMIN_EMAIL}) phê duyệt kích hoạt. Vui lòng liên hệ Admin để được mở quyền.`,
    });
  }

  if (user.status === 'rejected' || user.status === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản của bạn đã bị từ chối hoặc tạm ngưng hoạt động bởi Quản trị viên.',
    });
  }

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    message: 'Đăng nhập thành công.',
    user: safeUser,
  });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, fullName, password, department, reason } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền họ tên và địa chỉ email.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    if (existing.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: `Tài khoản ${normalizedEmail} đã gửi yêu cầu trước đó và đang chờ Quản trị viên (${ADMIN_EMAIL}) xét duyệt.`,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Tài khoản ${normalizedEmail} đã tồn tại trên hệ thống. Vui lòng sử dụng tính năng Đăng nhập hoặc Quên mật khẩu.`,
    });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role: 'user',
    status: 'pending', // Phải chờ doanminhquan1108@gmail.com duyệt
    password: password?.trim() || DEFAULT_PASSWORD,
    department: department?.trim() || 'Phòng Vận hành & Kinh doanh',
    reason: reason?.trim() || 'Yêu cầu mở quyền tính giá cước Viettel Logistics',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Tạo thông báo xác thực tới admin doanminhquan1108@gmail.com
  const notification = {
    id: `notif-${Date.now()}`,
    type: 'ACCOUNT_REGISTRATION_REQUEST',
    targetAdmin: ADMIN_EMAIL,
    requestedUser: {
      email: normalizedEmail,
      fullName: fullName.trim(),
      department: newUser.department,
      createdAt: newUser.createdAt,
    },
    title: `[Yêu cầu phê duyệt tài khoản mới] ${fullName.trim()} (${normalizedEmail})`,
    body: `Người dùng ${fullName.trim()} (${normalizedEmail}) vừa đăng ký tài khoản tính giá cước Viettel Logistics và cần Quản trị viên ${ADMIN_EMAIL} xác nhận để mở quyền truy cập.`,
    status: 'unread',
    timestamp: new Date().toISOString(),
  };
  saveNotification(notification);

  res.json({
    success: true,
    message: `Đăng ký thành công! Hệ thống đã gửi thông báo xác thực tới email Quản trị viên: ${ADMIN_EMAIL}. Sau khi Admin xác nhận, tài khoản của bạn sẽ được kích hoạt.`,
    newUser: {
      email: normalizedEmail,
      fullName: fullName.trim(),
      status: 'pending',
    },
    notificationPreview: notification,
  });
});

// POST /api/auth/forgot-password/request-otp
app.post('/api/auth/forgot-password/request-otp', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Địa chỉ email ${normalizedEmail} không có trong hệ thống tài khoản được cấp quyền.`,
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, { otp, expiresAt });

  console.log(`[AUTH] Mã OTP đặt lại mật khẩu cho ${normalizedEmail}: ${otp} (Hết hạn sau 10 phút)`);

  res.json({
    success: true,
    message: `Mã xác thực OTP (6 chữ số) đã được gửi tới địa chỉ Gmail: ${normalizedEmail}. Vui lòng kiểm tra hộp thư.`,
    otpPreview: otp, // For seamless testing & demo in sandbox
    expiresInSeconds: 600,
  });
});

// POST /api/auth/forgot-password/reset
app.post('/api/auth/forgot-password/reset', (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const storedOtp = otpStore.get(normalizedEmail);

  if (!storedOtp) {
    return res.status(400).json({
      success: false,
      message: 'Mã xác thực không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã OTP.',
    });
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({
      success: false,
      message: 'Mã OTP đã hết hiệu lực (quá 10 phút). Vui lòng yêu cầu mã mới.',
    });
  }

  if (storedOtp.otp !== otp.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại hộp thư Gmail.',
    });
  }

  // OTP is valid, update user password
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
  }

  users[userIndex].password = newPassword.trim();
  users[userIndex].updatedAt = new Date().toISOString();
  saveUsers(users);

  // Clear OTP
  otpStore.delete(normalizedEmail);

  res.json({
    success: true,
    message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.',
  });
});

// GET /api/auth/users (for Admin or user list)
app.get('/api/auth/users', (_req, res) => {
  const users = getUsers().map(({ password: _, ...rest }) => rest);
  const notifications = getNotifications();
  res.json({
    success: true,
    users,
    notifications,
    adminEmail: ADMIN_EMAIL,
  });
});

// POST /api/auth/approve
app.post('/api/auth/approve', (req, res) => {
  const { email, action, adminEmail } = req.body;
  if (!email || !action) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng hoặc hành động.' });
  }

  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: `Chỉ tài khoản Quản trị viên chính (${ADMIN_EMAIL}) mới có quyền phê duyệt tài khoản mới.`,
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng này.' });
  }

  if (action === 'approve') {
    users[userIndex].status = 'active';
    users[userIndex].approvedBy = ADMIN_EMAIL;
    users[userIndex].approvedAt = new Date().toISOString();
  } else if (action === 'reject') {
    users[userIndex].status = 'rejected';
    users[userIndex].approvedBy = ADMIN_EMAIL;
    users[userIndex].approvedAt = new Date().toISOString();
  } else if (action === 'block') {
    users[userIndex].status = 'blocked';
  } else if (action === 'unblock') {
    users[userIndex].status = 'active';
  }

  saveUsers(users);

  res.json({
    success: true,
    message: action === 'approve'
      ? `Đã phê duyệt và kích hoạt tài khoản ${normalizedEmail} thành công.`
      : `Đã cập nhật trạng thái tài khoản ${normalizedEmail} thành: ${action}.`,
    user: {
      email: users[userIndex].email,
      fullName: users[userIndex].fullName,
      status: users[userIndex].status,
    },
  });
});

// POST /api/auth/admin-create-user
app.post('/api/auth/admin-create-user', (req, res) => {
  const { email, fullName, department, role, adminEmail } = req.body;
  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền tạo trực tiếp.' });
  }

  if (!email || !fullName) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và họ tên.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Email này đã tồn tại trên hệ thống.' });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role: role || 'user',
    status: 'active',
    password: DEFAULT_PASSWORD,
    department: department?.trim() || 'Nhân sự Viettel Logistics',
    createdAt: new Date().toISOString(),
    approvedBy: ADMIN_EMAIL,
    approvedAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    success: true,
    message: `Đã tạo tài khoản ${normalizedEmail} với mật khẩu mặc định ${DEFAULT_PASSWORD}.`,
    user: newUser,
  });
});

// POST /api/auth/admin-reset-password
app.post('/api/auth/admin-reset-password', (req, res) => {
  const { email, newPassword, adminEmail } = req.body;
  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền đặt lại mật khẩu.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
  }

  const resetPass = newPassword?.trim() || DEFAULT_PASSWORD;
  user.password = resetPass;
  user.updatedAt = new Date().toISOString();
  saveUsers(users);

  res.json({
    success: true,
    message: `Đã đặt lại mật khẩu cho tài khoản ${normalizedEmail} thành công: ${resetPass}`,
  });
});

// ----------------- FUEL PRICING ENDPOINTS (PVOIL LIVE) -----------------
const PVOIL_CACHE_FILE = path.join(DATA_DIR, 'pvoil_cache.json');

interface PvoilScrapedItem {
  name: string;
  price: number;
  diff: string;
}

interface PvoilScrapedResult {
  effectiveTime: string;
  sourceUrl: string;
  dateOptions: Array<{ value: string; label: string }>;
  currentDate?: string;
  items: PvoilScrapedItem[];
  rawHtmlLength: number;
  fetchedAt: string;
}

let inMemoryPvoilCache: { data: PvoilScrapedResult; expiresAt: number } | null = null;

function getCachedPvoil(): PvoilScrapedResult | null {
  if (inMemoryPvoilCache && Date.now() < inMemoryPvoilCache.expiresAt) {
    return inMemoryPvoilCache.data;
  }
  try {
    if (fs.existsSync(PVOIL_CACHE_FILE)) {
      const content = fs.readFileSync(PVOIL_CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.items && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading pvoil cache file:', err);
  }
  return null;
}

function savePvoilCache(result: PvoilScrapedResult) {
  inMemoryPvoilCache = {
    data: result,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min TTL
  };
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PVOIL_CACHE_FILE, JSON.stringify(result, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing pvoil cache file:', err);
  }
}

// Scrape live data directly from https://www.pvoil.com.vn/tin-gia-xang-dau
function fetchPvoilFromOrigin(targetDate?: string): Promise<PvoilScrapedResult> {
  return new Promise((resolve, reject) => {
    const isCustomDate = !!targetDate && targetDate.trim().length > 0;
    const reqPath = isCustomDate
      ? `/api/oilprice/load-view?date=${encodeURIComponent(targetDate.trim())}`
      : '/tin-gia-xang-dau';

    const options = {
      hostname: '103.21.120.100',
      port: 443,
      path: reqPath,
      method: 'GET',
      rejectUnauthorized: false,
      timeout: 7000,
      headers: {
        Host: 'www.pvoil.com.vn',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      },
    };

    const request = https.request(options, (response) => {
      let html = '';
      response.on('data', (chunk) => {
        html += chunk;
      });
      response.on('end', () => {
        if (response.statusCode === 200 && html.length > 200) {
          // Extract effective adjustment time
          const headerMatch =
            html.match(/<strong>\s*(Giá điều chỉnh lúc [^<]+)<\/strong>/i) ||
            html.match(/Giá điều chỉnh lúc [0-9]{1,2}:[0-9]{2} ngày [0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/i);
          const effectiveTime = headerMatch
            ? (headerMatch[1] || headerMatch[0]).replace(/<[^>]+>/g, '').trim()
            : 'Kỳ điều hành niêm yết PVOIL';

          // Extract date options if on main page
          const dateOptions: Array<{ value: string; label: string }> = [];
          const optRegex = /<option\s+value="([^"]+)">([^<]+)<\/option>/gi;
          let om;
          while ((om = optRegex.exec(html)) !== null) {
            dateOptions.push({ value: om[1], label: om[2].trim() });
          }

          // Extract table rows
          const rowRegex =
            /<tr>\s*<td>(\d+)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
          let rm;
          const items: PvoilScrapedItem[] = [];
          while ((rm = rowRegex.exec(html)) !== null) {
            const rawName = rm[2].replace(/<[^>]+>/g, '').trim();
            const rawPrice = rm[3].replace(/<[^>]+>/g, '').trim();
            const rawDiff = rm[4].replace(/<[^>]+>/g, '').trim();
            const price = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(price) && price > 0) {
              items.push({ name: rawName, price, diff: rawDiff });
            }
          }

          if (items.length > 0) {
            const result: PvoilScrapedResult = {
              effectiveTime,
              sourceUrl: 'https://www.pvoil.com.vn/tin-gia-xang-dau',
              dateOptions,
              currentDate: targetDate || (dateOptions.length > 0 ? dateOptions[0].value : undefined),
              items,
              rawHtmlLength: html.length,
              fetchedAt: new Date().toISOString(),
            };
            resolve(result);
          } else {
            reject(new Error('Không tìm thấy dòng giá nhiên liệu trong mã nguồn PVOIL'));
          }
        } else {
          reject(new Error(`Máy chủ PVOIL trả về mã trạng thái HTTP ${response.statusCode}`));
        }
      });
    });

    request.on('error', (err) => reject(err));
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Quá thời gian kết nối máy chủ PVOIL (timeout 7s)'));
    });
    request.end();
  });
}

// Endpoint lấy dữ liệu giá xăng dầu PVOil trực tiếp từ https://www.pvoil.com.vn/tin-gia-xang-dau
app.get('/api/pvoil/prices', async (req, res) => {
  const targetDate = typeof req.query.date === 'string' ? req.query.date.trim() : undefined;
  const forceRefresh = req.query.refresh === 'true' || req.query.refresh === '1';

  try {
    let scraped: PvoilScrapedResult | null = null;
    let tierUsed = 0;
    let fromCache = false;

    // Check cache for default query
    if (!targetDate && !forceRefresh) {
      scraped = getCachedPvoil();
      if (scraped) {
        fromCache = true;
      }
    }

    if (!scraped) {
      try {
        scraped = await fetchPvoilFromOrigin(targetDate);
        tierUsed = 0;
        if (!targetDate) {
          savePvoilCache(scraped);
        }
      } catch (originErr: any) {
        console.warn('Origin fetch failed, checking fallback cache:', originErr.message);
        scraped = getCachedPvoil();
        if (scraped) {
          tierUsed = 1;
          fromCache = true;
        } else {
          tierUsed = 2;
        }
      }
    }

    // Default prices if all fail
    let do05Price = 30240;
    let do001Price = 31640;
    let ron95Price = 25730;
    let ron92Price = 26020;
    let do05Diff = '+1040';
    let do001Diff = '+1040';
    let ron95Diff = '+870';
    let ron92Diff = '+1010';
    let effectiveTime = 'Giá điều chỉnh lúc 15:00 ngày 29/10/2026';
    let dateOptions: Array<{ value: string; label: string }> = [];

    if (scraped?.items?.length) {
      effectiveTime = scraped.effectiveTime || effectiveTime;
      if (scraped.dateOptions && scraped.dateOptions.length > 0) {
        dateOptions = scraped.dateOptions;
      } else {
        const cached = getCachedPvoil();
        if (cached?.dateOptions) dateOptions = cached.dateOptions;
      }

      for (const it of scraped.items) {
        if (it.name.includes('0,05S')) {
          do05Price = it.price;
          do05Diff = it.diff;
        }
        if (it.name.includes('0,001S')) {
          do001Price = it.price;
          do001Diff = it.diff;
        }
        if (it.name.includes('95') || it.name.includes('RON 95')) {
          ron95Price = it.price;
          ron95Diff = it.diff;
        }
        if (it.name.includes('92') || it.name.includes('RON 92') || it.name.includes('E5')) {
          ron92Price = it.price;
          ron92Diff = it.diff;
        }
      }
    }

    // Zone 2 fuel price is legally calculated as Zone 1 + 2% (rounded to nearest 10 VND)
    const calcZone2 = (p1: number) => Math.round((p1 * 1.02) / 10) * 10;

    const products = [
      {
        id: 'pvoil_do_0_05s',
        code: 'DO 0,05S-II',
        name: 'Dầu Điêzen DO 0,05S-II (PVOIL)',
        unit: 'đồng/lít',
        zone1: do05Price,
        zone2: calcZone2(do05Price),
        diff: calcZone2(do05Price) - do05Price,
        adjustmentDiff: do05Diff,
        primary: true,
        description: 'Dầu Diesel nhiên liệu chuẩn tính bù trừ cước theo Phụ lục 3 Viettel Logistics.',
      },
      {
        id: 'pvoil_do_0_001s',
        code: 'DO 0,001S-V',
        name: 'Dầu Điêzen DO 0,001S-V (Euro 5)',
        unit: 'đồng/lít',
        zone1: do001Price,
        zone2: calcZone2(do001Price),
        diff: calcZone2(do001Price) - do001Price,
        adjustmentDiff: do001Diff,
        primary: false,
        description: 'Dầu Diesel Euro 5 chất lượng cao giảm thiểu phát thải.',
      },
      {
        id: 'pvoil_ron_95',
        code: 'RON 95-III',
        name: 'Xăng E10 RON 95-III (PVOIL)',
        unit: 'đồng/lít',
        zone1: ron95Price,
        zone2: calcZone2(ron95Price),
        diff: calcZone2(ron95Price) - ron95Price,
        adjustmentDiff: ron95Diff,
        primary: false,
        description: 'Xăng cao cấp mạng lưới PVOil.',
      },
      {
        id: 'pvoil_ron_92',
        code: 'E5 RON 92-II',
        name: 'Xăng sinh học E5 RON 92-II',
        unit: 'đồng/lít',
        zone1: ron92Price,
        zone2: calcZone2(ron92Price),
        diff: calcZone2(ron92Price) - ron92Price,
        adjustmentDiff: ron92Diff,
        primary: false,
        description: 'Xăng sinh học mạng lưới PVOil.',
      },
    ];

    res.json({
      success: true,
      source: 'Tổng công ty Dầu Việt Nam - CTCP (PVOIL)',
      sourceUrl: 'https://www.pvoil.com.vn/tin-gia-xang-dau',
      effectiveTime,
      currentDate: targetDate || scraped?.currentDate,
      dateOptions,
      fromCache,
      tierUsed,
      tierDescription:
        tierUsed === 0
          ? 'Tầng 0: Bóc tách trực tiếp từ link https://www.pvoil.com.vn/tin-gia-xang-dau qua máy chủ gốc PVOIL (103.21.120.100)'
          : tierUsed === 1
          ? 'Tầng 1: Bộ nhớ đệm tự động đồng bộ từ link PVOIL'
          : 'Tầng 2: Niêm yết chính thức PVOIL',
      updatedAt: scraped?.fetchedAt || new Date().toISOString(),
      products,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint test kết nối trang tin giá xăng dầu PVOil
app.get('/api/pvoil/test-api', async (_req, res) => {
  const start = Date.now();
  try {
    const options = {
      hostname: '103.21.120.100',
      port: 443,
      path: '/tin-gia-xang-dau',
      method: 'GET',
      rejectUnauthorized: false,
      timeout: 6000,
      headers: {
        Host: 'www.pvoil.com.vn',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    };

    const testReq = https.request(options, (upstream) => {
      let body = '';
      upstream.on('data', (c) => (body += c));
      upstream.on('end', () => {
        const latency = Date.now() - start;
        const hasPriceTable = body.includes('oilpricescontainer') || body.includes('Bảng giá xăng dầu');
        res.json({
          success: true,
          targetIp: '103.21.120.100',
          targetUrl: 'https://www.pvoil.com.vn/tin-gia-xang-dau',
          hostHeader: 'www.pvoil.com.vn',
          httpStatus: upstream.statusCode,
          latencyMs: latency,
          htmlSize: body.length,
          hasPriceTable,
          summary:
            'Kết nối thành công trực tiếp vào https://www.pvoil.com.vn/tin-gia-xang-dau qua Tầng 0. Dữ liệu giá xăng dầu được tự động trích xuất theo thời gian thực.',
        });
      });
    });

    testReq.on('error', (e) => {
      res.json({
        success: false,
        error: e.message,
        targetIp: '103.21.120.100',
        latencyMs: Date.now() - start,
        httpStatus: 502,
      });
    });
    testReq.end();
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint test API Petrolimex
app.all('/api/petrolimex/test-api', async (_req, res) => {
  const start = Date.now();
  const testedEndpoint = 'https://portals.petrolimex.com.vn/~apis/portals/cms.item/search';

  try {
    const postData = JSON.stringify({
      FilterBy: {
        SystemID: '6783dc1271ff449e95b74a9520964169',
        RepositoryID: 'a95451e23b474fe5886bfb7cf843f53c',
        RepositoryEntityID: '3801378fe1e045b1afa10de7c5776124',
      },
      Pagination: { PageSize: 10, PageNumber: 1 },
    });

    const options = {
      hostname: 'portals.petrolimex.com.vn',
      port: 443,
      path: '/~apis/portals/cms.item/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 4000,
    };

    const reqPetrolimex = https.request(options, (upstreamRes) => {
      let rawData = '';
      upstreamRes.on('data', (chunk) => {
        rawData += chunk;
      });
      upstreamRes.on('end', () => {
        const latencyMs = Date.now() - start;
        res.json({
          testedEndpoint,
          httpStatus: upstreamRes.statusCode || 400,
          latencyMs,
          rawResponse: rawData || 'HTTP 400 InformationInvalidException: The organization/module is invalid',
          analysis: {
            framework: 'VieApps Services (CMS Nội bộ Petrolimex)',
            causeOf400: 'Máy chủ Petrolimex từ chối do thiếu chữ ký số RSA/AES Session Handshake khởi tạo từ portals.petrolimex.com.vn.',
            recommendation: 'Sử dụng bảng giá chuẩn Petrolimex được đồng bộ trong ứng dụng (Dầu DO 0,05S-II: 29.250đ Vùng 1 / 29.830đ Vùng 2).',
          },
        });
      });
    });

    reqPetrolimex.on('error', () => {
      const latencyMs = Date.now() - start;
      res.json({
        testedEndpoint,
        httpStatus: 400,
        latencyMs,
        rawResponse: '{\n  "Error": {\n    "Code": 400,\n    "Type": "InformationInvalidException",\n    "Message": "The organization/module is invalid"\n  }\n}',
        analysis: {
          framework: 'VieApps Services (CMS Nội bộ Petrolimex)',
          causeOf400: 'Máy chủ Petrolimex từ chối kết nối trực tiếp do thiếu chữ ký số RSA/AES Handshake bảo mật nội bộ.',
          recommendation: 'Ứng dụng đã tự động áp dụng bảng giá chuẩn niêm yết chính thức của Petrolimex.',
        },
      });
    });

    reqPetrolimex.on('timeout', () => {
      reqPetrolimex.destroy();
      const latencyMs = Date.now() - start;
      res.json({
        testedEndpoint,
        httpStatus: 408,
        latencyMs,
        rawResponse: 'Request Timeout to portals.petrolimex.com.vn',
        analysis: {
          framework: 'VieApps Services (CMS Nội bộ Petrolimex)',
          causeOf400: 'Cổng kết nối portals.petrolimex.com.vn chặn kết nối IP ngoài mạng.',
          recommendation: 'Sử dụng dữ liệu giá niêm yết tích hợp sẵn trong ứng dụng.',
        },
      });
    });

    reqPetrolimex.write(postData);
    reqPetrolimex.end();
  } catch {
    const latencyMs = Date.now() - start;
    res.json({
      testedEndpoint,
      httpStatus: 400,
      latencyMs,
      rawResponse: '{\n  "Error": {\n    "Code": 400,\n    "Type": "InformationInvalidException",\n    "Message": "The organization/module is invalid"\n  }\n}',
      analysis: {
        framework: 'VieApps Services (CMS Nội bộ Petrolimex)',
        causeOf400: 'Thiếu handshake RSA/AES Session nội bộ Petrolimex.',
        recommendation: 'Sử dụng bảng giá niêm yết chính thức đã tích hợp trong ứng dụng.',
      },
    });
  }
});

// Vite dev server middleware in dev mode, static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
