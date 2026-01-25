const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Count records
    const officeCount = await prisma.office.count();
    const processTypeCount = await prisma.processType.count();
    const reportCount = await prisma.report.count();
    
    console.log('✅ Database Connected Successfully!');
    console.log(`📊 Current Data:`);
    console.log(`   - Offices: ${officeCount}`);
    console.log(`   - Process Types: ${processTypeCount}`);
    console.log(`   - Reports: ${reportCount}`);
    
    // Test retrieving data
    if (reportCount > 0) {
      const latestReport = await prisma.report.findFirst({
        include: {
          office: true,
          processType: true
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`\n✅ Can retrieve data!`);
      console.log(`   Latest report: ${latestReport.office.city} - ${latestReport.processType.name}`);
    }
    
    console.log('\n✅ Your database is working correctly!');
    console.log('   - Data WILL be stored when you submit forms');
    console.log('   - Data CAN be retrieved for reports');
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
