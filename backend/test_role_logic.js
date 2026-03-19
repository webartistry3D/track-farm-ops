// Test role-based access logic
const ROLE_HIERARCHY = {
  OWNER: ['OWNER', 'MANAGER', 'WORKER'],
  MANAGER: ['MANAGER', 'WORKER'],
  WORKER: ['WORKER']
};

const buildRoleBasedWhereClause = (user) => {
  const accessibleRoles = ROLE_HIERARCHY[user.role] || [user.role];
  
  if (user.role === 'OWNER') {
    // OWNER can see all records
    console.log(`OWNER ${user.name} can see ALL records`);
    return {};
  } else if (user.role === 'MANAGER') {
    // MANAGER can see their own records + WORKER records
    console.log(`MANAGER ${user.name} can see own + WORKER records`);
    return {
      OR: [
        { userId: user.id },
        { user: { role: 'WORKER' } }
      ]
    };
  } else {
    // WORKER can only see their own records
    console.log(`WORKER ${user.name} can only see own records`);
    return { userId: user.id };
  }
};

// Test scenarios
const testUsers = [
  { id: 1, role: 'OWNER', name: 'Owner User' },
  { id: 2, role: 'MANAGER', name: 'Manager User' },
  { id: 3, role: 'WORKER', name: 'Worker User' }
];

console.log('=== Testing Role-Based Access ===');

// Test OWNER access
const ownerUser = testUsers[0];
console.log(`Testing OWNER (${ownerUser.name}):`);
const ownerWhere = buildRoleBasedWhereClause(ownerUser);
console.log('OWNER where clause:', JSON.stringify(ownerWhere, null, 2));

// Test MANAGER access
const managerUser = testUsers[1];
console.log(`Testing MANAGER (${managerUser.name}):`);
const managerWhere = buildRoleBasedWhereClause(managerUser);
console.log('MANAGER where clause:', JSON.stringify(managerWhere, null, 2));

// Test WORKER access
const workerUser = testUsers[2];
console.log(`Testing WORKER (${workerUser.name}):`);
const workerWhere = buildRoleBasedWhereClause(workerUser);
console.log('WORKER where clause:', JSON.stringify(workerWhere, null, 2));

// Expected results:
// OWNER should return {} (empty object - no filtering)
// MANAGER should return { OR: [{ userId: 2 }, { user: { role: 'WORKER' } }] }
// WORKER should return { userId: 3 }
