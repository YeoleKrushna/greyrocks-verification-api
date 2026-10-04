# GreyRocks Verification API

A small Express service that verifies GreyRocks internship certificates against the Neon `certificates` table.

## Run locally

1. Install Node.js and dependencies with `npm install`.
2. Set `NEON_DB` in the process environment or create a local `.env` from `.env.example` and configure it privately.
3. Start with `npm start`.
4. Check `http://localhost:10000/health` and `http://localhost:10000/api/verification/GR-AI-2026-FC1AC8`.

## Deploy to Render

Create a **Web Service** for this directory and name it `greyrocks-verification-api` to use the frontend default API origin. Configure it with:

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variable: `NEON_DB` (set the connection string privately in the Render dashboard)

The service listens on `process.env.PORT` and defaults to port `10000` locally. Configure the frontend build variable `PUBLIC_VERIFICATION_API_URL` with this service's HTTPS origin if the Render service does not use `https://greyrocks-verification-api.onrender.com`.

CORS allows browser requests from `https://greyrocks.in` and `https://www.greyrocks.in`.