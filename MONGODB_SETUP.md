# Quick MongoDB Installation Guide

## Fastest Option: Download MongoDB Community Server

### Step 1: Download
Go to: https://www.mongodb.com/try/download/community

Select:
- **Version:** 7.0.x (latest)
- **Platform:** Windows
- **Package:** MSI

Click **Download**

### Step 2: Install
1. Run the downloaded `.msi` file
2. Accept license agreement
3. Choose **"Complete"** installation type
4. **IMPORTANT:** Check these boxes:
   - ✅ Install MongoDB as a Service
   - ✅ Run service as Network Service user
   - ✅ Install MongoDB Compass (optional GUI tool)
5. Click **"Next"** → **"Install"**
6. Wait 2-3 minutes for installation

### Step 3: Verify
MongoDB should start automatically as a Windows service.

To verify, open PowerShell and run:
```powershell
mongod --version
```

You should see the MongoDB version number.

### Step 4: You're Done!
Your `.env` file is already configured to use local MongoDB:
```
MONGODB_URL=mongodb://localhost:27017/ai_career_autopilot
```

No additional configuration needed!

---

## Alternative: MongoDB Atlas (Cloud)

If the "Create Deployment" button wasn't working:

1. Try refreshing the page
2. Use a different browser (Chrome recommended)
3. Or try this direct link: https://cloud.mongodb.com/v2#/clusters

Once cluster is created, you'll get a connection string to replace in `.env` line 7.

---

## After MongoDB is Ready

Once MongoDB is installed, run:
```powershell
python -m uvicorn app.main:app --reload
```

Then access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
