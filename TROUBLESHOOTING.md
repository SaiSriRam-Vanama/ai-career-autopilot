# Fixing Google OAuth Errors

## Issue 1: "The given origin is not allowed for the given client ID"

This error means `http://localhost:3000` is not authorized in your Google Cloud Console.

### Fix Steps:

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Navigate to Credentials**:
   - Select your project
   - Click "APIs & Services" → "Credentials"

3. **Edit your OAuth 2.0 Client ID**:
   - Find your client ID: `941518658194-gc3a6tnj7vq1j18ved3pu3u38dko1d54`
   - Click the pencil/edit icon

4. **Add Authorized JavaScript Origins**:
   - Under "Authorized JavaScript origins", click "+ ADD URI"
   - Add: `http://localhost:3000`
   - Click "Save"

5. **Add Authorized Redirect URIs** (if not already added):
   - Under "Authorized redirect URIs", click "+ ADD URI"
   - Add: `http://localhost:3000`
   - Click "Save"

6. **Wait a few minutes** for changes to propagate (usually instant, but can take up to 5 minutes)

7. **Refresh your browser** and try again

---

## Issue 2: Backend API Timeout

The backend is timing out on `/auth/login` and `/auth/register` requests.

### Possible Causes:

1. **MongoDB Connection Issue**:
   - Your MongoDB Atlas cluster might be paused or unreachable
   - Connection string might be incorrect

2. **Backend Not Responding**:
   - The backend might be stuck or crashed

### Fix Steps:

1. **Check Backend Terminal**:
   - Look at the terminal running `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
   - Check for any error messages

2. **Test Backend Health**:
   - Open browser: http://localhost:8000/health
   - Should return: `{"status": "healthy", ...}`
   - If it doesn't load, the backend is not running properly

3. **Check MongoDB Connection**:
   - Verify your MongoDB Atlas cluster is running (not paused)
   - Check if your IP address is whitelisted in MongoDB Atlas
   - Test connection string

4. **Restart Backend**:
   - Stop the backend (Ctrl+C in terminal)
   - Start again: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
   - Watch for startup errors

---

## Quick Test

After fixing the Google OAuth origin:

1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. You should see the Google account picker
4. Select your account
5. You should be redirected to the dashboard

If you still get timeout errors, the backend database connection needs to be fixed first.
