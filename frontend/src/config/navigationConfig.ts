// Centralized role-based navigation configuration
// This file defines the navigation structure for all user roles

import type { SubscriptionLimits } from '../utils/subscriptionRestrictions';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Wallet,
  DollarSign,
  CreditCard,
  Package,
  Tractor,
  Camera,
  Heart,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Users,
  Building2,
  Activity,
  Monitor,
  Server,
  FileCode,
} from 'lucide-react';

export type UserRole = 'WORKER' | 'VETERINARIAN' | 'INVENTORY' | 'MANAGER' | 'ACCOUNTANT' | 'OWNER' | 'SUPERUSER';

export interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href?: string;
  apiEndpoint?: string;
  children?: NavItem[];
  allowedRoles: UserRole[];
  feature?: keyof SubscriptionLimits['features'];
}

export interface RoleNavigationConfig {
  [key: string]: {
    bottomNav: NavItem[];
  };
}

// Primary navigation categories
const DASHBOARD_CATEGORY: NavItem = {
  id: 'dashboard',
  name: 'Dashboard',
  icon: LayoutDashboard,
  href: '/dashboard',
  allowedRoles: ['OWNER', 'ACCOUNTANT'],
};

const FINANCE_CATEGORY: NavItem = {
  id: 'finance',
  name: 'Finance',
  icon: Wallet,
  allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
  children: [
    {
      id: 'income',
      name: 'Income',
      icon: Wallet,
      href: '/income',
      allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
    },
    {
      id: 'expense',
      name: 'Expense',
      icon: CreditCard,
      href: '/expenses',
      allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
    },
  ],
};

const MONITOR_CATEGORY: NavItem = {
  id: 'monitor',
  name: 'Monitor',
  icon: Monitor,
  allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
  children: [
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Package,
      href: '/inventory',
      allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
      feature: 'inventoryTransactions',
    },
    {
      id: 'assets',
      name: 'Assets',
      icon: Tractor,
      href: '/assets',
      allowedRoles: ['MANAGER', 'ACCOUNTANT', 'OWNER'],
      feature: 'inventoryTransactions',
    },
    {
      id: 'cctv',
      name: 'CCTV',
      icon: Camera,
      href: '/cctv',
      allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
      feature: 'inventoryTransactions',
    },
  ],
};

const LIVESTOCK_HEALTH_CATEGORY: NavItem = {
  id: 'livestock-health',
  name: 'Health',
  icon: Heart,
  href: '/livestock-health',
  allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
  feature: 'inventoryTransactions',
};

const OTHERS_CATEGORY: NavItem = {
  id: 'others',
  name: 'Others',
  icon: Settings,
  allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
  children: [
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      allowedRoles: ['MANAGER', 'ACCOUNTANT', 'OWNER'],
      feature: 'analytics',
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      href: '/reports',
      allowedRoles: ['ACCOUNTANT', 'OWNER'],
      feature: 'financialReports',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      href: '/settings',
      allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
    },
    {
      id: 'logout',
      name: 'Logout',
      icon: LogOut,
      allowedRoles: ['WORKER', 'VETERINARIAN', 'INVENTORY', 'MANAGER', 'ACCOUNTANT', 'OWNER'],
    },
  ],
};

// Superuser navigation configuration
const SUPERUSER_DASHBOARD_CATEGORY: NavItem = {
  id: 'superuser-dashboard',
  name: 'Overview',
  icon: LayoutDashboard,
  href: '/super-user/dashboard',
  allowedRoles: ['SUPERUSER'],
};

const SUPERUSER_PEOPLE_CATEGORY: NavItem = {
  id: 'people',
  name: 'People',
  icon: Users,
  allowedRoles: ['SUPERUSER'],
  children: [
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      href: '/super-user/user/',
      apiEndpoint: '/super-user/user',
      allowedRoles: ['SUPERUSER'],
    },
    {
      id: 'organizations',
      name: 'Organizations',
      icon: Building2,
      href: '/super-user/organization',
      apiEndpoint: '/super-user/organization',
      allowedRoles: ['SUPERUSER'],
    },
  ],
};

const SUPERUSER_MONITOR_CATEGORY: NavItem = {
  id: 'superuser-monitor',
  name: 'Monitor',
  icon: Activity,
  allowedRoles: ['SUPERUSER'],
  children: [
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      icon: CreditCard,
      href: '/super-user/subscriptions',
      apiEndpoint: '/super-user/subscription',
      allowedRoles: ['SUPERUSER'],
    },
    {
      id: 'activity',
      name: 'Activity Monitor',
      icon: Monitor,
      href: '/super-user/activity',
      apiEndpoint: '/super-user/activity',
      allowedRoles: ['SUPERUSER'],
    },
  ],
};

