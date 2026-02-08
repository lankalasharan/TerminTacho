# Authentication Setup Guide

## 🔐 Setting Up Authentication

Your website now includes authentication with:
- ✅ Email (magic link)
- ✅ Google OAuth  
- ✅ Facebook OAuth (also supports Instagram login)

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### 1. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add this to `NEXTAUTH_SECRET` in `.env.local`

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. For production, add: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

### 3. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. In Settings → Basic, copy App ID and App Secret
5. In Facebook Login → Settings, add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
6. For production, add: `https://yourdomain.com/api/auth/callback/facebook`
7. Copy to `.env.local`

**Note**: Facebook Login automatically works with Instagram accounts linked to Facebook.

### 4. Email Provider Setup (Optional)

For email magic links:
1. Use Gmail with an [App Password](https://support.google.com/accounts/answer/185833)
2. Or use services like SendGrid, AWS SES, etc.
3. Configure SMTP settings in `.env.local`

### Testing Authentication

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign In" in the header
4. Test each provider

### Production Deployment

Before deploying:
1. Update `NEXTAUTH_URL` to your production domain
2. Update OAuth redirect URIs in Google/Facebook consoles
3. Never commit `.env.local` to git
4. Add environment variables to your hosting platform (Vercel, etc.)

### Database

Authentication tables are automatically created:
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `User` - User profiles (minimal data stored)
- `VerificationToken` - Email verification tokens

**Privacy**: Only email and provider info is stored. No personal data from OAuth providers is retained.

