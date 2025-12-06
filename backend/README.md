# BookHive Backend API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install MongoDB:
   - **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow the [official installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

3. Start MongoDB service:
   - **Windows**: Start MongoDB service from Services or run `mongod`
   - **macOS/Linux**: `sudo systemctl start mongod` or `brew services start mongodb-community`

4. Configure environment variables:
   - Copy [.env.example](.env.example) to [.env](.env)
   - Uncomment and adjust the MONGODB_URI if needed

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 5000 by default.

## API Endpoints

- Authentication: `/api/auth/*`
- Resources: `/api/resources/*`
- Stories: `/api/stories/*`
- Study Circles: `/api/circles/*`
- Users: `/api/users/*`

## Database Models

- User: User accounts and profiles
- Resource: Notes and PDF documents
- Story: User shared stories
- StudyCircle: Study groups and discussions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://127.0.0.1:27017/bookhive |
| JWT_SECRET | Secret for JWT tokens | bookhive_jwt_secret_key_here_change_in_production |
| REACT_APP_URL | Frontend URL | http://localhost:3000 |
| PRODUCTION_URL | Production frontend URL | https://himanshu5683.github.io/bookhive |