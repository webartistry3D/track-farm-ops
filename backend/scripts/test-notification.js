const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNotificationSystem() {
  try {
    console.log('🧪 Testing Notification System...\n');

    // Get a user to test with
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('❌ No users found in database. Please create a user first.');
      return;
    }

    console.log(`👤 Testing with user: ${user.name} (ID: ${user.id})`);

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        title: 'Test Notification',
        message: 'This is a test notification from the notification system',
        type: 'INFO',
        userId: user.id,
        organizationId: user.organizationId,
        read: false
      }
    });

    console.log(`✅ Created notification: ${notification.title} (ID: ${notification.id})`);

    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📬 User has ${notifications.length} notifications`);

    // Mark notification as read
    await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true }
    });

    console.log(`✅ Marked notification as read`);

    // Verify it's marked as read
    const updatedNotification = await prisma.notification.findUnique({
      where: { id: notification.id }
    });

    console.log(`🔍 Notification read status: ${updatedNotification.read}`);

    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: user.id },
      data: { read: true }
    });

    console.log(`✅ Marked all notifications as read`);

    console.log('\n🎉 Notification system test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();
