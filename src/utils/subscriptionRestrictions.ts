export interface SubscriptionLimits {
  farmLocations: number;
  workers: number;
  features: {
    incomeTracking: 'basic' | 'full';
    expenseTracking: 'basic' | 'full';
    inventoryTransactions: boolean;
    ownerDashboard: boolean;
    financialReports: 'simple' | 'advanced';
    analytics: boolean;
    auditLogs: boolean;
    dataExport: boolean;
    prioritySupport: boolean;
  };
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  freemium: {
    farmLocations: 1,
    workers: 1,
    features: {
      incomeTracking: 'basic',
      expenseTracking: 'basic',
      inventoryTransactions: false,
      ownerDashboard: false,
      financialReports: 'simple',
      analytics: false,
      auditLogs: false,
      dataExport: false,
      prioritySupport: false
    }
  },
  trial: {
    farmLocations: 1,
    workers: 3,
    features: {
      incomeTracking: 'full',
      expenseTracking: 'full',
      inventoryTransactions: true,
      ownerDashboard: true,
      financialReports: 'simple',
      analytics: false,
      auditLogs: false,
      dataExport: true,
      prioritySupport: false
    }
  },
  starter: {
    farmLocations: 1,
    workers: 3,
    features: {
      incomeTracking: 'full',
      expenseTracking: 'full',
      inventoryTransactions: true,
      ownerDashboard: true,
      financialReports: 'simple',
      analytics: false,
      auditLogs: false,
      dataExport: true,
      prioritySupport: false
    }
  },
  growth: {
    farmLocations: 2,
    workers: 30,
    features: {
      incomeTracking: 'full',
      expenseTracking: 'full',
      inventoryTransactions: true,
      ownerDashboard: true,
      financialReports: 'advanced',
      analytics: true,
      auditLogs: true,
      dataExport: true,
      prioritySupport: true
    }
  },
  pro: {
    farmLocations: 3,
    workers: 80,
    features: {
      incomeTracking: 'full',
      expenseTracking: 'full',
      inventoryTransactions: true,
      ownerDashboard: true,
      financialReports: 'advanced',
      analytics: true,
      auditLogs: true,
      dataExport: true,
      prioritySupport: true
    }
  }
};

