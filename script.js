const countElement = document.getElementById("count");
const counterBtn = document.getElementById("counterBtn");
const demoForm = document.getElementById("demoForm");
const greeting = document.getElementById("greeting");
const yearElement = document.getElementById("year");
const statusBtn = document.getElementById("statusBtn");
const statusResult = document.getElementById("statusResult");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const registerResult = document.getElementById("registerResult");
const loginResult = document.getElementById("loginResult");
const adminLoginResult = document.getElementById("adminLoginResult");
const adminPanel = document.getElementById("adminPanel");
const loadMechanicsBtn = document.getElementById("loadMechanicsBtn");
const mechanicsList = document.getElementById("mechanicsList");
const loadRequestsBtn = document.getElementById("loadRequestsBtn");
const requestsList = document.getElementById("requestsList");
const requestFilter = document.getElementById("requestFilter");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const serverStatusBtn = document.getElementById("serverStatusBtn");
const serverStatusResult = document.getElementById("serverStatusResult");

let count = 0;
let adminLoggedIn = false;
let currentRequestFilter = "all";
let cachedRequests = [];

if (counterBtn && countElement) {
  counterBtn.addEventListener("click", () => {
    count += 1;
    countElement.textContent = count;
    counterBtn.textContent = `Estimasi permintaan: ${count}`;
  });
}

if (demoForm && greeting) {
  demoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(demoForm);
    const name = formData.get("name").toString().trim();
    const service = formData.get("service").toString().trim();

    if (name.length < 3) {
      greeting.textContent = "Nama harus minimal 3 karakter.";
      return;
    }

    if (service.length < 5) {
      greeting.textContent = "Deskripsi layanan harus minimal 5 karakter.";
      return;
    }

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, service }),
      });

      const data = await response.json();

      if (!response.ok) {
        greeting.textContent = data.message || "Terjadi kesalahan saat mengirim permintaan.";
        return;
      }

      greeting.textContent = data.message;
      demoForm.reset();
    } catch (error) {
      greeting.textContent = "Tidak dapat terhubung ke server. Coba lagi nanti.";
    }
  });
}

if (statusBtn && statusResult) {
  statusBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/status");
      const data = await response.json();

      if (!response.ok) {
        statusResult.textContent = "Server tidak aktif.";
        return;
      }

      statusResult.textContent = `${data.status.toUpperCase()}: ${data.message}`;
    } catch (error) {
      statusResult.textContent = "Tidak dapat terhubung ke server.";
    }
  });
}

if (registerForm && registerResult) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const fullName = formData.get("fullName").toString().trim();
    const email = formData.get("email").toString().trim();
    const phone = formData.get("phone").toString().trim();
    const skills = formData.get("skills").toString().trim();
    const password = formData.get("password").toString().trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^08[0-9]{8,12}$/;

    if (fullName.length < 3) {
      registerResult.textContent = "Nama lengkap minimal 3 karakter.";
      return;
    }

    if (!emailPattern.test(email)) {
      registerResult.textContent = "Email tidak valid.";
      return;
    }

    if (!phonePattern.test(phone)) {
      registerResult.textContent = "Nomor telepon harus dimulai dengan 08 dan berisi 10-14 angka.";
      return;
    }

    if (skills.length < 5) {
      registerResult.textContent = "Tuliskan keahlian mekanik minimal 5 karakter.";
      return;
    }

    if (password.length < 6) {
      registerResult.textContent = "Kata sandi minimal 6 karakter.";
      return;
    }

    try {
      const response = await fetch("/api/mechanic/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, skills, password }),
      });

      const data = await response.json();
      registerResult.textContent = data.message || "Pendaftaran berhasil.";
      if (response.ok) {
        registerForm.reset();
      }
    } catch (error) {
      registerResult.textContent = "Tidak dapat mendaftar. Coba lagi nanti.";
    }
  });
}

if (loginForm && loginResult) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get("loginEmail").toString().trim();
    const password = formData.get("loginPassword").toString().trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      loginResult.textContent = "Email tidak valid.";
      return;
    }

    if (password.length < 6) {
      loginResult.textContent = "Kata sandi minimal 6 karakter.";
      return;
    }

    try {
      const response = await fetch("/api/mechanic/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      loginResult.textContent = data.message || "Login berhasil.";
      if (response.ok) {
        loginForm.reset();
      }
    } catch (error) {
      loginResult.textContent = "Tidak dapat login. Coba lagi nanti.";
    }
  });
}

if (adminLoginForm && adminLoginResult) {
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(adminLoginForm);
    const email = formData.get("adminEmail").toString().trim();
    const password = formData.get("adminPassword").toString().trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      adminLoginResult.textContent = "Email admin tidak valid.";
      return;
    }

    if (password.length < 6) {
      adminLoginResult.textContent = "Kata sandi admin minimal 6 karakter.";
      return;
    }

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      adminLoginResult.textContent = data.message || "Login admin berhasil.";
      if (response.ok) {
        adminLoginForm.reset();
        if (adminPanel) {
          adminPanel.classList.remove("hidden");
        }
        adminLoggedIn = true;
        loadMechanics();
        loadRequests();
      }
    } catch (error) {
      adminLoginResult.textContent = "Tidak dapat login admin. Coba lagi nanti.";
    }
  });
}

