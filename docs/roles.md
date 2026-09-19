# Roles & Permissions

The application implements Role-Based Access Control (RBAC) supplemented by Resource Ownership checks.

## The Roles

1. **Traveler (`traveler`)**: The default role for standard users. They can browse destinations, generate itineraries, make bookings (hotels, flights, tours), and manage their own profiles and bookings. They cannot create or modify inventory (hotels, tours).
2. **Business (`business`)**: Vendor users who have registered a business entity on the platform. They inherit all traveler capabilities, but are additionally granted permission to create, update, and manage inventory (hotels, tours, buses, etc.) associated with their specific `business_id`.
3. **Admin (`admin`)**: Superusers. They can view all bookings across the platform, update or delete any resource (destinations, businesses, hotels, tours) regardless of ownership.

## Enforcement Mechanisms

- `requireRole(roles)`: Ensures the user has a specific role (e.g., `['business', 'admin']`).
- `isOwnerOrAdmin(req.user, resourceOwnerId)`: Ensures that a user is either attempting to modify their *own* resource, or has admin privileges.

## Permission Matrix

*Note: "Read" usually refers to public list/detail endpoints which are accessible without authentication.*

| Resource | Action | Traveler | Business | Admin |
| :--- | :--- | :---: | :---: | :---: |
| **Destinations** | Read | ✅ | ✅ | ✅ |
| | Create | ❌ | ❌ (Unless specific edge-case) / ✅ | ✅ |
| | Update | ❌ | ✅ (If owner) / ❌ | ✅ |
| | Delete | ❌ | ❌ | ✅ |
| **Businesses** | Read | ✅ | ✅ | ✅ |
| | Create | ✅ (Upgrades status) | ✅ | ✅ |
| | Update | ❌ | ✅ (If owner) | ✅ |
| | Delete | ❌ | ❌ | ✅ |
| **Hotels / Tours** | Read | ✅ | ✅ | ✅ |
| | Create | ❌ | ✅ (Associated with their biz) | ✅ |
| | Update | ❌ | ✅ (If owner) | ✅ |
| | Delete | ❌ | ✅ (If owner) | ✅ |
| **Bookings** | Read (Self) | ✅ | ✅ | ✅ |
| | Read (All) | ❌ | ❌ | ✅ |
| | Create | ✅ | ✅ | ✅ |
| | Cancel (Self)| ✅ | ✅ | ✅ |
| **Itineraries** | Read (Public)| ✅ | ✅ | ✅ |
| | Read (Private)| ✅ (If owner) | ✅ (If owner) | ✅ |
| | Create | ✅ | ✅ | ✅ |
| | Update/Delete| ✅ (If owner) | ✅ (If owner) | ✅ |

## Frontend Routing

The frontend enforces access control via the `<ProtectedRoute>` component. Unauthenticated users are redirected to `/login`, while authenticated users without the required roles are redirected to the `/unauthorized` (403) page.

| Route | Requires Auth | Allowed Roles |
| :--- | :---: | :--- |
| `/dashboard/*` | ✅ | Any (`traveler`, `business`, `admin`) |
| `/business-dashboard` | ✅ | `business`, `admin` |
| `/admin-dashboard` | ✅ | `admin` |
| `/destinations`, `/experiences`, etc. | ❌ | All |
