# Schools FR — Face Recognition Microservice Spec (`schools-fr`)

A dedicated, closed-set face recognition service for the Schools vertical. Faster than the general engine because it does **not** handle unknown faces, visitor clustering, or temp-attendance — only enrolled identities can match.

---

## 1. Stack

- FastAPI + Uvicorn workers
- InsightFace `buffalo_l` (512-d embeddings) on CUDA when available, CPU fallback
- pgvector inside the shared Postgres (extension `vector`)
- Embeddings table **partitioned by `org_id`**:

```sql
CREATE TABLE face_embeddings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL,
  person_id     uuid NOT NULL,
  vec           vector(512) NOT NULL,
  quality       real NOT NULL,
  model_version text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
) PARTITION BY HASH (org_id);

-- 16 partitions
CREATE INDEX face_embeddings_vec_idx
  ON face_embeddings USING ivfflat (vec vector_cosine_ops) WITH (lists = 100);
```

A `/recognize` query always includes `WHERE org_id = :org`, so the planner hits a single partition.

---

## 2. Auth

Service accepts:
- Supabase user JWT (forwarded by browser) — validated against Supabase JWKS.
- Service JWT minted by `schools-api` (HS256, secret = `SCHOOLS_FR_SERVICE_JWT_SECRET`) for server-to-server enrollment.

Both carry the resolved `org_id` claim. Requests without one are `401`.

---

## 3. Endpoints

All under `/v1/face/`. Base URL: `https://fr.schools.mispartechnologies.com`.

### `POST /enroll`
```json
// request
{ "person_id": "uuid", "image_base64": "..." }
// response
{ "embedding_id": "uuid", "quality": 0.93, "ok": true }
```
Rejects if `quality < 0.55` with `{ "ok": false, "message": "low_quality" }`.

### `POST /re-enroll`
Same as enroll, but first deletes existing embeddings for `(org_id, person_id)`.

### `POST /recognize`
```json
// request
{
  "image_base64": "...",
  "capture_point_id": "uuid",
  "mode": "gate|classroom|event|kiosk|mobile"
}
// response
{
  "matches": [
    { "person_id": "uuid", "score": 0.94, "bbox": [x, y, w, h] }
  ],
  "latency_ms": 67
}
```
- Top-K = 1 per detected face (closed-set).
- Threshold: cosine ≥ 0.42 (configurable per tenant).
- No match → empty `matches` array (do **not** create a "visitor" record — that's a deliberate difference from the general engine).

### `POST /recognize-batch`
For kiosk/mobile burst frames. Accepts up to 8 frames; returns one match block per frame.

### `GET /health`
```json
{ "gpu": true, "queue_depth": 3, "p50_ms": 42, "p95_ms": 168, "model_version": "buffalo_l@1.4" }
```

### `DELETE /person/{person_id}`
Hard-removes all embeddings for `(org_id, person_id)`. Idempotent.

---

## 4. Performance targets

| Metric | Target |
|---|---|
| `/recognize` p50 | < 80 ms |
| `/recognize` p95 | < 200 ms (10k embeddings/tenant, T4 GPU) |
| `/enroll` p95 | < 500 ms |
| Throughput per worker | ≥ 50 RPS sustained |
| Tenant isolation | Query never scans another partition |

---

## 5. Anti-spoof (optional, per-tenant)

When the tenant has `liveness_required=true` in settings, run a passive liveness check before the embedding lookup. On failure, return `{ matches: [], reason: "liveness_failed" }`. Do not log raw images — only metadata.

---

## 6. Storage hygiene

- Raw enrollment images go to Supabase Storage at `faces/{org_id}/{person_id}/enrollment.jpg` via the existing path. `schools-fr` only stores the embedding vector.
- On `DELETE /person/{id}` the API layer is responsible for purging the storage object too.
