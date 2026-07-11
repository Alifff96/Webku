const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const port = process.env.PORT || 8080;
const dataDir = path.join(__dirname, "data");
const mechanicsFile = path.join(dataDir, "mechanics.json");
const requestsFile = path.join(dataDir, "requests.json");
const servicesFile = path.join(dataDir, "services.json");
const partsFile = path.join(dataDir, "parts.json");
const customersFile = path.join(dataDir, "customers.json");

const ensureDataDirectory = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const loadJsonFile = (filePath, defaultValue) => {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Tidak dapat membaca file data: ${filePath}`, error);
    return defaultValue;
  }
};

const saveJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Tidak dapat menyimpan file data: ${filePath}`, error);
  }
};

ensureDataDirectory();

const mechanics = loadJsonFile(mechanicsFile, []);
const serviceRequests = loadJsonFile(requestsFile, []);
const customers = loadJsonFile(customersFile, []);

if (!fs.existsSync(customersFile)) {
  saveJsonFile(customersFile, customers);
}

const adminUser = {
  email: "admin@bengkel.com",
  password: "admin123",
};

const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...value] = cookie.trim().split("=");
    cookies[name] = decodeURIComponent(value.join("="));
  });
  return cookies;
};

const createToken = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
const adminSessions = new Set();
const mechanicSessions = new Map();

const requireAdmin = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.adminToken || !adminSessions.has(cookies.adminToken)) {
    return res.status(401).json({ status: "error", message: "Akses admin dibutuhkan." });
  }
  next();
};

const requireMechanic = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.mechanicToken || !mechanicSessions.has(cookies.mechanicToken)) {
    return res.status(401).json({ status: "error", message: "Akses mekanik dibutuhkan." });
  }
  req.mechanicEmail = mechanicSessions.get(cookies.mechanicToken);
  next();
};

const isAdminTokenValid = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return cookies.adminToken && adminSessions.has(cookies.adminToken);
};

app.get("/api/status", (req, res) => {
  res.json({
    status: "active",
    message: "Server UMKM Bengkel berjalan dan siap menerima permintaan.",
    timestamp: new Date().toISOString(),
  });
});

const paymentInstructions = {
  "DANA QRIS": "Silakan bayar via DANA QRIS ke 0857-1234-5678. Tunjukkan bukti pembayaran saat mekanik datang.",
  "Bank BCA": "Transfer ke BCA 123-456-7890 a.n. alifff96.com. Simpan bukti transfer untuk konfirmasi.",
  "Bank Mandiri": "Transfer ke Mandiri 070-123-4567 a.n. alifff96.com. Simpan bukti transfer untuk proses selanjutnya.",
};

const defaultServiceCatalog = [
  { id: "SERV-001", name: "Servis Motor", description: "Pemeriksaan dan perawatan lengkap untuk motor.", category: "Servis Motor", createdBy: "system" },
  { id: "SERV-002", name: "Servis Mobil", description: "Servis berkala dan perbaikan mobil ringan.", category: "Servis Mobil", createdBy: "system" },
  { id: "SERV-003", name: "Ganti Oli", description: "Penggantian oli mesin dan filter secara cepat.", category: "Ganti Oli", createdBy: "system" },
  { id: "SERV-004", name: "Perbaikan Rem", description: "Pemeriksaan sistem rem serta penggantian kampas.", category: "Perbaikan Rem", createdBy: "system" },
  { id: "SERV-005", name: "Elektrik Kendaraan", description: "Perbaikan kelistrikan dan audio kendaraan.", category: "Elektrik Kendaraan", createdBy: "system" },
  { id: "SERV-006", name: "Instalasi Aksesoris", description: "Pasang aksesoris kendaraan seperti audio dan lampu.", category: "Servis Motor", createdBy: "system" },
];

const defaultPartCatalog = [
  { id: "PART-001", name: "Oli Mesin", description: "Oli berkualitas untuk motor dan mobil.", price: "Rp 120.000", createdBy: "system" },
  { id: "PART-002", name: "Kampas Rem", description: "Kampas rem depan dan belakang berbagai jenis.", price: "Rp 150.000", createdBy: "system" },
  { id: "PART-003", name: "Aki", description: "Aki standar untuk motor dan mobil.", price: "Rp 450.000", createdBy: "system" },
  { id: "PART-004", name: "Filter Udara", description: "Filter udara OEM dan aftermarket.", price: "Rp 75.000", createdBy: "system" },
  { id: "PART-005", name: "Ban dan Velg", description: "Pilihan ban dan velg untuk berbagai kebutuhan.", price: "Mulai Rp 300.000", createdBy: "system" },
  { id: "PART-006", name: "Sistem Kelistrikan", description: "Sparepart kelistrikan lengkap untuk kendaraan.", price: "Harga sesuai permintaan", createdBy: "system" },
];

