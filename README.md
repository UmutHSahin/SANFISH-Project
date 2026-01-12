# 🐟 FSHApp - Fish Biodiversity Data Management Platform

A comprehensive full-stack web application for managing marine biodiversity data, enabling marine biologists, researchers, and developers to track fish observations, analyze scientific data, and access filtered datasets via custom API endpoints.

## 🚀 Features

### For Partners (Marine Biologists)
- 📝 Submit detailed fish catch records with geospatial data
- 🗺️ Interactive map visualization with Leaflet integration
- 📊 Track diseases, lab analyses, and environmental conditions
- 📄 Export data as CSV/PDF reports
- 🌐 Manage partner profiles and company information

### For Developers
- 🔑 Self-service API key generation
- 🎯 Create custom filtered data endpoints
- 📈 Usage statistics and access tracking
- 🧪 Preview filter results before endpoint creation
- 🔗 Dynamic endpoint slug generation

### For Administrators
- 👥 Complete user management (CRUD operations)
- 🐠 System-wide fish data oversight
- ⚙️ Global system settings and announcements
- 📊 Dashboard statistics and analytics
- 📥 Bulk data export capabilities

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **React Router DOM** - Client-side routing
- **Context API** - State management
- **Leaflet** - Interactive maps
- **React Toastify** - Notifications
- **Vanilla CSS** - Styling with dark/light themes

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Joi & express-validator** - Data validation
- **Multer** - File uploads
- **pdfkit** - PDF generation
- **csv-writer** - CSV export

## 📋 Prerequisites

- **Node.js** >= 14.x
- **npm** >= 6.x
- **MongoDB** (Atlas or local instance)

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/UmutHSahin/SANFISH-Project.git
cd SANFISH-Project
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file from template
cp .env.example .env

# Edit .env and add your configuration:
# - MongoDB connection string
# - JWT secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - Server port
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🚦 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

### Start Frontend Development Server
```bash
cd frontend
npm start
# Application runs on http://localhost:3000
```

## 🗂️ Project Structure

```
FSHApp/
├── backend/
│   ├── Controllers/       # Business logic
│   │   ├── AuthController.js
│   │   ├── AdminController.js
│   │   ├── DeveloperController.js
│   │   ├── fishDataController.js
│   │   └── partnerController.js
│   ├── Models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── FishData.js
│   │   ├── FishSpecies.js
│   │   ├── FishDiseases.js
│   │   ├── FishAnalysis.js
│   │   ├── Partners.js
│   │   ├── DeveloperEndpoint.js
│   │   └── SystemSettings.js
│   ├── Routers/          # API routes
│   │   ├── AuthRouter.js
│   │   ├── adminRoutes.js
│   │   ├── developerRoutes.js
│   │   ├── fishDataRoutes.js
│   │   └── partnerRoutes.js
│   ├── Middlewares/      # Express middlewares
│   │   ├── authMiddleware.js
│   │   ├── bulkFishDataValidation.js
│   │   └── AuthValidation.js
│   ├── .env.example      # Environment template
│   └── index.js          # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home/             # Partner dashboard
│   │   │   ├── AdminPanel/       # Admin interface
│   │   │   ├── Developer/        # Developer dashboard
│   │   │   ├── Login/            # Authentication
│   │   │   ├── CreateFish/       # Data entry forms
│   │   │   └── shared/           # Reusable components
│   │   ├── context/              # React Context
│   │   │   └── ThemeContext.js
│   │   ├── App.js                # Main router
│   │   └── index.js              # React entry
│   └── public/
│
├── DOCUMENTATION.txt     # Complete technical documentation
└── README.md            # This file
```

## 🔐 Environment Variables

Create `backend/.env` file based on `.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `MONGO_CONN` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_random_32_byte_hex_string` |

## 👥 User Roles

1. **Admin**: Full system access, user management, system configuration
2. **Partner**: Submit fish data, view own submissions, manage profile
3. **Developer**: API access, create custom endpoints, manage API keys

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login

### Fish Data
- `GET /api/fish-data` - List fish (role-filtered)
- `POST /api/fish-data` - Create fish record
- `GET /api/fish-data/export/csv` - Export as CSV
- `GET /api/fish-data/export/pdf` - Export as PDF

### Developer API
- `GET /api/dev/api-key` - Get API key
- `POST /api/dev/endpoints` - Create custom endpoint
- `GET /api/dev/data/:slug?key={apiKey}` - Access filtered data

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/fish` - List all fish data
- `GET /api/admin/stats` - System statistics
- `PUT /api/admin/settings` - Update system settings

_For complete API documentation, see [DOCUMENTATION.txt](DOCUMENTATION.txt)_

## 📚 Documentation

📄 **[DOCUMENTATION.txt](DOCUMENTATION.txt)** - Comprehensive technical documentation covering:
- Database schemas (all fields, types, constraints)
- Complete API reference
- Middleware logic and validation rules
- Frontend architecture and component structure
- Authentication & authorization flows
- Business rules and logic

## 🔒 Security Features

- JWT-based authentication (24h expiration)
- bcrypt password hashing (10 salt rounds)
- Role-based access control (RBAC)
- Request validation (Joi + express-validator)
- Soft delete for users
- API key management for developers

## 🌍 Deployment

### Production Considerations
- ✅ Change `JWT_SECRET` to a strong random string
- ✅ Use environment-specific `.env` files
- ✅ Enable HTTPS
- ✅ Configure CORS properly
- ✅ Set up MongoDB Atlas IP whitelist
- ✅ Implement rate limiting
- ✅ Add request logging

## 📝 License

This project is proprietary software developed for fish biodiversity research and management.

## 👨‍💻 Author

**Umut Hasan Şahin**  
GitHub: [@UmutHSahin](https://github.com/UmutHSahin)

## 🐛 Known Issues & Future Enhancements

- [ ] Implement email verification
- [ ] Add real-time notifications
- [ ] Mobile responsive optimization
- [ ] Multi-language support
- [ ] Advanced data visualization charts

---

**Version**: 1.0.0  
**Last Updated**: January 12, 2026

For detailed technical specifications, please refer to [DOCUMENTATION.txt](DOCUMENTATION.txt).
