# Render deployment

Deploy one Render **Web Service** from this project root. The service serves the built admin UI and the existing API on one origin, so the frontend can keep using `/api` and no cross-origin CORS configuration is needed.

## Service settings

- Root Directory: `califnco-admin-fullstack` (the folder containing the root `package.json`)
- Runtime: Node
- Node version: 24.x (the package requires Node.js 22.13 or newer)
- Build Command: `npm ci && npm run build:deployment`
- Start Command: `npm start`
- Health Check Path: `/api/health`

The default app selector is `admin`; set `CALIFNCO_APP=admin` if the Render service does not inherit that default. The server binds to `0.0.0.0` and uses Render's `PORT`.

## Environment variables

Set these in the Render service's Environment settings. Do not add `.env` to Git or place server secrets in `VITE_` variables.

Required for live Firebase-backed data and authentication:

- `DEMO_MODE=false`
- `FIREBASE_PROJECT_ID=<your Firebase project ID>`
- `FIREBASE_SERVICE_ACCOUNT_JSON=<the complete service-account JSON>`
- `VITE_FIREBASE_API_KEY=<Firebase web app API key>`
- `VITE_FIREBASE_AUTH_DOMAIN=<Firebase web app auth domain>`
- `VITE_FIREBASE_PROJECT_ID=<Firebase project ID>`
- `VITE_FIREBASE_APP_ID=<Firebase web app app ID>`

Required for Gemini captions in the existing admin AI studio:

- `GEMINI_API_KEY=<your server-side Gemini API key>`
- `GEMINI_TEXT_MODEL=gemini-2.5-flash`

`GEMINI_TEXT_MODEL` is the existing default and can be overridden if the model is not enabled for the account. The key is read only by the server; never prefix it with `VITE_`.

Set optional integrations only when using them: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CRON_SECRET`, `AI_IMAGE_PROVIDER`, `HF_TOKEN`, `HF_IMAGE_MODEL`, `GEMINI_IMAGE_MODEL`, Cloudinary, Instagram, email, and SMS variables from `.env.example`. Keep `INSTAGRAM_PUBLISH_ENABLED=false` until an authorized draft is reviewed.

Do not configure `ALLOWED_ORIGINS` for the same-origin admin UI. If you later move the UI to a separate host, set `ALLOWED_ORIGINS` to its exact HTTPS origin and set a Vite `VITE_API_URL` only after adding matching client support; this project currently uses same-origin `/api` requests.

## Firebase setup

Create a Firebase service account with the required Firebase Admin permissions and store its entire JSON in Render's `FIREBASE_SERVICE_ACCOUNT_JSON` secret field. Ensure `FIREBASE_PROJECT_ID` matches that account, enable Firebase Email/Password Authentication, create Firestore, deploy `firestore.rules` and indexes, and add the Render domain to Firebase Authentication's authorized domains. Use `npm run seed` with the same server credentials when initial catalogue data is required; create an administrator account and run the documented `npm run bootstrap:admin` command.

The current local `.env` is not copied or uploaded by this procedure. Keep secrets in Render's environment settings.

## Deployment verification

After deployment, open `/api/health`. A 200 response means the service process and route are reachable; inspect `mode` and integration indicators for setup state. It does not verify that Firebase credentials, Gemini account access, or external services can actually complete requests. Sign in with a configured Firebase account, exercise the authenticated admin API, and run a Gemini draft to validate those providers.
