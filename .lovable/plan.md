

# Fix 500 Errors on Members/Admin Pages + Resend Email Integration

## Root Cause Analysis

### The 500 Errors — Backend Issue, Not Frontend

Both pages call the same endpoint:
- **MembersList** → `GET /api/members/?role=member` and `POST /api/members/` (via `AddMemberModal`)
- **AdminManagement** → `GET /api/members/?page_size=200` and `POST /api/members/` (via `InviteAdminModal`)

The frontend code is correct — proper payloads, auth headers, error handling. The 500 is entirely backend.

**Likely causes on Django:**
1. `POST /api/members/` — The view tries to create a Supabase auth user but fails (missing service role key, incorrect Supabase admin SDK usage, or the user creation logic throws an unhandled exception)
2. `GET /api/members/?role=member` — The `role` query param filter may not be implemented, or the serializer references a field that doesn't exist on the model
3. The `job_title` field sent by `InviteAdminModal` may not exist on the `CustomUser` model

### Resend — Must Be Backend, Not Frontend

Resend should be integrated in the **Django backend**, not the frontend. When `POST /api/members/` creates a user, the backend should use the Resend API (`RESEND_API_KEY`) to send the invitation email. The frontend just calls `POST /api/members/` and expects the backend to handle email delivery atomically.

**No frontend changes needed.** The frontend is already built correctly for this flow.

## Frontend Fixes (Minor)

Only one small resilience improvement:

| File | Change |
|---|---|
| `src/pages/dashboard/AdminManagement.tsx` | Add `silent: true` to `getMembers` call to suppress duplicate toast on 500 (the page already has its own error handling) |

## Backend Implementation Prompt

Here is the Django prompt to fix all issues:

---

### 1. Fix `GET /api/members/` — Support Filtering

The endpoint must support these query params:
- `role` — filter by role (e.g., `member`, `pending`, `admin`, `manager`, `super_admin`)
- `order_by` — sort field (e.g., `-created_at`)
- `page` / `page_size` — pagination (Django REST Framework default)

Ensure the serializer includes ALL these fields: `id`, `email`, `first_name`, `last_name`, `phone_number`, `gender`, `role`, `job_title`, `status`, `department_id`, `department_name`, `face_image_url`, `created_at`

If `job_title` doesn't exist on the model yet:
```python
job_title = models.CharField(max_length=100, blank=True, null=True)
```

If `status` doesn't exist:
```python
status = models.CharField(max_length=20, default='active', choices=[
    ('active', 'Active'), ('pending', 'Pending'), ('suspended', 'Suspended')
])
```

### 2. Fix `POST /api/members/` — Create User + Send Invite Email via Resend

This is the core fix. The endpoint should:

