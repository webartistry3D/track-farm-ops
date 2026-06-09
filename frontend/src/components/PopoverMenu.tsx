import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import type { NavItem } from '../config/navigationConfig';

interface PopoverMenuProps {
  trigger: React.ReactNode;
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const PopoverMenu = ({ trigger, items, isOpen, onToggle, position = 'top' }: PopoverMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { canAccessFeature } = useSubscriptionRestrictions();
  const location = useLocation();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'bottom-full mb-2';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={onToggle}>{trigger}</div>
      
      {isOpen && (
        <div className={`absolute ${getPositionClasses()} left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50`}>
          <div className="max-h-64 overflow-y-auto">
            {items.map((item) => {
              // Check subscription restrictions for restricted items
              const isRestricted = item.feature && !canAccessFeature(item.feature);
              if (isRestricted) return null;

              const isItemActive = isActive(item.href);

              if (item.children && item.children.length > 0) {
                // Render submenu item with children
                return (
                  <div key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                      {item.icon} {item.name}
                    </div>
                    {item.children.map((child) => {
                      const isChildRestricted = child.feature && !canAccessFeature(child.feature);
                      if (isChildRestricted) return null;

                      const isChildActive = isActive(child.href);

                      return (
                        <Link
                          key={child.id}
                          to={child.href || '#'}
                          onClick={onToggle}
                          className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                            isChildActive
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="text-lg">{child.icon}</span>
                          <span className="text-sm font-medium">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              }

              // Render simple menu item
              return (
                <Link
                  key={item.id}
                  to={item.href || '#'}
                  onClick={onToggle}
                  className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                    isItemActive
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PopoverMenu;
