import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getCutoffDate(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

async function main() {
  const retentionDays = 30;
  const cutoff = getCutoffDate(retentionDays);

  const [reportResult, reviewResult, userResult] = await prisma.$transaction([
    prisma.report.updateMany({
      where: {
        ipAddress: { not: null },
        createdAt: { lt: cutoff },
      },
      data: { ipAddress: null },
    }),
    prisma.review.updateMany({
      where: {
        ipAddress: { not: null },
        createdAt: { lt: cutoff },
      },
      data: { ipAddress: null },
    }),
    prisma.user.updateMany({
      where: {
        lastIpAddress: { not: null },
        createdAt: { lt: cutoff },
      },
      data: { lastIpAddress: null },
    }),
  ]);

  console.log("IP cleanup complete:");
  console.log(`- Reports updated: ${reportResult.count}`);
  console.log(`- Reviews updated: ${reviewResult.count}`);
  console.log(`- Users updated: ${userResult.count}`);
}

main()
  .catch((error) => {
    console.error("IP cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
