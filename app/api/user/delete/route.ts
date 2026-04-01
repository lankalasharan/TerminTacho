import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email || null;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportReviewFilter = userId && userEmail
      ? { OR: [{ userId }, { userEmail }] }
      : userId
        ? { userId }
        : { userEmail };

    const tasks: Prisma.PrismaPromise<unknown>[] = [];

    tasks.push(prisma.report.deleteMany({ where: reportReviewFilter }));
    tasks.push(prisma.review.deleteMany({ where: reportReviewFilter }));

    if (userId) {
      tasks.push(prisma.vote.deleteMany({ where: { userId } }));
      tasks.push(prisma.session.deleteMany({ where: { userId } }));
      tasks.push(prisma.account.deleteMany({ where: { userId } }));
    }

    if (userEmail) {
      tasks.push(prisma.verificationToken.deleteMany({ where: { identifier: userEmail } }));
      tasks.push(prisma.newsletter.deleteMany({ where: { email: userEmail } }));
    }

    await prisma.$transaction(tasks);

    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    } else if (userEmail) {
      await prisma.user.delete({ where: { email: userEmail } });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
