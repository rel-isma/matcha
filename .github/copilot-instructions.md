# Matcha Dating App - AI Coding Agent Instructions

## Project Overview
Full-stack dating app with Next.js 15 frontend, Express/TypeScript backend, PostgreSQL database, and Socket.IO for real-time features. Uses JWT authentication with HTTP-only cookies.

## Architecture & Data Flow

### Frontend (Next.js 15 App Router)
- **Route Structure**: `(auth)` for public pages, `(dashboard)` for protected pages
- **Context System**: `AuthContext`, `SocketContext`, `NotificationContext2` provide global state
- **Hooks Pattern**: Use custom hooks (`useAuth`, `useProfile`, `useSocket`) to access contexts
- **API Layer**: Centralized in `lib/api.ts` and `lib/profileApi.ts` using axios with `withCredentials: true`

### Backend (Express + TypeScript)
- **Layered Architecture**: Routes → Controllers → Services → Models
- **Database**: PostgreSQL via `pg` library with connection pooling (`config/database.ts`)
- **Models**: Static methods pattern (e.g., `UserModel.findByEmail()`, `ProfileModel.createProfile()`)
- **Real-time**: Socket.IO in `config/socket.ts` with JWT authentication middleware

### Database Schema Key Points
- `users` table: auth + basic info
- `profiles` table: dating-specific data, GPS coordinates (latitude/longitude), fame_rating, completeness
- Foreign keys cascade on delete
- Location uses GPS coordinates only (no geocoding on backend)

## Critical Developer Workflows

### Development Commands
```bash
make build      # Build and start all services with Docker
make up         # Start services without rebuilding
make down       # Stop all services
make mock-data  # Create 100 test profiles (password: Password123!)
make logs       # View all container logs
make db-reset   # Reset database (destructive!)
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev     # Run on localhost:3000
```

### Backend API
- **Base URL**: `http://localhost:5000/api`
- **Documentation**: `http://localhost:5000/api-docs` (Swagger)
- **Database Admin**: `http://localhost:8080` (Adminer)

## Code Conventions & Patterns

### Component Structure
```tsx
'use client'  // Always on top for client components
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'  // Animations
import { Icon } from 'lucide-react'     // Icons
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'     // User feedback
```

### Toast Notifications
**Use `react-hot-toast` for all user feedback** (NOT console.log):
```tsx
toast.success('Profile updated!')
toast.error('Failed to save')
toast('Info message', { icon: 'ℹ️' })
```

### Form Handling Pattern
See `settings/page.tsx` for standard pattern:
1. Separate form state from original data
2. Compare to detect changes before submitting
3. Use `hasDataChanged()` helpers
4. Show specific field changes in success message

### API Response Pattern
All API responses follow:
```typescript
{ success: boolean, data?: T, message?: string }
```

### Styling System (Tailwind)
**Color Usage** (defined in `tailwind.config.ts`):
- `accent` = Orange (#F39C12) - USE SPARINGLY as highlights only
- `foreground` = White/light text
- `muted-foreground` = Gray secondary text
- `card` = Dark surface (#1e293b)
- `border` = Dividers (#334155)
- `destructive` = Red for errors/delete

**Avoid orange overload**: Use green for success states, neutral colors for inactive states, orange only for primary actions and active states.

### Animation Standard
Use `framer-motion` for page transitions:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

## Integration Points

### Authentication Flow
1. Login → JWT stored in HTTP-only cookie (backend sets it)
2. Frontend axios config: `withCredentials: true`
3. Protected routes check `user` from `AuthContext`
4. 403 response with `redirect` → auto-redirect to complete-profile

### Profile Completion Check
Middleware in `backend/src/middleware/profileCompletion.ts` blocks incomplete profiles from dashboard routes. Frontend intercepts 403 responses.

### Real-time Features
- Socket.IO connection requires valid JWT in cookies
- User joins personal room: `socket.join(userId)`
- Emit to specific user: `io.to(userId).emit('notification', data)`
- Notification types in `lib/constants.ts`: like, match, message, profile_view

### Location Handling
- **GPS Only**: Frontend gets coordinates via `navigator.geolocation`
- Backend stores raw lat/lng, no geocoding
- `GPSLocationPicker` component handles UI
- Neighborhood fetched from GeoNames API (frontend)

### Image Upload
- Backend: `multer` with `sharp` for resizing to WebP
- Stored in `backend/uploads/profile-pictures/`
- Served as static: `/uploads/...`
- Frontend: Use `STATIC_BASE_URL + picture.url`
- **Next.js Image**: Always add `unoptimized` prop for external images

## Common Patterns

### Change Detection
```tsx
const hasChanged = JSON.stringify(current) !== JSON.stringify(original)
```

### Conditional Button Disable
```tsx
<Button disabled={isLoading || !hasDataChanged()}>Save</Button>
```

### Profile Picture Display
```tsx
<Image
  src={picture.url.startsWith('http') ? picture.url : `${STATIC_BASE_URL}${picture.url}`}
  alt="Profile"
  fill
  className="object-cover"
  unoptimized
/>
```

### Error Handling in Forms
Store errors in state object: `errors: {[key: string]: string}`
Display inline with field-specific keys

## Key Files Reference
- `frontend/src/lib/constants.ts` - All app constants, routes, options
- `backend/src/types/index.ts` - TypeScript interfaces
- `backend/src/config/socket.ts` - Socket.IO setup
- `backend/src/middleware/auth.ts` - JWT verification
- `frontend/src/context/AuthContext.tsx` - Global auth state
- `Makefile` - All developer commands

## Testing Data
Use `make mock-data` to create 100 profiles:
- Email: `[username]@example.com`
- Password: `Password123!`
- Mix of genders, interests, locations
- All profiles verified and complete

## Anti-Patterns to Avoid
❌ Using `console.log` instead of toast for user feedback
❌ Forgetting `unoptimized` prop on Next.js Image components
❌ Not checking `hasDataChanged()` before API calls
❌ Using orange color everywhere (use sparingly for accents)
❌ Hardcoding API URLs (use constants)
❌ Not handling loading states
❌ Missing `'use client'` directive on interactive components
