import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend directory
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);