const countElement = document.getElementById("count");
const counterBtn = document.getElementById("counterBtn");
const demoForm = document.getElementById("demoForm");
const greeting = document.getElementById("greeting");
const yearElement = document.getElementById("year");
const statusBtn = document.getElementById("statusBtn");
const statusResult = document.getElementById("statusResult");
const serviceCatalogList = document.getElementById("serviceCatalogList");
const partsCatalogList = document.getElementById("partsCatalogList");
const copyResult = document.getElementById("copyResult");
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
const categoryFilter = document.getElementById("categoryFilter");
const requestSearchInput = document.getElementById("requestSearchInput");
const assignedMechanicFilter = document.getElementById("assignedMechanicFilter");
const paymentMethodInput = document.getElementById("paymentMethod");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const serverStatusBtn = document.getElementById("serverStatusBtn");
const serverStatusResult = document.getElementById("serverStatusResult");
const mechanicPanel = document.getElementById("mechanicPanel");
const mechanicLogoutBtn = document.getElementById("mechanicLogoutBtn");
const loadMechanicRequestsBtn = document.getElementById("loadMechanicRequestsBtn");
const mechanicRequestsList = document.getElementById("mechanicRequestsList");
const mechanicWelcome = document.getElementById("mechanicWelcome");
const mechanicStatusFilter = document.getElementById("mechanicStatusFilter");
const mechanicCategoryFilter = document.getElementById("mechanicCategoryFilter");
const mechanicProfileInfo = document.getElementById("mechanicProfileInfo");
const mechanicProfileForm = document.getElementById("mechanicProfileForm");
const mechanicProfileResult = document.getElementById("mechanicProfileResult");
const profilePhoneInput = document.getElementById("profilePhone");
const profileSkillsInput = document.getElementById("profileSkills");
const profilePasswordInput = document.getElementById("profilePassword");
const adminServiceForm = document.getElementById("adminServiceForm");
const adminServiceResult = document.getElementById("adminServiceResult");
const adminPartForm = document.getElementById("adminPartForm");
const adminPartResult = document.getElementById("adminPartResult");
const adminServiceCatalogList = document.getElementById("adminServiceCatalogList");
const adminPartCatalogList = document.getElementById("adminPartCatalogList");
const mechanicServiceForm = document.getElementById("mechanicServiceForm");
const mechanicServiceResult = document.getElementById("mechanicServiceResult");
const mechanicPartForm = document.getElementById("mechanicPartForm");
const mechanicPartResult = document.getElementById("mechanicPartResult");
const mechanicServiceCatalogList = document.getElementById("mechanicServiceCatalogList");
const mechanicPartCatalogList = document.getElementById("mechanicPartCatalogList");

let count = 0;
let adminLoggedIn = false;
let currentRequestFilter = "all";
let currentCategoryFilter = "all";
let currentMechanicStatusFilter = "all";
let currentMechanicCategoryFilter = "all";
let cachedRequests = [];
let cachedMechanics = [];
let cachedMechanicRequests = [];
let mechanicName = "";

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
    const category = formData.get("category").toString().trim();

    if (name.length < 3) {
      greeting.textContent = "Nama harus minimal 3 karakter.";
      return;
    }

    if (service.length < 5) {
      greeting.textContent = "Deskripsi layanan harus minimal 5 karakter.";
      return;
    }

    if (!category) {
      greeting.textContent = "Pilih kategori layanan.";
      return;
    }

        const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "";
    if (!paymentMethod) {
      greeting.textContent = "Pilih metode pembayaran.";
      return;
    }

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, service, category, paymentMethod }),
      });

      const data = await response.json();

      if (!response.ok) {
        greeting.textContent = data.message || "Terjadi kesalahan saat mengirim permintaan.";
        return;
      }

      greeting.innerHTML = `${data.message}<br /><strong>Pembayaran:</strong> ${data.paymentInstruction}`;
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
        credentials: "include",
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
        credentials: "include",
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
        loadAdminCatalogs();
      }
    } catch (error) {
      adminLoginResult.textContent = "Tidak dapat login admin. Coba lagi nanti.";
    }
  });
}

