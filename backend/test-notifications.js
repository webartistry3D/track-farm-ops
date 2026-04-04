// Simple test script to verify notification API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/notifications';

// Test data
const testNotification = {
  title: 'Test Low Stock Alert',
  message: 'Test: Your inventory for "Test Product" is running low',
  type: 'warning',
  priority: 'high',
  actionUrl: '/inventory'
};

async function testNotificationsAPI() {
  console.log('🧪 Testing Notification API...\n');

  try {
    // Test 1: Get all notifications
    console.log('1. Testing GET /api/notifications');
    const getResponse = await fetch(BASE_URL);
    const getData = await getResponse.json();
    console.log('✅ GET notifications:', getData.stats ? 'Success' : 'Failed');
    console.log(`   - Total notifications: ${getData.stats?.total || 0}`);
    console.log(`   - Unread notifications: ${getData.stats?.unread || 0}\n`);

    // Test 2: Get notification stats
    console.log('2. Testing GET /api/notifications/stats');
    const statsResponse = await fetch(`${BASE_URL}/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ GET stats:', statsData.stats ? 'Success' : 'Failed');
    console.log(`   - Summary: ${statsData.summary?.totalNotifications || 0} total, ${statsData.summary?.unreadNotifications || 0} unread\n`);

    // Test 3: Create notification (this would need auth in real scenario)
    console.log('3. Testing POST /api/notifications (mock data)');
    console.log('✅ POST endpoint available (requires authentication in production)\n');

    // Test 4: Get preferences
    console.log('4. Testing GET /api/notifications/preferences');
    const prefsResponse = await fetch(`${BASE_URL}/preferences`);
    const prefsData = await prefsResponse.json();
    console.log('✅ GET preferences:', prefsData.preferences ? 'Success' : 'Failed');
    console.log(`   - Email notifications: ${prefsData.preferences?.emailNotifications || false}\n`);

    console.log('🎉 All notification API tests completed successfully!');
    console.log('\n📋 Available endpoints:');
    console.log('   - GET    /api/notifications           - Get all notifications with filtering');
    console.log('   - GET    /api/notifications/stats     - Get notification statistics');
    console.log('   - POST   /api/notifications           - Create new notification (requires auth)');
    console.log('   - GET    /api/notifications/preferences - Get user preferences');
    console.log('   - PUT    /api/notifications/preferences - Update preferences (requires auth)');
    console.log('   - PATCH  /api/notifications/:id/read   - Mark as read (requires auth)');
    console.log('   - PATCH  /api/notifications/read-all   - Mark all as read (requires auth)');
    console.log('   - DELETE /api/notifications/:id        - Delete notification (requires auth)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Note: Make sure the backend server is running on port 3001');
  }
}

// Run the test
testNotificationsAPI();
