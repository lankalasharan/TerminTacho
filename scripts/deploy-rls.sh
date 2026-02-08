#!/usr/bin/env bash
# RLS Security Deployment Script
# Deploy Row-Level Security to Supabase production database

set -e

echo "🔐 RLS Security Deployment Script"
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo "Set it with: export DATABASE_URL='postgresql://...'"
  exit 1
fi

echo "📋 Deployment Steps:"
echo "1. Applying database migration..."

# Run Prisma migration
npx prisma db push --skip-generate

echo "✅ Migration applied"
echo ""

echo "2. Regenerating Prisma client..."
npx prisma generate

echo "✅ Prisma client regenerated"
echo ""

echo "3. Verifying RLS is enabled..."
npx prisma db execute --stdin << 'EOF'
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('Report', 'Review', 'Office', 'ProcessType', 'User', 'Account', 'Session')
ORDER BY tablename;
EOF

echo ""
echo "✅ RLS Security deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Test the application locally: npm run dev"
echo "2. Deploy to production: git push origin main"
echo "3. Monitor logs in Supabase dashboard"
echo "4. Run: npm run test (if you have tests)"
echo ""
echo "📖 See docs/RLS_SECURITY_GUIDE.md for more information"

