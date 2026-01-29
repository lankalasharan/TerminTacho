import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Import real data from external sources
 * Usage: npx ts-node import-real-data.ts
 * 
 * This file allows you to add genuine timeline data from:
 * - Reddit posts (r/germany, r/expats)
 * - Forum discussions
 * - Partner agencies
 * - Government sources
 * - User feedback
 */

interface RealDataEntry {
  city: string;                    // e.g., "Berlin"
  processType: string;             // e.g., "Blue Card"
  submittedDate: Date;             // When application was submitted
  decisionDate?: Date;             // When decision was made
  status: "approved" | "pending" | "rejected" | "withdrawn";
  notes?: string;                  // Additional context
  source: string;                  // "reddit", "forum", "partner", "government", "direct"
  sourceUrl?: string;              // Link to original post (if applicable)
}

/**
 * EXAMPLE: Real data from Reddit posts and forums
 * Replace with actual data you collect
 */
const realDataEntries: RealDataEntry[] = [
  // Berlin Blue Card submissions
  {
    city: "Berlin",
    processType: "💼 EU Blue Card - Initial",
    submittedDate: new Date("2025-08-15"),
    decisionDate: new Date("2025-10-20"),
    status: "approved",
    notes:
      "Applied with existing Blue Card from another country, fast track process. Had all documents ready.",
    source: "reddit",
    sourceUrl: "https://reddit.com/r/germany/...",
  },
  {
    city: "Berlin",
    processType: "💼 EU Blue Card - Initial",
    submittedDate: new Date("2025-09-01"),
    decisionDate: new Date("2025-11-30"),
    status: "approved",
    notes:
      "First time Blue Card application. Required employment contract verification. Processing took 3 months.",
    source: "reddit",
  },
  {
    city: "Berlin",
    processType: "💼 Job Seeker Visa",
    submittedDate: new Date("2025-07-10"),
    decisionDate: new Date("2025-08-05"),
    status: "approved",
    notes: "6-month job seeker visa approved without issues. Clear qualifications helped.",
    source: "forum",
  },

  // Munich Blue Card submissions
  {
    city: "Munich",
    processType: "💼 EU Blue Card - Initial",
    submittedDate: new Date("2025-06-01"),
    decisionDate: new Date("2025-08-15"),
    status: "approved",
    notes: "Munich office was relatively fast. Had all documents prepared beforehand.",
    source: "reddit",
  },
  {
    city: "Munich",
    processType: "💼 Skilled Worker Visa (§18a)",
    submittedDate: new Date("2025-05-20"),
    decisionDate: new Date("2025-07-25"),
    status: "approved",
    notes: "Skilled worker with IT background. Employer helped with application.",
    source: "direct",
  },

  // Frankfurt submissions
  {
    city: "Frankfurt am Main",
    processType: "💼 EU Blue Card - Initial",
    submittedDate: new Date("2025-07-01"),
    decisionDate: new Date("2025-10-10"),
    status: "approved",
    notes:
      "Frankfurt was slow. Had to follow up multiple times. Missing address proof caused delays.",
    source: "reddit",
  },
  {
    city: "Frankfurt am Main",
    processType: "👨‍👩‍👧 Family Reunion Visa",
    submittedDate: new Date("2025-08-01"),
    decisionDate: new Date("2025-11-20"),
    status: "approved",
    notes: "Family reunion took 3.5 months. Required extensive documentation.",
    source: "forum",
  },

  // Hamburg submissions
  {
    city: "Hamburg",
    processType: "💼 EU Blue Card - Initial",
    submittedDate: new Date("2025-09-15"),
    decisionDate: new Date("2025-11-10"),
    status: "approved",
    notes: "Hamburg was quite efficient. Got approval in 2 months.",
    source: "reddit",
  },

  // Cologne submissions
  {
    city: "Cologne",
    processType: "🎓 Student Visa - Initial Application",
    submittedDate: new Date("2025-06-15"),
    decisionDate: new Date("2025-07-20"),
    status: "approved",
    notes: "Student visa processed quickly. Had university letter and blocked account.",
    source: "reddit",
  },
  {
    city: "Cologne",
    processType: "💼 Job Seeker Visa",
    submittedDate: new Date("2025-08-01"),
    decisionDate: null,
    status: "pending",
    notes: "Currently waiting for decision. Submitted 5 months ago.",
    source: "direct",
  },

  // Stuttgart submissions
  {
    city: "Stuttgart",
    processType: "💼 Skilled Worker Visa (§18a)",
    submittedDate: new Date("2025-04-10"),
    decisionDate: new Date("2025-06-15"),
    status: "approved",
    notes: "Tech worker, employer sponsored. Smooth process.",
    source: "reddit",
  },

  // Düsseldorf submissions
  {
    city: "Düsseldorf",
    processType: "💼 EU Blue Card - Initial",
    submittedDate: new Date("2025-07-20"),
    decisionDate: new Date("2025-09-30"),
    status: "approved",
    notes: "Düsseldorf office was helpful. Asked for additional documents once.",
    source: "forum",
  },

  // Add more as needed...
];

async function importRealData() {
  try {
    console.log("📊 Starting real data import...\n");

    let importedCount = 0;
    let skippedCount = 0;

    for (const entry of realDataEntries) {
      try {
        // Find office
        const office = await prisma.office.findFirst({
          where: {
            city: {
              contains: entry.city,
              mode: "insensitive",
            },
          },
        });

        if (!office) {
          console.log(`⚠️  City not found: ${entry.city}`);
          skippedCount++;
          continue;
        }

        // Find process type
        const processType = await prisma.processType.findFirst({
          where: {
            name: {
              contains: entry.processType.split(" - ")[0],
              mode: "insensitive",
            },
          },
        });

        if (!processType) {
          console.log(`⚠️  Process type not found: ${entry.processType}`);
          skippedCount++;
          continue;
        }

        // Create report
        const report = await prisma.report.create({
          data: {
            officeId: office.id,
            processTypeId: processType.id,
            method: "online", // or "in-person"
            submittedAt: entry.submittedDate,
            decisionAt: entry.decisionDate || undefined,
            status: entry.status,
            notes: entry.notes,
            userEmail: undefined, // Keep anonymous
            createdAt: new Date(),
          },
        });

        console.log(
          `✅ Imported: ${entry.city} - ${entry.processType} (${entry.status})`
        );
        importedCount++;
      } catch (error) {
        console.log(`❌ Error importing entry: ${error}`);
        skippedCount++;
      }
    }

    console.log(`\n📈 Import Summary:`);
    console.log(`   ✅ Imported: ${importedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   📊 Total: ${importedCount + skippedCount}`);
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importRealData();
