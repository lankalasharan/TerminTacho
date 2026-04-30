import { prisma } from "../lib/prisma";
import { sendPendingTimelineClosureReminder } from "../lib/email";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function parseLimit(): number | null {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  if (!arg) return null;
  const parsed = Number(arg.split("=")[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function main() {
  const shouldSend = hasFlag("--send");
  const limit = parseLimit();

  const pendingUsers = await prisma.report.findMany({
    where: {
      status: "pending",
      userEmail: { not: null },
    },
    select: {
      userEmail: true,
    },
    distinct: ["userEmail"],
    ...(limit ? { take: limit } : {}),
  });

  const recipients = pendingUsers
    .map((item) => item.userEmail)
    .filter((email): email is string => Boolean(email));

  console.log(`Found ${recipients.length} unique pending user emails.`);

  if (!shouldSend) {
    console.log("Dry run only. No emails sent. Use --send to send emails.");
    recipients.forEach((email) => console.log(`- ${email}`));
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY. Aborting send.");
  }

  let sent = 0;
  let failed = 0;

  for (const email of recipients) {
    try {
      await sendPendingTimelineClosureReminder(email);
      sent += 1;
      console.log(`Sent reminder to ${email}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed sending to ${email}:`, error);
    }
  }

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error("Failed to process pending timeline reminders:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
