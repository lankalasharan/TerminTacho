# 🔐 RLS Security Implementation Guide

## Overview
Row-Level Security (RLS) has been enabled on all public tables in your Supabase database. This protects against unauthorized data access and modification.

## What Was Changed

### 1. **Database Tables Enhanced**
- ✅ Added `userId` column to `Report` and `Review` tables (nullable for backward compatibility)
- ✅ Added indexes on `userId`, `officeId`, `createdAt` for performance
- ✅ Enabled RLS on all public-facing tables

### 2. **Security Policies Implemented**

#### Read Access (✅ Everyone)
- Public read access to `Office`, `ProcessType`, `Report`, and `Review`
- No authentication required to view data
- Essential for your public dashboard

#### Write Access (🔐 Restricted)
| Table | Insert | Update | Delete | Notes |
|-------|--------|--------|--------|-------|
| Report | Authenticated + Anon | Own only | Own only | Users can only modify their own submissions |
| Review | Authenticated + Anon | Own only | Own only | Users can only modify their own reviews |
| Office | Service Role Only | Service Role Only | Service Role Only | Admin-only (backend) |
| ProcessType | Service Role Only | Service Role Only | Service Role Only | Admin-only (backend) |
| User/Account/Session | Owner or Service Role | Owner or Service Role | Owner or Service Role | Protects auth data |

### 3. **Helper Functions**
- `can_manage_report()` - Check if user owns a report
- `can_manage_review()` - Check if user owns a review

## Deployment Steps

### Step 1: Push Migration to Supabase
```bash
# Navigate to your project
cd c:\Users\reddy\Desktop\termintacho

# Apply the RLS migration
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### Step 2: Test Policies in Supabase Dashboard
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run a quick test query:
```sql
-- Check if RLS is enabled
SELECT * FROM pg_tables WHERE tablename IN ('Office', 'ProcessType', 'Report', 'Review') AND schemaname = 'public';

-- View enabled RLS
SELECT * FROM pg_class WHERE relname IN ('Office', 'ProcessType', 'Report', 'Review');
```

### Step 3: Test with Different Roles
```bash
# Test as anon (unauthenticated)
# Should be able to: READ reports, INSERT report without userId
# Should NOT be able to: UPDATE/DELETE others' reports

# Test as authenticated
# Should be able to: READ reports, INSERT/UPDATE/DELETE own reports
# Should NOT be able to: UPDATE/DELETE others' reports

# Test as service_role (backend)
# Should be able to: All operations on all tables
```

## How It Works

### Anonymous Submissions (Current Behavior - Still Works ✅)
```javascript
// Frontend can still submit anonymously via anon key
const { data, error } = await supabase
  .from('Report')
  .insert({
    officeId: 'berlin-123',
    processTypeId: 'blue-card',
    method: 'online',
    submittedAt: new Date(),
    status: 'approved',
    notes: 'Anonymous submission',
    // userId is NULL - allowed by policy
  });
```

### Authenticated Submissions (New - More Control)
```javascript
// Users logged in can submit with userId for tracking
const session = await supabase.auth.getSession();
const { data, error } = await supabase
  .from('Report')
  .insert({
    officeId: 'berlin-123',
    processTypeId: 'blue-card',
    method: 'online',
    submittedAt: new Date(),
    status: 'approved',
    notes: 'Authenticated submission',
    userId: session.user.id, // Can edit/delete later
  });
```

### User Management (Protected)
```javascript
// Users can only see their own profile
const { data, error } = await supabase
  .from('User')
  .select('*')
  .eq('id', session.user.id)
  .single();

// Cannot access other users' data - RLS will block
```

## Security Benefits

✅ **Prevents Data Breaches**
- Unauthorized users cannot access or modify sensitive data
- Each row is protected by policies

✅ **Enforces Ownership**
- Users can only modify their own submissions
- Service role (backend) can manage everything

✅ **Maintains Anonymity**
- Users can still submit anonymously (userId = NULL)
- Optional tracking for authenticated users

✅ **Performance Optimized**
- Indexes on filtered columns (userId, officeId, createdAt)
- Policies evaluated at database level (faster than application)

✅ **Scalable**
- Grows with your user base
- No application code changes needed

## Testing Checklist

### Before Deployment
- [ ] Migration runs without errors
- [ ] Prisma client regenerates successfully
- [ ] No TypeScript errors in your app

### After Deployment
- [ ] Dashboard loads (public read works)
- [ ] Can submit report anonymously
- [ ] Can submit report as authenticated user
- [ ] Cannot edit/delete others' reports
- [ ] Service role can manage all data
- [ ] All API endpoints still work

### Verify in Supabase
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('Report', 'Review', 'Office', 'ProcessType');

-- View all policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('Report', 'Review', 'Office', 'ProcessType');
```

## Rollback Plan

If something breaks, you can revert:

```bash
# Revert the migration
npx prisma migrate resolve --rolled-back add_rls_security

# Or manually disable RLS (NOT RECOMMENDED for production)
ALTER TABLE "Report" DISABLE ROW LEVEL SECURITY;
```

## API Updates Needed (Optional)

Your current API routes work fine, but to support user ownership:

```typescript
// app/api/reports/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const session = await auth(); // Get authenticated user

  const report = await prisma.report.create({
    data: {
      ...body,
      userId: session?.user?.id || null, // Track if authenticated
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
```

## Next Steps

1. ✅ **Deploy this migration to production**
2. 📊 **Monitor Supabase logs** for any blocked queries
3. 🧪 **Test with real users** to ensure no breaking changes
4. 📈 **Enable Supabase logs** for security audit trail

---

**Questions?** Check [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

