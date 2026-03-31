// Responsive breakpoint constants for engineering precision
export const BREAKPOINTS = {
  mobile: '640px',    // sm
  tablet: '768px',    // md
  desktop: '1024px',   // lg
  large: '1280px'      // xl
} as const;

// Responsive grid utilities for precise layout matching
export const getResponsiveGrid = (base: string, tablet?: string, desktop?: string, large?: string) => {
  return `${base} ${tablet || ''} ${desktop || ''} ${large || ''}`.trim();
};

// Engineering-precise skeleton dimensions based on actual component analysis
export const SKELETON_DIMENSIONS = {
  // Dashboard specific
  dashboard: {
    statsCard: {
      mobile: 'h-24',
      tablet: 'h-28', 
      desktop: 'h-32'
    },
    welcomeSection: {
      mobile: 'h-16',
      tablet: 'h-20',
      desktop: 'h-24'
    }
  },
  
  // Inventory specific
  inventory: {
    itemCard: {
      mobile: 'h-48',
      tablet: 'h-52',
      desktop: 'h-56'
    },
    statsCard: {
      mobile: 'h-20',
      tablet: 'h-24',
      desktop: 'h-28'
    }
  },
  
  // Assets specific
  assets: {
    assetCard: {
      mobile: 'h-44',
      tablet: 'h-48', 
      desktop: 'h-52'
    },
    kpiCard: {
      mobile: 'h-16',
      tablet: 'h-20',
      desktop: 'h-24'
    }
  },
  
  // Analytics specific
  analytics: {
    chartContainer: {
      mobile: 'h-48',
      tablet: 'h-56',
      desktop: 'h-64'
    },
    metricCard: {
      mobile: 'h-20',
      tablet: 'h-24',
      desktop: 'h-28'
    }
  },
  
  // Reports specific
  reports: {
    tableRow: {
      mobile: 'h-12',
      tablet: 'h-14',
      desktop: 'h-16'
    },
    filterSection: {
      mobile: 'h-16',
      tablet: 'h-20',
      desktop: 'h-24'
    }
  }
} as const;

// Animation timing constants for smooth UX
export const ANIMATION_TIMING = {
  fast: 'duration-200',
  normal: 'duration-300', 
  slow: 'duration-500',
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer'
} as const;

// Utility for responsive skeleton classes
export const getResponsiveSkeleton = (dimensions: { mobile: string; tablet?: string; desktop?: string }) => {
  return `${dimensions.mobile} md:${dimensions.tablet || dimensions.mobile} lg:${dimensions.desktop || dimensions.tablet || dimensions.mobile}`;
};

// Re-export skeleton components from SkeletonComponents
export { 
  SkeletonElement, 
  CardSkeleton, 
  PageSkeleton 
} from './SkeletonComponents';
