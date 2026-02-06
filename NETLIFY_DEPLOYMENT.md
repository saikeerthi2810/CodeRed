# 🚀 Netlify Deployment Guide

## Environment Variables Setup

### Required Variables:
Add these in Netlify Dashboard → Site Settings → Environment Variables

```bash
VITE_GEMINI_API_KEY=AIzaSyCxEuGizljbfm3sx930UoyJGMOQT7lpWXc
VITE_SUPABASE_URL=https://obrncrfrwpvyyuxmlvio.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icm5jcmZyd3B2eXl1eG1sdmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTEyNTMsImV4cCI6MjA4NTk2NzI1M30.ffeUndtHC_d81nmIpnP6A4Zt1KVs8_BqSFZSNyF_aeY
```

## Steps:

1. **Login to Netlify**: https://app.netlify.com
2. **Select your site**: Click on "CodeRed" (or your site name)
3. **Go to Settings**: Site settings (top navigation)
4. **Find Environment Variables**: 
   - Click "Environment variables" in the left sidebar
   - OR: Build & deploy → Environment variables
5. **Add Variables**:
   - Click "Add a variable" or "Add environment variable"
   - For each variable above:
     - Enter the **Key** (e.g., `VITE_GEMINI_API_KEY`)
     - Enter the **Value** (the long string)
     - Click "Create variable" or "Save"
6. **Redeploy**:
   - Go to: Deploys tab
   - Click: "Trigger deploy" button
   - Select: "Deploy site"

## Verification:

After deployment completes:
- Visit your site URL
- Open browser console (F12)
- You should see:
  - ✅ "✅ Gemini API Key configured"
  - ✅ ML model training successfully
  - ✅ No environment variable errors

## Troubleshooting:

If errors persist:
1. **Check variable names**: Must be EXACTLY as shown (case-sensitive)
2. **Check for spaces**: No extra spaces in keys or values
3. **Clear deploy cache**: Deploys → Trigger deploy → "Clear cache and deploy site"
4. **Check build logs**: Look for "Environment variables" section in build logs

## Expected Build Output:

```
Build settings
Environment variables
  - VITE_GEMINI_API_KEY
  - VITE_SUPABASE_URL  
  - VITE_SUPABASE_ANON_KEY
```

If you see this in your build logs, the variables are configured correctly! 🎉
