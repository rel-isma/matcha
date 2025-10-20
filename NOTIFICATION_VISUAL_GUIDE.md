# 🎨 Notification UI - Visual Guide

## 🔔 Bell Icon (Header)

### Normal State
```
┌─────────────┐
│    🔔       │  ← Bell icon (gray)
│             │
└─────────────┘
```

### With Notifications
```
┌─────────────┐
│    🔔   ⓷  │  ← Bell icon + pink badge (animated pulse)
│             │
└─────────────┘
```

### On Hover
```
┌─────────────┐
│    🔔↗  ⓷  │  ← Bell scales up, turns orange
│             │
└─────────────┘
```

### New Notification Arrives
```
┌─────────────┐
│    🔔   ⓸  │  ← Bell BOUNCES, badge updates
│     ↕       │
└─────────────┘
```

---

## 📱 Notification Sidebar

### Full Layout
```
┌─────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════╗  │
│  ║  🔔 Notifications           ✕        ║  │ ← Orange Gradient Header
│  ║  3 new notifications                  ║  │
│  ║                                       ║  │
│  ║  [  All  ]  [ Unread (3) ]           ║  │ ← Filter Tabs
│  ╚═══════════════════════════════════════╝  │
│  ┌───────────────────────────────────────┐  │
│  │ ✓ Mark all as read                    │  │ ← Action Bar
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │▌ ┌────┐                               │  │
│  │▌ │ 👤 │ 💗  Sarah liked your profile  │  │ ← Unread
│  │▌ └────┘     2 mins ago        [New] 🗑│  │   (orange bar)
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │▌ ┌────┐                               │  │
│  │▌ │ 😊 │ 💞  You matched with Alex!    │  │ ← Unread Match
│  │▌ └────┘     5 mins ago        [New] 🗑│  │   (pulsing heart)
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  ┌────┐                               │  │
│  │  │ AB │ 👁  Alex viewed your profile  │  │ ← Read
│  │  └────┘     1 hour ago             🗑│  │   (no bar)
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  ┌────┐                               │  │
│  │  │ 📷 │ 💔  John unliked you          │  │ ← Unlike
│  │  └────┘     2 hours ago            🗑│  │   (gray icon)
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
    420px wide (desktop)
```

---

## 🎨 Notification Item Breakdown

### Unread Notification
```
┌─────────────────────────────────────────────────┐
│ ▌  Avatar    Badge    Content            Actions│
│ ▌  ┌──────┐  ┌────┐                             │
│ ▌  │      │  │ 💗 │  Username liked you    🗑   │
│ ▌  │ IMG/ │  └────┘  2 mins ago    [New]        │
│ ▌  │ AB   │          ─────────────              │
│ ▌  └──────┘          Timestamp     Badge        │
│ ▌   48x48      36x36                             │
│ ▌                                                │
└─Orange──Gradient──Background──────────────────────┘
  Bar
```

### Component Details

#### 1. Orange Left Bar
```
▌ ← 4px wide
    Orange (#e67817)
    Only on unread
```

#### 2. Avatar (48x48)
```
With Photo:
┌──────────┐
│          │
│   📷     │  White ring → Orange on hover
│          │  Scales 1.1x on hover
└──────────┘

Without Photo:
┌──────────┐
│          │
│    AB    │  Initials on gradient
│          │  Orange/pink background
└──────────┘
```

#### 3. Icon Badge (36x36)
```
Like:
┌────────┐
│  💗    │  Pink gradient
│        │  bg-pink-100 → pink-200
└────────┘

Match:
┌────────┐
│  💞    │  Pink gradient + PULSE
│ (puls) │  Animated!
└────────┘

View:
┌────────┐
│  👁️    │  Orange gradient
│        │  bg-primary-100 → orange-200
└────────┘

Unlike:
┌────────┐
│  💔    │  Gray gradient
│        │  bg-gray-100 → gray-200
└────────┘
```

#### 4. Content Area
```
Username liked your profile  ← Bold if unread
2 mins ago          [New]    ← Timestamp + Badge
```

#### 5. Actions
```
Hover State:
┌────┐
│ 🗑 │  Delete button
└────┘  Appears on hover
        Red on hover
        Rotates 12° on hover
```

---

## 🎭 States & Animations

### Unread Item
```
┌─────────────────────────────────────────┐
│▌ [Avatar] [Badge] Bold Text        🗑  │  ← Orange gradient BG
│▌                  2m ago    [New]      │  ← Orange bar + New badge
└─────────────────────────────────────────┘
  Font: font-semibold (600)
  Background: from-primary-50 to-orange-50
```

### Read Item
```
┌─────────────────────────────────────────┐
│  [Avatar] [Badge] Normal Text       🗑  │  ← White BG
│                   1h ago                │  ← No bar, no badge
└─────────────────────────────────────────┘
  Font: normal (400)
  Background: transparent/white
```

### Hover State
```
┌─────────────────────────────────────────┐
│▌ [Avatar↗] [Badge↗] Text          [🗑↻]│  ← Scale 1.02x
│▌                    ✨ shimmer ✨       │  ← Shimmer effect
└─────────────────────────────────────────┘
  Avatar ring: gray → orange
  Delete: hidden → visible
  Shimmer: sliding gradient
```

### Deleting State
```
┌─────────────────────────────────────────┐
│ [ ← Item slides out left          ]    │  ← Opacity 0
│                                         │  ← translateX(-100%)
└─────────────────────────────────────────┘
  Duration: 300ms
  Then: removed from DOM
```

---

## 📊 Color System

