# Cursor command for Nuviobridge deployment

Paste the following into Cursor Agent while the folder
`/Users/fitdog/Desktop/bridge2.0/a` is open:

```text
Prepare the Bridge monorepo for production deployment to an Ubuntu IONOS VPS at
https://www.nuviobridge.com.

Requirements:
1. Preserve all portal API routes, authentication, AI features, reports, and
   pathway dashboards. Do not convert the app to a static export.
2. Use the Next.js standalone server output.
3. Run npm install, portal typecheck, portal tests, and the production build.
4. Run deploy/ionos/build-upload.sh.
5. Confirm the FileZilla upload package exists at
   deploy/ionos/upload/nuviobridge.
6. Never place real API keys in source control or printed terminal output.
7. Report any failed check. Do not upload or change DNS automatically.
```

Then run this in Cursor’s terminal:

```bash
cd /Users/fitdog/Desktop/bridge2.0/a
chmod +x deploy/ionos/build-upload.sh
./deploy/ionos/build-upload.sh
```
