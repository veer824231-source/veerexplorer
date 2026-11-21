# VEER EXPLOREX Notifications

This package keeps the supplied `index.html` and adds:
- In-app notification panel and toast
- Browser push subscription UI
- A real `/sw.js` service worker
- Vercel API routes backed by Upstash Redis
- An authenticated endpoint for sending notifications

## Deploy
1. Keep this project structure at the root of the GitHub/Vercel project.
2. Install dependencies with `npm install` (Vercel installs from package.json automatically).
3. In Vercel > Project > Settings > Environment Variables, add:
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
   - VAPID_PUBLIC_KEY
   - VAPID_PRIVATE_KEY
   - VAPID_SUBJECT (for example `mailto:you@example.com`)
   - ADMIN_NOTIFICATION_KEY (a long random secret)
4. Generate VAPID keys locally: `npx web-push generate-vapid-keys`
   Put the Public Key in VAPID_PUBLIC_KEY and Private Key in VAPID_PRIVATE_KEY.
   The public key must also be copied into `index.html` by replacing `__VAPID_PUBLIC_KEY__`.
5. Redeploy the Vercel project.
6. Open the live site over HTTPS, open Notifications, and click Enable push notifications. Allow browser permission.

## Send a notification
Send a POST request to `https://YOUR-DOMAIN/api/send-notification` with:
Header: `Content-Type: application/json`
Header: `x-admin-key: YOUR_ADMIN_NOTIFICATION_KEY`
Body:
`{"title":"VEER EXPLOREX","body":"A new update is available","url":"/"}`

The notification is stored in Redis for the in-app list and delivered to subscribed browsers.
Never put ADMIN_NOTIFICATION_KEY, VAPID_PRIVATE_KEY, or Upstash token in frontend code or share them in chat.

## Notes
- Browser push requires HTTPS (Vercel provides this) and user permission.
- Users must enable push on each browser/device.
- Notifications cannot be delivered to users who have not subscribed.
- This does not automatically send announcements; an authenticated admin request is required.
