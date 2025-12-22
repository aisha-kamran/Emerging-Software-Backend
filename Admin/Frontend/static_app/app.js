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
    <div style="margin-top:12px">
      <div class="list-item">superadmin@admin.com <span class="small">(Super Admin)</span></div>
      <div class="list-item" style="margin-top:8px">admin@admin.com <span class="small">(Admin)</span></div>
    </div>
  `;
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
      // demo accepts any password
      if(email === 'superadmin@admin.com' || email === 'admin@admin.com'){
        // fake login: store user in localStorage
        localStorage.setItem('admin_user', email);
        // redirect to dashboard
        navigate('/dashboard');
      } else {
        const err = el.querySelector('#loginError');
        err.style.display = 'block';
        setTimeout(()=> err.style.display='none', 3000);
      }
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