const serviceCatalog = loadJsonFile(servicesFile, defaultServiceCatalog);
const partCatalog = loadJsonFile(partsFile, defaultPartCatalog);

if (!fs.existsSync(servicesFile)) {
  saveJsonFile(servicesFile, serviceCatalog);
}

if (!fs.existsSync(partsFile)) {
  saveJsonFile(partsFile, partCatalog);
}

app.get("/api/services", (req, res) => {
  return res.json({ status: "success", services: serviceCatalog });
});

app.get("/api/parts", (req, res) => {
  return res.json({ status: "success", parts: partCatalog });
});

app.post("/api/customer/register", (req, res) => {
  const { name, email, phone } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^08[0-9]{8,12}$/;

  if (!name || !email || !phone) {
    return res.status(400).json({ status: "error", message: "Semua bidang pendaftaran pelanggan harus diisi." });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ status: "error", message: "Email tidak valid." });
  }

  if (!phonePattern.test(phone)) {
    return res.status(400).json({ status: "error", message: "Nomor HP tidak valid. Gunakan format 08xxxxxxxx." });
  }

  const existingCustomer = customers.find((customer) => customer.email === email);
  if (existingCustomer) {
    existingCustomer.name = name;
    existingCustomer.phone = phone;
    existingCustomer.updatedAt = new Date().toISOString();
  } else {
    customers.push({ name, email, phone, registeredAt: new Date().toISOString() });
  }

  saveJsonFile(customersFile, customers);
  return res.json({ status: "success", message: "Pendaftaran pelanggan berhasil.", customer: { name, email, phone } });
});

app.get("/api/customers", requireAdmin, (req, res) => {
  return res.json({ status: "success", customers });
});

app.post("/api/mechanic/service", requireMechanic, (req, res) => {
  const { name, description, category } = req.body;

  if (!name || !description || !category) {
    return res.status(400).json({ status: "error", message: "Nama jasa, deskripsi, dan kategori diperlukan." });
  }

  const newService = {
    id: `SERV-${Math.floor(Math.random() * 900000 + 100000)}`,
    name,
    description,
    category,
    createdBy: req.mechanicEmail,
    createdAt: new Date().toISOString(),
  };

  serviceCatalog.push(newService);
  saveJsonFile(servicesFile, serviceCatalog);

  return res.json({ status: "success", message: "Jasa berhasil ditambahkan.", service: newService });
});

app.post("/api/mechanic/part", requireMechanic, (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ status: "error", message: "Nama sparepart, deskripsi, dan harga diperlukan." });
  }

  const newPart = {
    id: `PART-${Math.floor(Math.random() * 900000 + 100000)}`,
    name,
    description,
    price,
    createdBy: req.mechanicEmail,
    createdAt: new Date().toISOString(),
  };

  partCatalog.push(newPart);
  saveJsonFile(partsFile, partCatalog);

  return res.json({ status: "success", message: "Sparepart berhasil ditambahkan.", part: newPart });
});

app.post("/api/request", (req, res) => {
  const { name, email, phone, service, category, paymentMethod } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^08[0-9]{8,12}$/;

  if (!name || !email || !phone || !service || !category || !paymentMethod) {
    return res.status(400).json({
      status: "error",
      message: "Nama, email, no HP, layanan, kategori, dan metode pembayaran diperlukan.",
    });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ status: "error", message: "Email tidak valid." });
  }

  if (!phonePattern.test(phone)) {
    return res.status(400).json({ status: "error", message: "Nomor HP tidak valid. Gunakan format 08xxxxxxxx." });
  }

  if (!paymentInstructions[paymentMethod]) {
    return res.status(400).json({
      status: "error",
      message: "Metode pembayaran tidak valid.",
    });
  }

  const existingCustomer = customers.find((customer) => customer.email === email);
  if (existingCustomer) {
    existingCustomer.name = name;
    existingCustomer.phone = phone;
    existingCustomer.updatedAt = new Date().toISOString();
  } else {
    customers.push({ name, email, phone, registeredAt: new Date().toISOString() });
  }
  saveJsonFile(customersFile, customers);

  const requestId = `REQ-${Math.floor(Math.random() * 900000 + 100000)}`;
  const requestItem = {
    id: requestId,
    name,
    email,
    phone,
    service,
    category,
    paymentMethod,
    assignedMechanicEmail: null,
    createdAt: new Date().toISOString(),
    status: "baru",
  };

  serviceRequests.push(requestItem);
  saveJsonFile(requestsFile, serviceRequests);

  return res.json({
    status: "success",
    message: `Halo ${name}, permintaan '${category} - ${service}' telah diterima. Mekanik terdaftar akan segera menghubungi Anda.`,
    paymentInstruction: paymentInstructions[paymentMethod],
    requestId,
    invoiceUrl: `/invoice.html?id=${requestId}`,
  });
});

