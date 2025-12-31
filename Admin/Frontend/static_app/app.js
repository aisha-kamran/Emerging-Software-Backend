// Simple client-side router and page renderers
const routes = {
  '/': homePage,
  '/dashboard': dashboardPage,
  '/admins': adminsPage,
  '/blogs': blogsPage,
  '/logs': logsPage,
  '/settings': settingsPage,
  '/login': loginPage,
};

// Backend API base (used by static demo to optionally call real backend)
const API_BASE = 'http://localhost:8000';

function navigate(path) {
  window.location.hash = '#'+path;
}

function router() {
  const path = location.hash.replace('#','') || '/';
  const page = routes[path] || notFoundPage;
  document.getElementById('app').innerHTML = '';
  document.getElementById('app').appendChild(page());
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// --- Pages ---
function homePage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Welcome to AdminPanel (Static)</h2>
    <p class="small">This is a static HTML/CSS/JS approximation of the original React frontend.</p>
    <div class="grid" style="margin-top:16px">
      <div class="list-item"><strong>Overview</strong><div class="small">Quick stats and links</div></div>
      <div class="list-item"><strong>Users</strong><div class="small">Manage admin users</div></div>
      <div class="list-item"><strong>Settings</strong><div class="small">App config</div></div>
    </div>
  `;
  return el;
}

function dashboardPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Dashboard</h2>
    <p class="small">Key metrics snapshot</p>
    <div style="display:flex;gap:12px;margin-top:14px">
      <div class="list-item" style="flex:1"><strong>Visitors</strong><div class="small">1,234</div></div>
      <div class="list-item" style="flex:1"><strong>Active Admins</strong><div class="small">4</div></div>
      <div class="list-item" style="flex:1"><strong>Errors</strong><div class="small">0</div></div>
    </div>
  `;
  return el;
}

function adminsPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Admins</h2>
    <p class="small">List of admin accounts</p>
    <div id="adminsList" style="margin-top:12px">
      <div class="list-item">Loading admins...</div>
    </div>
  `;

  // Try to fetch admins from backend using stored token; fall back to static demo list
  setTimeout(async () => {
    const container = el.querySelector('#adminsList');
    const token = localStorage.getItem('api_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/admin/list`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const admins = await res.json();
          container.innerHTML = '';
          admins.forEach(a => {
            const email = `${a.username}@admin.com`;
            const roleLabel = a.is_super_admin ? '(Super Admin)' : '(Admin)';
            const item = document.createElement('div');
            item.className = 'list-item';
            item.style.marginTop = '8px';
            item.textContent = `${email} `;
            const span = document.createElement('span');
            span.className = 'small';
            span.textContent = ` ${roleLabel}`;
            item.appendChild(span);
            container.appendChild(item);
          });
          return;
        }
      } catch (e) {
        // fallthrough to static list
      }
    }

    // Fallback static list
    container.innerHTML = `
      <div class="list-item">superadmin@admin.com <span class="small">(Super Admin)</span></div>
      <div class="list-item" style="margin-top:8px">admin@admin.com <span class="small">(Admin)</span></div>
    `;
  }, 10);
  return el;
}

function blogsPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Blogs</h2>
    <p class="small">Manage blog posts</p>
    <div style="margin-top:12px" class="grid">
      <div class="list-item">Blog 1</div>
      <div class="list-item">Blog 2</div>
    </div>
  `;
  return el;
}

function logsPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Logs</h2>
    <p class="small">System logs (static)</p>
    <div style="margin-top:12px" class="list-item small">No recent logs</div>
  `;
  return el;
}

function settingsPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Settings</h2>
    <p class="small">Application settings</p>
    <div style="margin-top:12px" class="list-item small">Theme: Dark</div>
  `;
  return el;
}

function notFoundPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">404 — Not Found</h2>
    <p class="small">The page you're looking for doesn't exist.</p>
  `;
  return el;
}

// --- Login page with demo credentials ---
function loginPage(){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h2 class="h1">Sign In</h2>
    <p class="small">Use demo accounts: superadmin@admin.com or admin@admin.com</p>
    <form id="loginForm" style="margin-top:12px">
      <div class="form-row"><input id="email" class="input" placeholder="Email" required></div>
      <div class="form-row"><input id="password" type="password" class="input" placeholder="Password" required></div>
      <div class="form-row"><button class="btn" type="submit">Sign In</button></div>
      <div id="loginError" style="display:none" class="alert">Invalid credentials</div>
    </form>
  `;

  setTimeout(()=>{
    const form = el.querySelector('#loginForm');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = el.querySelector('#email').value.trim();
      const password = el.querySelector('#password').value;
      const username = email.includes('@') ? email.split('@')[0] : email;

      // Try backend login first
      (async () => {
        try {
          const body = new URLSearchParams();
          body.append('username', username);
          body.append('password', password);
          const resp = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
          });
          if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem('api_token', data.access_token);

            // Fetch admin list to determine role
            const listRes = await fetch(`${API_BASE}/admin/list`, { headers: { Authorization: `Bearer ${data.access_token}` } });
            if (listRes.ok) {
              const admins = await listRes.json();
              const match = admins.find(a => a.username === username);
              const role = match && match.is_super_admin ? 'superadmin' : 'admin';
              localStorage.setItem('admin_user', email);
              localStorage.setItem('admin_role', role);
              navigate('/dashboard');
              return;
            }
          }
        } catch (err) {
          // ignore and fallback to demo
        }

        // Fallback demo behavior: accept built-in demo accounts
        if(email === 'superadmin@admin.com' || email === 'admin@admin.com'){
          localStorage.setItem('admin_user', email);
          localStorage.setItem('admin_role', email === 'superadmin@admin.com' ? 'superadmin' : 'admin');
          navigate('/dashboard');
        } else {
          const err = el.querySelector('#loginError');
          err.style.display = 'block';
          setTimeout(()=> err.style.display='none', 3000);
        }
      })();
    });
  },20);

  return el;
}

// Update nav active state
function updateNav(){
  const links = document.querySelectorAll('[data-link]');
  links.forEach(a=>{
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if(location.hash === href) a.classList.add('active');
    if(location.hash === '' && href === '#/') a.classList.add('active');
  });
}

// Hide or show Admins nav link based on role (superadmin only)
function refreshNavVisibility(){
  const role = localStorage.getItem('admin_role');
  const adminLink = document.querySelector('a[data-link][href="#/admins"]');
  if (!adminLink) return;
  if (role === 'superadmin') {
    adminLink.style.display = '';
  } else {
    adminLink.style.display = 'none';
  }
}

window.addEventListener('hashchange', ()=>{ updateNav(); refreshNavVisibility(); });
window.addEventListener('load', ()=>{ updateNav(); refreshNavVisibility(); });

window.addEventListener('hashchange', updateNav);
window.addEventListener('load', updateNav);

// courtesy: intercept top nav clicks to use hash navigation
document.addEventListener('click',(e)=>{
  const a = e.target.closest('a[data-link]');
  if(a){
    e.preventDefault();
    const href = a.getAttribute('href');
    location.hash = href.replace('#','');
  }
});