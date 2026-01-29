# Analytics & Monitoring Setup Guide

## ✅ What's Been Implemented

### 1. Google Analytics
- **Component**: `app/components/GoogleAnalytics.tsx`
- **Status**: Integrated in layout, needs configuration

### 2. Sentry Error Monitoring
- **Files**: `sentry.*.config.ts`
- **Status**: Installed, needs configuration

### 3. Rate Limiting
- **File**: `lib/rateLimit.ts`
- **Status**: ✅ Active on contact form (5 submissions/hour per IP)

### 4. Blog Section
- **Routes**: `/blog` and `/blog/[slug]`
- **Status**: ✅ Live with 3 sample posts
- **Menu**: ✅ Added to navigation menu

---

## 🔧 Setup Instructions

### Google Analytics

1. **Get your Measurement ID**:
   - Go to [https://analytics.google.com](https://analytics.google.com)
   - Create a new property for termintacho.de
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add to .env**:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR-ID-HERE
   ```

3. **That's it!** Analytics will automatically start tracking:
   - Page views
   - User sessions
   - Traffic sources
   - User demographics

---

### Sentry Error Monitoring

1. **Create Sentry Account**:
   - Go to [https://sentry.io](https://sentry.io)
   - Sign up (free tier: 5,000 events/month)
   - Create a new project → Select "Next.js"

2. **Get your DSN**:
   - Copy the DSN from project settings
   - Format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

3. **Add to .env**:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here
   ```

4. **What Sentry Tracks**:
   - JavaScript errors
   - API failures
   - Performance issues
   - User sessions with errors
   - Stack traces

---

### Rate Limiting (Already Active ✅)

**Current Settings**:
- Contact form: 5 submissions per hour per IP
- Prevents spam and abuse
- Returns 429 error when limit exceeded

**To Adjust Limits**:
Edit `lib/rateLimit.ts` or the call in `app/api/contact/route.ts`:
```typescript
rateLimit(clientIp, 5, 3600000); // 5 requests, 1 hour
```

---

### Blog Section (Already Live ✅)

**Current Blog Posts**:
1. Complete Guide to Getting the EU Blue Card
2. 10 Tips for Your Ausländerbehörde Appointment
3. Understanding Processing Times

**To Add New Posts**:
Edit `app/blog/[slug]/page.tsx` and add to the `blogPosts` object.

**Later Enhancement**:
Move blog content to:
- Database (Prisma)
- CMS (Contentful, Sanity)
- Markdown files

---

## 💰 Costs

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Google Analytics** | ✅ Unlimited | Free forever |
| **Sentry** | 5,000 events/month | $26/month for 50K |
| **Rate Limiting** | ✅ Built-in | $0 |
| **Blog** | ✅ Built-in | $0 |

**Total Monthly Cost**: $0 (unless you exceed free tiers)

---

## 🚀 Next Steps

### Immediate (5 minutes each):
1. ✅ Get Google Analytics ID → Add to .env
2. ✅ Get Sentry DSN → Add to .env
3. ✅ Restart dev server
4. ✅ Test everything

### Future Enhancements:
1. **Admin Dashboard** - View contact submissions, analytics
2. **Blog CMS** - Easy blog post management
3. **Email Analytics** - Track email open rates
4. **User Analytics** - Track button clicks, form interactions
5. **A/B Testing** - Test different designs

---

## 🧪 Testing

### Test Rate Limiting:
1. Go to contact page
2. Submit form 6 times quickly
3. 6th submission should fail with "Too many requests"

### Test Google Analytics:
1. Add your GA_MEASUREMENT_ID to .env
2. Restart server
3. Visit your site
4. Check Google Analytics dashboard (data appears in ~24 hours)

### Test Sentry:
1. Add SENTRY_DSN to .env
2. Trigger an error (type wrong URL)
3. Check Sentry dashboard for error report

---

## 📊 What You'll See

### Google Analytics Dashboard:
- Real-time active users
- Most visited pages
- Traffic sources (Google, social, direct)
- User locations
- Device types (mobile/desktop)

### Sentry Dashboard:
- Error frequency
- Affected users
- Stack traces
- Performance metrics
- Deployment tracking

---

## ❓ Questions?

- Google Analytics setup: [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- Sentry setup: [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- Rate limiting issues: Check server logs
