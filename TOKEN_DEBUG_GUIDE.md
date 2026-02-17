# Token Storage & Refresh Token Debugging Guide

## What Gets Stored in localStorage

After a successful login or registration, your application stores:

### Authentication Tokens

1. **`authToken`** - JWT access token (short-lived, typically 15min - 1hr)
2. **`refreshToken`** - JWT refresh token (long-lived, typically 7-30 days)
3. **`userData`** - User information (JSON string)

### Application Data

- **`cart`** - Shopping cart data
- **`bookReviews`** - Book reviews data

---

## How to Check Token Storage

### Method 1: Browser DevTools

1. Press **F12** to open Developer Tools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → select your domain
4. Look for: `authToken`, `refreshToken`, `userData`

### Method 2: Console Commands (Now Available!)

Open the browser console and type:

```javascript
// View complete token status with expiration info
tokenDebug.logStatus()

// Check access token details
tokenDebug.getAccessToken()

// Check refresh token details
tokenDebug.getRefreshToken()

// Check if token needs refresh
tokenDebug.shouldRefresh()

// Manually test token refresh
await tokenDebug.testRefresh()

// Clear all auth data
tokenDebug.clearAuth()
```

---

## Automatic Token Refresh Flow

The refresh token mechanism works automatically:

1. **User makes an API request** → Access token is sent in Authorization header
2. **Server returns 401 Unauthorized** → Token has expired
3. **API interceptor catches the 401** → Automatically calls refresh endpoint
4. **New access token received** → Stored in localStorage
5. **Original request is retried** → With new access token
6. **User continues seamlessly** → No interruption to their experience

### What Happens When Refresh Fails?

If the refresh token is also expired or invalid:

- All tokens are cleared from localStorage
- User data is removed
- User is redirected to login page

---

## Testing the Implementation

### 1. After Login

After you log in, the console will automatically show:

```
🔐 Token Status
Access Token: ✅ Present
  - Expired: ✅ No
  - Expires in: 59m 45s
  - Issued at: 2/17/2026, 10:30:00 AM
  - Payload: {...}
Refresh Token: ✅ Present
  - Expired: ✅ No
  - Expires in: 6d 23h 59m
  - Issued at: 2/17/2026, 10:30:00 AM
User Data: ✅ Present
  - Data: {id: "...", email: "..."}
```

### 2. Manual Token Refresh Test

In the browser console:

```javascript
await tokenDebug.testRefresh()
```

### 3. Simulate Token Expiration

```javascript
// Manually expire the access token (for testing)
localStorage.setItem('authToken', 'expired.token.here')

// Make any authenticated API call - it should automatically refresh
```

---

## Common Issues & Solutions

### ❌ No tokens in localStorage after login

**Check:**

- Login response structure in Network tab
- Console for any errors during login
- `authService.login()` is storing tokens correctly

**Debug:**

```javascript
// After login attempt, run:
tokenDebug.logStatus()
```

### ❌ 401 errors not triggering refresh

**Check:**

- API interceptor is properly configured
- Request has Authorization header
- Request is not marked with `skipAuth: true`

### ❌ Refresh token call fails

**Possible reasons:**

- Refresh token has expired
- Refresh token endpoint `/api/v1/auth/refresh` is not accessible
- Server not accepting the refresh token format

**Debug:**

```javascript
// Check token expiration
tokenDebug.getRefreshToken()

// Try manual refresh
await tokenDebug.testRefresh()
```

---

## Security Considerations

### Current Implementation (localStorage)

✅ Pros:

- Survives page refresh
- Easy to implement
- Works across tabs

⚠️ Cons:

- Vulnerable to XSS attacks
- Accessible via JavaScript

### Best Practices Applied

- ✅ Tokens cleared on logout
- ✅ Automatic cleanup on auth errors
- ✅ Refresh token rotation (if server supports it)
- ✅ User data cleared with tokens

---

## API Endpoints Used

```
POST /api/v1/auth/login       - Login and get tokens
POST /api/v1/auth/register    - Register and get tokens
POST /api/v1/auth/refresh     - Refresh access token
POST /api/v1/auth/logout      - Logout (invalidate tokens)
```

---

## Next Steps

1. **Test the login flow** - Check console for token status
2. **Wait for token expiration** - Or manually test with `tokenDebug.testRefresh()`
3. **Make authenticated requests** - Watch the automatic refresh in Network tab
4. **Test logout** - Verify all tokens are cleared

---

## Need Help?

Use the debug commands in the console:

- `tokenDebug.logStatus()` - See current state
- `await tokenDebug.testRefresh()` - Test refresh manually
- `tokenDebug.clearAuth()` - Reset auth state
