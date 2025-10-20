# Notification System Updates

## Overview
Updated the notification system to display user profile avatars and use consistent theme colors throughout the application.

## Changes Made

### Backend Updates

#### 1. Database Query Enhancement (`backend/src/models/Notification.ts`)
- Updated `findByUserId()` method to include profile picture URL in notifications
- Added JOIN with `profiles` and `profile_pictures` tables to fetch the sender's avatar
- New field returned: `fromUserAvatar` (URL of the sender's profile picture)

**SQL Query Enhancement:**
```sql
SELECT 
  n.id, 
  n.user_id as "userId", 
  n.type, 
  n.message, 
  n.link, 
  n.from_user_id as "fromUserId",
  n.is_read as "isRead", 
  n.created_at as "createdAt",
  u.username as "fromUsername",
  u.first_name as "fromFirstName",
  u.last_name as "fromLastName",
  pp.url as "fromUserAvatar"  -- NEW: Profile picture URL
FROM notifications n
LEFT JOIN users u ON n.from_user_id = u.id
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN profile_pictures pp ON p.id = pp.profile_id AND pp.is_profile_pic = true
WHERE n.user_id = $1
ORDER BY n.created_at DESC
LIMIT $2
```

#### 2. Type Definitions (`backend/src/types/index.ts`)
- Added `fromUserAvatar?: string` to the `Notification` interface

### Frontend Updates

#### 1. Type Definitions (`frontend/src/types/index.ts`)
- Added `fromUserAvatar?: string` to the `Notification` interface

#### 2. NotificationBell Component (`frontend/src/components/notifications/NotificationBell.tsx`)

##### Theme Color Updates:
- **Bell Icon Hover**: Changed from `orange-600` to `primary-600` (theme's primary color)
- **Bell Icon Background Hover**: Changed from `orange-50` to `primary-50` 
- **Unread Badge**: Changed from `red-500` to `pink-500` (matches like notifications)
- **Header Bell Icon**: Added `text-primary-600` color
- **Header Unread Badge**: Changed from `red-500` to `pink-500`
- **Mark All Read Button**: Changed from `blue-600` to `primary-600`
- **Loading Spinner**: Changed from `pink-500` to `primary-500`
- **Unread Indicator Dot**: Changed from `blue-500` to `primary-500`
- **Unread Background**: Changed from `blue-50` to `primary-50/50`

##### Icon Color Consistency:
```typescript
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like_received':
      return <Heart className="w-5 h-5 text-pink-500" />;
    case 'match':
      return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />; // Changed from red-500
    case 'profile_view':
      return <Eye className="w-5 h-5 text-primary-500" />; // Changed from blue-500
    case 'unlike':
      return <HeartOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
  }
};
```

##### Avatar Display:
- Added user avatar display in each notification item
- Shows profile picture when available, or a default User icon
- Avatar is a 40x40px circle with a 2px border
- Positioned alongside the notification type icon

**Avatar Implementation:**
```tsx
const avatarUrl = notification.fromUserAvatar 
  ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${notification.fromUserAvatar}`
  : null;

{avatarUrl ? (
  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
    <Image
      src={avatarUrl}
      alt={`${notification.fromUsername || 'User'}'s avatar`}
      fill
      className="object-cover"
      unoptimized
    />
  </div>
) : (
  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
  </div>
)}
```

## Theme Color Palette Used

Based on `tailwind.config.ts`:

### Primary Colors (Orange):
- `primary-50`: #fef9f4 (very light backgrounds)
- `primary-500`: #F78822 (main accent)
- `primary-600`: #e67817 (hover states)

### Pink Colors (for likes/matches):
- `pink-500`: #ec4899 (like notifications, badges)

### Gray Colors (for neutral elements):
- `gray-200`: Borders, backgrounds
- `gray-400`: Inactive icons
- `gray-500`: Secondary text
- `gray-700`: Dark mode text

## Visual Improvements

1. **Consistent Branding**: All interactive elements now use the primary orange color instead of mixed blue/orange
2. **Love Theme**: Like and match notifications consistently use pink to emphasize the romantic nature
3. **Profile Recognition**: Users can now immediately see who sent each notification via their avatar
4. **Better Hierarchy**: Avatar + Icon + Message creates a clear visual hierarchy
5. **Dark Mode Support**: All color changes maintain proper contrast in dark mode

## Testing Recommendations

1. **Create test notifications** of each type:
   - `like_received`
   - `match`
   - `profile_view`
   - `unlike`

2. **Test avatar display**:
   - With users who have profile pictures
   - With users who don't have profile pictures (should show User icon)
   - Verify image loading and error handling

3. **Test theme consistency**:
   - Light mode
   - Dark mode
   - Hover states
   - Unread vs read states

4. **Test functionality**:
   - Click notifications to navigate
   - Mark as read
   - Mark all as read
   - Delete notifications

## Files Modified

### Backend:
- `backend/src/models/Notification.ts`
- `backend/src/types/index.ts`

### Frontend:
- `frontend/src/types/index.ts`
- `frontend/src/components/notifications/NotificationBell.tsx`

## Database Impact
No schema changes required. The existing database structure already supports this feature through the existing JOIN relationships.

## Performance Considerations
- Uses LEFT JOIN so notifications without avatars still display correctly
- Next.js Image component handles image optimization
- Fallback to User icon is instant (no network request)

## Next Steps
1. Restart backend and frontend services
2. Test notification creation and display
3. Verify avatar loading from the uploads directory
4. Test all notification types and interactions