const renderMechanicRequestsList = (requests) => {
  if (!mechanicRequestsList) return;

  if (requests.length === 0) {
    mechanicRequestsList.innerHTML = "<p>Tidak ada permintaan layanan saat ini.</p>";
    return;
  }

  mechanicRequestsList.innerHTML = requests
    .map(
      (request) =>
        `<div class="mechanic-item" id="mechanic-request-${request.id}"><strong>${request.name}</strong> (${request.id})<p>Kategori: ${request.category}</p><p>Layanan: ${request.service}</p><p>Status: <span class="request-status">${request.status}</span></p><p>${new Date(request.createdAt).toLocaleString()}</p><div class="request-actions"><select id="mechanicStatusSelect-${request.id}"><option value="baru" ${request.status === "baru" ? "selected" : ""}>Baru</option><option value="diproses" ${request.status === "diproses" ? "selected" : ""}>Diproses</option><option value="selesai" ${request.status === "selesai" ? "selected" : ""}>Selesai</option></select><button class="btn-secondary update-status-btn" data-request-id="${request.id}">Update Status</button></div><p class="request-action-result" id="mechanicRequestResult-${request.id}"></p></div>`
    )
    .join("");

  const updateButtons = mechanicRequestsList.querySelectorAll(".update-status-btn");
  updateButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.dataset.requestId;
      const select = document.getElementById(`mechanicStatusSelect-${requestId}`);
      if (!select) return;
      const status = select.value;
      await updateRequestStatus(requestId, status);
    });
  });
};

const filterMechanicRequests = (requests, statusFilter, categoryFilter) => {
  let filtered = requests;

  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((request) => request.status === statusFilter);
  }

  if (categoryFilter && categoryFilter !== "all") {
    filtered = filtered.filter((request) => request.category === categoryFilter);
  }

  return filtered;
};

const assignRequestToMechanic = async (requestId, mechanicEmail) => {
  const resultElement = document.getElementById(`requestResult-${requestId}`);
  if (resultElement) {
    resultElement.textContent = "Menugaskan mekanik...";
  }

  try {
    const response = await fetch("/api/request/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ requestId, mechanicEmail }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (resultElement) {
        resultElement.textContent = data.message || "Gagal menugaskan mekanik.";
      }
      return;
    }

    if (resultElement) {
      resultElement.textContent = data.message || "Mekanik berhasil ditugaskan.";
    }

    loadRequests();
  } catch (error) {
    if (resultElement) {
      resultElement.textContent = "Tidak dapat terhubung ke server.";
    }
  }
};

const loadServiceCatalog = async () => {
  if (!serviceCatalogList) return;

  try {
    const response = await fetch("/api/services");
    const data = await response.json();
    if (!response.ok) {
      serviceCatalogList.innerHTML = "<p>Gagal memuat daftar jasa.</p>";
      return;
    }

    serviceCatalogList.innerHTML = data.services
      .map(
        (service) =>
          `<div class="catalog-item"><strong>${service.name}</strong><p>${service.description}</p><button class="btn-secondary" data-service="${service.name}" data-category="${service.category}">Pilih</button></div>`
      )
      .join("");

    const buttons = serviceCatalogList.querySelectorAll("button[data-service]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const serviceName = button.dataset.service;
        const serviceCategory = button.dataset.category;
        const serviceInput = document.getElementById("service");
        const categorySelect = document.getElementById("category");
        if (serviceInput) {
          serviceInput.value = serviceName;
        }
        if (categorySelect) {
          categorySelect.value = serviceCategory;
        }
      });
    });
  } catch (error) {
    serviceCatalogList.innerHTML = "<p>Tidak dapat memuat daftar jasa sekarang.</p>";
  }
};

const loadPartsCatalog = async () => {
  if (!partsCatalogList) return;

  try {
    const response = await fetch("/api/parts");
    const data = await response.json();
    if (!response.ok) {
      partsCatalogList.innerHTML = "<p>Gagal memuat daftar sparepart.</p>";
      return;
    }

    partsCatalogList.innerHTML = data.parts
      .map(
        (part) =>
          `<div class="catalog-item"><strong>${part.name}</strong><p>${part.description}</p><p><strong>${part.price}</strong></p></div>`
      )
      .join("");
  } catch (error) {
    partsCatalogList.innerHTML = "<p>Tidak dapat memuat daftar sparepart sekarang.</p>";
  }
};

