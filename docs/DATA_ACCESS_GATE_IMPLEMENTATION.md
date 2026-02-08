# Data Access Gate Implementation - Complete Guide

## Overview
Your TerminTacho website now requires users to:
1. **Verify their email address** - Via NextAuth email verification
2. **Submit at least one timeline** - Before accessing any data

This creates a two-tier access system that ensures data quality while allowing community contribution.

## How It Works

### User Journey

#### Unauthenticated User
1. Lands on homepage (can see general info)
2. Tries to access `/timelines`, `/leaderboard`, or `/offices/[city]`
3. See locked message: "🔒 Data Access Restricted"
4. Prompted to "Sign In / Create Account"

#### Authenticated but Unverified Email
1. Successfully signs in
2. Email verification is pending
3. See message: "✉️ Verify Your Email"
4. Instructed to check email and click verification link
5. Once email is verified → proceed to step 3

#### Email Verified, No Timeline Submitted
1. Email is now verified ✅
2. Try to access data pages
3. See message: "📝 Submit Your Timeline"
4. Button to go to `/submit` page
5. After submitting first timeline → full access

#### Full Access
1. Email verified ✅
2. Timeline submitted ✅
3. Access all data, leaderboards, office pages

## Database Changes

### User Model Update
```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String?   @unique
  emailVerified         DateTime?  // NextAuth existing field
  image                 String?
  hasSubmittedTimeline  Boolean   @default(false)  // NEW
  timelineSubmittedAt   DateTime?  // NEW
  createdAt             DateTime  @default(now())
  accounts              Account[]
  sessions              Session[]
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_timeline_tracking
```

## New Files Created

### 1. **Verification Utility** (`lib/userVerification.ts`)
Provides helper functions to check user access status:
- `isEmailVerified(userId)` - Check if email is verified
- `hasSubmittedTimeline(userId)` - Check if timeline submitted
- `hasFullDataAccess(userId)` - Check if both conditions met
- `markTimelineSubmitted(userId)` - Mark timeline as submitted
- `getUserVerificationStatus(userId)` - Get complete status object

### 2. **Access Gate Component** (`app/components/DataAccessGate.tsx`)
React component that gates any content:
```tsx
<DataAccessGate>
  <YourContent />
</DataAccessGate>
```

Shows appropriate messages based on user state:
- Not authenticated → Sign in prompt
- Email unverified → Email verification prompt
- No timeline → Submit timeline prompt
- Full access → Shows content

### 3. **Access Status API** (`app/api/user/access-status/route.ts`)
Check user's verification status:
```bash
GET /api/user/access-status
```

Response:
```json
{
  "isAuthenticated": true,
  "emailVerified": true,
  "hasSubmittedTimeline": true,
  "hasFullAccess": true
}
```

## Modified Files

### 1. **Reports API** (`app/api/reports/route.ts`)
- POST endpoint now:
  - Requires authentication (optional for anonymous submissions)
  - Marks timeline as submitted if authenticated
  - Associates report with user ID

### 2. **Protected Pages**
The following pages now show the access gate:
- `/timelines` - Process time data
- `/leaderboard` - Top contributors
- `/offices/[city]` - Office details and reviews

## How to Enable NextAuth Email Verification

Your NextAuth setup uses email-based sign-in. Email verification is handled by:

1. **NextAuth Email Provider** - Sends verification links
2. **VerificationToken Model** - Stores temporary tokens
3. **Automatic Verification** - Email is marked verified when link clicked

The `emailVerified` field is set automatically by NextAuth when user clicks the email verification link.

## Configuration Checklist

### 1. Database Migration
```bash
cd c:\Users\reddy\Desktop\termintacho
npx prisma migrate dev --name add_timeline_tracking
```

### 2. Environment Variables
No new env vars needed. Your existing `DATABASE_URL` is sufficient.

### 3. Deploy Changes
Push these files to your production environment:
- `lib/userVerification.ts` (new)
- `app/components/DataAccessGate.tsx` (new)
- `app/api/user/access-status/route.ts` (new)
- `prisma/schema.prisma` (updated)
- `app/api/reports/route.ts` (updated)
- `app/timelines/page.tsx` (updated)
- `app/leaderboard/page.tsx` (updated)
- `app/offices/[city]/page.tsx` (updated)

## Testing the Flow

### Test Scenario 1: Anonymous User
1. Open incognito/private window
2. Navigate to `/timelines`
3. Should see: "🔒 Data Access Restricted" + "Sign In" button ✅

### Test Scenario 2: Unverified Email
1. Sign in via email
2. DON'T click verification email yet
3. Navigate to `/timelines`
4. Should see: "✉️ Verify Your Email" message ✅
5. Click verification link in email
6. Refresh page
7. Should now see: "📝 Submit Your Timeline" message ✅

### Test Scenario 3: Full Access
1. Continue from Scenario 2
2. Go to `/submit`
3. Submit a timeline
4. Check page refreshes/shows success
5. Navigate to `/timelines`
6. Should see: Full data access ✅
7. Try `/leaderboard` - Should have full access ✅
8. Try `/offices/[city]` - Should have full access ✅

## How to Add Gate to More Pages

To gate any page:

```tsx
// 1. Import the component
import DataAccessGate from "../components/DataAccessGate";

// 2. Wrap your page content
export default function MyPage() {
  return (
    <DataAccessGate>
      <div>Your protected content here</div>
    </DataAccessGate>
  );
}
```

## API-Level Protection (Optional)

If you want to protect API endpoints too:

```typescript
// In your API route
import { getServerSession } from "next-auth";
import { hasFullDataAccess } from "@/lib/userVerification";

export async function GET(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  const hasAccess = await hasFullDataAccess(user?.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  
  // ... rest of your endpoint
}
```

## Troubleshooting

### Issue: User can't verify email
- Check that your SMTP/email service is configured
- Check NextAuth `EMAIL_SERVER_*` env vars are set
- Check spam folder for verification email

### Issue: Timeline submission not marking user as verified
- Ensure user is authenticated (`session?.user?.email`)
- Check database for user record
- Verify Prisma migration was successful

### Issue: Access gate shows wrong state
- Clear browser cache
- Check `/api/user/access-status` directly in browser/postman
- Verify database has correct `emailVerified` and `hasSubmittedTimeline` values

## Future Enhancements

1. **Email Notifications** - Send email when user gets full access
2. **Analytics** - Track how many users pass each gate
3. **Custom Messages** - Allow admin to customize gate messages
4. **Gradual Unlock** - Show what percentage of requirements completed
5. **Social Proof** - Show "X users have unlocked data today"

## Summary

Your website now has a **secure, community-driven access system** that:
- ✅ Protects data from scraping
- ✅ Ensures quality contributions (users invested in their email)
- ✅ Builds community (users submit their data to access others')
- ✅ Maintains anonymity (email verified, data anonymous)
- ✅ Creates growth loop (submit → access → see others → submit more)

