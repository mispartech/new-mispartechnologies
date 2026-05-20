# MSSE — Step 4: Smart Campus Security (Backend Spec)

Frontend: `src/pages/msse/MsseSecurity.tsx` at `/msse/dashboard/security`.
API client (mocked): `src/lib/api/msse/security.ts`.

## Goals
Unified security operations console: live CCTV grid, AI watchlist matching, smart gate console
(face / RFID / QR / visitor pass), restricted-zone monitoring, incident management, and
campus-wide heatmap. Tenant-scoped via JWT (institution + campus inferred — never in URL).

## Data model (Django)

```
class Camera(models.Model):
    institution = FK(Institution)
    campus = FK(Campus, null=True)
    name = CharField()
    zone = CharField()                 # Perimeter | Academic | Hostel | Restricted | Residential | Admin
    rtsp_url = CharField()             # never returned to clients
    snapshot_url = URLField(null=True) # signed URL refreshed every 5s
    status = CharField(choices=[online, offline, degraded])
    last_frame_at = DateTimeField(null=True)
    ai_enabled = BooleanField(default=True)

class WatchlistEntry(models.Model):
    institution = FK(Institution)
    profile_embedding_id = FK(IdentityProfile, null=True)  # Step 2 link
    name = CharField()
    reason = CharField(choices=[expelled, banned, wanted, staff_alert])
    photo_url = URLField()
    added_by = FK(User)
    active = BooleanField(default=True)
    expires_at = DateTimeField(null=True)

class WatchlistMatch(models.Model):
    entry = FK(WatchlistEntry)
    camera = FK(Camera)
    ts = DateTimeField(db_index=True)
    confidence = FloatField()
    frame_url = URLField()             # faces/{org}/watchlist/{yyyy}/{mm}/{dd}/{id}.jpg
    acknowledged_by = FK(User, null=True)

class Gate(models.Model):
    institution = FK(Institution)
    campus = FK(Campus, null=True)
    name = CharField()
    methods_enabled = JSONField(default=list)  # [face, rfid, qr, visitor_pass, manual]
    online = BooleanField(default=True)

class GateEvent(models.Model):
    gate = FK(Gate)
    ts = DateTimeField(db_index=True)
    person = FK(IdentityProfile, null=True)
    method = CharField(choices=GATE_METHODS)
    direction = CharField(choices=[in, out])
    authorized = BooleanField()
    reason = CharField(null=True)      # populated when authorized=False

class RestrictedZone(models.Model):
    institution = FK(Institution)
    name = CharField()
    polygon = JSONField()              # geojson polygon on campus map
    allowed_hours = JSONField()        # [{day, start, end}]
    allowed_roles = JSONField(default=list)

class RestrictedZoneAlert(models.Model):
    zone = FK(RestrictedZone)
    ts = DateTimeField(db_index=True)
    person = FK(IdentityProfile, null=True)
    severity = CharField(choices=[info, warning, critical])
    description = TextField()
    frame_url = URLField(null=True)

class Incident(models.Model):
    institution = FK(Institution)
    title = CharField()
    zone = CharField()
    severity = CharField(choices=[info, warning, critical])
    status = CharField(choices=[open, investigating, resolved], default='open')
    reported_by = CharField()          # AI Vision | Gate System | User name
    assigned_to = FK(User, null=True)
    ai_summary = TextField(null=True)  # Lovable AI Gateway (google/gemini-2.5-flash)
    related_match = FK(WatchlistMatch, null=True)
    related_gate_event = FK(GateEvent, null=True)
    related_zone_alert = FK(RestrictedZoneAlert, null=True)
    opened_at = DateTimeField(auto_now_add=True)
    resolved_at = DateTimeField(null=True)
```

## REST endpoints (all under `/api/msse/security/`)

| Method | Path                              | Purpose                                  | Roles |
|--------|-----------------------------------|------------------------------------------|-------|
| GET    | `kpis/`                           | Headline security KPIs                   | security_officer, admin, principal |
| GET    | `cameras/`                        | All cameras + status + signed snapshot   | security_officer, admin |
| GET    | `cameras/{id}/stream/`            | Returns short-lived HLS URL              | security_officer |
| GET    | `watchlist/`                      | Watchlist entries                        | security_officer, admin |
| POST   | `watchlist/`                      | Add entry (multipart: photo + reason)    | security_officer, admin |
| DELETE | `watchlist/{id}/`                 | Deactivate entry                         | admin |
| GET    | `watchlist/matches/`              | Recent matches (filter: zone, since)     | security_officer, admin |
| POST   | `watchlist/matches/{id}/ack/`     | Acknowledge match                        | security_officer |
| GET    | `gates/`                          | Gate config + online status              | security_officer, admin |
| GET    | `gates/events/`                   | Gate event stream (filter: gate, authorized, q) | security_officer, admin |
| GET    | `zones/`                          | Restricted zones + polygons              | security_officer, admin |
| GET    | `zones/alerts/`                   | Restricted zone alerts                   | security_officer, admin |
| GET    | `incidents/`                      | Incident log (filter: status, severity)  | security_officer, admin, principal |
| POST   | `incidents/`                      | Create manual incident                   | security_officer |
| PATCH  | `incidents/{id}/`                 | Update status / assignment               | security_officer |
| POST   | `incidents/{id}/dispatch/`        | Dispatch officer (push + SMS)            | security_officer |

## Realtime (Django Channels)

- `/ws/msse/security/feed/` — tenant-wide stream
- Message types: `camera.status`, `watchlist.match`, `gate.event`, `zone.alert`, `incident.created`, `incident.updated`

## AI pipelines

1. **Watchlist matcher** — every camera frame (≤2 fps per cam) is embedded with InsightFace and
   compared against `WatchlistEntry.profile_embedding` via pgvector. Threshold ≥ 0.85 triggers
   `WatchlistMatch` + auto-creates a `critical` Incident with `ai_summary` from Lovable AI
   Gateway (`google/gemini-2.5-flash`).
2. **Restricted zone detector** — person bounding boxes against polygon + hour rules. Outside
   allowed hours/roles → `RestrictedZoneAlert`.
3. **Tailgating detector** — at each gate, when 2+ persons cross within 1.5s and only one
   identity resolved → unauthorized `GateEvent` with reason "Tailgating suspected".

## RBAC
- `security_officer` → full read/write on security namespace.
- `principal`, `institution_owner` → full read, can resolve incidents.
- `admin` → manage watchlist, gates, zones.
- All other roles → no access.

## Storage
- `faces/{org_id}/watchlist/{yyyy}/{mm}/{dd}/{match_id}.jpg`
- `faces/{org_id}/zones/{yyyy}/{mm}/{dd}/{alert_id}.jpg`
- `faces/{org_id}/gates/{yyyy}/{mm}/{dd}/{event_id}.jpg` (optional)

## Notes
- Never return raw `rtsp_url` to clients — always proxy via short-lived signed HLS URLs.
- Suppress non-critical 404s with `silent` flag on the frontend client.
- Watchlist photo upload must run liveness/quality check (reuse Step 2 pipeline).
- All times stored UTC; render in institution timezone from `/api/profile/`.