app.get("/api/request/:id", (req, res) => {
  const requestItem = serviceRequests.find((item) => item.id === req.params.id);
  if (!requestItem) {
    return res.status(404).json({ status: "error", message: "Permintaan layanan tidak ditemukan." });
  }

  return res.json({
    status: "success",
    request: requestItem,
    paymentInstruction: paymentInstructions[requestItem.paymentMethod] || null,
  });
});

app.post("/api/mechanic/register", (req, res) => {
  const { fullName, email, phone, skills, password } = req.body;

  if (!fullName || !email || !phone || !skills || !password) {
    return res.status(400).json({
      status: "error",
      message: "Semua bidang pendaftaran mekanik harus diisi.",
    });
  }

  const existing = mechanics.find((m) => m.email === email);
  if (existing) {
    return res.status(409).json({
      status: "error",
      message: "Email sudah terdaftar sebagai mekanik.",
    });
  }

  mechanics.push({ fullName, email, phone, skills, password });
  saveJsonFile(mechanicsFile, mechanics);

  return res.json({
    status: "success",
    message: `Mekanik ${fullName} berhasil terdaftar. Silakan login untuk mulai menerima permintaan.`,
  });
});

app.post("/api/mechanic/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email dan kata sandi dibutuhkan.",
    });
  }

  const mechanic = mechanics.find((m) => m.email === email && m.password === password);
  if (!mechanic) {
    return res.status(401).json({
      status: "error",
      message: "Email atau kata sandi mekanik tidak valid.",
    });
  }

  const mechanicToken = createToken();
  mechanicSessions.set(mechanicToken, email);
  res.setHeader(
    "Set-Cookie",
    `mechanicToken=${mechanicToken}; HttpOnly; Path=/; SameSite=Strict`
  );

  return res.json({
    status: "success",
    message: `Selamat datang, ${mechanic.fullName}. Anda berhasil login sebagai mekanik.`,
  });
});

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email dan kata sandi admin dibutuhkan.",
    });
  }

  if (email !== adminUser.email || password !== adminUser.password) {
    return res.status(401).json({
      status: "error",
      message: "Email atau kata sandi admin tidak valid.",
    });
  }

  const adminToken = createToken();
  adminSessions.add(adminToken);
  res.setHeader(
    "Set-Cookie",
    `adminToken=${adminToken}; HttpOnly; Path=/; SameSite=Strict`
  );

  return res.json({
    status: "success",
    message: "Login admin berhasil. Selamat datang di dashboard admin.",
  });
});

app.get("/api/mechanics", requireAdmin, (req, res) => {
  return res.json({
    status: "success",
    mechanics: mechanics.map(({ password, ...rest }) => rest),
  });
});

app.get("/api/requests", requireAdmin, (req, res) => {
  return res.json({
    status: "success",
    requests: serviceRequests,
  });
});

app.get("/api/admin/status", (req, res) => {
  const loggedIn = isAdminTokenValid(req);
  return res.json({
    status: "success",
    loggedIn,
  });
});

app.get("/api/mechanic/status", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const mechanicEmail = cookies.mechanicToken && mechanicSessions.get(cookies.mechanicToken);
  if (!mechanicEmail) {
    return res.json({ status: "success", loggedIn: false });
  }

  const mechanic = mechanics.find((m) => m.email === mechanicEmail);
  if (!mechanic) {
    mechanicSessions.delete(cookies.mechanicToken);
    return res.json({ status: "success", loggedIn: false });
  }

  return res.json({
    status: "success",
    loggedIn: true,
    mechanic: {
      fullName: mechanic.fullName,
      email: mechanic.email,
    },
  });
});

