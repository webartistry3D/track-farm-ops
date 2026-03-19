import { prisma } from '../lib/prisma';

// Helper function to build role-based where clause
export const buildRoleBasedWhereClause = (user: { id: number; role: string; name: string }) => {
  // For now, use a simpler approach - get all records and filter in canUserAccessRecord
  // This avoids complex Prisma queries that might fail
  return {};
};

// Helper function to get organization root (the ultimate owner)
const getOrganizationRoot = async (userId: number): Promise<number | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdBy: true }
  });
  
  if (!user) return null;
  
  // If user has createdBy, that's the organization root
  // If user has no createdBy, they are the organization root (owner)
  return user.createdBy || userId;
};

// Helper function to check if user can access a specific record
export const canUserAccessRecord = async (
  user: { id: number; role: string; name: string },
  recordUserId: number,
  recordCreatedBy?: number
) => {
  // Always allow access to own records
  if (user.id === recordUserId) {
    return true;
  }

  // Get the organization root for both user and record creator
  const userOrgRoot = await getOrganizationRoot(user.id);
  const recordOrgRoot = await getOrganizationRoot(recordUserId);

  // Users can access records if they are in the same organization
  // (same organization root)
  return userOrgRoot === recordOrgRoot;
};

// Helper function to get accessible user IDs for filtering
export const getAccessibleUserIds = async (user: { id: number; role: string; name: string }) => {
  // Get the organization root for this user
  const userOrgRoot = await getOrganizationRoot(user.id);
  
  if (!userOrgRoot) {
    // If no organization root found, only return user's own ID
    return [user.id];
  }

  // Get all users in the same organization
  const organizationUsers = await prisma.user.findMany({
    where: {
      OR: [
        { id: userOrgRoot }, // The owner themselves
        { createdBy: userOrgRoot } // All users created by this owner
      ]
    },
    select: { id: true }
  });

  return organizationUsers.map(u => u.id);
};