const initPublicPage = async () => {
  await loadServiceCatalog();
  await loadPartsCatalog();
};

const loadAdminCatalogs = async () => {
  if (adminServiceCatalogList) {
    try {
      const response = await fetch("/api/services", { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        renderCatalogList(data.services, adminServiceCatalogList);
      }
    } catch (error) {
      adminServiceCatalogList.innerHTML = "<p>Tidak dapat memuat layanan admin.</p>";
    }
  }

  if (adminPartCatalogList) {
    try {
      const response = await fetch("/api/parts", { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        renderCatalogList(data.parts, adminPartCatalogList);
      }
    } catch (error) {
      adminPartCatalogList.innerHTML = "<p>Tidak dapat memuat sparepart admin.</p>";
    }
  }
};

const loadMechanicCatalogs = async () => {
  if (mechanicServiceCatalogList) {
    try {
      const response = await fetch("/api/services", { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        renderCatalogList(data.services, mechanicServiceCatalogList);
      }
    } catch (error) {
      mechanicServiceCatalogList.innerHTML = "<p>Tidak dapat memuat layanan mekanik.</p>";
    }
  }

  if (mechanicPartCatalogList) {
    try {
      const response = await fetch("/api/parts", { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        renderCatalogList(data.parts, mechanicPartCatalogList);
      }
    } catch (error) {
      mechanicPartCatalogList.innerHTML = "<p>Tidak dapat memuat sparepart mekanik.</p>";
    }
  }
};

const loadMechanicRequests = async () => {
  if (!mechanicRequestsList) return;

  try {
    const response = await fetch("/api/mechanic/requests", { credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      mechanicRequestsList.innerHTML = "<p>Gagal memuat permintaan mekanik.</p>";
      return;
    }

    cachedMechanicRequests = data.requests || [];
    renderMechanicRequestsList(filterMechanicRequests(cachedMechanicRequests, currentMechanicStatusFilter, currentMechanicCategoryFilter));
  } catch (error) {
    mechanicRequestsList.innerHTML = "<p>Tidak dapat memuat permintaan mekanik sekarang.</p>";
  }
};

const checkAdminSession = async () => {
  if (!adminPanel) return;

  try {
    const response = await fetch("/api/admin/status", { credentials: "include" });
    const data = await response.json();

    if (response.ok && data.loggedIn) {
      adminLoggedIn = true;
      adminPanel.classList.remove("hidden");
      loadMechanics();
      loadRequests();
      loadAdminCatalogs();
    }
  } catch (error) {
    // ignore session restore failure
  }
};

const loadMechanicProfile = async () => {
  if (!mechanicProfileInfo || !profilePhoneInput || !profileSkillsInput) return;

  try {
    const response = await fetch("/api/mechanic/profile", { credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      mechanicProfileInfo.innerHTML = "<p>Gagal memuat profil mekanik.</p>";
      return;
    }

    mechanicProfileInfo.innerHTML = `<p><strong>${data.profile.fullName}</strong> (${data.profile.email})</p><p>Telepon: ${data.profile.phone}</p><p>Keahlian: ${data.profile.skills}</p>`;
    profilePhoneInput.value = data.profile.phone;
    profileSkillsInput.value = data.profile.skills;
    profilePasswordInput.value = "";
  } catch (error) {
    mechanicProfileInfo.innerHTML = "<p>Tidak dapat memuat profil sekarang.</p>";
  }
};

const updateMechanicProfile = async (event) => {
  event.preventDefault();
  if (!profilePhoneInput || !profileSkillsInput || !mechanicProfileResult) return;

  const phone = profilePhoneInput.value.trim();
  const skills = profileSkillsInput.value.trim();
  const password = profilePasswordInput.value.trim();

  if (!phone || !skills) {
    mechanicProfileResult.textContent = "Nomor telepon dan keahlian tidak boleh kosong.";
    return;
  }

  mechanicProfileResult.textContent = "Menyimpan profil...";

  try {
    const response = await fetch("/api/mechanic/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, skills, password }),
    });

    const data = await response.json();
    mechanicProfileResult.textContent = data.message || "Profil berhasil diperbarui.";
    if (response.ok) {
      profilePasswordInput.value = "";
      loadMechanicProfile();
    }
  } catch (error) {
    mechanicProfileResult.textContent = "Tidak dapat menyimpan profil sekarang.";
  }
};

const checkMechanicSession = async () => {
  if (!mechanicPanel) return;

  try {
    const response = await fetch("/api/mechanic/status", { credentials: "include" });
    const data = await response.json();

    if (response.ok && data.loggedIn) {
      mechanicName = data.mechanic.email;
      if (mechanicPanel) {
        mechanicPanel.classList.remove("hidden");
      }
      if (mechanicWelcome) {
        mechanicWelcome.textContent = `Halo ${data.mechanic.fullName}, ini permintaan layanan terbaru.`;
      }
      await loadMechanicProfile();
      loadMechanicRequests();
    }
  } catch (error) {
    // ignore session restore failure
  }
};

const initApp = async () => {
  await checkAdminSession();
  await checkMechanicSession();
  await initPublicPage();
};

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
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      loginResult.textContent = data.message || "Login berhasil.";
      if (response.ok) {
        loginForm.reset();
        mechanicName = email;
        if (mechanicPanel) {
          mechanicPanel.classList.remove("hidden");
        }
        if (mechanicWelcome) {
          mechanicWelcome.textContent = `Halo ${email}, ini permintaan layanan terbaru.`;
        }
        await loadMechanicProfile();
        loadMechanicRequests();
        loadMechanicCatalogs();
      }
    } catch (error) {
      loginResult.textContent = "Tidak dapat login. Coba lagi nanti.";
    }
  });
}

if (loadMechanicRequestsBtn) {
  loadMechanicRequestsBtn.addEventListener("click", loadMechanicRequests);
}

if (mechanicStatusFilter) {
  mechanicStatusFilter.addEventListener("change", () => {
    currentMechanicStatusFilter = mechanicStatusFilter.value;
    if (cachedMechanicRequests.length > 0) {
      renderMechanicRequestsList(filterMechanicRequests(cachedMechanicRequests, currentMechanicStatusFilter, currentMechanicCategoryFilter));
    }
  });
}

if (mechanicCategoryFilter) {
  mechanicCategoryFilter.addEventListener("change", () => {
    currentMechanicCategoryFilter = mechanicCategoryFilter.value;
    if (cachedMechanicRequests.length > 0) {
      renderMechanicRequestsList(filterMechanicRequests(cachedMechanicRequests, currentMechanicStatusFilter, currentMechanicCategoryFilter));
    }
  });
}

if (mechanicLogoutBtn) {
  mechanicLogoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/mechanic/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      // ignore network error on logout
    }

    mechanicName = "";
    if (mechanicPanel) {
      mechanicPanel.classList.add("hidden");
    }
    loginResult.textContent = "Anda telah logout mekanik.";
  });
}

