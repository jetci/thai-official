# UI Integration Guide (API v1)

- Base URL (real): `/api/v1`
- Base URL (mock): `http://localhost:4010/api/v1`

## Auth Flow
1. Login: `POST /auth/login` -> returns `accessToken` and sets `refreshToken` cookie (HttpOnly)
2. Use access token in `Authorization: Bearer <token>` for protected routes
3. Refresh: `POST /auth/refresh` -> returns a new `accessToken` and refresh cookie
4. Logout: `POST /auth/logout` -> clears the refresh cookie

Required headers/cookies:
- `Authorization: Bearer <accessToken>` for protected routes
- `Cookie: refreshToken=<token>` for refresh/logout if needed

## Error Format (Standard)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "email must be an email",
    "password should not be empty"
  ]
}
```

## Pagination
Response wrapper:
```json
{
  "page": 1,
  "pageSize": 10,
  "total": 100,
  "items": [ /* array of resource */ ]
}
```
Query params: `?page=1&pageSize=10`

## Endpoints Matrix (selected)
- Auth
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Users
  - `GET /users/me` (Bearer)
- Announcements
  - `GET /announcements` (paginated)
- Subjects
  - `GET /subjects` (paginated)
  - `GET /subjects/{id}`
- Positions
  - `GET /positions` (paginated)
  - `GET /positions/{id}`
- Questions
  - `GET /questions?subjectId=<id>` (paginated)
  - `GET /questions/{id}`
- Subscriptions
  - `GET /subscriptions/my` (Bearer)
  - `POST /subscriptions` (Bearer)

## Examples (curl)

Login:
```bash
curl -X POST "http://localhost:4010/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Passw0rd!"}' -i
```

List announcements (paginated):
```bash
curl "http://localhost:4010/api/v1/announcements?page=1&pageSize=10"
```

Questions by subject:
```bash
curl "http://localhost:4010/api/v1/questions?subjectId=cksubj123"
```

Refresh token (using cookie):
```bash
curl -X POST "http://localhost:4010/api/v1/auth/refresh" \
  -H "Cookie: refreshToken=mock-refresh-token" -i
```

## Mock Server
- Start: `npm run api:mock`
- Spec: `openapi/openapi-v1.yaml`
- Port: `4010`

## Notes
- All resource IDs are strings (`cuid`/`uuid`)
- SecuritySchemes: `bearerAuth` (JWT), `cookieAuth` (HttpOnly refresh)
- For full schema, see `openapi/openapi-v1.yaml` and `openapi/openapi-v1.json` (export with `npm run openapi:export`)
