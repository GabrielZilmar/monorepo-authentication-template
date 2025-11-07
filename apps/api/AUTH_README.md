# Authentication Feature

This authentication system provides JWT-based authentication for the API.

## Features

- User registration with email and password
- User login with JWT token generation
- Password hashing using bcrypt
- JWT token validation
- Protected routes using guards
- Input validation using class-validator

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/profile` - Get user profile (protected)

### Protected Links

- `POST /links` - Create a new link (protected)
- `PATCH /links/:id` - Update a link (protected)
- `DELETE /links/:id` - Delete a link (protected)

## Usage

### Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "John Doe",
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Access protected routes

```bash
curl -X POST http://localhost:3000/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Link",
    "url": "https://example.com",
    "description": "A sample link"
  }'
```

## Environment Variables

Set the following environment variable:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Security Notes

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours
- Input validation is enabled globally
- CORS is enabled for cross-origin requests
