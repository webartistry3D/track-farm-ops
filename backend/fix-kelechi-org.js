const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOrganization() {
  try {
    console.log('🔍 Checking organization assignment for kelechi@owner.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Organization ID:', user.organizationId);
    console.log('   Organization:', user.organization?.name || 'None');
    
    if (!user.organizationId) {
      console.log('🔧 User has no organization - creating one...');
      
      // Create a default organization for this user
      const organization = await prisma.organization.create({
        data: {
          name: 'Kelechi Farm',
          address: 'Default Address',
          phone: '+234 XXX XXX XXXX',
          email: user.email
        }
      });
      
      console.log('✅ Organization created:', organization.name);
      
      // Update user to link to organization
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id }
      });
      
      console.log('✅ User linked to organization');
      console.log('🎉 kelechi@owner.com should now be able to login!');
    } else {
      console.log('✅ User already has organization');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrganization();
