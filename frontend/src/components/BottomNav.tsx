import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import { getNavigationForRole, type NavItem, type UserRole } from '../config/navigationConfig';

// Add custom animation styles
const slideUpAnimation = `
  @keyframes slideUp {
    from {
      transform: translate(-50%, 100%);
    }
    to {
      transform: translate(-50%, 0);
    }
  }
  .animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
`;

interface BottomNavProps {
  onLogout?: () => void;
}

const BottomNav = ({ onLogout }: BottomNavProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { canAccessFeature } = useSubscriptionRestrictions();

  if (!user) return null;

  const userRole = user.role as UserRole;
  const navigationItems = getNavigationForRole(userRole);

  const handleMenuToggle = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'logout' || item.id === 'superuser-logout') {
      if (onLogout) {
        onLogout();
      }
      return;
    }

    // Close menu after navigation
    setActiveMenu(null);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const isMenuActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.href));
  };

  return (
    <>
      <style>{slideUpAnimation}</style>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around h-16 px-2 sm:px-4">
        {navigationItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isItemActive = isActive(item.href) || isMenuActive(item);
          const isMenuOpen = activeMenu === item.id;

          // Check subscription restrictions for restricted items
          const isRestricted = item.feature && !canAccessFeature(item.feature);
          if (isRestricted) return null;

          return (
            <div key={item.id} className="relative flex-1 min-w-0 max-w-[120px]">
              {hasChildren ? (
                <button
                  onClick={() => handleMenuToggle(item.id)}
                  className={`w-full h-full flex flex-col items-center justify-center space-y-0.5 transition-colors px-1 ${
                    isItemActive || isMenuOpen
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <item.icon size={10} className="sm:size-10 size-8" />
                  <span className="text-[10px] sm:text-[10px] font-medium truncate w-full text-center">{item.name}</span>
                </button>
              ) : (
                <Link
                  to={item.href || '#'}
                  onClick={() => handleItemClick(item)}
                  className={`w-full h-full flex flex-col items-center justify-center space-y-0.5 transition-colors px-1 ${
                    isItemActive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <item.icon size={10} className="sm:size-10 size-8" />
                  <span className="text-[10px] sm:text-[10px] font-medium truncate w-full text-center">{item.name}</span>
                </Link>
              )}

              {/* Popover Menu */}
              {hasChildren && (
                <div className={`absolute bottom-full left-1/2 mb-2 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[150px] sm:min-w-[180px] transition-all duration-300 ease-out ${
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                  <div className="max-h-64 overflow-y-auto">
                    {item.children?.map((child) => {
                      // Check subscription restrictions for child items
                      const isChildRestricted = child.feature && !canAccessFeature(child.feature);
                      if (isChildRestricted) return null;

                      const isChildActive = isActive(child.href);

                      return (
                        <Link
                          key={child.id}
                          to={child.href || '#'}
                          onClick={() => handleItemClick(child)}
                          className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                            isChildActive
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <child.icon size={18} />
                          <span className="text-sm font-medium">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default BottomNav;
