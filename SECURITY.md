# 🔐 LifeLink Twin - Security Documentation

## Authentication System

LifeLink Twin now includes a secure authentication system with hashed passwords and JWT-based session management.

### Features

- ✅ **Password Hashing**: All passwords are hashed using bcrypt with salt
- ✅ **JWT Tokens**: Secure token-based authentication
- ✅ **Session Management**: HTTP-only cookies for token storage
- ✅ **Role-Based Access**: Doctor-only
- ✅ **Protected API Routes**: All patient data endpoints require authentication

### Default Users

For demo purposes, the system includes pre-configured users:

| Username | Password  | Role   | Access Level          |
|----------|-----------|--------|-----------------------|
| doctor   | doctor123 | Doctor | Patient data access   |

⚠️ **Important**: Change these credentials in production!

## API Endpoints

### Authentication Endpoints (Public)

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "doctor",
  "password": "doctor123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "doctor",
    "role": "doctor",
    "name": "Dr. Smith",
    "email": "doctor@lifelink.com"
  }
}
```

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "name": "New User",
  "email": "user@example.com",
  "role": "doctor"
}

Note: this deployment enforces doctor-only registration; any non-`doctor` role will be rejected.
```

#### Logout
```
POST /api/auth/logout
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Protected Endpoints (Require Authentication)

All patient data endpoints now require authentication:

- `GET /api/patient/:id` - Get patient data
- `GET /api/patients` - Get all patients
- `GET /api/health` - System health check

### Using Authentication in Client

Include the JWT token in requests:

```javascript
// Store token after login
localStorage.setItem('token', data.token);

// Include in API requests
fetch('/api/patients', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Security Best Practices

### For Production Deployment

1. **Environment Variables**: Use environment variables for secrets
   ```bash
   export JWT_SECRET=your-secret-key-here
   export SESSION_SECRET=your-session-secret-here
   ```

2. **HTTPS**: Enable HTTPS and set secure cookies
   ```javascript
   cookie: { 
     secure: true,  // Require HTTPS
     httpOnly: true,
     sameSite: 'strict'
   }
   ```

3. **Strong Passwords**: Enforce password policies
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers, special characters
   - Password expiration policies

4. **Rate Limiting**: Implement rate limiting for login attempts
   ```bash
   npm install express-rate-limit
   ```

5. **Database**: Replace in-memory storage with a real database
   - MongoDB with mongoose
   - PostgreSQL with pg
   - MySQL with mysql2

6. **Password Reset**: Implement password reset flow
   - Email verification
   - Temporary reset tokens
   - Token expiration

7. **Two-Factor Authentication (2FA)**: Add extra security layer
   - SMS verification
   - Authenticator apps (Google Authenticator, Authy)

8. **Audit Logging**: Log all authentication attempts
   - Successful logins
   - Failed login attempts
   - Password changes
   - User access patterns

## File Structure

```
server/
├── index.js          # Main server with auth routes
├── auth.js           # Authentication module
└── ...

public/
├── login.html        # Login page
└── ...
```

## WebSocket Authentication

WebSocket connections can also be authenticated:

```javascript
// Client-side
const socket = io({
  auth: {
    token: localStorage.getItem('token')
  }
});

// Server-side (to be implemented)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = verifyToken(token);
  if (decoded) {
    socket.user = decoded;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

## Password Hashing Details

- **Algorithm**: bcrypt
- **Salt Rounds**: 10 (2^10 iterations)
- **Hash Length**: 60 characters
- **Security**: Resistant to rainbow table and brute force attacks

## JWT Token Details

- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: 24 hours
- **Payload**: username, role, name, email
- **Storage**: HTTP-only cookie (XSS protection)

## Testing

Test the authentication system:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"doctor123"}'

# Get current user
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get patients (protected)
curl http://localhost:3000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### "No token provided" error
- Ensure token is included in Authorization header
- Check if token is stored correctly in localStorage

### "Invalid or expired token" error
- Token may have expired (24h default)
- Re-login to get a new token

## Future Enhancements

- [ ] Password strength meter
- [ ] Account lockout after failed attempts
- [ ] Email verification for new users
- [ ] Password reset via email
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, Microsoft)
- [ ] Session management dashboard
- [ ] IP whitelist/blacklist
- [ ] API key authentication for external integrations

## Support

For security concerns or issues, please contact the development team.

---

**⚠️ Security Notice**: This is a demo implementation. For production use, implement additional security measures, use HTTPS, secure your secrets, and follow OWASP security guidelines.
