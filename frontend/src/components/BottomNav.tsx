import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import { getNavigationForRole, type NavItem, type UserRole } from '../config/navigationConfig';

interface BottomNavProps {
  onLogout?: () => void;
}

const BottomNav = ({ onLogout }: BottomNavProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { canAccessFeature } = useSubscriptionRestrictions();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [trayPositions, setTrayPositions] = useState<Record<string, number>>({});
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  if (!user) return null;

  const userRole = user.role as UserRole;
  const navigationItems = getNavigationForRole(userRole);

  // Compute the actually-visible items after subscription filtering.
  // This is what determines the rendered layout and thus the tray positions.
  // The full `navigationItems` array never changes (static config), but the
  // visible subset does — e.g. when subscription data loads asynchronously
  // and a previously-restricted item becomes visible.
  const visibleNavItems = navigationItems.filter(
    item => !item.feature || canAccessFeature(item.feature)
  );
  const visibleNavKey = visibleNavItems.map(i => i.id).join(',');

  useEffect(() => {
    const updatePositions = () => {
      const positions: Record<string, number> = {};
      visibleNavItems.forEach(item => {
        const el = itemRefs.current[item.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          positions[item.id] = rect.left + rect.width / 2;
        }
      });
      setTrayPositions(positions);
    };

    // Defer initial measurement so layout is settled (fonts, flexbox, async content)
    const deferredTimer = setTimeout(updatePositions, 0);

    window.addEventListener('resize', updatePositions);

    // Observe the nav container for layout shifts (content loading, font swaps)
    const resizeObserver = new ResizeObserver(() => updatePositions());
    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }

    // Re-measure when fonts finish loading (causes layout shift without resize event)
    if (document.fonts) {
      document.fonts.ready.then(() => updatePositions());
    }

    return () => {
      clearTimeout(deferredTimer);
      window.removeEventListener('resize', updatePositions);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNavKey]);

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
      {/* Slide-up Trays - rendered as siblings behind the bottom navbar */}
      {navigationItems.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        if (!hasChildren) return null;

        const isRestricted = item.feature && !canAccessFeature(item.feature);
        if (isRestricted) return null;

        const isMenuOpen = activeMenu === item.id;
        const centerX = trayPositions[item.id];

        return (
          <div
            key={`tray-${item.id}`}
            style={{ left: centerX ?? '50%' }}
            className={`fixed bottom-16 -translate-x-1/2 min-w-[160px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-transform duration-300 ease-out z-40 ${
              isMenuOpen
                ? 'translate-y-0 pointer-events-auto'
                : 'translate-y-full pointer-events-none'
            }`}
          >
            <div className="max-h-64 overflow-y-auto">
              {item.children?.map(child => {
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
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <child.icon size={18} />
                    <span className="text-sm font-medium">{child.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom Navigation */}
      <div ref={navContainerRef} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-50">
        <div className="flex items-center justify-around h-16 px-2 sm:px-4">
          {navigationItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isItemActive = isActive(item.href) || isMenuActive(item);
            const isMenuOpen = activeMenu === item.id;

            // Check subscription restrictions for restricted items
            const isRestricted = item.feature && !canAccessFeature(item.feature);
            if (isRestricted) return null;

            return (
              <div
                key={item.id}
                ref={el => { itemRefs.current[item.id] = el; }}
                className="relative flex-1 min-w-0 max-w-[120px]"
              >
                {hasChildren ? (
                  <button
                    onClick={() => handleMenuToggle(item.id)}
                    className={`w-full h-full flex flex-col items-center justify-center space-y-0.5 transition-colors px-1 ${
                      isItemActive || isMenuOpen
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <item.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                    <span className="text-[10px] sm:text-[10px] font-medium truncate w-full text-center">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    to={item.href || '#'}
                    onClick={() => handleItemClick(item)}
                    className={`w-full h-full flex flex-col items-center justify-center space-y-0.5 transition-colors px-1 ${
                      isItemActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <item.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                    <span className="text-[10px] sm:text-[10px] font-medium truncate w-full text-center">{item.name}</span>
                  </Link>
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
