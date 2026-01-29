import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Comprehensive list of German cities with government offices
  const cities = [
    // Major cities
    { id: "berlin", city: "Berlin", name: "Ausländerbehörde Berlin" },
    { id: "munich", city: "Munich", name: "Ausländerbehörde München" },
    { id: "frankfurt", city: "Frankfurt am Main", name: "Ausländerbehörde Frankfurt am Main" },
    { id: "hamburg", city: "Hamburg", name: "Ausländerbehörde Hamburg" },
    { id: "cologne", city: "Cologne", name: "Ausländerbehörde Köln" },
    { id: "stuttgart", city: "Stuttgart", name: "Ausländerbehörde Stuttgart" },
    { id: "dusseldorf", city: "Düsseldorf", name: "Ausländerbehörde Düsseldorf" },
    { id: "dortmund", city: "Dortmund", name: "Ausländerbehörde Dortmund" },
    { id: "essen", city: "Essen", name: "Ausländerbehörde Essen" },
    { id: "leipzig", city: "Leipzig", name: "Ausländerbehörde Leipzig" },
    { id: "bremen", city: "Bremen", name: "Ausländerbehörde Bremen" },
    { id: "dresden", city: "Dresden", name: "Ausländerbehörde Dresden" },
    { id: "hanover", city: "Hanover", name: "Ausländerbehörde Hannover" },
    { id: "nuremberg", city: "Nuremberg", name: "Ausländerbehörde Nürnberg" },
    { id: "duisburg", city: "Duisburg", name: "Ausländerbehörde Duisburg" },
    { id: "bochum", city: "Bochum", name: "Ausländerbehörde Bochum" },
    { id: "wuppertal", city: "Wuppertal", name: "Ausländerbehörde Wuppertal" },
    { id: "bielefeld", city: "Bielefeld", name: "Ausländerbehörde Bielefeld" },
    { id: "bonn", city: "Bonn", name: "Ausländerbehörde Bonn" },
    { id: "mannheim", city: "Mannheim", name: "Ausländerbehörde Mannheim" },
    { id: "karlsruhe", city: "Karlsruhe", name: "Ausländerbehörde Karlsruhe" },
    { id: "wiesbaden", city: "Wiesbaden", name: "Ausländerbehörde Wiesbaden" },
    { id: "munster", city: "Münster", name: "Ausländerbehörde Münster" },
    { id: "augsburg", city: "Augsburg", name: "Ausländerbehörde Augsburg" },
    { id: "aachen", city: "Aachen", name: "Ausländerbehörde Aachen" },
    { id: "monchengladbach", city: "Mönchengladbach", name: "Ausländerbehörde Mönchengladbach" },
    { id: "gelsenkirchen", city: "Gelsenkirchen", name: "Ausländerbehörde Gelsenkirchen" },
    { id: "braunschweig", city: "Braunschweig", name: "Ausländerbehörde Braunschweig" },
    { id: "chemnitz", city: "Chemnitz", name: "Ausländerbehörde Chemnitz" },
    { id: "kiel", city: "Kiel", name: "Ausländerbehörde Kiel" },
    { id: "krefeld", city: "Krefeld", name: "Ausländerbehörde Krefeld" },
    { id: "halle", city: "Halle (Saale)", name: "Ausländerbehörde Halle" },
    { id: "magdeburg", city: "Magdeburg", name: "Ausländerbehörde Magdeburg" },
    { id: "freiburg", city: "Freiburg im Breisgau", name: "Ausländerbehörde Freiburg" },
    { id: "lubeck", city: "Lübeck", name: "Ausländerbehörde Lübeck" },
    { id: "erfurt", city: "Erfurt", name: "Ausländerbehörde Erfurt" },
    { id: "oberhausen", city: "Oberhausen", name: "Ausländerbehörde Oberhausen" },
    { id: "rostock", city: "Rostock", name: "Ausländerbehörde Rostock" },
    { id: "mainz", city: "Mainz", name: "Ausländerbehörde Mainz" },
    { id: "kassel", city: "Kassel", name: "Ausländerbehörde Kassel" },
    { id: "hagen", city: "Hagen", name: "Ausländerbehörde Hagen" },
    { id: "saarbrucken", city: "Saarbrücken", name: "Ausländerbehörde Saarbrücken" },
    { id: "hamm", city: "Hamm", name: "Ausländerbehörde Hamm" },
    { id: "mulheim", city: "Mülheim an der Ruhr", name: "Ausländerbehörde Mülheim" },
    { id: "potsdam", city: "Potsdam", name: "Ausländerbehörde Potsdam" },
    { id: "ludwigshafen", city: "Ludwigshafen", name: "Ausländerbehörde Ludwigshafen" },
    { id: "oldenburg", city: "Oldenburg", name: "Ausländerbehörde Oldenburg" },
    { id: "leverkusen", city: "Leverkusen", name: "Ausländerbehörde Leverkusen" },
    { id: "osnabruck", city: "Osnabrück", name: "Ausländerbehörde Osnabrück" },
    { id: "solingen", city: "Solingen", name: "Ausländerbehörde Solingen" },
    { id: "heidelberg", city: "Heidelberg", name: "Ausländerbehörde Heidelberg" },
    { id: "herne", city: "Herne", name: "Ausländerbehörde Herne" },
    { id: "neuss", city: "Neuss", name: "Ausländerbehörde Neuss" },
    { id: "darmstadt", city: "Darmstadt", name: "Ausländerbehörde Darmstadt" },
    { id: "paderborn", city: "Paderborn", name: "Ausländerbehörde Paderborn" },
    { id: "regensburg", city: "Regensburg", name: "Ausländerbehörde Regensburg" },
    { id: "ingolstadt", city: "Ingolstadt", name: "Ausländerbehörde Ingolstadt" },
    { id: "wurzburg", city: "Würzburg", name: "Ausländerbehörde Würzburg" },
    { id: "wolfsburg", city: "Wolfsburg", name: "Ausländerbehörde Wolfsburg" },
    { id: "ulm", city: "Ulm", name: "Ausländerbehörde Ulm" },
    { id: "gottingen", city: "Göttingen", name: "Ausländerbehörde Göttingen" },
    { id: "heilbronn", city: "Heilbronn", name: "Ausländerbehörde Heilbronn" },
    { id: "pforzheim", city: "Pforzheim", name: "Ausländerbehörde Pforzheim" },
    { id: "reutlingen", city: "Reutlingen", name: "Ausländerbehörde Reutlingen" },
    { id: "bottrop", city: "Bottrop", name: "Ausländerbehörde Bottrop" },
    { id: "offenbach", city: "Offenbach am Main", name: "Ausländerbehörde Offenbach" },
    { id: "bremerhaven", city: "Bremerhaven", name: "Ausländerbehörde Bremerhaven" },
    { id: "remscheid", city: "Remscheid", name: "Ausländerbehörde Remscheid" },
    { id: "trier", city: "Trier", name: "Ausländerbehörde Trier" },
    { id: "salzgitter", city: "Salzgitter", name: "Ausländerbehörde Salzgitter" },
    { id: "jena", city: "Jena", name: "Ausländerbehörde Jena" },
    { id: "furth", city: "Fürth", name: "Ausländerbehörde Fürth" },
    { id: "erlangen", city: "Erlangen", name: "Ausländerbehörde Erlangen" },
    { id: "konstanz", city: "Konstanz", name: "Ausländerbehörde Konstanz" },
  ];

  console.log("📍 Creating offices for all German cities...");
  for (const city of cities) {
    await prisma.office.upsert({
      where: { id: city.id },
      update: {},
      create: city,
    });
  }
  console.log(`✅ Created ${cities.length} offices`);

  // Comprehensive Process Types for Expats - Categorized
  const processTypes = [
    // 👨‍🎓 STUDENTS
    { id: "student-visa", name: "🎓 Student Visa - Initial Application" },
    { id: "student-extension", name: "🎓 Student Visa - Extension" },
    { id: "student-to-work", name: "🎓 Student to Work Permit Conversion" },
    { id: "language-course-visa", name: "🎓 Language Course Visa" },
    { id: "phd-visa", name: "🎓 PhD/Research Visa" },
    { id: "student-internship", name: "🎓 Student Internship Permit" },
    
    // 💼 EMPLOYEES
    { id: "blue-card", name: "💼 EU Blue Card - Initial" },
    { id: "blue-card-extension", name: "💼 EU Blue Card - Extension" },
    { id: "work-permit-skilled", name: "💼 Skilled Worker Visa (§18a)" },
    { id: "work-permit-18b", name: "💼 Work Permit (§18b)" },
    { id: "ict-card", name: "💼 ICT Card (Intra-Corporate Transfer)" },
    { id: "freelance-visa", name: "💼 Freelance Visa (§21)" },
    { id: "job-seeker", name: "💼 Job Seeker Visa" },
    { id: "opportunity-card", name: "💼 Opportunity Card (Chancenkarte)" },
    { id: "employment-extension", name: "💼 Employment Permit Extension" },
    
    // 👔 BUSINESS / ENTREPRENEURS
    { id: "entrepreneur-visa", name: "👔 Entrepreneur/Self-Employment Visa" },
    { id: "business-startup", name: "👔 Startup Visa" },
    { id: "business-investor", name: "👔 Investor Visa" },
    { id: "business-extension", name: "👔 Business Visa Extension" },
    
    // 👨‍👩‍👧‍👦 FAMILY / PARENTS / DEPENDENTS
    { id: "family-reunion", name: "👨‍👩‍👧 Family Reunion Visa" },
    { id: "spouse-visa", name: "👨‍👩‍👧 Spouse/Partner Visa" },
    { id: "child-visa", name: "👨‍👩‍👧 Child Visa" },
    { id: "parent-visa", name: "👨‍👩‍👧 Parent Visa" },
    { id: "family-extension", name: "👨‍👩‍👧 Family Visa Extension" },
    { id: "dependent-visa", name: "👨‍👩‍👧 Dependent Visa" },
    
    // 🏠 RESIDENCE / SETTLEMENT
    { id: "settlement-permit", name: "🏠 Settlement Permit (Niederlassungserlaubnis)" },
    { id: "permanent-residence", name: "🏠 Permanent Residence Permit" },
    { id: "temporary-residence", name: "🏠 Temporary Residence Permit" },
    { id: "residence-extension", name: "🏠 Residence Permit Extension" },
    { id: "address-registration", name: "🏠 Address Registration (Anmeldung)" },
    { id: "deregistration", name: "🏠 Address Deregistration (Abmeldung)" },
    
    // 🏦 FINANCIAL / BANKING / TAX
    { id: "tax-id", name: "🏦 Tax ID (Steuer-ID) Application" },
    { id: "bank-account-cert", name: "🏦 Bank Account Certificate" },
    { id: "blocked-account", name: "🏦 Blocked Account (Sperrkonto) Verification" },
    { id: "financial-proof", name: "🏦 Financial Proof Verification" },
    
    // 📄 CITIZENSHIP / NATURALIZATION
    { id: "citizenship-application", name: "📄 Citizenship Application" },
    { id: "naturalization", name: "📄 Naturalization Process" },
    { id: "dual-citizenship", name: "📄 Dual Citizenship Application" },
    
    // 🚗 DRIVER LICENSE / VEHICLE
    { id: "driver-license-exchange", name: "🚗 Driver License Exchange" },
    { id: "driver-license-application", name: "🚗 Driver License Application" },
    { id: "vehicle-registration", name: "🚗 Vehicle Registration" },
    
    // 📋 OTHER DOCUMENTS
    { id: "passport-renewal", name: "📋 Passport/ID Renewal" },
    { id: "birth-certificate", name: "📋 Birth Certificate Registration" },
    { id: "marriage-certificate", name: "📋 Marriage Certificate Registration" },
    { id: "work-contract-approval", name: "📋 Work Contract Approval" },
    { id: "degree-recognition", name: "📋 Degree Recognition (Anerkennung)" },
    { id: "visa-appointment", name: "📋 Visa Appointment Booking" },
  ];

  console.log("📝 Creating comprehensive process types...");
  for (const processType of processTypes) {
    await prisma.processType.upsert({
      where: { id: processType.id },
      update: {},
      create: processType,
    });
  }
  console.log(`✅ Created ${processTypes.length} process types across all expat categories`);

  // Get references for creating sample reports
  const berlin = await prisma.office.findUnique({ where: { id: "berlin" } });
  const munich = await prisma.office.findUnique({ where: { id: "munich" } });
  const frankfurt = await prisma.office.findUnique({ where: { id: "frankfurt" } });
  const hamburg = await prisma.office.findUnique({ where: { id: "hamburg" } });
  const cologne = await prisma.office.findUnique({ where: { id: "cologne" } });
  
  const blueCard = await prisma.processType.findUnique({ where: { id: "blue-card" } });
  const studentVisa = await prisma.processType.findUnique({ where: { id: "student-visa" } });
  const settlement = await prisma.processType.findUnique({ where: { id: "settlement-permit" } });
  const familyReunion = await prisma.processType.findUnique({ where: { id: "family-reunion" } });
  const workPermit = await prisma.processType.findUnique({ where: { id: "work-permit-18b" } });
  const jobSeeker = await prisma.processType.findUnique({ where: { id: "job-seeker" } });

  if (!berlin || !munich || !frankfurt || !hamburg || !cologne || !blueCard || !studentVisa || !settlement || !familyReunion || !workPermit || !jobSeeker) {
    console.error("❌ Failed to create necessary offices or process types");
    return;
  }

  console.log("📊 Creating sample reports...");

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
      processTypeId: studentVisa.id,
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
      processTypeId: studentVisa.id,
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
    // === RECENT DATA (< 6 months) - FULL RELEVANCE ===
    {
      officeId: berlin.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2025-09-10"),
      decisionAt: new Date("2025-12-20"),
      status: "approved",
      notes: "Very recent submission - recent data, high relevance",
    },
    {
      officeId: munich.id,
      processTypeId: blueCard.id,
      method: "in-person",
      submittedAt: new Date("2025-10-05"),
      decisionAt: new Date("2026-01-10"),
      status: "approved",
      notes: "Recently approved - current processing times",
    },
    {
      officeId: frankfurt.id,
      processTypeId: workPermit.id,
      method: "online",
      submittedAt: new Date("2025-11-15"),
      decisionAt: new Date("2026-01-25"),
      status: "approved",
      notes: "Very recent approval",
    },
    {
      officeId: hamburg.id,
      processTypeId: studentVisa.id,
      method: "online",
      submittedAt: new Date("2025-12-01"),
      decisionAt: new Date("2026-01-15"),
      status: "approved",
      notes: "Latest submission - maximum weight",
    },
    // === OLDER DATA (1-2 years) - REDUCED RELEVANCE ===
    {
      officeId: berlin.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2024-08-15"),
      decisionAt: new Date("2024-11-20"),
      status: "approved",
      notes: "1 year old data - processing times may have changed",
    },
    {
      officeId: munich.id,
      processTypeId: blueCard.id,
      method: "in-person",
      submittedAt: new Date("2024-06-10"),
      decisionAt: new Date("2024-09-15"),
      status: "approved",
      notes: "Over 1.5 years old - reduced impact on statistics",
    },
    {
      officeId: frankfurt.id,
      processTypeId: familyReunion.id,
      method: "in-person",
      submittedAt: new Date("2024-05-20"),
      decisionAt: new Date("2024-10-10"),
      status: "approved",
      notes: "Older data - lower relevance weight",
    },
    // === VERY OLD DATA (> 2 years) - MINIMAL RELEVANCE ===
    {
      officeId: berlin.id,
      processTypeId: blueCard.id,
      method: "online",
      submittedAt: new Date("2023-10-01"),
      decisionAt: new Date("2023-12-20"),
      status: "approved",
      notes: "2+ years old - very limited impact on current averages",
    },
    {
      officeId: hamburg.id,
      processTypeId: workPermit.id,
      method: "in-person",
      submittedAt: new Date("2023-07-15"),
      decisionAt: new Date("2023-11-01"),
      status: "approved",
      notes: "Old data - procedures may have changed",
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