const renderMechanicsList = (mechanics) => {
  if (!mechanicsList) return;

  if (mechanics.length === 0) {
    mechanicsList.innerHTML = "<p>Tidak ada mekanik terdaftar saat ini.</p>";
    return;
  }

  mechanicsList.innerHTML = mechanics
    .map(
      (mechanic) =>
        `<div class="mechanic-item"><strong>${mechanic.fullName}</strong><p>${mechanic.email} · ${mechanic.phone}</p><p>Keahlian: ${mechanic.skills}</p></div>`
    )
    .join("");
};

const loadMechanics = async () => {
  if (!mechanicsList) return;

  try {
    const response = await fetch("/api/mechanics");
    const data = await response.json();

    if (!response.ok) {
      mechanicsList.innerHTML = "<p>Gagal memuat mekanik.</p>";
      return;
    }

    renderMechanicsList(data.mechanics || []);
  } catch (error) {
    mechanicsList.innerHTML = "<p>Tidak dapat memuat mekanik sekarang.</p>";
  }
};

const filterRequests = (requests, filter) => {
  if (!requests || filter === "all") return requests;
  return requests.filter((request) => request.status === filter);
};

const renderRequestsList = (requests) => {
  if (!requestsList) return;

  if (requests.length === 0) {
    requestsList.innerHTML = "<p>Tidak ada permintaan layanan saat ini.</p>";
    return;
  }

  requestsList.innerHTML = requests
    .map(
      (request) =>
        `<div class="mechanic-item" id="request-${request.id}"><strong>${request.name}</strong> (${request.id})<p>Layanan: ${request.service}</p><p>Status: <span class="request-status">${request.status}</span></p><p>${new Date(request.createdAt).toLocaleString()}</p><div class="request-actions"><select id="statusSelect-${request.id}"><option value="baru" ${request.status === "baru" ? "selected" : ""}>Baru</option><option value="diproses" ${request.status === "diproses" ? "selected" : ""}>Diproses</option><option value="selesai" ${request.status === "selesai" ? "selected" : ""}>Selesai</option></select><button class="btn-secondary update-status-btn" data-request-id="${request.id}">Update Status</button></div><p class="request-action-result" id="requestResult-${request.id}"></p></div>`
    )
    .join("");

  const updateButtons = document.querySelectorAll(".update-status-btn");
  updateButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.dataset.requestId;
      const select = document.getElementById(`statusSelect-${requestId}`);
      if (!select) return;
      const status = select.value;
      await updateRequestStatus(requestId, status);
    });
  });
};

const updateRequestStatus = async (requestId, status) => {
  const resultElement = document.getElementById(`requestResult-${requestId}`);
  if (resultElement) {
    resultElement.textContent = "Memperbarui status...";
  }

  try {
    const response = await fetch("/api/request/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (resultElement) {
        resultElement.textContent = data.message || "Gagal memperbarui status.";
      }
      return;
    }

    if (resultElement) {
      resultElement.textContent = data.message || "Status berhasil diperbarui.";
    }

    const statusText = document.querySelector(`#request-${requestId} .request-status`);
    if (statusText) {
      statusText.textContent = status;
    }
  } catch (error) {
    if (resultElement) {
      resultElement.textContent = "Tidak dapat terhubung ke server.";
    }
  }
};

const loadRequests = async () => {
  if (!requestsList) return;

  try {
    const response = await fetch("/api/requests");
    const data = await response.json();

    if (!response.ok) {
      requestsList.innerHTML = "<p>Gagal memuat permintaan layanan.</p>";
      return;
    }

    cachedRequests = data.requests || [];
    renderRequestsList(filterRequests(cachedRequests, currentRequestFilter));
  } catch (error) {
    requestsList.innerHTML = "<p>Tidak dapat memuat permintaan layanan sekarang.</p>";
  }
};

if (loadMechanicsBtn) {
  loadMechanicsBtn.addEventListener("click", loadMechanics);
}

if (loadRequestsBtn) {
  loadRequestsBtn.addEventListener("click", loadRequests);
}

if (requestFilter) {
  requestFilter.addEventListener("change", () => {
    currentRequestFilter = requestFilter.value;
    if (cachedRequests.length > 0) {
      renderRequestsList(filterRequests(cachedRequests, currentRequestFilter));
    }
  });
}

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      // ignore network error on logout
    }

    adminLoggedIn = false;
    if (adminPanel) {
      adminPanel.classList.add("hidden");
    }
    adminLoginResult.textContent = "Anda telah logout.";
  });
}

if (serverStatusBtn && serverStatusResult) {
  serverStatusBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/status");
      const data = await response.json();

      if (!response.ok) {
        serverStatusResult.textContent = "Server tidak aktif.";
        return;
      }

      serverStatusResult.textContent = `${data.status.toUpperCase()}: ${data.message}`;
    } catch (error) {
      serverStatusResult.textContent = "Tidak dapat terhubung ke server.";
    }
  });
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
