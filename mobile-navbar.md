Mobile Navigation Refactor & Role-Based Access Control Specification

Objective

Replace the existing sidebar and clicakble top navbar profile button (containing Profile ans Settings submenu) navigation with a role-aware mobile bottom navigation system.

The navigation must dynamically adapt based on the authenticated user's role, ensuring users only see modules relevant to their responsibilities while maintaining a clean and intuitive mobile experience.

---

Supported Roles

- Worker
- Veterinarian
- Manager
- Accountant
- Owner
- Superuser

---

Navigation Architecture

The application shall use a fixed bottom navigation bar.

Primary navigation categories:

1. Dashboard
2. Finance
3. Monitor
4. Livestock Health
5. Others

Each category may expose different submenu items depending on the authenticated user's role.

---

Role-Based Navigation Matrix

WORKER

Visible Bottom Navigation

- Finance
- Monitor
- Livestock Health
- Others

Finance

- Income
- Expense

Monitor

- Inventory
- CCTV

Others

- Settings
- Logout

---

VETERINARIAN

Visible Bottom Navigation

- Finance
- Monitor
- Livestock Health
- Others

Finance

- Expense

Monitor

- Inventory
- CCTV

Others

- Settings
- Logout

---

MANAGER

Visible Bottom Navigation

- Finance
- Monitor
- Livestock Health
- Others

Finance

- Income
- Expense

Monitor

- Inventory
- Assets
- CCTV

Others

- Analytics
- Settings
- Logout

---

ACCOUNTANT

Visible Bottom Navigation

- Dashboard
- Finance
- Monitor
- Livestock Health
- Others

Finance

- Income
- Expense

Monitor

- Inventory
- Assets
- CCTV

Others

- Analytics
- Reports
- Settings
- Logout

---

OWNER

Visible Bottom Navigation

- Dashboard
- Finance
- Monitor
- Livestock Health
- Others

Finance

- Income
- Expense

Monitor

- Inventory
- Assets
- CCTV

Others

- Analytics
- Reports
- Settings
- Logout

---
For SUPERUSER, bottom navigation should reveal buttons for "../super-user/dashboard" page sidemenu:
- Dashboard Overview button
- People button > submenu: Users & Organizations button
- Monitor button > Subscriptions & Activity Monitor buttons
- System button > System Health & System Logs buttons
- Others buttons > Analytics, Settings & Logout buttons

----
Permission Rules

Dashboard Access

Visible only to:

- Owner
- Accountant

Hidden from:

- Worker
- Veterinarian
- Manager

---

Income Access

Visible to:

- Worker
- Manager
- Accountant
- Owner

Hidden from:

- Veterinarian

---

Expense Access

Visible to:

- All roles

---

Inventory Access

Visible to:

- All roles

---

Asset Access

Visible to:

- Manager
- Accountant
- Owner

Hidden from:

- Worker
- Veterinarian

---

CCTV Access

Visible to:

- All roles

---

Livestock Health Access

Visible to:

- All roles

---

Analytics Access

Visible to:

- Manager
- Accountant
- Owner

Hidden from:

- Worker
- Veterinarian

---

Reports Access

Visible to:

- Accountant
- Owner

Hidden from:

- Worker
- Veterinarian
- Manager

---

Settings Access

Visible to:

- All roles

---

Logout Access

Visible to:

- All roles

---

Technical Implementation Requirements

Navigation Components

Create reusable components:

BottomNav

Responsible for:

- Rendering primary navigation items
- Active state management
- Mobile responsiveness
- Role filtering

PopoverMenu

Responsible for:

- Finance submenu
- Monitor submenu
- Others submenu

PermissionGuard

Responsible for:

- Route-level access control
- UI-level visibility control
- Unauthorized access prevention

---

Navigation Rendering Logic

Navigation items must be generated dynamically from a centralized configuration object rather than hardcoded components.

Example structure:

rolePermissions
├── worker
├── veterinarian
├── manager
├── accountant
└── owner

The navigation engine should read the authenticated user's role and automatically build the bottom navigation menu.

---

Security Requirements

UI visibility alone is not sufficient.

All protected routes must also validate user permissions on:

- Route access
- API requests
- Backend authorization middleware

Users must never gain access simply by manually entering a URL.

---

User Experience Goals

- Reduce navigation clutter.
- Present only relevant modules.
- Improve mobile usability.
- Minimize training requirements for farm staff.
- Increase task completion speed.
- Create a scalable permission architecture for future modules.

---

Expected Outcome

A fully role-aware mobile navigation system where each user type sees only the tools required for their responsibilities while maintaining a consistent and intuitive navigation experience across the entire Track Farm Ops platform.