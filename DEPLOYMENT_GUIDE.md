# TerminTacho - Setup & Deployment Guide

## Quick Start After Feature Implementation

### 1. Install Dependencies

```bash
# Install favicon and OG image generation dependencies
npm install sharp
```

### 2. Generate Static Assets

```bash
# Generate favicons from logo.png
node generate-favicons.js

# Generate Open Graph image for social sharing
node generate-og-image.js
```

Expected output:
```
✓ Generated favicon-32x32.png
✓ Generated favicon-16x16.png
✓ Generated apple-touch-icon.png
✓ Generated favicon.ico
✓ Generated og-image.png (1200x630)
```

### 3. Database Migration

```bash
# Run Prisma migration to create Newsletter table
npx prisma migrate dev --name add_newsletter

# Or manually sync schema
npx prisma db push
```

### 4. Environment Configuration

Update your `.env.local` file:

```env
# Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email Service (for newsletter delivery - future)
# SENDGRID_API_KEY=your_key_here
# OR
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user@example.com
# SMTP_PASS=password

# NextAuth Configuration (existing)
NEXTAUTH_URL=https://termintacho.com
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_id_here
GOOGLE_CLIENT_SECRET=your_secret_here
```

### 5. Update Google Analytics ID

Edit `/app/layout.tsx` line ~82:
```tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_GA_ID"></script>
<script>
  {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_GA_ID');`}
</script>
```

### 6. Test Locally

```bash
# Development server
npm run dev

# Visit http://localhost:3000

# Test new features:
# - Search: http://localhost:3000/search?q=test
# - Leaderboard: http://localhost:3000/leaderboard
# - Dashboard: http://localhost:3000/dashboard (requires login)
# - API Docs: http://localhost:3000/api-docs
# - Dark mode: Click button in header
# - Sitemap: http://localhost:3000/api/sitemap.xml
# - Robots: http://localhost:3000/robots.txt
```

### 7. Production Deployment

#### For Vercel:

```bash
# Push to git
git add .
git commit -m "Add industry-standard features"
git push origin main

# Vercel auto-deploys on push
# Verify:
# - https://termintacho.com/robots.txt
# - https://termintacho.com/api/sitemap.xml
# - https://termintacho.com/search
# - https://termintacho.com/leaderboard
# - https://termintacho.com/dashboard
```

#### For Self-Hosted:

```bash
# Build
npm run build

# Start production server
npm start

# Setup reverse proxy (nginx/Apache)
# Configure SSL certificate
# Set environment variables on server
```

## Feature Configuration Checklist

### SEO & Analytics
- [ ] Generate favicons: `node generate-favicons.js`
- [ ] Generate OG image: `node generate-og-image.js`
- [ ] Update GA ID in layout.tsx
- [ ] Submit sitemap to Google Search Console: `termintacho.com/api/sitemap.xml`
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify robots.txt accessibility: `termintacho.com/robots.txt`

### User Features
- [ ] Run database migration: `npx prisma migrate dev --name add_newsletter`
- [ ] Test newsletter signup on home page
- [ ] Test user dashboard (login required)
- [ ] Configure email service for newsletter delivery
- [ ] Test dark mode toggle in header
- [ ] Test search functionality

### Developer Resources
- [ ] Verify API documentation at `/api-docs`
- [ ] Test all API endpoints:
  - `GET /api/search?q=test`
  - `GET /api/leaderboard`
  - `GET /api/sitemap.xml`
  - `POST /api/newsletter` (with email)
  - `GET /api/user/stats` (authenticated)

### Accessibility
- [ ] Test skip-to-content link (Tab key)
- [ ] Test screen reader with NVDA/JAWS
- [ ] Verify keyboard navigation
- [ ] Check color contrast with WCAG guidelines
- [ ] Validate HTML semantic structure

## Monitoring & Maintenance

### Weekly Tasks
- Monitor newsletter unsubscribes
- Check API error rates
- Review search analytics
- Monitor database size

### Monthly Tasks
- Update Google Analytics reports
- Review leaderboard for bot activity
- Update content (FAQ, guides)
- Check for broken links

### Quarterly Tasks
- Audit accessibility compliance
- Review SEO rankings
- Update dependencies
- Backup database

## Common Issues & Solutions

### Issue: Favicons not showing
**Solution:**
```bash
# Clear cache and regenerate
node generate-favicons.js
# Hard refresh browser (Ctrl+Shift+R)
```

### Issue: Newsletter subscription not working
**Solution:**
```bash
# Verify database migration ran
npx prisma migrate status

# Check database for Newsletter table
npx prisma studio

# Verify API is accessible
curl http://localhost:3000/api/newsletter -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com"}'
```

### Issue: Search not finding results
**Solution:**
```bash
# Check API response
curl "http://localhost:3000/api/search?q=munich"

# Verify data in database
npx prisma studio
# Check Office and ProcessType tables have data
```

### Issue: Dark mode not persisting
**Solution:**
```bash
# Check browser localStorage
# Open DevTools → Application → Local Storage
# Should have 'darkMode' key

# Clear and refresh
localStorage.clear()
# Reload page
```

### Issue: Analytics not tracking
**Solution:**
1. Verify GA ID is correct in layout.tsx
2. Check Google Analytics property is active
3. Allow localhost in GA (for testing)
4. Wait 24 hours for data to appear
5. Use GA Real-Time to verify tracking

## Rollback Procedure

If issues arise after deployment:

```bash
# Revert to previous commit
git revert HEAD

# Or specific file
git checkout HEAD~1 -- app/layout.tsx

# Restart server
npm run build
npm start
```

## Performance Optimization

### Caching Strategy

```javascript
// API responses (set in route handlers)
response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour

// Static assets
response.headers.set('Cache-Control', 'public, max-age=86400'); // 1 day
```

### Database Optimization

```sql
-- Add indexes for faster queries
CREATE INDEX idx_report_email ON "Report"("userEmail");
CREATE INDEX idx_report_city ON "Report"("officeId");
CREATE INDEX idx_report_status ON "Report"("status");
```

## Backup & Recovery

### Daily Backup
```bash
# Backup database (PostgreSQL)
pg_dump termintacho_db > backup_$(date +%Y%m%d).sql

# Backup public files
tar -czf public_backup_$(date +%Y%m%d).tar.gz public/
```

### Restore from Backup
```bash
# Restore database
psql termintacho_db < backup_20240101.sql

# Restore public files
tar -xzf public_backup_20240101.tar.gz
```

## Support & Resources

- **Documentation**: `/api-docs`
- **Contact**: `/contact`
- **FAQ**: `/faq`
- **GitHub**: [Your repo URL]
- **Issues**: Check /dashboard for user metrics

## Deployment Checklist

Before going live:
- [ ] All favicons generated
- [ ] OG image generated
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] GA ID updated
- [ ] Email service configured (if needed)
- [ ] API endpoints tested
- [ ] Accessibility audit complete
- [ ] Performance benchmarks met
- [ ] SEO submission completed
- [ ] 404 error page configured
- [ ] Monitoring & alerts set up
