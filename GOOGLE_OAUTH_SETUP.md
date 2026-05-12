# Google OAuth Setup Instructions

## Frontend Setup

1. **Get Google Client ID**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000`
   - Copy the Client ID

2. **Update Frontend Environment**:
   - Open `frontend/.env.local`
   - Replace `your_google_client_id_here` with your actual Google Client ID:
     ```
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
     ```

## Backend Setup

1. **Update Backend Environment**:
   - Open `.env` in the root directory
   - Add:
     ```
     GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
     ```
   - This should be the SAME Client ID as the frontend

2. **Restart Servers**:
   - Stop the backend server (Ctrl+C)
   - Restart: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
   - The frontend dev server will auto-reload

## Testing

1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Select your Google account
4. You should be redirected to the dashboard

## Troubleshooting

- **"Google Sign-In not configured"**: Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `frontend/.env.local`
- **Backend error**: Ensure `GOOGLE_CLIENT_ID` is set in root `.env` file
- **Invalid token**: Make sure both frontend and backend use the SAME Client ID
