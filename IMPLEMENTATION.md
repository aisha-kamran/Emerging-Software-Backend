# Blogs & Admin System - Production-Ready Implementation

## Overview
A secure, production-ready FastAPI system with JWT authentication for admin management and blog CRUD operations.

## Files Modified/Created

### 1. **requirements.txt** - Updated Dependencies
All required packages pinned to stable versions:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `psycopg2-binary` - PostgreSQL driver
- `python-jose[cryptography]` - JWT handling
- `passlib[bcrypt]` - Password hashing
- `pydantic` - Data validation
- `python-dotenv` - Environment variables

### 2. **models.py** - Enhanced Database Models

#### `Admin` Model
```python
class Admin:
    id: int (primary key)
    username: str (unique)
    hashed_password: str
    is_super_admin: bool (only one super-admin)
    created_at: datetime
    updated_at: datetime
```

#### `Blog` Model
```python
class Blog:
    id: int (primary key)
    title: str
    content: text
    author: str
    created_at: datetime
    updated_at: datetime
```

### 3. **database.py** - Environment-Based Configuration
- Reads `DATABASE_URL` from environment variables
- Supports Supabase, Neon, and local PostgreSQL
- Connection pooling enabled for production
- Database session dependency injection

### 4. **auth.py** - Secure Authentication
- **Password Hashing**: bcrypt via passlib
- **JWT Tokens**: Using python-jose
- **Functions**:
  - `verify_password()` - Validate password
  - `get_password_hash()` - Hash password securely
  - `authenticate_admin()` - Verify credentials
  - `create_access_token()` - Generate JWT
  - `get_current_admin()` - Dependency for admin routes
  - `get_super_admin()` - Dependency for super-admin routes

### 5. **schemas.py** - NEW Pydantic Validation Models

#### Admin Schemas
- `AdminLogin` - Login request (username, password)
- `AdminCreate` - Create admin request
- `AdminResponse` - Admin data response
- `TokenResponse` - JWT token response

#### Blog Schemas
- `BlogCreate` - Create blog request
- `BlogUpdate` - Partial blog updates
- `BlogResponse` - Full blog response
- `BlogListResponse` - Blog list item (minimal fields)

### 6. **main.py** - Complete API Endpoints

#### Admin Authentication Endpoints
- **POST /admin/login** - Admin login, returns JWT
- **POST /admin/create** - Create new admin (admin-only)
- **GET /admin/list** - List all admins (admin-only)
- **DELETE /admin/{admin_id}** - Delete admin (super-admin only)

#### Blog CRUD Endpoints
- **POST /blogs** - Create blog (admin-only)
- **GET /blogs** - List all blogs (public, paginated)
- **GET /blogs/{id}** - Get single blog (public)
- **PUT /blogs/{id}** - Update blog (admin-only)
- **DELETE /blogs/{id}** - Delete blog (admin-only)

#### Health Check
- **GET /health** - Service health status

### 7. **.env** - Environment Configuration
```dotenv
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URLS=http://localhost:3000,http://localhost:5173
```

## Security Features

### Authentication & Authorization
- ✅ JWT-based admin authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (super-admin vs regular admin)
- ✅ Admin-only endpoints for create/update/delete
- ✅ Public read access for blogs
- ✅ Secure environment variable handling

### Database Security
- ✅ Parameterized queries (SQLAlchemy ORM)
- ✅ Connection pooling with health checks
- ✅ No hardcoded credentials

### API Security
- ✅ CORS enabled for frontend
- ✅ HTTP status codes (201, 400, 401, 403, 404)
- ✅ Proper error messages
- ✅ Bearer token authentication

## Multi-Admin Support
1. **Super-Admin**: One fixed admin with full permissions
   - Can create other admins
   - Can delete any admin except themselves
   - Cannot delete other super-admins

2. **Regular Admins**: Created by super-admin
   - Can create new admins
   - Cannot delete any admin
   - Can manage blogs

## Database Setup

### Local PostgreSQL
```bash
createdb blog_db
psql blog_db
```

### Cloud Options
1. **Supabase** - https://supabase.com
   - Managed PostgreSQL
   - DATABASE_URL provided in dashboard

2. **Neon** - https://neon.tech
   - Serverless Postgres
   - DATABASE_URL provided in dashboard

3. **Railway.app** - https://railway.app
   - Deploy FastAPI + PostgreSQL
   - Environment variables auto-configured

## Running the Application

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables
Update `.env` with your database URL and SECRET_KEY

### 3. Start Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Usage Examples

### Admin Login
```bash
curl -X POST "http://localhost:8000/admin/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=password123"
```

### Create Blog (Admin Only)
```bash
curl -X POST "http://localhost:8000/blogs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Blog Post",
    "content": "Blog content here...",
    "author": "John Doe"
  }'
```

### Get All Blogs (Public)
```bash
curl "http://localhost:8000/blogs?skip=0&limit=10"
```

### Get Single Blog (Public)
```bash
curl "http://localhost:8000/blogs/1"
```

### Update Blog (Admin Only)
```bash
curl -X PUT "http://localhost:8000/blogs/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content..."
  }'
```

### Delete Blog (Admin Only)
```bash
curl -X DELETE "http://localhost:8000/blogs/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration (JavaScript/Fetch)

### Login
```javascript
const response = await fetch('http://localhost:8000/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ username: 'admin', password: 'password' })
});
const { access_token } = await response.json();
localStorage.setItem('token', access_token);
```

### Create Blog
```javascript
const token = localStorage.getItem('token');
await fetch('http://localhost:8000/blogs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Blog',
    content: 'Content here',
    author: 'Jane Doe'
  })
});
```

### Get Blogs (Public)
```javascript
const response = await fetch('http://localhost:8000/blogs');
const blogs = await response.json();
```

## Deployment Checklist

- [ ] Generate strong SECRET_KEY (use `openssl rand -hex 32`)
- [ ] Set DATABASE_URL to production database (Supabase/Neon)
- [ ] Update FRONTEND_URLS for CORS
- [ ] Set ACCESS_TOKEN_EXPIRE_MINUTES appropriately
- [ ] Deploy to Render.com or Railway.app
- [ ] Run database migrations/create tables
- [ ] Create super-admin user
- [ ] Test health endpoint
- [ ] Monitor logs for errors

## Project Structure
```
Blogs/Backend/
├── main.py              (FastAPI app + endpoints)
├── models.py            (SQLAlchemy models)
├── auth.py              (JWT & password handling)
├── database.py          (DB connection & session)
├── schemas.py           (Pydantic validation)
├── requirements.txt     (Dependencies)
├── .env                 (Environment variables)
└── __pycache__/
```

## Notes
- Only Blogs and Admin modules were refactored
- No other project components were modified
- Fully compatible with cloud-managed PostgreSQL
- Production-ready with proper error handling
- CORS enabled for frontend integration
- Comprehensive API documentation via Swagger