app.get("/api/mechanic/profile", requireMechanic, (req, res) => {
  const mechanic = mechanics.find((m) => m.email === req.mechanicEmail);
  if (!mechanic) {
    return res.status(404).json({ status: "error", message: "Profil mekanik tidak ditemukan." });
  }

  return res.json({
    status: "success",
    profile: {
      fullName: mechanic.fullName,
      email: mechanic.email,
      phone: mechanic.phone,
      skills: mechanic.skills,
    },
  });
});

app.post("/api/mechanic/profile", requireMechanic, (req, res) => {
  const { phone, skills, password } = req.body;
  const mechanic = mechanics.find((m) => m.email === req.mechanicEmail);

  if (!mechanic) {
    return res.status(404).json({ status: "error", message: "Profil mekanik tidak ditemukan." });
  }

  if (!phone || !skills) {
    return res.status(400).json({ status: "error", message: "Nomor telepon dan keahlian diperlukan." });
  }

  if (password && password.length < 6) {
    return res.status(400).json({ status: "error", message: "Kata sandi baru minimal 6 karakter." });
  }

  mechanic.phone = phone;
  mechanic.skills = skills;
  if (password) {
    mechanic.password = password;
  }

  saveJsonFile(mechanicsFile, mechanics);

  return res.json({
    status: "success",
    message: "Profil mekanik berhasil diperbarui.",
    profile: {
      fullName: mechanic.fullName,
      email: mechanic.email,
      phone: mechanic.phone,
      skills: mechanic.skills,
    },
  });
});

app.post("/api/request/assign", requireAdmin, (req, res) => {
  const { requestId, mechanicEmail } = req.body;

  if (!requestId || !mechanicEmail) {
    return res.status(400).json({
      status: "error",
      message: "ID permintaan dan email mekanik diperlukan.",
    });
  }

  const requestItem = serviceRequests.find((item) => item.id === requestId);
  if (!requestItem) {
    return res.status(404).json({
      status: "error",
      message: "Permintaan layanan tidak ditemukan.",
    });
  }

  const mechanic = mechanics.find((m) => m.email === mechanicEmail);
  if (!mechanic) {
    return res.status(404).json({
      status: "error",
      message: "Mekanik tidak ditemukan.",
    });
  }

  requestItem.assignedMechanicEmail = mechanicEmail;
  saveJsonFile(requestsFile, serviceRequests);

  return res.json({
    status: "success",
    message: `Permintaan ${requestId} berhasil ditugaskan ke ${mechanic.fullName}.`,
    request: requestItem,
  });
});

app.get("/api/mechanic/requests", requireMechanic, (req, res) => {
  const mechanicRequests = serviceRequests.filter(
    (item) => item.assignedMechanicEmail === req.mechanicEmail
  );

  return res.json({
    status: "success",
    requests: mechanicRequests,
  });
});

app.post("/api/request/status", (req, res) => {
  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({
      status: "error",
      message: "ID permintaan dan status diperlukan.",
    });
  }

  const requestItem = serviceRequests.find((item) => item.id === requestId);
  if (!requestItem) {
    return res.status(404).json({
      status: "error",
      message: "Permintaan layanan tidak ditemukan.",
    });
  }

  const validStatuses = ["baru", "diproses", "selesai"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      status: "error",
      message: "Status permintaan tidak valid.",
    });
  }

  const cookies = parseCookies(req.headers.cookie);
  const isAdmin = cookies.adminToken && adminSessions.has(cookies.adminToken);
  const mechanicEmail = cookies.mechanicToken && mechanicSessions.get(cookies.mechanicToken);
  const isAssignedMechanic = mechanicEmail && requestItem.assignedMechanicEmail === mechanicEmail;

  if (!isAdmin && !isAssignedMechanic) {
    return res.status(403).json({
      status: "error",
      message: "Hanya admin atau mekanik yang ditugaskan dapat memperbarui status permintaan.",
    });
  }

  requestItem.status = status;
  saveJsonFile(requestsFile, serviceRequests);

  return res.json({
    status: "success",
    message: `Status permintaan ${requestId} berhasil diperbarui menjadi ${status}.`,
    request: requestItem,
  });
});

app.post("/api/admin/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.adminToken) {
    adminSessions.delete(cookies.adminToken);
  }

  res.setHeader(
    "Set-Cookie",
    "adminToken=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
  );

  return res.json({
    status: "success",
    message: "Logout admin berhasil.",
  });
});

app.post("/api/mechanic/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.mechanicToken) {
    mechanicSessions.delete(cookies.mechanicToken);
  }

  res.setHeader(
    "Set-Cookie",
    "mechanicToken=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
  );

  return res.json({
    status: "success",
    message: "Logout mekanik berhasil.",
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

