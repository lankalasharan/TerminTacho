const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Offices (German cities with Ausländerbehörde)
  const berlin = await prisma.office.upsert({
    where: { id: "berlin-mitte" },
    update: {},
    create: {
      id: "berlin-mitte",
      city: "Berlin",
      name: "Ausländerbehörde Berlin Mitte",
    },
  });

  const munich = await prisma.office.upsert({
    where: { id: "munich-main" },
    update: {},
    create: {
      id: "munich-main",
      city: "Munich",
      name: "Ausländerbehörde München",
    },
  });

  const frankfurt = await prisma.office.upsert({
    where: { id: "frankfurt-main" },
    update: {},
    create: {
      id: "frankfurt-main",
      city: "Frankfurt",
      name: "Ausländerbehörde Frankfurt am Main",
    },
  });

  const hamburg = await prisma.office.upsert({
    where: { id: "hamburg-main" },
    update: {},
    create: {
      id: "hamburg-main",
      city: "Hamburg",
      name: "Ausländerbehörde Hamburg",
    },
  });

  const cologne = await prisma.office.upsert({
    where: { id: "cologne-main" },
    update: {},
    create: {
      id: "cologne-main",
      city: "Cologne",
      name: "Ausländerbehörde Köln",
    },
  });

  console.log("✅ Created offices");

  // Create Process Types
  const blueCard = await prisma.processType.upsert({
    where: { id: "blue-card" },
    update: {},
    create: {
      id: "blue-card",
      name: "EU Blue Card",
    },
  });

  const jobSeeker = await prisma.processType.upsert({
    where: { id: "job-seeker" },
    update: {},
    create: {
      id: "job-seeker",
      name: "Job Seeker Visa",
    },
  });

  const familyReunion = await prisma.processType.upsert({
    where: { id: "family-reunion" },
    update: {},
    create: {
      id: "family-reunion",
      name: "Family Reunion Visa",
    },
  });

  const workPermit = await prisma.processType.upsert({
    where: { id: "work-permit" },
    update: {},
    create: {
      id: "work-permit",
      name: "Work Permit (§18b)",
    },
  });

  const settlement = await prisma.processType.upsert({
    where: { id: "settlement-permit" },
    update: {},
    create: {
      id: "settlement-permit",
      name: "Settlement Permit (Niederlassungserlaubnis)",
    },
  });

  const student = await prisma.processType.upsert({
    where: { id: "student-visa" },
    update: {},
    create: {
      id: "student-visa",
      name: "Student Residence Permit",
    },
  });

  console.log("✅ Created process types");

  // Create Sample Reports
  const reports = [
    {
      officeId: berlin.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2025-08-15"),
      decisionAt: new Date("2025-11-20"),
      status: "approved",
      notes: "Fast processing, received email confirmation after 3 months",
    },
    {
      officeId: berlin.id,
      processTypeId: blueCard.id,
      method: "in-person",
      submittedAt: new Date("2025-09-01"),
      decisionAt: new Date("2025-12-15"),
      status: "approved",
      notes: "Had to provide additional salary proof",
    },
    {
      officeId: munich.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2025-07-20"),
      decisionAt: new Date("2025-09-30"),
      status: "approved",
      notes: "Very quick! Munich office is efficient",
    },
    {
      officeId: frankfurt.id,
      processTypeId: workPermit.id,
      method: "online",
      submittedAt: new Date("2025-10-01"),
      decisionAt: new Date("2026-01-15"),
      status: "approved",
      notes: "Standard processing time",
    },
    {
      officeId: hamburg.id,
      processTypeId: familyReunion.id,
      method: "in-person",
      submittedAt: new Date("2025-06-10"),
      decisionAt: new Date("2025-10-25"),
      status: "approved",
      notes: "Needed to provide language certificates",
    },
    {
      officeId: cologne.id,
      processTypeId: student.id,
      method: "email",
      submittedAt: new Date("2025-08-01"),
      decisionAt: new Date("2025-09-15"),
      status: "approved",
      notes: "Quick for student visa!",
    },
    {
      officeId: berlin.id,
      processTypeId: settlement.id,
      method: "in-person",
      submittedAt: new Date("2025-05-01"),
      decisionAt: new Date("2025-12-10"),
      status: "approved",
      notes: "Long wait but worth it. Need all documents perfect.",
    },
    {
      officeId: munich.id,
      processTypeId: jobSeeker.id,
      method: "online",
      submittedAt: new Date("2025-11-01"),
      decisionAt: null,
      status: "pending",
      notes: "Still waiting, submitted 2 months ago",
    },
    {
      officeId: frankfurt.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2025-09-15"),
      decisionAt: null,
      status: "pending",
      notes: "Application under review",
    },
    {
      officeId: berlin.id,
      processTypeId: workPermit.id,
      method: "in-person",
      submittedAt: new Date("2025-07-01"),
      decisionAt: new Date("2025-11-05"),
      status: "approved",
      notes: "Appointment took 3 hours but staff were helpful",
    },
    {
      officeId: hamburg.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2025-08-20"),
      decisionAt: new Date("2025-11-30"),
      status: "approved",
      notes: "Standard timeframe",
    },
    {
      officeId: cologne.id,
      processTypeId: familyReunion.id,
      method: "in-person",
      submittedAt: new Date("2025-06-15"),
      decisionAt: new Date("2025-11-10"),
      status: "approved",
      notes: "Longer than expected but eventually approved",
    },
  ];

  for (const report of reports) {
    await prisma.report.create({
      data: report,
    });
  }

  console.log("✅ Created sample reports");
  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