const SUPERUSER_SYSTEM_CATEGORY: NavItem = {
  id: 'system',
  name: 'System',
  icon: Server,
  allowedRoles: ['SUPERUSER'],
  children: [
    {
      id: 'system-health',
      name: 'System Health',
      icon: Heart,
      href: '/super-user/system-health',
      apiEndpoint: '/super-user/system-health',
      allowedRoles: ['SUPERUSER'],
    },
    {
      id: 'system-logs',
      name: 'System Logs',
      icon: FileCode,
      href: '/super-user/logs',
      allowedRoles: ['SUPERUSER'],
    },
  ],
};

const SUPERUSER_OTHERS_CATEGORY: NavItem = {
  id: 'superuser-others',
  name: 'Others',
  icon: Settings,
  allowedRoles: ['SUPERUSER'],
  children: [
    {
      id: 'superuser-analytics',
      name: 'Analytics',
      icon: BarChart3,
      href: '/super-user/analytics',
      apiEndpoint: '/super-user/analytics',
      allowedRoles: ['SUPERUSER'],
    },
    {
      id: 'superuser-settings',
      name: 'Settings',
      icon: Settings,
      href: '/super-user/settings',
      apiEndpoint: '/super-user/settings',
      allowedRoles: ['SUPERUSER'],
    },
    {
      id: 'superuser-logout',
      name: 'Logout',
      icon: LogOut,
      allowedRoles: ['SUPERUSER'],
    },
  ],
};

// Role-based navigation configuration
export const ROLE_NAVIGATION_CONFIG: RoleNavigationConfig = {
  WORKER: {
    bottomNav: [
      FINANCE_CATEGORY,
      MONITOR_CATEGORY,
      LIVESTOCK_HEALTH_CATEGORY,
      OTHERS_CATEGORY,
    ],
  },
  VETERINARIAN: {
    bottomNav: [
      FINANCE_CATEGORY,
      MONITOR_CATEGORY,
      LIVESTOCK_HEALTH_CATEGORY,
      OTHERS_CATEGORY,
    ],
  },
  INVENTORY: {
    bottomNav: [
      FINANCE_CATEGORY,
      MONITOR_CATEGORY,
      LIVESTOCK_HEALTH_CATEGORY,
      OTHERS_CATEGORY,
    ],
  },
  MANAGER: {
    bottomNav: [
      FINANCE_CATEGORY,
      MONITOR_CATEGORY,
      LIVESTOCK_HEALTH_CATEGORY,
      OTHERS_CATEGORY,
    ],
  },
  ACCOUNTANT: {
    bottomNav: [
      DASHBOARD_CATEGORY,
      FINANCE_CATEGORY,
      MONITOR_CATEGORY,
      LIVESTOCK_HEALTH_CATEGORY,
      OTHERS_CATEGORY,
    ],
  },
  OWNER: {
    bottomNav: [
      DASHBOARD_CATEGORY,
      FINANCE_CATEGORY,
      MONITOR_CATEGORY,
      LIVESTOCK_HEALTH_CATEGORY,
      OTHERS_CATEGORY,
    ],
  },
  SUPERUSER: {
    bottomNav: [
      SUPERUSER_DASHBOARD_CATEGORY,
      SUPERUSER_PEOPLE_CATEGORY,
      SUPERUSER_MONITOR_CATEGORY,
      SUPERUSER_SYSTEM_CATEGORY,
      SUPERUSER_OTHERS_CATEGORY,
    ],
  },
};

// Helper function to get navigation for a specific role
export const getNavigationForRole = (role: UserRole): NavItem[] => {
  const config = ROLE_NAVIGATION_CONFIG[role];
  if (!config) {
    console.warn(`No navigation configuration found for role: ${role}`);
    return [];
  }
  return config.bottomNav;
};

// Helper function to filter navigation items based on user role
export const filterNavItemsByRole = (items: NavItem[], role: UserRole): NavItem[] => {
  return items
    .filter(item => item.allowedRoles.includes(role))
    .map(item => ({
      ...item,
      children: item.children ? filterNavItemsByRole(item.children, role) : undefined,
    }));
};

// Helper function to check if a user has access to a specific navigation item
export const hasAccessToNavItem = (item: NavItem, role: UserRole): boolean => {
  return item.allowedRoles.includes(role);
};
