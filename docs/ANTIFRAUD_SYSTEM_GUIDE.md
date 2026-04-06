# Anti-Fraud & Data Quality System - Complete Implementation

## Overview

TerminTacho now has a sophisticated **anti-fraud and data quality system** to reduce fake submissions, spam, and ensure data integrity. This adds strategic friction to protect your platform.

## Key Features Implemented

### 1. **Account Age Weighting** ⏳
- **0 days (new)**: 30% confidence
- **7 days**: 50% confidence  
- **30 days**: 70% confidence
- **90 days**: 85% confidence
- **180+ days**: 100% confidence (fully trusted)

**Impact**: Older, more established accounts have their data weighted higher in calculations.

### 2. **One Review Per Day** 📝
- Users can submit maximum **1 review per 24 hours**
- Prevents spam and review bombing
- Error response: `429 Too Many Requests`
- User-friendly message: "You can submit another review in X hours"

### 3. **Submission Rate Limiting** 🚦
- Maximum **5 timeline submissions per 24 hours**
- Per authenticated user
- Prevents bulk spam
- Error response: `429 Too Many Requests`

### 4. **Duplicate Prevention** 🔍
- One submission per **office + process type** combination per user
- Users cannot resubmit the same city/office and process type more than once
- Also checks **case number + process type** if a case number is provided
- Encourages quality over quantity
- Error response: `409 Conflict`

### 5. **Confidence Scoring** ⭐
Each submission gets a confidence score based on:
- **Account age** (primary factor)
- **Account activity** (helpful votes, submission history)
- **Data recency** (fresher reports weighted higher)

Confidence levels:
- **0.9-1.0**: Very High (trusted sources)
- **0.75-0.9**: High (verified users)
- **0.6-0.75**: Moderate (established users)
- **0.4-0.6**: Low (new accounts)
- **<0.4**: Very Low (brand new accounts)

### 6. **Time Range Display** 📊
Instead of showing exact times that may be unreliable:
- **Minimum** processing time
- **Median** (50th percentile)
- **Maximum** processing time
- **Weighted average** (accounts for source reliability)

Display format: `"15-45 days (typically ~28 days)"`

### 7. **Still Waiting Updates** ⏱️
Users can update their submissions with:
- Status: Still Waiting ⏳ / Completed ✅
- Mark case as still in progress
- Update decision date when complete
- Community gets real-time status without new submissions

### 8. **Trust Metrics Dashboard** 📈
Each user gets public trust stats:
- Account age
- Total submissions
- Helpful votes received
- Trust level badge
- Confidence score

## Database Changes

### Updated Models

```prisma
model Report {
  id                String      @id @default(cuid())
  caseNumber        String?     // NEW - for duplicate detection
  confidenceScore   Float       @default(0.5)  // NEW - 0-1 scale
  isStillWaiting    Boolean     @default(false) // NEW - status tracking
  // ... other fields
  @@unique([userId, caseNumber, processTypeId])  // NEW - prevent duplicates
}

model Review {
  id              String   @id @default(cuid())
  lastReviewDate  DateTime? // NEW - for rate limiting
  // ... other fields
}
```

## New Files Created

### 1. **Anti-Fraud Utilities** (`lib/antifraud.ts`)
Core functions:
- `calculateConfidenceScore(accountAge)` - Returns 0-1 confidence
- `canSubmitReview(userId)` - Check 1-review-per-day limit
- `isDuplicateSubmission(userId, caseNumber, processTypeId)` - Check duplicates by case number
- **API-level**: office + processType duplicate check after ID resolution (catches duplicates even without a case number)
- `checkSubmissionRateLimit(userId)` - Check 5-per-24h limit
- `getUserTrustMetrics(userId)` - Get user's trust profile

### 2. **Data Weighting** (`lib/dataWeighting.ts`)
Display functions:
- `calculateWeightedProcessingDays()` - Min/median/max with weights
- `formatProcessingRange()` - Human-readable output
- `getConfidenceLabel()` - "High", "Moderate", etc.
- `getConfidenceColor()` - Color-coded confidence
- `categorizeByConfidence()` - Filter data by trust level

### 3. **Report Update API** (`app/api/reports/[id]/route.ts`)
Allows users to:
- GET report details with full context
- PATCH to update status, mark as "still waiting", add decision date
- Ownership verification (users can only update their own)

## Updated Files

### 1. **Prisma Schema** (`prisma/schema.prisma`)
- Added confidence score tracking
- Added case number for duplicates
- Added "still waiting" status
- Added unique constraint on user+case+process

### 2. **Reports API** (`app/api/reports/route.ts`)
- Checks for duplicates before creating
- Checks rate limits (5 per 24 hours)
- Calculates and stores confidence score
- Stores case number for duplicate detection
- Returns 409/429 errors for violations

### 3. **Reviews API** (`app/api/reviews/route.ts`)
- Enforces 1 review per 24 hours per user
- Associates review with user
- Returns 429 error if limit exceeded

## Error Responses

### Rate Limit Exceeded (Reviews)
```json
{
  "error": "You can submit another review in 18 hours"
}
// HTTP 429
```

### Not Authenticated
```json
{
  "error": "You must be logged in to submit a report."
}
// HTTP 401
```

### Duplicate Submission (case number)
```json
{
  "error": "You have already submitted a report for this case and process type"
}
// HTTP 409
```

