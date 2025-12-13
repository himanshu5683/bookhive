// Script to help identify the correct backend URL after Railway setup
console.log('=== BookHive Backend URL Finder ===\n');

console.log('After setting up your Railway services, you will have:');
console.log('- A frontend service (serving your React app)');
console.log('- A backend service (running your Node.js API)\n');

console.log('Steps to find your backend URL:\n');

console.log('1. Go to https://railway.app and log in');
console.log('2. Navigate to your BookHive project');
console.log('3. Find the service named something like "bookhive-backend" or similar');
console.log('4. Click on that service');
console.log('5. Look for the "Domains" section');
console.log('6. Copy the default domain (it will look like):');
console.log('   https://YOUR-SERVICE-ID.up.railway.app\n');

console.log('Example URLs after setup:');
console.log('- Backend Health Check: https://YOUR-SERVICE-ID.up.railway.app/api/health');
console.log('- Backend API Base: https://YOUR-SERVICE-ID.up.railway.app/api');
console.log('- Backend WebSocket: wss://YOUR-SERVICE-ID.up.railway.app\n');

console.log('Update your .env.production file with these URLs:');
console.log('REACT_APP_API_URL=https://YOUR-SERVICE-ID.up.railway.app/api');
console.log('REACT_APP_WS_URL=wss://YOUR-SERVICE-ID.up.railway.app\n');

console.log('After updating:');
console.log('1. Commit and push your changes to GitHub');
console.log('2. Railway will automatically redeploy your frontend');
console.log('3. Your login/signup should work correctly\n');

console.log('Need help setting up the services?');
console.log('Follow the instructions in RAILWAY_SETUP_INSTRUCTIONS.md');