# Qlinica API Specification

## Base URL
```
https://api.qlinica.com/api/v1
```

## Authentication
All endpoints (except auth) require a JWT token in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## Auth Endpoints

### POST /auth/login
**Description:** Authenticate user with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "João Silva",
      "phone": "+351912345678",
      "avatar": "https://...",
      "preferences": {
        "notifications": true,
        "language": "pt",
        "theme": "dark"
      }
    }
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid email/password format
- **401 Unauthorized:** Invalid credentials
- **429 Too Many Requests:** Too many login attempts

---

### POST /auth/register
**Description:** Register new user account

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "João Silva",
  "phone": "+351912345678"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { /* same as login */ }
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid data format or validation errors
- **409 Conflict:** Email already registered

---

### POST /auth/logout
**Description:** Logout user (invalidate token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/refresh
**Description:** Refresh JWT token

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "newToken..."
  }
}
```

**Error Responses:**
- **401 Unauthorized:** Token invalid or expired

---

## User Endpoints

### GET /auth/user
**Description:** Get current user profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "name": "João Silva",
    "phone": "+351912345678",
    "avatar": "https://...",
    "preferences": { /* ... */ },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

---

### PUT /auth/user
**Description:** Update user profile

**Request Body:**
```json
{
  "name": "João Silva",
  "phone": "+351912345678",
  "avatar": "https://...",
  "preferences": {
    "notifications": true,
    "language": "pt",
    "theme": "dark"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated user */ }
}
```

---

### POST /auth/change-password
**Description:** Change user password

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- **400 Bad Request:** Current password incorrect or new password invalid

---

## Services Endpoints

### GET /services
**Description:** Get all available services

**Query Parameters:**
- `category` (optional): Filter by category
- `includeDescription` (optional): Include full descriptions

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Massage",
      "description": "Professional massage therapy",
      "price": 60,
      "currency": "EUR",
      "duration": 60,
      "category": "wellness",
      "imageUrl": "https://..."
    },
    /* more services... */
  ]
}
```

---

### GET /services/:id
**Description:** Get service details

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* service object */ }
}
```

---

## Therapists Endpoints

### GET /therapists
**Description:** Get all therapists

**Query Parameters:**
- `serviceId` (optional): Filter by service
- `available` (optional): Only available therapists

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Maria Santos",
      "specialty": "Massage Therapy",
      "rating": 4.8,
      "reviewCount": 127,
      "image": "https://...",
      "bio": "Experienced therapist...",
      "services": [1, 2, 3],
      "isAvailable": true
    },
    /* more therapists... */
  ]
}
```

---

### GET /therapists/:id
**Description:** Get therapist details

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* therapist object */ }
}
```

---

### GET /therapists/:id/availability
**Description:** Get therapist availability

**Query Parameters:**
- `date` (required): YYYY-MM-DD format
- `serviceId` (required): Service ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "therapistId": 1,
    "date": "2024-03-25",
    "availableSlots": [
      { "time": "09:00", "available": true },
      { "time": "09:30", "available": true },
      { "time": "10:00", "available": false },
      /* more slots... */
    ]
  }
}
```

---

## Bookings Endpoints

### GET /bookings
**Description:** Get user's bookings

**Query Parameters:**
- `status` (optional): upcoming|past|cancelled|completed
- `from` (optional): YYYY-MM-DD
- `to` (optional): YYYY-MM-DD
- `limit` (optional): Default 20
- `offset` (optional): Default 0

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking123",
      "userId": "user123",
      "serviceId": 1,
      "serviceName": "Massage",
      "therapistId": 1,
      "therapistName": "Dr. Maria Santos",
      "date": "2024-03-25",
      "time": "14:30",
      "duration": 60,
      "status": "upcoming",
      "notes": "Optional notes",
      "price": 60,
      "currency": "EUR",
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    },
    /* more bookings... */
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

### POST /bookings
**Description:** Create new booking

**Request Body:**
```json
{
  "serviceId": 1,
  "therapistId": 1,
  "date": "2024-03-25",
  "time": "14:30",
  "notes": "Optional notes"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { /* booking object */ }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid data or missing required fields
- **409 Conflict:** Slot already booked

---

### GET /bookings/:id
**Description:** Get booking details

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* booking object */ }
}
```

---

### PUT /bookings/:id
**Description:** Update/reschedule booking

**Request Body:**
```json
{
  "date": "2024-03-26",
  "time": "15:00",
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated booking */ }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid data
- **409 Conflict:** New slot not available
- **422 Unprocessable Entity:** Cannot reschedule (too close to appointment)

---

### POST /bookings/:id/cancel
**Description:** Cancel booking

**Request Body:**
```json
{
  "reason": "Optional cancellation reason"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* cancelled booking */ }
}
```

**Error Responses:**
- **400 Bad Request:** Cannot cancel appointment (too close)

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { /* optional additional info */ }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Missing or invalid JWT
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., slot booked)
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- **Limit:** 100 requests per minute per user
- **Header:** `X-RateLimit-Remaining: 95`
- **Error:** 429 Too Many Requests
- **Retry-After:** Header with seconds to wait

---

## Pagination

All list endpoints support pagination:
- `limit`: Number of items (default 20, max 100)
- `offset`: Starting position (default 0)

Response includes:
```json
{
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Response Headers

All successful responses include:
```
Content-Type: application/json
X-Request-Id: unique-request-id
Cache-Control: private, max-age=300
```

---

## Implementation Status

- [ ] Auth endpoints
- [ ] User endpoints
- [ ] Services endpoints
- [ ] Therapists endpoints
- [ ] Bookings endpoints
- [ ] Error handling
- [ ] Rate limiting
- [ ] Pagination
- [ ] JWT validation
- [ ] CORS configuration

---

**Last Updated:** 2024-03-22
**Version:** 1.0
**Status:** Ready for Implementation
