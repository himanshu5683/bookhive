# Test Commands for BookHive Login Functionality

## CURL Commands

### 1. Test Login
```bash
curl -X POST https://bookhive-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://himanshu5683.github.io" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt \
  -d '{"email": "test@example.com", "password": "testpassword123"}'
```

### 2. Test Signup
```bash
curl -X POST https://bookhive-backend-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: https://himanshu5683.github.io" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt \
  -d '{"email": "test@example.com", "password": "testpassword123", "name": "Test User"}'
```

### 3. Test Token Verification
```bash
curl -X GET https://bookhive-backend-production.up.railway.app/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Origin: https://himanshu5683.github.io" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

## Axios Example

### Login Function
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://bookhive-backend-production.up.railway.app/api',
  withCredentials: true
});

async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
login('test@example.com', 'testpassword123')
  .then(data => console.log('User:', data.user))
  .catch(error => console.error('Error:', error));
```

## Expected Responses

### Successful Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "credits": 100
  }
}
```

### Failed Login Response
```json
{
  "error": "Invalid credentials"
}
```

### Successful Signup Response
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "credits": 100
  }
}
```