if (mechanicProfileForm) {
  mechanicProfileForm.addEventListener("submit", updateMechanicProfile);
}

const renderMechanicsList = (mechanics, requests = []) => {
  if (!mechanicsList) return;

  if (mechanics.length === 0) {
    mechanicsList.innerHTML = "<p>Tidak ada mekanik terdaftar saat ini.</p>";
    return;
  }

  const assignedCounts = requests.reduce((counts, item) => {
    if (item.assignedMechanicEmail) {
      counts[item.assignedMechanicEmail] = (counts[item.assignedMechanicEmail] || 0) + 1;
    }
    return counts;
  }, {});

  mechanicsList.innerHTML = mechanics
    .map(
      (mechanic) =>
        `<div class="mechanic-item"><strong>${mechanic.fullName}</strong><p>${mechanic.email} · ${mechanic.phone}</p><p>Keahlian: ${mechanic.skills}</p><p>Permintaan ditugaskan: ${assignedCounts[mechanic.email] || 0}</p></div>`
    )
    .join("");
};

const adminSummary = document.getElementById("adminSummary");
const summaryText = document.getElementById("summaryText");

const populateAssignedMechanicFilter = (mechanics) => {
  if (!assignedMechanicFilter) return;

  assignedMechanicFilter.innerHTML = '<option value="all">Semua Mekanik</option>' +
    mechanics
      .map((mechanic) =>
        `<option value="${mechanic.email}">${mechanic.fullName} (${mechanic.email})</option>`
      )
      .join("");
};