### Light Mode
```
Unread Background:
  ┌──────────────────────────┐
  │ ◄──────────────────────► │
  │ Orange → Pink gradient   │
  │ from-primary-50/80       │
  │ to-orange-50/50          │
  └──────────────────────────┘

Hover:
  Light gray background
  bg-gray-50

Normal:
  White background
  bg-white
```

### Dark Mode
```
Unread Background:
  ┌──────────────────────────┐
  │ ◄──────────────────────► │
  │ Dark orange → pink       │
  │ from-primary-900/20      │
  │ to-orange-900/10         │
  └──────────────────────────┘

Hover:
  Dark gray background
  bg-gray-800/50

Normal:
  Dark background
  bg-gray-900
```

---

## 🎬 Animation Timeline

### Opening Sidebar (Total: 500ms)
```
0ms:    Click bell
        ↓
50ms:   Overlay fades in (200ms)
        ↓
100ms:  Sidebar slides in (300ms)
        ↓
300ms:  Items start appearing
        ↓
350ms:  Item 1 appears
400ms:  Item 2 appears
450ms:  Item 3 appears
        ↓
500ms:  All animations complete
```

### Hover Animation (Total: 200ms)
```
0ms:    Mouse enters
        ↓
50ms:   Avatar starts scaling
        Badge starts scaling
        ↓
100ms:  Delete button fades in
        Item scales to 1.02x
        ↓
150ms:  Ring color changes
        ↓
200ms:  Shimmer starts (2s loop)
        All transforms complete
```

### Delete Animation (Total: 300ms)
```
0ms:    Click delete
        ↓
100ms:  Opacity → 0.5
        translateX(-50%)
        ↓
200ms:  Opacity → 0
        translateX(-100%)
        ↓
300ms:  Remove from DOM
        List collapses smoothly
```

---

## 📏 Spacing Guide

### Notification Item
```
┌─ Padding: 16px (p-4) ────────────────────┐
│                                           │
│  ┌─ Gap: 12px ──┬─ Gap: 12px ──┬────┐   │
│  │              │               │    │   │
│  [Avatar]  [Badge]  [Content]  [Del]│   │
│  48x48     36x36                16x  │   │
│  │              │               │    │   │
│  └──────────────┴───────────────┴────┘   │
│                                           │
└───────────────────────────────────────────┘
```

### Sidebar
```
┌─ Width: 420px (desktop) / 100vw (mobile) ─┐
│                                            │
│  ┌─ Header: 80px height ─────────────┐    │
│  │  Padding: 20px (p-5)              │    │
│  └───────────────────────────────────┘    │
│                                            │
│  ┌─ Action bar: 48px ────────────────┐    │
│  └───────────────────────────────────┘    │
│                                            │
│  ┌─ Scrollable area ─────────────────┐    │
│  │                                    │    │
│  │  [Item] ← 64px min height         │    │
│  │  [Item]                            │    │
│  │  [Item]                            │    │
│  │  ...                               │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

---

## 🎯 Icon Reference

### Notification Types
```
💗 Like:
   - Icon: Heart (outline)
   - Color: Pink (#ec4899)
   - Badge: Pink gradient
   - Animation: None

💞 Match:
   - Icon: Heart (filled)
   - Color: Pink (#ec4899)
   - Badge: Pink gradient
   - Animation: PULSE (2s infinite)

👁️ Profile View:
   - Icon: Eye
   - Color: Orange (#e67817)
   - Badge: Orange gradient
   - Animation: None

💔 Unlike:
   - Icon: HeartOff
   - Color: Gray (#6b7280)
   - Badge: Gray gradient
   - Animation: None

🔔 Default:
   - Icon: Bell
   - Color: Gray (#6b7280)
   - Badge: Gray gradient
   - Animation: None
```

---

## 🌓 Dark Mode Comparison

### Light Mode
```
┌─────────────────────────────────────┐
│  🔔 Notifications          ✕       │ ← Orange gradient
│  3 new notifications                │
│                                     │
│  [  All  ]  [ Unread (3) ]         │
├─────────────────────────────────────┤
│▌ [😊] 💗 Sarah liked you      [🗑]  │ ← Orange/pink BG
│▌       2 mins ago      [New]       │   White text
└─────────────────────────────────────┘
```

### Dark Mode
```
┌─────────────────────────────────────┐
│  🔔 Notifications          ✕       │ ← Same orange gradient
│  3 new notifications                │   (darker text)
│                                     │
│  [  All  ]  [ Unread (3) ]         │
├─────────────────────────────────────┤
│▌ [😊] 💗 Sarah liked you      [🗑]  │ ← Dark orange/pink BG
│▌       2 mins ago      [New]       │   Light text
└─────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (≥ 768px)
```
Browser Window
┌─────────────────────────────────────────┐
│  Header                                 │
│                                         │
│                      ┌──────────────┐   │
│  Content Area        │ Notifications│   │
│                      │              │   │
│                      │  Sidebar     │   │
│                      │  420px       │   │
│                      │              │   │
│                      └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         Subtle overlay (20%)
```

### Mobile (< 768px)
```
Mobile Screen
┌───────────────────┐
│ Notifications     │ ← Full screen
│                   │
│  [  All  ]        │
│                   │
│▌ [Avatar] Like    │
│                   │
│  [Avatar] Match   │
│                   │
│  ...              │
│                   │
│                   │
└───────────────────┘
  100vw width
  Dark overlay (60%)
```

---

**Created:** October 20, 2025  
**Purpose:** Visual reference for developers and designers  
**Status:** Production Ready ✨
