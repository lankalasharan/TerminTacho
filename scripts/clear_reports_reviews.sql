-- Clear user-submitted reports and reviews only
TRUNCATE TABLE "Report", "Review" RESTART IDENTITY CASCADE;
