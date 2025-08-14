# QuantumForge

Fullstack quantum version control system.

## Development

- Server: `npm run dev`
- Client: `cd client && npm run dev`

Set env vars:
- `MONGODB_URI` mongodb connection string
- `JWT_SECRET` secret for tokens
- `ELASTICSEARCH_URL` elasticsearch node url
- `SENTRY_DSN` optional sentry dsn

## Testing

- Backend: `npm test`
- E2E: `cd client && npm run cypress:open`