export class SubscriptionRestrictions {
  private static userSubscription: any = null;
  private static userLimits: SubscriptionLimits | null = null;
  private static isInitialized: boolean = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize() {
    // Prevent multiple simultaneous initializations
    if (this.isInitialized) {
      console.log('📦 SubscriptionRestrictions already initialized, using cached data');
      return;
    }

    if (this.initPromise) {
      console.log('⏳ Initialization in progress, waiting...');
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    await this.initPromise;
  }

  private static async performInitialization() {
    try {
      console.log('🔄 Initializing subscription restrictions...');
      
      // Use the configured API instance instead of fetch
      const { api } = await import('../lib/api');
      const response = await api.get('/subscription/current');
      
      if (response.data) {
        // API returns data nested in subscription object
        this.userSubscription = response.data.subscription || response.data;
        this.userLimits = SUBSCRIPTION_LIMITS[this.userSubscription.plan] || SUBSCRIPTION_LIMITS.freemium;
        console.log(`✅ Subscription loaded: ${this.userSubscription.plan}`);
      } else {
        // Default to freemium if no subscription
        this.userLimits = SUBSCRIPTION_LIMITS.freemium;
        console.log('ℹ️ No subscription found, defaulting to freemium');
      }
      
      this.isInitialized = true;
      console.log('✅ SubscriptionRestrictions initialization completed');
    } catch (error) {
      console.error('❌ Subscription initialization error:', error);
      // Fallback to freemium on error
      this.userLimits = SUBSCRIPTION_LIMITS.freemium;
      this.isInitialized = true;
    }
  }

  static async refresh() {
    // Reset cached data and reinitialize
    console.log('🔄 Refreshing subscription restrictions...');
    this.userSubscription = null;
    this.userLimits = null;
    this.isInitialized = false;
    this.initPromise = null;
    await this.initialize();
  }

  static getLimits(): SubscriptionLimits {
    return this.userLimits || SUBSCRIPTION_LIMITS.freemium;
  }

  static canAccessFeature(feature: keyof SubscriptionLimits['features']): boolean {
    const limits = this.getLimits();
    return limits.features[feature] !== false && limits.features[feature] !== 'basic';
  }

  static canAccessBasicFeature(feature: keyof SubscriptionLimits['features']): boolean {
    const limits = this.getLimits();
    return limits.features[feature] !== false;
  }

  static getFeatureLevel(feature: keyof SubscriptionLimits['features']): 'none' | 'basic' | 'full' | 'advanced' {
    const limits = this.getLimits();
    const featureValue = limits.features[feature];
    
    if (featureValue === false) return 'none';
    if (featureValue === 'basic') return 'basic';
    if (featureValue === 'full') return 'full';
    if (featureValue === 'advanced') return 'advanced';
    return 'none';
  }

  static canAddMoreWorkers(currentWorkers: number): boolean {
    const limits = this.getLimits();
    return currentWorkers < limits.workers;
  }

  static canAddMoreLocations(currentLocations: number): boolean {
    const limits = this.getLimits();
    return currentLocations < limits.farmLocations;
  }

  static getWorkerLimit(): number {
    return this.getLimits().workers;
  }

  static getLocationLimit(): number {
    return this.getLimits().farmLocations;
  }

  static getCurrentPlan(): string {
    return this.userSubscription?.plan || 'freemium';
  }

  static isSubscribed(): boolean {
    const plan = this.getCurrentPlan();
    return plan !== 'freemium' && plan !== 'trial';
  }

  static shouldShowUpgradePrompt(feature: keyof SubscriptionLimits['features']): boolean {
    return !this.canAccessFeature(feature);
  }

  static getUpgradeMessage(feature: keyof SubscriptionLimits['features']): string {
    const currentPlan = this.getCurrentPlan();
    
    const featureMessages: Record<string, Record<string, string>> = {
      incomeTracking: {
        freemium: 'Upgrade to Starter for full income tracking with categories and reports',
        trial: 'Upgrade to Starter for advanced income tracking features',
        starter: 'Upgrade to Growth for comprehensive income analytics'
      },
      expenseTracking: {
        freemium: 'Upgrade to Starter for detailed expense tracking and receipt management',
        trial: 'Upgrade to Starter for advanced expense categorization',
        starter: 'Upgrade to Growth for expense trend analysis'
      },
      inventoryTransactions: {
        freemium: 'Upgrade to Starter for complete inventory management',
        trial: 'Your trial includes inventory management - upgrade to Starter to keep it'
      },
      ownerDashboard: {
        freemium: 'Upgrade to Starter for the owner dashboard with financial overview',
        trial: 'Your trial includes the dashboard - upgrade to Starter to maintain access'
      },
      financialReports: {
        freemium: 'Upgrade to Starter for basic financial reports',
        starter: 'Upgrade to Growth for advanced financial analytics and trends'
      },
      analytics: {
        freemium: 'Upgrade to Growth for powerful analytics and insights',
        trial: 'Upgrade to Growth for comprehensive analytics features',
        starter: 'Upgrade to Growth for advanced analytics and trend analysis'
      },
      auditLogs: {
        freemium: 'Upgrade to Growth for complete audit trail and activity logs',
        trial: 'Upgrade to Growth for audit logs and compliance features',
        starter: 'Upgrade to Growth for comprehensive audit trail'
      },
      dataExport: {
        freemium: 'Upgrade to Starter for data export (CSV/Excel)',
        trial: 'Your trial includes data export - upgrade to Starter to continue exporting'
      },
      prioritySupport: {
        freemium: 'Upgrade to Starter for priority email support',
        starter: 'Upgrade to Growth for priority support with faster response times'
      }
    };

    return featureMessages[feature]?.[currentPlan] || 'Upgrade your plan to access this feature';
  }

  static getRequiredPlanForFeature(feature: keyof SubscriptionLimits['features']): string {
    // Find the minimum plan that has access to this feature
    for (const [plan, limits] of Object.entries(SUBSCRIPTION_LIMITS)) {
      if (limits.features[feature] !== false && limits.features[feature] !== 'basic') {
        return plan;
      }
    }
    return 'starter'; // Default fallback
  }
}

// Hook for React components
export const useSubscriptionRestrictions = () => {
  return {
    canAccessFeature: SubscriptionRestrictions.canAccessFeature.bind(SubscriptionRestrictions),
    canAccessBasicFeature: SubscriptionRestrictions.canAccessBasicFeature.bind(SubscriptionRestrictions),
    getFeatureLevel: SubscriptionRestrictions.getFeatureLevel.bind(SubscriptionRestrictions),
    canAddMoreWorkers: SubscriptionRestrictions.canAddMoreWorkers.bind(SubscriptionRestrictions),
    canAddMoreLocations: SubscriptionRestrictions.canAddMoreLocations.bind(SubscriptionRestrictions),
    getWorkerLimit: SubscriptionRestrictions.getWorkerLimit.bind(SubscriptionRestrictions),
    getLocationLimit: SubscriptionRestrictions.getLocationLimit.bind(SubscriptionRestrictions),
    getCurrentPlan: SubscriptionRestrictions.getCurrentPlan.bind(SubscriptionRestrictions),
    isSubscribed: SubscriptionRestrictions.isSubscribed.bind(SubscriptionRestrictions),
    shouldShowUpgradePrompt: SubscriptionRestrictions.shouldShowUpgradePrompt.bind(SubscriptionRestrictions),
    getUpgradeMessage: SubscriptionRestrictions.getUpgradeMessage.bind(SubscriptionRestrictions),
    getRequiredPlanForFeature: SubscriptionRestrictions.getRequiredPlanForFeature.bind(SubscriptionRestrictions)
  };
};