const loadMechanics = async () => {
  if (!mechanicsList) return;

  try {
    const response = await fetch("/api/mechanics", { credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      mechanicsList.innerHTML = "<p>Gagal memuat mekanik.</p>";
      return;
    }

    cachedMechanics = data.mechanics || [];
    populateAssignedMechanicFilter(cachedMechanics);
    renderMechanicsList(cachedMechanics, cachedRequests);
    updateAdminSummary(cachedMechanics, cachedRequests);
  } catch (error) {
    mechanicsList.innerHTML = "<p>Tidak dapat memuat mekanik sekarang.</p>";
  }
};

const filterRequests = (requests, statusFilter, categoryFilter, searchQuery, mechanicEmail) => {
  let filtered = requests;

  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((request) => request.status === statusFilter);
  }

  if (categoryFilter && categoryFilter !== "all") {
    filtered = filtered.filter((request) => request.category === categoryFilter);
  }

  if (mechanicEmail && mechanicEmail !== "all") {
    filtered = filtered.filter((request) => request.assignedMechanicEmail === mechanicEmail);
  }

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (request) =>
        request.name.toLowerCase().includes(lowerQuery) ||
        request.id.toLowerCase().includes(lowerQuery) ||
        (request.assignedMechanicEmail && request.assignedMechanicEmail.toLowerCase().includes(lowerQuery))
    );
  }

  return filtered;
};

const renderRequestsList = (requests) => {
  if (!requestsList) return;

  if (requests.length === 0) {
    requestsList.innerHTML = "<p>Tidak ada permintaan layanan saat ini.</p>";
    return;
  }

  const mechanicOptions = cachedMechanics.length
    ? `<option value="">Pilih mekanik</option>${cachedMechanics
      .map((mechanic) => `<option value="${mechanic.email}">${mechanic.fullName} (${mechanic.email})</option>`)
      .join("")}`
    : "<option value=\"\">Belum ada mekanik terdaftar</option>";

  requestsList.innerHTML = requests
    .map(
      (request) =>
        `<div class="mechanic-item" id="request-${request.id}"><strong>${request.name}</strong> (${request.id})<p>Kategori: ${request.category}</p><p>Layanan: ${request.service}</p><p>Ditugaskan: ${request.assignedMechanicEmail || "Belum ada"}</p><p>Status: <span class="request-status">${request.status}</span></p><p>${new Date(request.createdAt).toLocaleString()}</p><div class="request-actions"><select id="statusSelect-${request.id}"><option value="baru" ${request.status === "baru" ? "selected" : ""}>Baru</option><option value="diproses" ${request.status === "diproses" ? "selected" : ""}>Diproses</option><option value="selesai" ${request.status === "selesai" ? "selected" : ""}>Selesai</option></select><button class="btn-secondary update-status-btn" data-request-id="${request.id}">Update Status</button></div><div class="request-actions"><select id="assignMechanicSelect-${request.id}">${mechanicOptions}</select><button class="btn-secondary assign-mechanic-btn" data-request-id="${request.id}">Tugaskan</button></div><p class="request-action-result" id="requestResult-${request.id}"></p></div>`
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

  const assignButtons = document.querySelectorAll(".assign-mechanic-btn");
  assignButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.dataset.requestId;
      const select = document.getElementById(`assignMechanicSelect-${requestId}`);
      if (!select) return;
      const mechanicEmail = select.value;
      if (!mechanicEmail) return;
      await assignRequestToMechanic(requestId, mechanicEmail);
    });
  });
};

const saveCatalogItem = async (endpoint, payload, resultElement) => {
  if (resultElement) {
    resultElement.textContent = "Menyimpan...";
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      if (resultElement) {
        resultElement.textContent = data.message || "Gagal menyimpan katalog.";
      }
      return false;
    }

    if (resultElement) {
      resultElement.textContent = data.message || "Data katalog berhasil disimpan.";
    }

    return true;
  } catch (error) {
    if (resultElement) {
      resultElement.textContent = "Tidak dapat terhubung ke server.";
    }
    return false;
  }
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
      credentials: "include",
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