```python
# views.py - MemberViewSet.create()

from resend import Emails
import resend

resend.api_key = settings.RESEND_API_KEY  # "re_YdpmU6o6_Ao7pBuuWPFrSXNDyYMBGZjjV"

def create(self, request):
    data = request.data
    admin = request.user  # Authenticated via JWT
    org = admin.organization
    
    # 1. Validate required fields
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role', 'member')
    
    if not email or not first_name or not last_name:
        return Response({'error': 'email, first_name, last_name are required'}, status=400)
    
    # 2. Check role hierarchy
    if role in ('admin', 'super_admin') and admin.role != 'super_admin':
        return Response({'error': 'Only super admins can assign admin roles'}, status=403)
    if role == 'manager' and admin.role not in ('super_admin', 'admin'):
        return Response({'error': 'Only admins can assign manager roles'}, status=403)
    
    # 3. Check if email already exists in org
    if CustomUser.objects.filter(email=email, organization=org).exists():
        return Response({'error': 'A user with this email already exists in your organization'}, status=400)
    
    # 4. Create Supabase auth user
    from supabase import create_client
    supabase_admin = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
    
    try:
        # Generate a temporary password or use invite link
        import secrets
        temp_password = secrets.token_urlsafe(16)
        
        auth_response = supabase_admin.auth.admin.create_user({
            'email': email,
            'password': temp_password,
            'email_confirm': True,  # Auto-confirm so invite link works
            'user_metadata': {
                'first_name': first_name,
                'last_name': last_name,
            }
        })
        supabase_uid = auth_response.user.id
    except Exception as e:
        return Response({'error': f'Failed to create auth account: {str(e)}'}, status=500)
    
    # 5. Create CustomUser record
    try:
        member = CustomUser.objects.create(
            id=supabase_uid,  # Link to Supabase auth
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=data.get('phone_number', ''),
            gender=data.get('gender', ''),
            role=role,
            job_title=data.get('job_title', ''),
            organization=org,
            status='pending',
        )
        
        # Link department if provided
        dept_id = data.get('department_id')
        if dept_id:
            member.department_id = dept_id
            member.save()
    except Exception as e:
        # Rollback: delete the Supabase auth user
        supabase_admin.auth.admin.delete_user(supabase_uid)
        return Response({'error': f'Failed to create user record: {str(e)}'}, status=500)
    
    # 6. Generate password reset link for the invitee
    try:
        reset_link = supabase_admin.auth.admin.generate_link({
            'type': 'recovery',
            'email': email,
            'options': {
                'redirect_to': f'{settings.FRONTEND_URL}/auth?mode=login'
            }
        })
        action_link = reset_link.properties.action_link
    except Exception as e:
        action_link = f'{settings.FRONTEND_URL}/auth?mode=reset'
    
    # 7. Send invitation email via Resend
    try:
        role_label = role.replace('_', ' ').title()
        resend.Emails.send({
            "from": "Mispar Technologies <noreply@mispartechnologies.com>",
            "to": [email],
            "subject": f"You've been invited to join {org.name} on Mispar",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Welcome to {org.name}!</h2>
                <p>Hi {first_name},</p>
                <p>You've been invited to join <strong>{org.name}</strong> as a <strong>{role_label}</strong> on Mispar Technologies.</p>
                <p>Click the button below to set up your password and get started:</p>
                <a href="{action_link}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Set Up Your Account</a>
                <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">{action_link}</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">Mispar Technologies - Smart Attendance Management</p>
            </div>
            """
        })
    except Exception as e:
        # Log but don't fail — user was created successfully
        print(f"[WARNING] Failed to send invite email to {email}: {e}")
    
    return Response({
        'id': str(member.id),
        'email': member.email,
        'first_name': member.first_name,
        'last_name': member.last_name,
        'role': member.role,
        'status': member.status,
    }, status=201)
```

### 3. Add Resend to Django Requirements

```
pip install resend
```

Add to `settings.py`:
```python
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', 're_YdpmU6o6_Ao7pBuuWPFrSXNDyYMBGZjjV')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://new-mispartechnologies.lovable.app')
```

### 4. Fix `PATCH /api/members/<id>/` and `DELETE /api/members/<id>/`

These are needed for role changes (AdminManagement) and member deletion:

```python
# PATCH - update role, department, etc.
def partial_update(self, request, pk=None):
    member = get_object_or_404(CustomUser, id=pk, organization=request.user.organization)
    # Validate role hierarchy before allowing changes
    # Update fields and save
    
# DELETE - remove member
def destroy(self, request, pk=None):
    member = get_object_or_404(CustomUser, id=pk, organization=request.user.organization)
    # Also delete from Supabase auth
    supabase_admin.auth.admin.delete_user(str(member.id))
    member.delete()
```

## Summary

| Issue | Root Cause | Fix Location |
|---|---|---|
| `GET /api/members/` 500 | Missing `role` filter or serializer field mismatch | Backend |
| `POST /api/members/` 500 | User creation + Supabase provisioning not implemented | Backend |
| `PATCH /api/members/:id/` | Not implemented | Backend |
| `DELETE /api/members/:id/` | Not implemented | Backend |
| Invitation emails not sent | Resend not integrated | Backend (use Resend API) |
| Frontend changes needed | None — code is correct | N/A |

The frontend is ready. All fixes are backend-only. Implement the Django changes above, add `resend` to requirements, set `RESEND_API_KEY` in environment, and the invitation flow will work end-to-end.