### Duplicate Submission (same office + process)
```json
{
  "error": "You have already submitted a report for the same office and process type. Each user can only submit one report per city/process combination."
}
// HTTP 409
```

### Rate Limit Exceeded (Timeline)
```json
{
  "error": "You've reached the limit of 5 submissions per 24 hours. Try again later."
}
// HTTP 429
```

## User Experience Flow

### User Perspective: Submitting Timeline
1. Fill in form (office, process, dates, case number) — form is always accessible
2. Press Submit
3. If **not logged in**: ⚠️ Yellow banner — "Please log in to submit your data. Your form data is preserved."
   - Clicking "log in" opens sign-in flow and redirects back to `/submit`
4. If logged in and first submission for this office+process: ✅ Success, confidence score = 0.5-1.0
5. If duplicate office+process (or case number): ❌ Error "Already submitted this case"
6. If >5 in 24h: ⚠️ Error "Rate limit exceeded, try again in X hours"
7. Data appears with confidence badge showing account age impact
8. Can return later to mark as "still waiting" or "completed"

### User Perspective: Writing Review
1. Fill in review form
2. Submit
3. If first review or >24h since last: ✅ Success
4. If within 24 hours: ⏳ Error "Try again in X hours"
5. Review appears with trust metrics

## Displaying Data with Confidence

### Timeline View Example
```
Office: Berlin Immigration Office

📊 Processing Time: 45-120 days (typically ~72 days based on 23 reports)

Confidence Breakdown:
  • Very High Trust (10): avg 68 days
  • High Trust (8): avg 75 days
  • Moderate Trust (5): avg 78 days
```

### Report Card Example
```
Date: Jan 15, 2026
Case: BL-2025-12345
Process: Residence Permit
Status: ✅ Completed in 62 days

Trust Score: ⭐⭐⭐⭐ (0.92)
Account Age: 145 days
Helpful: 23 votes
```

## Implementation Checklist

### Database Setup
```bash
cd c:\Users\reddy\Desktop\termintacho
npx prisma migrate dev --name add_antifraud_system
```

### Files to Deploy
- ✅ `lib/antifraud.ts` (new)
- ✅ `lib/dataWeighting.ts` (new)
- ✅ `app/api/reports/[id]/route.ts` (new)
- ✅ `prisma/schema.prisma` (updated)
- ✅ `app/api/reports/route.ts` (updated)
- ✅ `app/api/reviews/route.ts` (updated)

### Frontend Updates Needed
You should update these display components to use the new confidence scores and ranges:
- `/timelines` - Show ranges instead of exact times, add confidence badges
- `/offices/[city]` - Show weighted averages by trust level
- Report cards - Display confidence score and account age indicators

## Configuration Options

You can adjust friction levels in `lib/antifraud.ts`:

```typescript
// Adjust review submission limits
canSubmitReview() // Currently: 1 per 24 hours

// Adjust timeline submission limits
checkSubmissionRateLimit(userId, {
  maxSubmissions: 5,    // Change this
  timeWindowHours: 24   // Change this
})

// Adjust confidence curve
calculateConfidenceScore() // Modify the day thresholds
```

## Trust Levels & Weighting

### Account Age Impact
| Age | Confidence | Usage |
|-----|-----------|-------|
| <1 day | 30% | Weighted 30% in averages |
| 7 days | 50% | Weighted 50% in averages |
| 30 days | 70% | Weighted 70% in averages |
| 90 days | 85% | Weighted 85% in averages |
| 180+ days | 100% | Full weight in averages |

### Display Strategy
Show data **by confidence level**, not just overall:
- "Based on 23 high-trust accounts (90+ days old): 65 days"
- "All data (including new accounts): 72 days"

This transparency builds trust while discounting unreliable sources.

## Monitoring & Analytics

Track these metrics:
```typescript
// What to monitor
- Rejection rate by reason (duplicate, rate limit)
- Average confidence score over time
- Submission volume trends
- Trust level distribution
- Duplicate submission attempts per user
```

## Testing the System

### Test 1: Duplicate Prevention
1. User 1 submits case "ABC-123" for Residence Permit
2. User 1 tries to submit same case again
3. Should get 409 error ✅

### Test 2: Review Rate Limiting
1. User submits review at 2:00 PM
2. User tries to submit another at 2:30 PM
3. Should get 429 error with "18 hours remaining" ✅

### Test 3: Timeline Rate Limiting
1. New user submits 5 timelines in rapid succession
2. User tries 6th submission
3. Should get 429 error ✅

### Test 4: Confidence Scoring
1. New account (1 day old) submits timeline
2. Check database: `confidenceScore` should be ~0.3
3. Old account (180+ days) submits timeline
4. Check database: `confidenceScore` should be 1.0 ✅

## Benefits

✅ **Reduces Fake Data**: Friction makes spam costly
✅ **Improves Quality**: Older accounts are more reliable
✅ **Transparent**: Users see why data is weighted
✅ **Prevents Abuse**: Rate limits stop spam attacks
✅ **Community Trust**: Status updates provide reality checks
✅ **Scalable**: Weighting system works with any data size

## Summary

You now have enterprise-grade anti-fraud protection while maintaining a community-driven platform. The system:
- Discourages bad actors (friction)
- Rewards genuine users (account age weighting)
- Maintains data integrity (duplicates, rate limits)
- Provides transparency (confidence scores, trust levels)
- Allows corrections (status updates, "still waiting")

This positions TerminTacho as the **most trustworthy** source for German bureaucracy processing times.