const updateAdminSummary = (mechanics, requests) => {
  if (!summaryText) return;

  const totalMechanics = mechanics.length;
  const totalRequests = requests.length;
  const statusCounts = requests.reduce(
    (counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    },
    { baru: 0, diproses: 0, selesai: 0 }
  );

  const categoryCounts = requests.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {});

  const assignedCounts = requests.reduce((counts, item) => {
    if (item.assignedMechanicEmail) {
      counts[item.assignedMechanicEmail] = (counts[item.assignedMechanicEmail] || 0) + 1;
    }
    return counts;
  }, {});

  const categorySummary = Object.entries(categoryCounts)
    .map(([category, count]) => `${category}: <strong>${count}</strong>`)
    .join(" · ");

  const topMechanics = Object.entries(assignedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([email, count]) => `${email} (${count})`)
    .join(" · ");

  summaryText.innerHTML = `Total mekanik: <strong>${totalMechanics}</strong> · Total permintaan: <strong>${totalRequests}</strong><br>Baru: <strong>${statusCounts.baru}</strong>, Diproses: <strong>${statusCounts.diproses}</strong>, Selesai: <strong>${statusCounts.selesai}</strong><br>Kategori: ${categorySummary}<br>Top mekanik: <strong>${topMechanics || "Belum ada penugasan"}</strong>`;
};

const handleCatalogForm = async (form, endpoint, resultElement) => {
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const price = formData.get("price")?.toString().trim() || "";
    const category = formData.get("category")?.toString().trim() || "";

    if (!name || !description || !price || (form.querySelector("select[name=category]") && !category)) {
      if (resultElement) {
        resultElement.textContent = "Semua bidang harus diisi.";
      }
      return;
    }

    const payload = { name, description, price };
    if (category) {
      payload.category = category;
    }

    const saved = await saveCatalogItem(endpoint, payload, resultElement);
    if (saved) {
      if (form.id.startsWith("admin")) {
        loadAdminCatalogs();
      } else if (form.id.startsWith("mechanic")) {
        loadMechanicCatalogs();
      }
      form.reset();
    }
  });
};

const loadRequests = async () => {
  if (!requestsList) return;

  try {
    const response = await fetch("/api/requests", { credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      requestsList.innerHTML = "<p>Gagal memuat permintaan layanan.</p>";
      return;
    }

    cachedRequests = data.requests || [];
    renderRequestsList(
      filterRequests(
        cachedRequests,
        currentRequestFilter,
        currentCategoryFilter,
        requestSearchInput ? requestSearchInput.value : "",
        assignedMechanicFilter ? assignedMechanicFilter.value : "all"
      )
    );
    renderMechanicsList(cachedMechanics, cachedRequests);
    updateAdminSummary(cachedMechanics, cachedRequests);
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

handleCatalogForm(adminServiceForm, "/api/catalog/service", adminServiceResult);
handleCatalogForm(adminPartForm, "/api/catalog/part", adminPartResult);
handleCatalogForm(mechanicServiceForm, "/api/catalog/service", mechanicServiceResult);
handleCatalogForm(mechanicPartForm, "/api/catalog/part", mechanicPartResult);

const refreshAdminRequestList = () => {
  if (cachedRequests.length === 0) return;
  const filtered = filterRequests(
    cachedRequests,
    currentRequestFilter,
    currentCategoryFilter,
    requestSearchInput ? requestSearchInput.value.trim() : "",
    assignedMechanicFilter ? assignedMechanicFilter.value : "all"
  );
  renderRequestsList(filtered);
};

if (requestFilter) {
  requestFilter.addEventListener("change", () => {
    currentRequestFilter = requestFilter.value;
    refreshAdminRequestList();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    currentCategoryFilter = categoryFilter.value;
    refreshAdminRequestList();
  });
}

if (requestSearchInput) {
  requestSearchInput.addEventListener("input", () => {
    refreshAdminRequestList();
  });
}

if (assignedMechanicFilter) {
  assignedMechanicFilter.addEventListener("change", () => {
    refreshAdminRequestList();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target.matches(".btn-copy")) {
    const text = target.dataset.copy;
    navigator.clipboard.writeText(text).then(() => {
      if (copyResult) {
        copyResult.textContent = `Tersalin: ${text}`;
      }
    });
  }
});

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
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

initApp();
