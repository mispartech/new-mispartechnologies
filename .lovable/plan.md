

# Fix Multiple Issues: Invitations, Onboarding, Departments, Face Enrollment, Activity Logs

## Issue Analysis

### 1. Member/Admin Invitation — 500 Error (BACKEND)
The `POST /api/members/` returns 500. The frontend code is correct — it sends `{ email, first_name, last_name, phone_number, gender, department_id, role, job_title }`. The 500 is a backend issue — likely the endpoint doesn't handle user creation with Supabase auth provisioning, or the `role` field isn't accepted.

### 2. Face Enrollment — 500 "Image upload configuration error" (BACKEND)
The frontend correctly sends a `multipart/form-data` with an `image` field as a Blob. The 500 + "Image upload configuration error" means the Django backend's storage configuration (likely Supabase Storage bucket credentials or permissions) is misconfigured.

### 3. Onboarding Country/State/City — plain text inputs (FRONTEND)
Currently `country` and `city` are free-text `<Input>` fields with no `state` field. Need to add West African country dropdown, dynamic state/city selectors.

### 4. Department Delete — uses `confirm()` instead of modal (FRONTEND)
`DepartmentsList.tsx` line 82: `if (!confirm('Are you sure...'))` — needs a proper AlertDialog. Also, `updateDepartment` and `deleteDepartment` are stubs returning 404.

### 5. Department Description — doesn't save (BACKEND + FRONTEND)
Frontend sends `description` in `createDepartment()` correctly. If it's not saving, the backend `POST /api/departments/` may not include `description` in its serializer fields.

### 6. Activity Logs — "Coming Soon" placeholder (BACKEND needed)
No endpoint exists. Need backend `GET /api/activity-logs/` endpoint.

---

## Frontend Changes

### File 1: `src/pages/Onboarding.tsx`
- Add `state` field to `OnboardingData` interface
- Replace `country` text input with a `<Select>` dropdown containing West African countries: Nigeria, Ghana, Senegal, Côte d'Ivoire, Cameroon, Togo, Benin, Mali, Burkina Faso, Niger, Guinea, Sierra Leone, Liberia, The Gambia, Guinea-Bissau, Cape Verde
- Add `state` `<Select>` that dynamically populates based on selected country (Nigerian states, Ghanaian regions, etc.)
- Replace `city` text input with a `<Select>` or searchable input that shows cities for the selected state
- Include `state` in the draft save payload as `state`

### File 2: `src/pages/dashboard/DepartmentsList.tsx`
- Replace `confirm()` in `handleDelete` with an `AlertDialog` component
- Add state for `deletingDepartmentId` to track which department is being deleted
- Import `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle`

### File 3: `src/pages/dashboard/ActivityLogs.tsx`
- Replace "Coming Soon" with a functional activity log viewer
- Fetch from `GET /api/activity-logs/` (will show empty state gracefully if endpoint doesn't exist yet)
- Display table: Timestamp, User, Action, Details, IP Address
- Add date range filter and action type filter
- Mobile card layout

### File 4: `src/lib/api/client.ts`
- Add `getActivityLogs(params)` method calling `GET /api/activity-logs/`
- Move `updateDepartment` and `deleteDepartment` from stubs to real API calls (backend needs to implement these)

### File 5: `src/lib/api/apiRoutes.ts`
- Add `ACTIVITY_LOGS: '/api/activity-logs/'`
- Move `DEPARTMENT` route from `FUTURE_ROUTES` to `API_ROUTES`

### File 6: `src/lib/locationData.ts` (NEW)
- West African countries list with states/regions and major cities
- Export helper functions: `getCountries()`, `getStates(country)`, `getCities(country, state)`

---

## Backend Prompt (for you to implement on Django)

Here is the Django implementation prompt covering all backend fixes:

### 1. Fix `POST /api/members/` — Member/Admin Invitation
The endpoint returns 500 when creating members. Required fixes:
- Accept fields: `email`, `first_name`, `last_name`, `phone_number`, `gender`, `department_id`, `role` (default: `member`), `job_title`
- Create a Supabase auth user via `supabase.auth.admin.create_user(email=email, email_confirm=False)`
- Create a `CustomUser` record linked to the Supabase auth user's UUID
- Associate user with the requesting admin's organization
- If `department_id` is provided, link user to that department
- Set the user's `role` field (validate: admins can only assign `manager`; super_admins can assign `admin`/`manager`)
- Send invitation email with password setup link via Supabase `supabase.auth.admin.generate_link(type='invite', email=email)`
- Return `{ id, email, first_name, last_name, role, status: 'pending' }`

### 2. Fix `POST /api/face/enroll/` — Face Enrollment 500
The "Image upload configuration error" suggests storage misconfiguration:
- Verify Supabase Storage bucket `faces` exists and has proper permissions
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Django environment
- Check that the endpoint reads `request.FILES['image']` (multipart/form-data)
- Upload to path `faces/{org_id}/{user_id}/enrollment.jpg`
- Update user profile `face_enrolled=True` and `face_image_url` with the public URL
- Return `{ status: 'success', message: 'Face enrolled successfully' }`

### 3. Fix `POST /api/departments/` — Description field not saving
- Ensure `description` is included in the Department serializer's `fields`
- Verify the model has a `description` field (TextField, blank=True, null=True)

### 4. Implement `PATCH /api/departments/<id>/` and `DELETE /api/departments/<id>/`
- `PATCH`: Accept `name`, `description` — update the department
- `DELETE`: Remove department (handle members linked to it — set their department to null or reject if members exist)
- Both require admin/super_admin role

### 5. Implement `GET /api/activity-logs/`
- Create an `ActivityLog` model: `id`, `user_id`, `action` (string), `details` (JSONField), `ip_address`, `created_at`, `organization_id`
- Log actions automatically: member creation, department CRUD, attendance marks, role changes, settings updates, face enrollment
- Use Django middleware or signals to capture: user login, profile updates, member invitations
- Endpoint accepts query params: `start_date`, `end_date`, `action_type`, `user_id`, `page`, `page_size`
- Returns paginated: `{ count, results: [{ id, user_name, action, details, ip_address, created_at }] }`
- Only accessible to admin/super_admin roles

### 6. Add `state` field to Organization model
- Add `state` (CharField, max_length=100, blank=True) to the Organization model
- Include in the onboarding `PUT /api/onboarding/` accepted fields
- Include in `GET /api/organization-settings/` and `PATCH /api/organization-settings/` responses

