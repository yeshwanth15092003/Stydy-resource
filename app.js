/* ================= STORAGE ================= */
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getResources() {
  return JSON.parse(localStorage.getItem("resources")) || [];
}
function saveResources(resources) {
  localStorage.setItem("resources", JSON.stringify(resources));
}

/* ================= STATE ================= */
let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
const authMsg = document.getElementById("authMsg");

/* ================= PASSWORD ================= */
function isStrongPassword(p) {
  return p.length >= 8 &&
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[\W]/.test(p);
}

/* ================= URL VALIDATION ================= */
function isValidURL(url) {
  return /^https?:\/\/.+/.test(url);
}

/* ================= SIGNUP ================= */
function signup(username, password) {
  if (!username || !password) {
    authMsg.innerText = "Fill all fields";
    return;
  }

  if (!isStrongPassword(password)) {
    authMsg.innerText = "Password must be strong";
    return;
  }

  let users = getUsers();

  if (users.find(u => u.username === username)) {
    authMsg.innerText = "User already exists";
    return;
  }

  const role = username.toLowerCase() === "admin" ? "admin" : "user";

  users.push({ username, password, role });
  saveUsers(users);

  authMsg.style.color = "lightgreen";
  authMsg.innerText = "Signup successful!";
}

/* ================= LOGIN ================= */
function login(username, password) {
  let users = getUsers();

  let user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    authMsg.innerText = "Invalid credentials";
    return;
  }

  currentUser = user;
  sessionStorage.setItem("currentUser", JSON.stringify(user));

  initApp();
}

/* ================= INIT ================= */
function initApp() {
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");

  document.getElementById("currentUser").innerText =
    currentUser.username + (currentUser.role === "admin" ? " (Admin)" : "");

  renderResources();
}

/* ================= LOGOUT ================= */
function logout() {
  sessionStorage.removeItem("currentUser");
  location.reload();
}

/* ================= UPLOAD ================= */
function uploadResource() {
  let title = document.getElementById("title").value.trim();
  let subject = document.getElementById("subject").value.trim();
  let description = document.getElementById("description").value.trim();
  let link = document.getElementById("link").value.trim();

  if (!title || !subject || !link) {
    return alert("Fill required fields");
  }

  if (!isValidURL(link)) {
    return alert("Enter a valid link (must start with http/https)");
  }

  let resources = getResources();

  resources.push({
    id: Date.now(),
    title,
    subject,
    description,
    link,
    uploadedBy: currentUser.username
  });

  saveResources(resources);

  // CLEAR INPUTS
  document.getElementById("title").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("description").value = "";
  document.getElementById("link").value = "";

  renderResources();
}

/* ================= DELETE ================= */
function deleteResource(id) {
  if (currentUser.role !== "admin") {
    alert("Only admin can delete");
    return;
  }

  if (!confirm("Delete this resource?")) return;

  let resources = getResources();
  resources = resources.filter(r => r.id !== id);

  saveResources(resources);
  renderResources();
}

/* ================= RENDER ================= */
function renderResources() {
  const container = document.getElementById("resources");
  const search = document.getElementById("localSearch").value.toLowerCase();

  let resources = getResources();

  container.innerHTML = "";

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search) ||
    r.subject.toLowerCase().includes(search) ||
    (r.description && r.description.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No matching resources found.</p>";
    return;
  }

  filtered.forEach(r => {
    container.innerHTML += `
      <div class="resource">
        <h4>${r.title}</h4>
        <p><b>Subject:</b> ${r.subject}</p>
        <p>${r.description || ""}</p>
        <p><small>Uploaded by: ${r.uploadedBy}</small></p>
        <a href="${r.link}" target="_blank">📥 Open / Download</a>
        ${
          currentUser.role === "admin"
            ? `<br><button onclick="deleteResource(${r.id})">🗑 Delete</button>`
            : ""
        }
      </div>
    `;
  });
}

/* ================= ONLINE SEARCH ================= */
function searchOnlineNotes() {
  const query = document.getElementById("searchOnline").value.trim();

  if (!query) {
    alert("Enter a topic");
    return;
  }

  const url =
    "https://www.google.com/search?q=" +
    encodeURIComponent(query + " engineering notes filetype:pdf");

  window.open(url, "_blank");
}

/* ================= EVENTS ================= */
document.getElementById("authForm").addEventListener("submit", function(e) {
  e.preventDefault();

  login(
    document.getElementById("username").value.trim(),
    document.getElementById("password").value.trim()
  );
});

document.getElementById("signupBtn").addEventListener("click", function() {
  signup(
    document.getElementById("username").value.trim(),
    document.getElementById("password").value.trim()
  );
});

/* ================= AUTO LOGIN ================= */
window.onload = function () {
  if (currentUser) {
    initApp();
  }
};