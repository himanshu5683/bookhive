import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PRODUCTION_URL:', process.env.PRODUCTION_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);