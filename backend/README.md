# Bindisa Agritech Backend API

This is the backend API for the Bindisa Agritech platform, providing comprehensive agricultural services including soil analysis, weather data, crop management, and AI-powered chatbot assistance.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Soil Analysis**: Advanced soil parameter analysis with recommendations
- **Weather Integration**: Real-time weather data and forecasts
- **Crop Management**: Comprehensive crop lifecycle management
- **AI Chatbot**: Multilingual agricultural assistance (Hindi, Marathi, English)
- **Farm Management**: Complete farm profile and analytics
- **Expert Consultation**: Connect with agricultural experts
- **Real-time Notifications**: Socket.IO-powered real-time updates

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Bcrypt** for password hashing
- **Joi** for request validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Setup Instructions

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**

   - Install MongoDB locally or use MongoDB Atlas
   - Update MONGODB_URI in .env file

4. **Start the Server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-details` - Update user details
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar
- `GET /api/users/stats` - Get user statistics

### Soil Analysis

- `POST /api/soil-analysis/analyze` - Analyze soil parameters (public)
- `POST /api/soil-analysis` - Create analysis record
- `GET /api/soil-analysis` - Get user's analyses
- `GET /api/soil-analysis/:id` - Get specific analysis
- `PUT /api/soil-analysis/:id` - Update analysis
- `DELETE /api/soil-analysis/:id` - Delete analysis
- `POST /api/soil-analysis/:id/share` - Share analysis

### Chatbot

- `POST /api/chatbot/session` - Create chat session (public)
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/conversations` - Get conversations
- `GET /api/chatbot/conversation/:sessionId` - Get specific conversation
- `POST /api/chatbot/conversation/:sessionId/rate` - Rate conversation

### Weather

- `GET /api/weather/current/:lat/:lon` - Current weather (public)
- `GET /api/weather/forecast/:lat/:lon` - Weather forecast (public)
- `GET /api/weather/history/:lat/:lon` - Weather history
- `GET /api/weather/alerts/:lat/:lon` - Weather alerts

### Crops

- `GET /api/crops` - Get all crops (public)
- `GET /api/crops/:id` - Get specific crop (public)
- `GET /api/crops/recommendations/:soilType/:climate` - Crop recommendations
- `GET /api/crops/calendar/:cropName/:location` - Crop calendar

### Farm Management

- `POST /api/farms` - Create farm
- `GET /api/farms` - Get user's farms
- `GET /api/farms/:id` - Get specific farm
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm
- `POST /api/farms/:id/share` - Share farm
- `GET /api/farms/:id/analytics` - Farm analytics

### Expert Consultation

- `GET /api/experts` - Get all experts (public)
- `GET /api/experts/:id` - Get specific expert (public)
- `POST /api/experts/consultation` - Book consultation
- `GET /api/experts/consultations` - Get consultations

### Notifications

- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Dashboard

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Recent activity
- `GET /api/dashboard/weather` - Weather summary
- `GET /api/dashboard/crops` - Crop status

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bindisa-agritech

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External APIs
WEATHER_API_KEY=your-weather-api-key

# Security
BCRYPT_SALT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Database Models

- **User**: User accounts with profile and preferences
- **Farm**: Farm information and management
- **SoilAnalysis**: Soil test results and recommendations
- **ChatbotConversation**: Chat sessions and messages
- **Crop**: Crop information and lifecycle tracking

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection protection via Mongoose

## Testing

```bash
npm test
```

## Development

The API includes comprehensive error handling, logging, and validation. All endpoints return consistent JSON responses with proper HTTP status codes.

Response format:

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

Error format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## Health Check

Visit `http://localhost:5000/health` to verify the API is running.
