import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get report with status updates
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        office: true,
        processType: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

/**
 * Update report status (e.g., still waiting vs completed)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const body = await req.json();
    const { isStillWaiting, status, decisionAt } = body;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the report and verify ownership
    const report = await prisma.report.findUnique({
      where: { id },
      include: { office: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Check if user owns this report (or is admin)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (report.userId !== user?.id) {
      return NextResponse.json(
        { error: "You can only update your own reports" },
        { status: 403 }
      );
    }

    // Update the report
    const updateData: any = {};
    if (isStillWaiting !== undefined) {
      updateData.isStillWaiting = isStillWaiting;
    }
    if (status !== undefined && ["pending", "approved", "rejected"].includes(status)) {
      updateData.status = status;
    }
    if (decisionAt !== undefined) {
      updateData.decisionAt = decisionAt ? new Date(decisionAt) : null;
    }

    const updated = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        office: true,
        processType: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

/**
 * Delete a report (owner or admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
    const isAdmin = adminEmails.includes(session.user.email);

    if (!isAdmin && report.userId !== user?.id) {
      return NextResponse.json(
        { error: "You can only delete your own reports" },
        { status: 403 }
      );
    }

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
