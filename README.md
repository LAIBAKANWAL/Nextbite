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
│   ├── health.js       # Health check endpoint
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

**IMPORTANT**: Ensure your MongoDB URI follows this exact format:
- Include the database name at the end
- Use URL encoding for special characters in password
- Ensure IP whitelisting includes 0.0.0.0/0 for Vercel

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
3. **Important**: Set IP Access List to 0.0.0.0/0 to allow Vercel connections

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

- `GET /api/health` - Health check and database status
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
- Database connection uses connection caching for serverless optimization
- Frontend build outputs to `dist/` directory
- API functions are located in the `api/` directory

## 🐛 Troubleshooting

### Common MongoDB Connection Issues:

1. **"Cannot call 'users' on model with closed connection"**
   - Fixed by implementing proper connection caching
   - Ensure all environment variables are set correctly

2. **Network Timeout Errors**
   - Check MongoDB Atlas IP whitelist (use 0.0.0.0/0 for Vercel)
   - Verify connection string format is correct

3. **Authentication Failed**
   - Double-check MongoDB username and password
   - Ensure special characters are URL encoded

4. **Environment Variables**
   - Verify all required variables are set in Vercel dashboard
   - Check variable names match exactly (case-sensitive)

### Testing Deployment:

1. **Health Check**: Visit `/api/health` to verify API and database connectivity
2. **Logs**: Check Vercel function logs for detailed error messages
3. **Database**: Ensure collections exist and have proper data

### MongoDB Atlas Setup Checklist:

- ✅ Cluster created and running
- ✅ Database user created with readWrite permissions
- ✅ IP Access List set to 0.0.0.0/0
- ✅ Connection string copied correctly
- ✅ Database name included in connection string
- ✅ Collections (users, orders, products, categories) exist

## 📧 Support

If you encounter any issues:
1. Check the `/api/health` endpoint first
2. Review Vercel function logs
3. Verify MongoDB Atlas configuration
4. Ensure all environment variables are set

---

Ready for deployment! 🚀