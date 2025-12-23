# Quick Reference Guide

## API Endpoints Quick Lookup

### Authentication
```bash
# Login (get JWT token)
curl -X POST http://localhost:8000/admin/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# Response:
# {"access_token": "eyJhbGciOiJIUzI1NiI...", "token_type": "bearer"}
```

### Blog Operations
```bash
# Get all blogs (public - no auth needed)
curl http://localhost:8000/blogs

# Get single blog (public - no auth needed)
curl http://localhost:8000/blogs/1

# Create blog (admin only - requires token)
curl -X POST http://localhost:8000/blogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blog Title",
    "content": "Blog content...",
    "author": "Author Name"
  }'

# Update blog (admin only - requires token)
curl -X PUT http://localhost:8000/blogs/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Delete blog (admin only - requires token)
curl -X DELETE http://localhost:8000/blogs/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Management
```bash
# List all admins (admin only)
curl http://localhost:8000/admin/list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create new admin (admin only)
curl -X POST http://localhost:8000/admin/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "securepassword123"
  }'

# Delete admin (super-admin only)
curl -X DELETE http://localhost:8000/admin/2 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

### Health Check
```bash
curl http://localhost:8000/health
# {"status": "healthy", "service": "Blogs & Admin API"}
```

---

## Database Models

### Admin Table
```sql
admins:
  id (INTEGER, PK)
  username (VARCHAR, UNIQUE)
  hashed_password (VARCHAR)
  is_super_admin (BOOLEAN)
  created_at (DATETIME)
  updated_at (DATETIME)
```

### Blog Table
```sql
blogs:
  id (INTEGER, PK)
  title (VARCHAR)
  content (TEXT)
  author (VARCHAR)
  created_at (DATETIME)
  updated_at (DATETIME)
```

---

## Environment Variables

```dotenv
# Database (choose one format)
DATABASE_URL=postgresql://user:pass@localhost:5432/blog_db
# or Supabase
DATABASE_URL=postgresql://postgres.xxx:pass@xxx.postgres.supabase.co:5432/postgres
# or Neon
DATABASE_URL=postgresql://user:pass@xxx.neon.tech/dbname?sslmode=require

# JWT
SECRET_KEY=your-secret-key-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URLS=http://localhost:3000,http://localhost:5173
```

---

## Common Tasks

### Task: Create Super-Admin
```python
from database import SessionLocal, Base, engine
from models import Admin
from auth import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()
admin = Admin(
    username="admin",
    hashed_password=get_password_hash("secure_password"),
    is_super_admin=True
)
db.add(admin)
db.commit()
```

### Task: Reset Admin Password
```python
from database import SessionLocal
from models import Admin
from auth import get_password_hash

db = SessionLocal()
admin = db.query(Admin).filter(Admin.username == "admin").first()
admin.hashed_password = get_password_hash("new_password")
db.commit()
```

### Task: List All Admins
```python
from database import SessionLocal
from models import Admin

db = SessionLocal()
admins = db.query(Admin).all()
for admin in admins:
    print(f"{admin.username} - SuperAdmin: {admin.is_super_admin}")
```

### Task: Delete Blog by ID
```python
from database import SessionLocal
from models import Blog

db = SessionLocal()
blog = db.query(Blog).filter(Blog.id == 1).first()
if blog:
    db.delete(blog)
    db.commit()
```

### Task: Get Recent Blogs
```python
from database import SessionLocal
from models import Blog

db = SessionLocal()
recent = db.query(Blog).order_by(Blog.created_at.desc()).limit(5).all()
```

---

## Frontend JavaScript Examples

### Store Token
```javascript
const token = localStorage.getItem('token');
```

### Create Fetch Helper
```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };
  
  return fetch(`http://localhost:8000${endpoint}`, options)
    .then(r => r.json());
}
```

### Login
```javascript
const response = await apiCall('/admin/login', 'POST', {
  username: 'admin',
  password: 'password123'
});
localStorage.setItem('token', response.access_token);
```

### Get Blogs
```javascript
const blogs = await apiCall('/blogs');
```

### Create Blog
```javascript
await apiCall('/blogs', 'POST', {
  title: 'New Blog',
  content: 'Content here',
  author: 'John Doe'
});
```

### Update Blog
```javascript
await apiCall('/blogs/1', 'PUT', {
  title: 'Updated Title'
});
```

### Delete Blog
```javascript
await apiCall('/blogs/1', 'DELETE');
```

---

## Error Codes

| Status | Meaning | Solution |
|--------|---------|----------|
| 200 | Success | ✅ All good |
| 201 | Created | ✅ Resource created |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Send valid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check server logs |

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Could not validate credentials" | Check JWT token is valid/not expired |
| "Database connection refused" | Verify DATABASE_URL and DB is running |
| "CORS error" | Add frontend URL to FRONTEND_URLS |
| "Invalid credentials" | Check username/password at login |
| "Username already registered" | Use different username for new admin |

---

## Performance Tips

1. **Pagination**: Use `?skip=0&limit=10` for large blog lists
2. **Caching**: Add Redis for frequently accessed blogs (future)
3. **Indexes**: Database creates indexes automatically for common fields
4. **Connections**: Connection pooling enabled (max 30 concurrent)

---

## Security Reminders

- ✅ Never commit .env file
- ✅ Use HTTPS in production
- ✅ Generate strong SECRET_KEY
- ✅ Rotate tokens regularly
- ✅ Monitor failed login attempts
- ✅ Keep dependencies updated
- ✅ Use strong admin passwords (8+ chars)

---

## Files Overview

| File | Purpose |
|------|---------|
| main.py | All API endpoints |
| models.py | Database tables (Admin, Blog) |
| auth.py | JWT & password handling |
| schemas.py | Request/response validation |
| database.py | Database connection & session |
| requirements.txt | Python dependencies |
| .env | Configuration variables |

---

## Documentation Links

- **Full Implementation**: See IMPLEMENTATION.md
- **Deployment Guide**: See DEPLOYMENT.md
- **API Docs**: http://localhost:8000/docs (Swagger)
- **OpenAPI Schema**: http://localhost:8000/openapi.json

---

## Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# List blogs
curl http://localhost:8000/blogs

# Swagger UI
Open: http://localhost:8000/docs
```

---

## Support

For issues, check:
1. .env file configuration
2. DATABASE_URL format
3. Server logs (see DEPLOYMENT.md)
4. API documentation: /docs endpoint
