# PerioKit Frontend

Vue 3 + TypeScript frontend for the PerioKit periodontal charting system.

## API Boundary

Frontend must call the Express backend as the main API boundary.

- REST is used for authentication and file upload flows.
- Apollo Client/GraphQL is used for application data through the backend `/graphql` endpoint.
- Frontend must not call Supabase directly unless a future feature explicitly requires it, such as realtime subscriptions or direct upload with a reviewed access policy.

## Environment

```env
VITE_API_URL=http://localhost:3000
```

Supabase URL and anon key are intentionally not required by the frontend in the current architecture.

## Development

```bash
npm install
npm run dev
```
