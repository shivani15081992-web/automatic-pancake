# Spoken English — Mobile-first (GitHub-ready)

A mobile-first web app that lets students sign in with Google and use their own Gemini AI as a *virtual teacher*. Free to deploy using GitHub Pages (frontend) plus Google Apps Script (backend) as a free proxy.

## Files
- `index.html` — mobile UI & Google Sign-in button
- `style.css` — styling (mobile-first)
- `script.js` — browser logic: sign-in, chat UI, calls to backend
- `backend.gs` — Google Apps Script web app to proxy calls to Gemini

## Quick setup
1. **Create a Google Cloud project** and enable the "Generative Language API".
2. In Google Cloud, create **OAuth 2.0 Client ID** (type: Web application). Add these authorized origins / redirect URIs as required. Copy the `CLIENT_ID`.
3. Deploy the `backend.gs` as a **Google Apps Script Web App**: `Deploy -> New deployment -> Web app`.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copy the Web App URL and put it into `script.js` as `BACKEND_URL`.
4. In `index.html`, replace `REPLACE_WITH_CLIENT_ID` with your OAuth client ID.
5. In `script.js`, replace `REPLACE_WITH_CLIENT_ID` and `REPLACE_WITH_BACKEND_DEPLOY_URL`.
6. Host `index.html`, `style.css`, `script.js` on GitHub Pages (create a repository and push files). Open the Pages URL on mobile.

## How it works
- Student clicks Sign in with Google. The client obtains an ID token and sends it to the Apps Script backend (`/auth`).
- Backend validates ID token, stores it temporary in CacheService, and returns a session token.
- Subsequent frontend requests (`/chat`, `/lesson`, `/course`) include the session token. The backend retrieves the user's id_token and calls Gemini API as Bearer token — so the Gemini request is performed under the student's Google account.

## Important notes, limitations & security
- This repo is a **starter template**. It demonstrates the flow but is not production hardened.
- **Security**: The current backend stores ID tokens in Apps Script Cache for convenience. For a production system use a secure DB and implement refresh-token flow.
- **Quota**: Gemini usage will consume each student's own quota. If a student doesn't have access to Gemini (region or account limits), calls will fail for them.
- **OAuth verification**: If you publish to many users, you may need to go through Google's OAuth verification process for the consent screen.

## Adding AdSense later
- To add AdSense, place the script provided by Google inside the `<head>` of `index.html` and add ad placeholders where desired. You won't need other code changes.

## Want me to deploy?
If you want, I can give step-by-step commands to:
1. Create the OAuth client
2. Deploy the Apps Script web app
3. Set the placeholders
So you can copy-paste and get the site live quickly.
