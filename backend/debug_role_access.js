// Debug role-based access issue
const ROLE_HIERARCHY = {
  OWNER: ['OWNER', 'MANAGER', 'WORKER'],
  MANAGER: ['MANAGER', 'WORKER'],
  WORKER: ['WORKER']
};

const buildRoleBasedWhereClause = (user) => {
  console.log('Input user role:', user.role);
  console.log('User role type:', typeof user.role);
  
  const accessibleRoles = ROLE_HIERARCHY[user.role] || [user.role];
  console.log('Accessible roles:', accessibleRoles);
  
  if (user.role === 'OWNER') {
    console.log('OWNER detected - returning empty filter');
    return {};
  } else if (user.role === 'MANAGER') {
    console.log('MANAGER detected - returning own + worker filter');
    return {
      OR: [
        { userId: user.id },
        { user: { role: 'WORKER' } }
      ]
    };
  } else {
    console.log('WORKER detected - returning own filter');
    return { userId: user.id };
  }
};

// Test the exact scenario
const testOwner = {
  id: 1,
  role: 'OWNER',
  name: 'Nnenna Aribeana'
};

const testWorker = {
  id: 3,
  role: 'WORKER', 
  name: 'Kelechi Aribeana'
};

console.log('=== Testing Owner Access to Worker Records ===');
console.log('Owner user:', testOwner);
const ownerFilter = buildRoleBasedWhereClause(testOwner);
console.log('Owner filter result:', ownerFilter);

console.log('=== Testing Worker Access to Owner Records ===');
console.log('Worker user:', testWorker);
const workerFilter = buildRoleBasedWhereClause(testWorker);
console.log('Worker filter result:', workerFilter);

// Expected: Owner should see all records (empty filter)
// Expected: Worker should only see own records (userId: 3)
