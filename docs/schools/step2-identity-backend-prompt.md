# MSSE — Step 2: Biometric Identity System (Backend Spec)

Implement the biometric identity layer that underpins every MSSE module
(attendance, security, exams, hostel, library, transport). Frontend ships at
`/msse/dashboard/identity`; the Django backend must back it with the endpoints
below.

## Tenancy & permissions

Every request is tenant-scoped via JWT. The frontend NEVER sends
`organization_id`, `campus_id`, `faculty_id`, or `user_id` in URLs or
payloads. The backend infers all of these from the authenticated user.

RBAC matrix (see `roleConfig.ts`):

| Role                | List | Detail | Create | Enroll/Re-enroll | Resolve duplicates | Issue credential |
|---------------------|:----:|:------:|:------:|:----------------:|:------------------:|:----------------:|
| `institution_owner` | ✅   | ✅     | ✅     | ✅               | ✅                 | ✅               |
| `principal`         | ✅   | ✅     | ✅     | ✅               | ✅                 | ✅               |
| `dean`              | ✅   | ✅     | ✅     | ✅               | ✅                 | ✅               |
| `faculty_admin`     | ✅†  | ✅†    | ✅†    | ✅†              | ✅†                | ✅†              |
| `hod`               | ✅†  | ✅†    | ✅†    | ✅†              | ❌                 | ❌               |
| `security_officer`  | ✅   | ✅     | ❌     | ❌               | ✅                 | ❌               |
| `teacher`           | ✅†  | ✅†    | ❌     | ❌               | ❌                 | ❌               |
| `student`           | self | self   | ❌     | self only        | ❌                 | ❌               |

† Scoped to the user's faculty/department only.

## Data model

```python
class Identity(models.Model):
    organization = FK(Organization)
    campus       = FK(Campus, null=True)
    faculty      = FK(Faculty, null=True)
    department   = FK(Department, null=True)

    user         = OneToOne(User, null=True)   # optional account link
    full_name    = CharField
    reference_no = CharField(unique=("organization","reference_no"))
    role         = Choices: student | teacher | staff | admin | visitor
    class_or_level = CharField(null=True)

    enrollment_status = Choices: pending | enrolled | expired | rejected
    face_quality_score = FloatField(null=True)        # 0..1
    face_embedding     = VectorField(512)             # private — never returned
    face_image_path    = CharField                    # Supabase storage path
    last_seen_at       = DateTimeField(null=True)

    created_at, updated_at

class IdentityCredential(models.Model):
    identity = FK(Identity)
    type     = Choices: face | rfid | nfc | qr
    value    = EncryptedCharField    # card UID, qr token, etc.
    issued_at, revoked_at
```

Storage convention (already established): face images live at
`faces/{org_id}/{identity_id}/enrollment.jpg`. Embeddings stay in Postgres
(pgvector). Never expose `face_embedding` to clients.

## Endpoints

All paths under `/api/msse/identities/`. Pagination via `?page=&page_size=`.

| Method | Path                                | Purpose                                            |
|--------|-------------------------------------|----------------------------------------------------|
| GET    | `/`                                 | List; filters: `q`, `role`, `status`, `faculty_id` |
| POST   | `/`                                 | Create bio-data record (no biometric)              |
| GET    | `/:id/`                             | Detail                                             |
| PATCH  | `/:id/`                             | Update bio-data                                    |
| POST   | `/:id/enroll/`                      | Body `{image_base64}` → InsightFace pipeline       |
| POST   | `/:id/re-enroll/`                   | Invalidate old embedding, enroll new               |
| GET    | `/duplicates/`                      | Pairs flagged by nightly job, similarity ≥ 0.90   |
| POST   | `/duplicates/:dup_id/resolve/`      | Body `{action: "merge"\|"dismiss"}`               |
| POST   | `/:id/credentials/`                 | Body `{type, value?}` → issue RFID/NFC/QR backup   |
| DELETE | `/:id/credentials/:cred_id/`        | Revoke credential                                  |

### Enrollment pipeline (`POST /:id/enroll/`)

1. Decode base64 → run InsightFace detection + alignment.
2. Reject if no face / multiple faces / low quality (`< 0.65`).
3. Compute 512-d embedding.
4. Cross-check against existing embeddings in the same `organization`. If
   cosine similarity ≥ 0.90 to another identity, store a `DuplicateSuspect`
   row and return `{ success: true, duplicate_suspected: true, similarity }`.
5. Upload aligned image → `faces/{org_id}/{identity_id}/enrollment.jpg`.
6. Persist embedding + path. Set `enrollment_status = "enrolled"`,
   `face_quality_score = score`.
7. Emit realtime event on `msse:{org_id}:identity` channel:
   `{type: "identity.enrolled", identity_id, name, role}`.

Response:
```json
{ "success": true, "quality_score": 0.94, "duplicate_suspected": false }
```

### Duplicate detection

Nightly Celery task `msse.identity.detect_duplicates`:

- For each `enrolled` identity, run pgvector top-k search (k=3) over the same
  organization.
- Create `DuplicateSuspect` rows where similarity ≥ 0.90 and the two
  identities have different `reference_no`.
- Skip pairs already resolved.

`POST /duplicates/:id/resolve/`:

- `merge` → merge candidate INTO primary: transfer attendance records,
  credentials, account links; soft-delete candidate.
- `dismiss` → mark suspect resolved with no action.

## Realtime channels

WebSocket (Django Channels) per the overview spec:

- `msse:{org_id}:identity` — enrollment, re-enrollment, credential issuance.
- `msse:{org_id}:identity:duplicates` — new suspects.

## Acceptance criteria

- [ ] All endpoints return `403` for cross-tenant access.
- [ ] `faculty_admin`/`hod` see only their faculty/department.
- [ ] Enroll endpoint rejects multi-face, low-quality, and obviously fake
      (uniform color) images.
- [ ] Duplicate suspects appear in the Duplicates tab within ≤ 24h of enrol.
- [ ] Merge action is atomic (DB transaction); no orphan attendance rows.
- [ ] Face embeddings are never serialized to API responses.
- [ ] Audit log entry written for every enroll, re-enroll, merge, dismiss,
      credential issue, credential revoke.
