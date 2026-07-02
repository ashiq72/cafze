# Cafze Event Ticketing

Community-driven event ticketing for organizers and attendees in Bangladesh.

## Included

- Organizer registration and JWT login
- Email verification with Base360 identity
- Community feed with image posts, likes and comments
- Event attachments that link posts directly to booking
- Community profiles and follow relationships
- Dashboard metrics and event list
- Create, edit and delete event flows
- Dynamic ticket types
- Organizer event details and attendee status
- Public event discovery and event details
- Guest booking with QR ticket confirmation
- Camera QR scanning and manual ticket check-in
- Typed Axios services, loading states, errors and toast notifications

## Run locally

1. Create the environment file:

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Set the API origin in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_TENANT_ID=free4mood
   ```

3. Install and start:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3011`.

Camera scanning works on `localhost` or a deployed HTTPS origin.

## Run with Docker

`NEXT_PUBLIC_*` values are embedded into the browser bundle while the image is
built. Set them before building; changing them only on `docker run` will not
change the frontend API target.

Build and start with Docker Compose:

```bash
docker compose up --build -d
```

Open `http://localhost:3011`. View logs or stop the app with:

```bash
docker compose logs -f cafze
docker compose down
```

To build and run without Compose:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000 \
  --build-arg NEXT_PUBLIC_TENANT_ID=free4mood \
  -t cafze-web .

docker run --rm -p 3011:3011 cafze-web
```

For production, replace the API build argument with the public Base360 origin,
for example `https://base360.onrender.com`. Do not append `/api` or `/api/v1`.

## API contract

The Axios client uses the hybrid Base360 endpoints:

- `/api/v1/users/create-user`
- `/api/v1/auth/login`, `/api/v1/auth/verify-email`
- `/api/v1/users/me`
- `/api/events`, `/api/events/:id`
- `/api/public/events`, `/api/public/events/:slug`
- `/api/tickets`, `/api/tickets/:eventId`
- `/api/attendees`, `/api/attendees/:eventId`
- `/api/checkin`
- `/api/v1/social/posts`
- `/api/v1/social/profiles/:userId`
- `/api/v1/social/follows/*`

JWT tokens are stored as `cafze_access_token` in local storage and attached as
`Authorization: Bearer <token>`. Every request also includes the configured
`x-tenant-id`. Cafze also mirrors the token to Free4Mood's `accessToken`
cookie, allowing both frontends to share a login session on the same host.

Booking first creates an attendee, then creates a ticket using the returned
`attendeeId`. API responses may be returned directly or inside a `{ data }`
envelope. The client also supports collection envelopes such as
`data.result`, `data.items`, `data.events`, `data.tickets`, and
`data.attendees`.

Both booking requests include the same `Idempotency-Key` header. The backend
should persist and honor this key to prevent duplicate attendee or ticket
records when a customer retries after a network timeout.

Check-in should return a 2xx response for a valid ticket, 400/404 for an invalid
ticket, and 409 or a message containing `already used` for a previous check-in.
Authentication and 5xx failures are treated as operational errors, not invalid
tickets.

The event banner field is a local UI preview as requested. Connect it to the
backend media provider when file storage is available.
