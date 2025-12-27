# GearGuard - Maintenance Tracker

Production-ready maintenance management system with Django REST Framework backend and React TypeScript frontend.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop

### 1. Start PostgreSQL Database
```bash
cd backend
docker-compose up -d
```

### 2. Setup & Run Backend
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\\venv\\Scripts\\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Run migrations
python manage.py migrate

# Create seed data
python seed_data.py

# Start backend server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

### 3. Run Frontend
```bash
# From project root
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 🔐 Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager1 | password123 | Manager |
| tech1 | password123 | Technician |

## 📁 Project Structure

```
gearguard_odoo/
├── backend/                 # Django REST API
│   ├── config/             # Django settings
│   ├── core/               # Main app (models, views, serializers)
│   ├── docker-compose.yml  # PostgreSQL container
│   ├── requirements.txt
│   ├── seed_data.py        # Database seeding
│   └── manage.py
│
├── src/                    # React frontend
│   ├── services/
│   │   └── api.ts         # API integration layer
│   ├── features/          # Feature modules
│   └── components/        # Reusable components
│
└── .env                   # Frontend environment
```

## ⚙️ Configuration

### Backend (.env in backend/)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=gearguard
DB_USER=gearguard_user
DB_PASSWORD=gearguard_pass123
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:8000/api
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup/` - Register
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Current user

### Resources
- `/api/users/` - User management
- `/api/teams/` - Maintenance teams
- `/api/hierarchy/` - Asset hierarchy (ISA-95)
- `/api/equipment/` - Equipment CRUD
- `/api/tickets/` - Maintenance tickets
- `/api/messages/` - Ticket messages
- `/api/telemetry/` - Sensor data
- `/api/triggers/` - Automation rules

### Special Endpoints
- `GET /api/hierarchy/tree/` - Complete hierarchy
- `GET /api/equipment/{id}/telemetry/` - Equipment telemetry
- `POST /api/tickets/{id}/add_message/` - Add message

## 🏗️ Database Models

1. **User** - Custom auth with roles (admin, manager, technician, viewer)
2. **MaintenanceTeam** - Teams responsible for equipment
3. **AssetHierarchy** - ISA-95 hierarchy (Site → Area → Work Center)
4. **Equipment** - Machines and assets
5. **MaintenanceTrigger** - Automated maintenance rules
6. **MachineTelemetryLog** - Sensor data logs
7. **Ticket** - Maintenance requests/work orders
8. **Message** - Ticket conversation threads

## 🎯 Features

### Backend
✅ JWT authentication with token refresh  
✅ Role-based access control  
✅ Comprehensive filtering & search  
✅ Database connection pooling  
✅ Rate limiting (100/hour anon, 1000/hour users)  
✅ Caching support (Redis for production)  
✅ Structured logging  
✅ Security hardening for production  
✅ Django admin panel  

### Frontend
✅ Modern React with TypeScript  
✅ Tailwind CSS styling  
✅ Framer Motion animations  
✅ JWT token management  
✅ API service layer  
✅ Equipment tracking  
✅ Ticket management with conversations  
✅ Telemetry monitoring  
✅ Team & hierarchy management  

## 🔒 Production Deployment

###  Backend

1. **Update settings**:
   ```env
   DEBUG=False
   SECRET_KEY=<generate-strong-key>
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

2. **Database**: Use managed PostgreSQL (AWS RDS, Digital Ocean, etc.)

3. **Caching**: Setup Redis
   ```env
   REDIS_URL=redis://your-redis-url:6379/1
   ```

4. **Static files**:
   ```bash
   python manage.py collectstatic
   ```

5. **WSGI Server** (Gunicorn):
   ```bash
   pip install gunicorn
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

6. **Reverse Proxy**: Use Nginx for HTTPS and static files

### Frontend

1. **Build production bundle**:
   ```bash
   npm run build
   ```

2. **Serve with Nginx / Vercel / Netlify**

3. **Update API URL**:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

## 📊 Seeded Data

The `seed_data.py` script creates:
- 14 users (1 admin, 3 managers, 10 technicians)
- 5 maintenance teams
- 27 hierarchyNodes (sites, areas, work centers)
- 50 equipment items
- 43 automation triggers
- 841 telemetry logs
- 100 maintenance tickets
- 335 messages

## 🛠️ Development

### Backend Commands
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Django shell
python manage.py shell
```

### Frontend Commands
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Preview production build
npm run preview
```

## 🔍 Troubleshooting

**Database connection error**:
- Ensure Docker is running
- Check: `docker ps` shows postgres container
- Restart: `docker-compose restart`

**Port already in use**:
```bash
# Backend (use different port)
python manage.py runserver 8001

# Frontend (update vite.config.ts)
```

**CORS errors**:
- Verify backend CORS_ALLOWED_ORIGINS includes frontend URL
- Check frontend calls correct API_BASE_URL

**JWT token expired**:
- Logout and login again
- Check token lifetimes in backend settings

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Django 5.1, Django REST Framework 3.15 |
| Database | PostgreSQL 16 |
| Authentication | Simple JWT |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| Containerization | Docker, Docker Compose |

## 📄 License

This project is developed for the hackathon maintenance tracker challenge.

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation at `/admin/doc/`
3. Check backend logs in `backend/logs/django.log`

---

**Built with ❤️ for efficient maintenance tracking**
