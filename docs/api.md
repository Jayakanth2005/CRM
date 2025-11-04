# API Documentation - Fastor7 CRM Backend

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
6. [Request/Response Examples](#request-response-examples)

## Overview

The Fastor7 CRM API is a RESTful service that provides employee authentication and lead management functionality. All API responses follow a consistent JSON format.

**Base URL**: `http://localhost:3000/api`

### Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "errors": array (only for validation errors)
}
```

### HTTP Status Codes
- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication required/failed)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Resource already exists)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.

**Header Format**: `Authorization: Bearer <jwt_token>`

### Token Lifecycle
- Tokens expire after 7 days (configurable)
- New tokens are issued on successful login/registration
- Tokens contain user ID for authorization

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access denied. No valid token provided"
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Enquiry not found"
}
```

## Rate Limiting

### Global Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-*` headers included in responses

### Enquiry Submission Rate Limiting
- **Limit**: 5 requests per minute per IP
- **Endpoint**: `POST /api/public/enquiries`
- **Response**: 429 status with retry message

## Endpoints

### Health Check

#### GET /health
Check API and database connectivity.

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

### Authentication Endpoints

#### POST /auth/register
Register a new employee account.

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@fastor7.com",
  "password": "Password123"
}
```

**Validation Rules**:
- `name`: 2-100 characters, required
- `email`: Valid email format, unique, required
- `password`: Min 6 chars, must contain uppercase, lowercase, and number

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john.doe@fastor7.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-string"
  }
}
```

#### POST /auth/login
Authenticate existing employee.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@fastor7.com",
  "password": "Password123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john.doe@fastor7.com"
    },
    "token": "jwt-token-string"
  }
}
```

---

### Public Endpoints

#### POST /public/enquiries
Submit a new enquiry (public access with rate limiting).

**Authentication**: Not required
**Rate Limited**: 5 requests per minute

**Request Body**:
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "courseInterest": "Full Stack Web Development"
}
```

**Validation Rules**:
- `name`: 2-100 characters, required
- `email`: Valid email format, required
- `courseInterest`: 2-200 characters, required

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Enquiry submitted successfully",
  "data": {
    "enquiry": {
      "id": "uuid-string",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "courseInterest": "Full Stack Web Development",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Enquiry Management Endpoints (Protected)

#### GET /enquiries/unclaimed
Retrieve unclaimed enquiries with pagination and sorting.

**Authentication**: Required
**Method**: GET

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field - `createdAt`, `name`, `email`, `courseInterest` (default: `createdAt`)
- `sortOrder` (optional): `asc` or `desc` (default: `desc`)

**Example**: `GET /enquiries/unclaimed?page=2&limit=5&sortBy=name&sortOrder=asc`

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Unclaimed enquiries retrieved successfully",
  "data": {
    "enquiries": [
      {
        "id": "uuid-string",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "courseInterest": "Full Stack Web Development",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### POST /enquiries/:id/claim
Claim an unclaimed enquiry.

**Authentication**: Required
**Method**: POST

**URL Parameters**:
- `id`: Enquiry UUID

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Enquiry claimed successfully",
  "data": {
    "enquiry": {
      "id": "uuid-string",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "courseInterest": "Full Stack Web Development",
      "claimedAt": "2024-01-01T00:05:00.000Z",
      "claimedBy": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john.doe@fastor7.com"
      }
    }
  }
}
```

**Error Response - Already Claimed (409)**:
```json
{
  "success": false,
  "message": "Enquiry already claimed",
  "data": {
    "claimedBy": "Jane Smith"
  }
}
```

#### GET /enquiries/claimed
Retrieve enquiries claimed by the authenticated user.

**Authentication**: Required
**Method**: GET

**Query Parameters**: Same as unclaimed enquiries

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Your claimed enquiries retrieved successfully",
  "data": {
    "enquiries": [
      {
        "id": "uuid-string",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "courseInterest": "Full Stack Web Development",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "claimedAt": "2024-01-01T00:05:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 5,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Request/Response Examples

### Complete Workflow Example

#### 1. Register Employee
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Employee",
    "email": "john@fastor7.com",
    "password": "SecurePass123"
  }'
```

#### 2. Public Enquiry Submission
```bash
curl -X POST http://localhost:3000/api/public/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Potential Student",
    "email": "student@example.com",
    "courseInterest": "React Development"
  }'
```

#### 3. Employee Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@fastor7.com",
    "password": "SecurePass123"
  }'
```

#### 4. Get Unclaimed Enquiries
```bash
curl -X GET http://localhost:3000/api/enquiries/unclaimed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Claim Enquiry
```bash
curl -X POST http://localhost:3000/api/enquiries/ENQUIRY_ID/claim \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. Get My Claimed Enquiries
```bash
curl -X GET http://localhost:3000/api/enquiries/claimed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Postman Collection

For testing with Postman, import these examples:

1. **Environment Variables**:
   - `base_url`: `http://localhost:3000/api`
   - `auth_token`: Save from login response

2. **Authentication Header**:
   ```
   Key: Authorization
   Value: Bearer {{auth_token}}
   ```

3. **Test Scripts** (Add to login request):
   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     pm.environment.set("auth_token", response.data.token);
   }
   ```

### Error Scenarios

#### Invalid Email Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Please provide a valid email address",
      "path": "email"
    }
  ]
}
```

#### Weak Password
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "path": "password"
    }
  ]
}
```

#### Unauthorized Access
```json
{
  "success": false,
  "message": "Access denied. No valid token provided"
}
```

#### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many enquiry submissions. Please try again after a minute."
}
```

---

## Integration Notes

### Frontend Integration
- Store JWT token in localStorage/sessionStorage
- Include token in all protected API calls
- Handle token expiration (401 responses)
- Implement proper error handling for all scenarios

### Database Considerations
- All enquiries are initially unclaimed (`claimedBy: null`)
- Claiming an enquiry updates `claimedBy` and `updatedAt`
- Pagination helps manage large datasets
- Proper indexing ensures query performance

### Security Best Practices
- Always use HTTPS in production
- Validate JWT tokens on every protected request
- Implement proper CORS policies
- Use strong, unique JWT secrets
- Regular security audits and updates
