# NextBite - Food Delivery App

A full-stack food delivery application built with React (Vite) frontend and Node.js/Express backend, designed for Vercel deployment.

## 🚀 Features

- User authentication (signup/login)
- Food menu browsing with categories
- Cart functionality
- Order management
- Responsive design with Bootstrap

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- React Router DOM
- Bootstrap 5
- Bootstrap Icons

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt for password hashing

## 📦 Project Structure

```
├── frontend/           # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── api/                # Serverless API functions
│   ├── models/         # MongoDB models
│   ├── createUser.js   # User registration endpoint
│   ├── loginUser.js    # User login endpoint
│   ├── foodData.js     # Food items endpoint
│   ├── foodCategory.js # Food categories endpoint
│   ├── orderData.js    # Order creation endpoint
│   ├── myOrderData.js  # User orders endpoint
│   ├── db.js          # Database connection
│   └── index.js       # Local development server
├── vercel.json        # Vercel deployment configuration
└── README.md
```

## 🚀 Deployment to Vercel

### 1. Prerequisites

- [Vercel account](https://vercel.com)
- MongoDB Atlas database
- Git repository

### 2. Environment Variables

Set the following environment variables in your Vercel dashboard:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### 4. MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Add your database collections:
   - `users` - for user accounts
   - `orders` - for order data
   - `products` - for food items
   - `categories` - for food categories

## 🔧 Local Development

### Backend (API)

```bash
cd api
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 API Endpoints

- `POST /api/createUser` - User registration
- `POST /api/loginUser` - User login  
- `GET /api/foodData` - Get food items
- `GET /api/foodCategory` - Get food categories
- `POST /api/orderData` - Create order
- `POST /api/myOrderData` - Get user orders

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS protection
- Environment variable protection

## 📝 Notes

- The application is configured for serverless deployment on Vercel
- Database connection uses connection pooling for serverless optimization
- Frontend build outputs to `dist/` directory
- API functions are located in the `api/` directory

## 🐛 Troubleshooting

**Common Issues:**

1. **Environment Variables**: Make sure all required environment variables are set in Vercel dashboard
2. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist
3. **CORS Issues**: Ensure FRONTEND_URL environment variable matches your Vercel domain

## 📧 Support

If you encounter any issues, please check the deployment logs in your Vercel dashboard.

---

Ready for deployment! 🚀