# Employee Management System

A modern full-stack web application for efficient employee record management

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## ✨ Features

- **🔐 Secure Authentication** - JWT-based authentication system for both admins and employees
- **👥 Employee Management** - Complete CRUD operations for employee records
- **📊 Dashboard Analytics** - Visual representation of employee statistics
- **✅ Data Validation** - Comprehensive input validation and error handling
- **🛡️ Security** - Implemented best practices including password hashing and protected routes
- **📱 Responsive Design** - Optimized UI for all device sizes
- **🗄️ Database Integration** - MongoDB integration with Mongoose ODM

## 🚀 Tech Stack

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/abhrajyoti-01/employee-management-system.git
   cd employee-management-system
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/employee_management
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   This will start both backend and frontend servers concurrently.

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register admin (development only)
- `POST /api/employee-auth/login` - Employee login
- `POST /api/employee-auth/register` - Register employee

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Protected routes with middleware
- HTTP security headers with Helmet.js
- Error handling middleware

## 🌐 Project Structure

```txt
├── backend/              # Server-side code
│   ├── config/           # Database configuration
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Express app
├── frontend/             # Client-side code
│   ├── public/           # Static assets
│   └── src/              # React components and logic
│       ├── components/   # UI components
│       ├── contexts/     # React contexts
│       ├── services/     # API services
│       └── assets/       # Images and other assets
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

### Abhrajyoti Nath

- GitHub: [@abhrajyoti-01](https://github.com/abhrajyoti-01)
- LinkedIn: [Abhrajyoti Nath](https://linkedin.com/in/abhrajyoti-nath)

---

Made with ❤️ by [Abhrajyoti Nath](https://github.com/abhrajyoti-01)