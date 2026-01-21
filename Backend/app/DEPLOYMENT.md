# Setup and Deployment Guide

## Quick Start (Local Development)

### Step 1: Install Dependencies
```bash
cd Blogs/Backend
pip install -r requirements.txt
```

### Step 2: Configure Database
#### Option A: Local PostgreSQL
```bash
# Create database
createdb blog_db

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/blog_db
```

#### Option B: Supabase (Cloud)
1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Project Settings > Database
4. Update .env:
```
DATABASE_URL=postgresql://postgres.xxxxx:password@xxxxx.postgres.supabase.co:5432/postgres
```

#### Option C: Neon (Cloud)
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Update .env:
```
DATABASE_URL=postgresql://user:password@xxxxx.neon.tech/dbname?sslmode=require
```

### Step 3: Set Environment Variables
```bash
# Generate secure SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Update .env with:
SECRET_KEY=<generated-key-above>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URLS=http://localhost:3000,http://localhost:5173
```

### Step 4: Start Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Create Super-Admin
Open Python shell:
```python
from database import SessionLocal, Base, engine
from models import Admin
from auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

# Create super-admin
db = SessionLocal()
admin = Admin(
    username="admin",
    hashed_password=get_password_hash("admin123"),
    is_super_admin=True
)
db.add(admin)
db.commit()
print("Super-admin created!")
db.close()
```

### Step 6: Test API
Visit: http://localhost:8000/docs (Swagger UI)

## Deployment to Production

### Option 1: Railway.app (Recommended for Beginners)

1. **Create Account**: https://railway.app
2. **Connect GitHub** (or use CLI)
3. **Add PostgreSQL Plugin**:
   - New > Database > PostgreSQL
   - Railway auto-provides DATABASE_URL

4. **Deploy FastAPI**:
   ```bash
   railway init
   railway add
   railway up
   ```

5. **Set Environment Variables** in Railway Dashboard:
   - SECRET_KEY (generate: `openssl rand -hex 32`)
   - ALGORITHM=HS256
   - ACCESS_TOKEN_EXPIRE_MINUTES=30
   - FRONTEND_URLS=your-frontend-domain.com

6. **Create Super-Admin** in Railway Shell or via API

### Option 2: Render.com

1. **Create Account**: https://render.com
2. **Create PostgreSQL Database** first
3. **Connect GitHub Repository**
4. **Deploy Web Service**:
   - Language: Python
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Set Environment Variables**:
   - DATABASE_URL
   - SECRET_KEY
   - Other vars from .env

6. **Deploy** and create super-admin

### Option 3: Docker & Docker Hub

1. **Create Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build Image**:
```bash
docker build -t blog-api:latest .
```

3. **Run Locally**:
```bash
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e SECRET_KEY="your-secret-key" \
  blog-api:latest
```

## Production Security Checklist

- [ ] SECRET_KEY is 32+ characters random string
- [ ] DATABASE_URL uses strong password
- [ ] CORS FRONTEND_URLS restricted (no wildcard)
- [ ] HTTPS enabled on frontend/backend
- [ ] Passwords minimum 8 characters enforced
- [ ] JWT expiration set appropriately
- [ ] Logs monitored for failed auth attempts
- [ ] Database backups configured
- [ ] SSL/TLS on database connection
- [ ] Rate limiting implemented (optional)

## Generate Secure SECRET_KEY

### Linux/Mac:
```bash
openssl rand -hex 32
```

### Windows PowerShell:
```powershell
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Python:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## Frontend CORS Setup

### React Example:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  return response.json();
};
```

## Monitoring & Maintenance

### Check API Health:
```bash
curl http://your-api.com/health
```

### Monitor Logs:
```bash
# Local development
tail -f uvicorn.log

# Production (Render/Railway)
Check dashboard logs
```

### Backup Database:
```bash
# Supabase: Built-in backups
# Neon: Automated backups
# Local PostgreSQL:
pg_dump blog_db > backup.sql
```

## Troubleshooting

### "Could not validate credentials" error
- Check TOKEN is being sent in Authorization header
- Verify SECRET_KEY matches between server and token generation
- Ensure token hasn't expired (check expiration time)

### "Database connection refused"
- Verify DATABASE_URL format is correct
- Check database server is running
- For cloud DB: whitelist your IP address

### "CORS error"
- Ensure frontend URL is in FRONTEND_URLS env variable
- Separate multiple URLs with comma
- No trailing slash in URLs

### "Invalid password"
- Ensure password is at least 8 characters
- Check no special characters causing issues
- Try resetting admin password

## API Rate Limiting (Optional)

If needed, add to main.py:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/admin/login")
@limiter.limit("5/minute")
async def admin_login(...):
    ...
```

Install: `pip install slowapi`

## Scaling Considerations

1. **Connection Pooling**: Already enabled in database.py
2. **Caching**: Add Redis for blog caching
3. **Load Balancing**: Use Railway/Render auto-scaling
4. **Database**: Cloud managed (Supabase/Neon) handles scaling
5. **CDN**: Add CloudFlare for static assets

## Support Commands

```bash
# View API schema
curl http://localhost:8000/openapi.json

# Health check
curl http://localhost:8000/health

# Test admin login
curl -X POST http://localhost:8000/admin/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

## Summary

✅ Production-ready Blogs + Admin system  
✅ Secure JWT authentication with bcrypt  
✅ Cloud-database compatible  
✅ CORS enabled for frontend  
✅ Deployment-ready for Railway/Render  
✅ Comprehensive error handling  
✅ Swagger/OpenAPI documentation  
