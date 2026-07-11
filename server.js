const express = require("express");
const path = require("path");
const app = express();

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const mechanics = [];
const adminUser = {
  email: "admin@bengkel.com",
  password: "admin123",
};

app.get("/api/status", (req, res) => {
  res.json({
    status: "active",
    message: "Server UMKM Bengkel berjalan dan siap menerima permintaan.",
    timestamp: new Date().toISOString(),
  });
});

const serviceRequests = [];

app.post("/api/request", (req, res) => {
  const { name, service } = req.body;

  if (!name || !service) {
    return res.status(400).json({
      status: "error",
      message: "Nama dan layanan diperlukan.",
    });
  }

  const requestId = `REQ-${Math.floor(Math.random() * 900000 + 100000)}`;
  const requestItem = {
    id: requestId,
    name,
    service,
    createdAt: new Date().toISOString(),
    status: "baru",
  };

  serviceRequests.push(requestItem);

  return res.json({
    status: "success",
    message: `Halo ${name}, permintaan layanan '${service}' telah diterima. Mekanik terdaftar akan segera menghubungi Anda.`,
    requestId,
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

  return res.json({
    status: "success",
    message: "Login admin berhasil. Selamat datang di dashboard admin.",
  });
});

app.get("/api/mechanics", (req, res) => {
  return res.json({
    status: "success",
    mechanics: mechanics.map(({ password, ...rest }) => rest),
  });
});

app.get("/api/requests", (req, res) => {
  return res.json({
    status: "success",
    requests: serviceRequests,
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

  requestItem.status = status;

  return res.json({
    status: "success",
    message: `Status permintaan ${requestId} berhasil diperbarui menjadi ${status}.`,
    request: requestItem,
  });
});

app.post("/api/admin/logout", (req, res) => {
  return res.json({
    status: "success",
    message: "Logout admin berhasil.",
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

