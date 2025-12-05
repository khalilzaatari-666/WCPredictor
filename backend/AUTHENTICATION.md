# Authentication Guide

This application now supports multiple authentication methods. Users can choose their preferred method to register and log in.

## Authentication Methods

### 1. Email Authentication

Users can register and log in using their email address and password. Email verification is required.

#### Registration Flow:
1. POST `/api/auth/email/register`
   ```json
   {
     "username": "johndoe",
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```
   - Creates user account
   - Sends verification email with a unique token
   - Returns user info (without token until verified)

2. User checks email and clicks verification link
3. POST `/api/auth/email/verify`
   ```json
   {
     "token": "verification-token-from-email"
   }
   ```
   - Verifies email
   - Returns user info and JWT token for auto-login

#### Login Flow:
1. POST `/api/auth/email/login`
   ```json
   {
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```
   - Checks email is verified
   - Returns user info and JWT token

#### Resend Verification:
- POST `/api/auth/email/resend-verification`
  ```json
  {
    "email": "john@example.com"
  }
  ```

---

### 2. Phone Authentication

Users can register and log in using their phone number with OTP (One-Time Password) verification.

#### Registration Flow:
1. POST `/api/auth/phone/register`
   ```json
   {
     "phoneNumber": "+1234567890",
     "username": "johndoe"
   }
   ```
   - Phone number must be in E.164 format (e.g., +1234567890)
   - Sends 6-digit OTP via SMS
   - Returns userId

2. POST `/api/auth/phone/verify`
   ```json
   {
     "phoneNumber": "+1234567890",
     "code": "123456"
   }
   ```
   - Verifies OTP code
   - Returns user info and JWT token

#### Login Flow:
1. POST `/api/auth/phone/login`
   ```json
   {
     "phoneNumber": "+1234567890"
   }
   ```
   - Sends OTP to verified phone number

2. POST `/api/auth/phone/verify-login`
   ```json
   {
     "phoneNumber": "+1234567890",
     "code": "123456"
   }
   ```
   - Verifies OTP
   - Returns user info and JWT token

#### Resend OTP:
- POST `/api/auth/phone/resend-otp`
  ```json
  {
    "phoneNumber": "+1234567890"
  }
  ```

---

### 3. Google OAuth

Users can register and log in using their Google account. No verification required.

#### Flow:
1. Frontend initiates Google OAuth flow
2. User authenticates with Google
3. POST `/api/auth/google/callback`
   ```json
   {
     "googleId": "google-user-id",
     "email": "john@gmail.com",
     "displayName": "John Doe",
     "avatar": "https://...",
     "phoneNumber": "+1234567890"
   }
   ```
   - Creates new user if doesn't exist
   - phoneNumber is optional (no verification required)
   - Returns user info and JWT token

---

### 4. Wallet Authentication (Existing)

Users can register and log in using their Ethereum wallet.

- POST `/api/auth/wallet-login`

---

## Environment Variables

Add these to your `.env` file:

### Email Service (Resend)
```env
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=World Cup Predictor <onboarding@resend.dev>
```

**Setup Resend:**
1. Sign up at https://resend.com/signup
2. Get your API key from https://resend.com/api-keys
3. Free tier includes 100 emails/day, 3,000 emails/month
4. For production, verify your domain and use your own email address

### SMS Service (Twilio)
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Setup Twilio:**
1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token from the Console
3. Purchase a phone number or use the trial number
4. Add your verified phone numbers in the trial account

### Google OAuth (Optional)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Setup Google OAuth:**
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

---

## Database Migration

After pulling these changes, run:

```bash
cd backend
npm run migrate:dev
```

This will update your database schema with the new fields.

---

## API Endpoints Summary

### Email Auth
- `POST /api/auth/email/register` - Register with email
- `POST /api/auth/email/verify` - Verify email
- `POST /api/auth/email/login` - Login with email
- `POST /api/auth/email/resend-verification` - Resend verification email

### Phone Auth
- `POST /api/auth/phone/register` - Register with phone
- `POST /api/auth/phone/verify` - Verify phone with OTP
- `POST /api/auth/phone/login` - Request login OTP
- `POST /api/auth/phone/verify-login` - Verify login OTP
- `POST /api/auth/phone/resend-otp` - Resend OTP

### Google Auth
- `POST /api/auth/google/callback` - Google OAuth callback

### Wallet Auth
- `POST /api/auth/wallet-login` - Login with wallet

### Protected Routes (Require JWT Token)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout (invalidate token)

---

## Security Notes

- All passwords are hashed using bcrypt
- Email verification tokens expire after 24 hours
- OTP codes expire after 10 minutes
- JWT tokens can be configured via `JWT_EXPIRES_IN` (default: 7 days)
- Tokens are invalidated on logout using Redis blacklist
- Phone numbers must be in E.164 format
- Email verification is required before login
- Phone verification is required before login

---

## Testing

Use tools like Postman or Thunder Client to test the endpoints.

Example with curl:

```bash
# Register with email
curl -X POST http://localhost:4000/api/auth/email/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Register with phone
curl -X POST http://localhost:4000/api/auth/phone/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","phoneNumber":"+1234567890"}'
```
