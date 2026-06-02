import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import { 
  AnalyticsSkeleton
} from './EnhancedSkeletons';
import { 
  TrendingUp, 
  ShoppingCart, 
  PieChart,
  Package,
  Heart,
  Apple,
  Box,
  BarChart3,
  Calendar,
  Target,
  Zap,
  RefreshCw,
  Sprout,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle} from 'lucide-react';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: { category: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

interface InventorySummary {
  totalItems: number;
  livestock: number;
  produce: number;
  consumables: number;
  totalTransactions: number;
  itemsByType: {
    LIVESTOCK: any[];
    PRODUCE: any[];
    CONSUMABLES: any[];
  };
}

const Analytics = () => {
  const { user } = useAuth();

  // Check f user has appropriate role
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">Please log in to view analytics.</div>
        </div>
      </div>
    );
  }

  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'ACCOUNTANT' || user.role === 'INVENTORY';
  const isManager = user.role === 'MANAGER';
  const isInventory = user.role === 'INVENTORY';
  const shouldHideFinancialSections = isManager || isInventory;

  if (!isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Analytics is only available to farm owners, managers, accountants, and inventory managers.
        </p>
      </div>
    );
  }

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | 'allTime'>('allTime');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Farm Operations Modal States
  const [showCropModal, setShowCropModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setShowTotalItemsModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setShowLivestockModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setShowProduceModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setShowConsumablesModal] = useState(false);

  // Farm Operations Data
  const [crops, setCrops] = useState<any[]>([]);

  const [cropData, setCropData] = useState({
    newCrop: '',
    plantingDate: '',
    expectedHarvest: '',
    zoneAssignment: '',
    notes: ''
  });
  
  const [soilData, setSoilData] = useState({
    moistureLevel: '',
    phLevel: '',
    nitrogenLevel: '',
    phosphorusLevel: '',
    potassiumLevel: '',
    zone: '',
    treatmentType: '',
    treatmentDate: ''
  });
  
  const [irrigationData, setIrrigationData] = useState({
    zone: '',
    duration: '',
    startTime: '',
    waterAmount: '',
    frequency: ''
  });
  
  const [pestData, setPestData] = useState({
    pestType: '',
    severity: '',
    treatmentMethod: '',
    applicationDate: '',
    followUpDate: '',
    notes: ''
  });
  
  const [] = useState({
    equipmentName: '',
    maintenanceType: '',
    scheduledDate: '',
    estimatedCost: '',
    technician: '',
    notes: ''
  });
  
  const [] = useState({
    workerName: '',
    assignedTask: '',
    startTime: '',
    estimatedDuration: '',
    priority: '',
    notes: ''
  });

  const getDefaultFinancialSummary = (): FinancialSummary => ({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: [],
    expensesByCategory: []
  });

  const getDefaultInventorySummary = (): InventorySummary => ({
    totalItems: 0,
    livestock: 0,
    produce: 0,
    consumables: 0,
    totalTransactions: 0,
    itemsByType: {
      LIVESTOCK: [],
      PRODUCE: [],
      CONSUMABLES: []
    }
  });

  // Helper functions for live profit trend data
  const generateProfitTrendData = (): Array<{ label: number; profit: number; percentage: number }> => {
    // In production, this would fetch actual historical profit data
    // For now, return empty structure to avoid mock data
    const dataPoints = dateFilter === 'last7days' ? 7 : 12;
    return Array.from({ length: dataPoints }, (_, index) => ({
      label: index + 1,
      profit: 0,
      percentage: 0
    }));
  };

  const calculateProfitGrowth = () => {
    // In production, this would calculate growth from historical data
    // For now, return 0 to avoid mock data
    return 0;
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - dateFilter changed to:', dateFilter);
    fetchAnalytics();
  }, [dateFilter, selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    console.log('🔄 fetchAnalytics triggered - dateFilter:', dateFilter);
    setFinancialLoading(true);
    setInventoryLoading(true);

    try {
      // Calculate date range based on filter
      const today = new Date();
      let startDate = '';
      let endDate = '';

      switch (dateFilter) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = yesterday.toISOString().split('T')[0];
          break;
        case 'last7days':
          const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'last30days':
          const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
          startDate = thirtyDaysAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'custom':
          const customDate = new Date(selectedYear, selectedMonth, 1);
          const lastDayOfCustomMonth = new Date(selectedYear, selectedMonth + 1, 0);
          startDate = customDate.toISOString().split('T')[0];
          endDate = lastDayOfCustomMonth.toISOString().split('T')[0];
          break;
        case 'allTime':
          // For allTime, don't set date filters to get all data
          startDate = '';
          endDate = '';
          break;
      }

      console.log(`📅 Date range: ${startDate} to ${endDate}`);

      let financialData = getDefaultFinancialSummary();
      try {
        console.log('📊 Making API calls to /finance/income and /finance/expenses');
        const [incomeResponse, expenseResponse] = await Promise.all([
          api.get(`/finance/income${startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
          api.get(`/finance/expenses${startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`)
        ]);

        console.log('📥 Raw API responses:', {
          incomeResponse: incomeResponse.data,
          expenseResponse: expenseResponse.data,
          incomeResponseStatus: incomeResponse.status,
          expenseResponseStatus: expenseResponse.status
        });

        const incomeData = incomeResponse.data?.entries || [];
        const expenseData = expenseResponse.data?.entries || [];

        console.log('📊 Extracted data arrays:', {
          incomeData: incomeData.length,
          expenseData: expenseData.length,
          incomeDataSample: incomeData.slice(0, 2),
          expenseDataSample: expenseData.slice(0, 2)
        });

        console.log('🔍 Checking API response structure:', {
          hasIncomeTotal: 'totalIncome' in incomeResponse.data,
          hasExpenseTotal: 'totalExpenses' in expenseResponse.data,
          incomeTotalValue: incomeResponse.data?.totalIncome,
          expenseTotalValue: expenseResponse.data?.totalExpenses,
          incomeTotalType: typeof incomeResponse.data?.totalIncome,
          expenseTotalType: typeof expenseResponse.data?.totalExpenses
        });

        // Check if API is returning pre-calculated totals instead of entries
        if (typeof incomeResponse.data?.totalIncome === 'string' || typeof expenseResponse.data?.totalExpenses === 'string') {
          console.log('⚠️ API is returning pre-calculated totals as strings!');
          const apiTotalIncome = Number(incomeResponse.data?.totalIncome) || 0;
          const apiTotalExpenses = Number(expenseResponse.data?.totalExpenses) || 0;

          console.log('🔧 Converted API totals:', {
            totalIncome: apiTotalIncome,
            totalExpenses: apiTotalExpenses,
            netProfit: apiTotalIncome - apiTotalExpenses
          });

          financialData = {
            totalIncome: apiTotalIncome,
            totalExpenses: apiTotalExpenses,
            netProfit: apiTotalIncome - apiTotalExpenses,
            incomeByCategory: incomeResponse.data?.incomeByCategory || [],
            expensesByCategory: expenseResponse.data?.expensesByCategory || []
          };
        } else if (incomeData.length > 0 || expenseData.length > 0) {
          // Calculate from individual entries
          console.log('📊 Calculating from individual entries...');

          // Calculate totals from the actual transaction data
          console.log('🔍 Income data analysis:', {
            totalEntries: incomeData.length,
            sampleEntries: incomeData.slice(0, 5),
            allAmounts: incomeData.map((entry: { amount: string | number }) => entry.amount)
          });
          
          const totalIncome = incomeData.reduce((sum: number, entry: { amount: string | number }) => {
            const amount = parseFloat(String(entry.amount)) || 0;
            console.log('🔍 Income entry amount:', entry.amount, 'parsed to:', amount, 'running sum:', sum + amount);
            return sum + amount;
          }, 0);
          const totalExpenses = expenseData.reduce((sum: number, entry: { amount: string | number }) => {
            const amount = parseFloat(String(entry.amount)) || 0;
            console.log('🔍 Expense entry amount:', entry.amount, 'parsed to:', amount);
            return sum + amount;
          }, 0);

          console.log('💰 Calculated totals:', {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            incomeEntries: incomeData.length,
            expenseEntries: expenseData.length
          });

          // Group by category
          const incomeByCategory = incomeData.reduce((acc: any[], entry: any) => {
            const category = entry.category || 'General';
            const amount = parseFloat(entry.amount) || 0;
            const existing = acc.find(item => item.category === category);
            if (existing) {
              existing.amount += amount;
            } else {
              acc.push({ category, amount });
            }
            return acc;
          }, []);

          const expensesByCategory = expenseData.reduce((acc: any[], entry: any) => {
            const category = entry.category || 'General';
            const amount = parseFloat(entry.amount) || 0;
            const existing = acc.find(item => item.category === category);
            if (existing) {
              existing.amount += amount;
            } else {
              acc.push({ category, amount });
            }
            return acc;
          }, []);

          financialData = {
            totalIncome: Number(totalIncome) || 0,
            totalExpenses: Number(totalExpenses) || 0,
            netProfit: Number(totalIncome) - Number(totalExpenses),
            incomeByCategory,
            expensesByCategory
          };
        } else {
          console.log('📊 No data available - using default values');
        }

        console.log('📊 Processed financial data:', financialData);
        
        // FINAL SAFETY NET: Ensure all values are numbers regardless of source
        const safeFinancialData = {
          totalIncome: Number(financialData.totalIncome) || 0,
          totalExpenses: Number(financialData.totalExpenses) || 0,
          netProfit: Number(financialData.netProfit) || 0,
          incomeByCategory: financialData.incomeByCategory || [],
          expensesByCategory: financialData.expensesByCategory || []
        };
        
        console.log('🛡️ Final safe financial data:', safeFinancialData);
        console.log('🔍 Data types:', {
          totalIncome: typeof safeFinancialData.totalIncome,
          totalExpenses: typeof safeFinancialData.totalExpenses,
          netProfit: typeof safeFinancialData.netProfit
        });
        
        // Replace the financial data with the safe version
        financialData = safeFinancialData;
        
        // ADDITIONAL SAFETY: Force string to number conversion at the point of use
        if (typeof financialData.totalIncome === 'string') {
          console.warn('⚠️ FORCING string to number conversion for totalIncome');
          financialData.totalIncome = Number(financialData.totalIncome) || 0;
        }
        if (typeof financialData.totalExpenses === 'string') {
          console.warn('⚠️ FORCING string to number conversion for totalExpenses');
          financialData.totalExpenses = Number(financialData.totalExpenses) || 0;
        }
        if (typeof financialData.netProfit === 'string') {
          console.warn('⚠️ FORCING string to number conversion for netProfit');
          financialData.netProfit = Number(financialData.netProfit) || 0;
        }
      } catch (error) {
        console.error('❌ Financial API error:', error);
      }

      let inventoryData = getDefaultInventorySummary();
      try {
        const inventoryResponse = await api.get('/inventory/summary');
        inventoryData = {
          totalItems: typeof inventoryResponse.data.totalItems === 'number' ? inventoryResponse.data.totalItems : 0,
          livestock: typeof inventoryResponse.data.livestock === 'number' ? inventoryResponse.data.livestock : 0,
          produce: typeof inventoryResponse.data.produce === 'number' ? inventoryResponse.data.produce : 0,
          consumables: typeof inventoryResponse.data.consumables === 'number' ? inventoryResponse.data.consumables : 0,
          totalTransactions: typeof inventoryResponse.data.totalTransactions === 'number' ? inventoryResponse.data.totalTransactions : 0,
          itemsByType: inventoryResponse.data.itemsByType && typeof inventoryResponse.data.itemsByType === 'object' ? inventoryResponse.data.itemsByType : { LIVESTOCK: [], PRODUCE: [], CONSUMABLES: [] }
        };
      } catch (error) {
        console.error('❌ Inventory API error:', error);
      }

      setFinancialSummary(financialData);
      setInventorySummary(inventoryData);
    } catch (error) {
      console.error('❌ Unexpected error in fetchAnalytics:', error);
      setFinancialSummary(getDefaultFinancialSummary());
      setInventorySummary(getDefaultInventorySummary());
    } finally {
      setFinancialLoading(false);
      setInventoryLoading(false);
    }
  };

  const handleUpdateSoilAnalysis = () => {
    // Validate form data
    if (!soilData.moistureLevel || !soilData.phLevel || !soilData.nitrogenLevel || !soilData.phosphorusLevel || !soilData.potassiumLevel) {
      alert('Please fill in all required fields: Moisture Level, pH Level, and Nutrient levels');
      return;
    }

    // Update soil analysis logic here
    console.log('Updating soil analysis:', soilData);
    setShowSoilModal(false);
    
    alert(`Soil analysis for Zone ${soilData.zone || 'Selected'} has been successfully updated!`);
  };

  const handleScheduleIrrigation = () => {
    // Validate form data
    if (!irrigationData.zone || !irrigationData.duration || !irrigationData.startTime || !irrigationData.waterAmount || !irrigationData.frequency) {
      alert('Please fill in all required fields: Zone, Duration, Start Time, Water Amount, and Frequency');
      return;
    }

    // Schedule irrigation logic here
    console.log('Scheduling irrigation:', irrigationData);
    setShowIrrigationModal(false);
    
    alert(`Irrigation has been successfully scheduled for ${irrigationData.zone || 'selected zone'}!`);
  };

  const handleCreateTreatmentPlan = () => {
    // Validate form data
    if (!pestData.pestType || !pestData.severity || !pestData.treatmentMethod || !pestData.applicationDate || !pestData.followUpDate) {
      alert('Please fill in all required fields: Pest Type, Severity, Treatment Method, Application Date, and Follow-up Date');
      return;
    }

    // Create treatment plan logic here
    console.log('Creating pest treatment plan:', pestData);
    setShowPestModal(false);
    
    alert(`Pest treatment plan has been successfully created for ${pestData.applicationDate || 'selected date'}!`);
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'last7days': return 'Last 7 Days';
      case 'last30days': return 'Last 30 Days';
      case 'custom': return 'Custom';
      case 'allTime': return 'All Time';
      default: return 'Custom';
    }
  };

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }) => {
    const getGradientColor = () => {
      if (color === "bg-green-500") return "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700";
      if (color === "bg-red-500") return "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700";
      if (color === "bg-blue-500") return "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700";
      if (color === "bg-orange-500") return "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-700";
      if (color === "bg-indigo-500") return "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-700";
      if (color === "bg-purple-500") return "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700";
      return "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-700";
    };

    const getIconGradientColor = () => {
      if (color === "bg-green-500") return "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700";
      if (color === "bg-red-500") return "from-red-500 to-red-600 dark:from-red-600 dark:to-red-700";
      if (color === "bg-blue-500") return "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700";
      if (color === "bg-orange-500") return "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700";
      if (color === "bg-indigo-500") return "from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700";
      if (color === "bg-purple-500") return "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700";
      return "from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700";
    };

    const getTextColor = () => {
      if (color === "bg-green-500") return "text-green-600 dark:text-green-400";
      if (color === "bg-red-500") return "text-red-600 dark:text-red-400";
      if (color === "bg-blue-500") return "text-blue-600 dark:text-blue-400";
      if (color === "bg-orange-500") return "text-orange-600 dark:text-orange-400";
      if (color === "bg-indigo-500") return "text-indigo-600 dark:text-indigo-400";
      if (color === "bg-purple-500") return "text-purple-600 dark:text-purple-400";
      return "text-gray-600 dark:text-gray-400";
    };

  // Show skeleton while loading
  if (financialLoading || inventoryLoading) {
    return <AnalyticsSkeleton />;
  }

    return (
      <div 
        onClick={() => {
          // Handle card click - could navigate to detailed view or filter
          console.log('Analytics card clicked:', title);
        }}
        className={`group bg-gradient-to-br ${getGradientColor()} rounded-xl p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {getDateFilterLabel()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`p-2 bg-gradient-to-br ${getIconGradientColor()} rounded-lg shadow-lg`}>
              {icon}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <p className={`text-3xl font-bold ${getTextColor()}`}>
            {value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-0 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
          {/*<div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive overview of your farm's performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAnalytics}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>*/}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-0 py-0">
        {/* Key Performance Indicators */}
        <div className="mb-8">
          {/*<div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getDateFilterLabel()}
              </span>
              <button
                onClick={fetchAnalytics}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Refresh
              </button>
            </div>
          </div>*/}
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {/* Inventory Items and Efficiency cards will be moved after Financial Overview */}
          </div>
        </div>

        {/* Financial Overview */}
        {!isManager && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Overview</h2>
            {financialLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Income"
                  value={formatCurrency(Number(financialSummary?.totalIncome) || 0)}
                  icon={<TrendingUp className="h-4 w-4 text-white" />}
                  color="bg-green-500"
                />
                <StatCard
                  title="Total Expenses"
                  value={formatCurrency(Number(financialSummary?.totalExpenses) || 0)}
                  icon={<ShoppingCart className="h-4 w-4 text-white" />}
                  color="bg-red-500"
                />
                <StatCard
                  title="Net Profit"
                  value={formatCurrency(Number(financialSummary?.netProfit) || 0)}
                  icon={<TrendingUp className="h-4 w-4 text-white" />}
                  color={(Number(financialSummary?.netProfit) || 0) >= 0 ? "bg-blue-500" : "bg-orange-500"}
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-8">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-max">
                {/* Quick Date Buttons */}
                <button
                  onClick={() => setDateFilter('today')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'today'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter('yesterday')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'yesterday'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => setDateFilter('last7days')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'last7days'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setDateFilter('last30days')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'last30days'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setDateFilter('allTime')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'allTime'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Time
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs sm:text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      setDateFilter('custom');
                    }}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg font-inter text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-white"
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs sm:text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setDateFilter('custom');
                    }}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg font-inter text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-white"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory & Efficiency Cards */}
        {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Inventory Items"
            value={inventorySummary?.totalItems?.toString() || '0'}
            icon={<Package className="h-4 w-4 text-white" />}
            color="bg-blue-500"
          />

          <StatCard
            title="Efficiency"
            value="87.3%"
            icon={<Activity className="h-4 w-4 text-white" />}
            color="bg-purple-500"
          />
        </div>*/}

        {/* Advanced Analytics Charts */}
        {!shouldHideFinancialSections && (
          <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Advanced Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profit Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Profit Trend Analysis
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last 30 days
                </div>
              </div>
              
              {/* Live Profit Trend Chart */}
              <div className="space-y-4">
                {financialLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-pulse flex space-x-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between h-32">
                      {generateProfitTrendData().map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-full rounded-t-md hover:from-blue-700 hover:to-blue-500 transition-colors ${
                              data.profit >= 0 
                                ? 'bg-gradient-to-t from-green-600 to-green-400' 
                                : 'bg-gradient-to-t from-red-600 to-red-400'
                            }`}
                            style={{ height: `${Math.abs(data.percentage)}%` }}
                            title={`${data.label}: ${formatCurrency(data.profit)}`}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {data.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {dateFilter === 'allTime' ? 'All Time Profit Trend' : 
                         dateFilter === 'last30days' ? '30-Day Profit Trend' :
                         dateFilter === 'last7days' ? '7-Day Profit Trend' :
                         dateFilter === 'today' ? 'Today\'s Profit Trend' :
                         dateFilter === 'yesterday' ? 'Yesterday\'s Profit Trend' :
                         `${new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })} Profit Trend`}
                      </span>
                      <span className={`font-medium ${
                        calculateProfitGrowth() >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculateProfitGrowth() >= 0 ? '+' : ''}{calculateProfitGrowth()}% vs last period
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Revenue</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(Math.floor((Number(financialSummary?.totalIncome) || 0) / 30))}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {financialSummary?.totalIncome && financialSummary?.totalExpenses 
                        ? `${Math.round(((financialSummary.totalIncome - financialSummary.totalExpenses) / financialSummary.totalIncome) * 100)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {calculateProfitGrowth() !== 0 ? `${calculateProfitGrowth() >= 0 ? '+' : ''}${calculateProfitGrowth()}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {!shouldHideFinancialSections && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Income by Category
              </h2>
            {financialLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="ml-4 h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {!financialSummary?.incomeByCategory || financialSummary.incomeByCategory.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No income data available</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Create income entries to see category breakdowns</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financialSummary.incomeByCategory.map((item, index) => {
                      const totalIncome = financialSummary.incomeByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                      const percentage = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-red-500" />
              Expense by Category
            </h2>
            {financialLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="ml-4 h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {!financialSummary?.expensesByCategory || financialSummary.expensesByCategory.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No expense data available</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Create expense entries to see category breakdowns</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financialSummary.expensesByCategory.map((item, index) => {
                      const totalExpenses = financialSummary.expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                      const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-500" />
            Inventory Overview
          </h2>
          {inventoryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div onClick={() => setShowTotalItemsModal(true)} className="cursor-pointer">
                <StatCard
                  title="Total Items"
                  value={inventorySummary?.totalItems?.toString() || '0'}
                  icon={<Package className="w-6 h-6 text-white" />}
                  color="bg-blue-500"
                />
              </div>
              <div onClick={() => setShowLivestockModal(true)} className="cursor-pointer">
                <StatCard
                  title="Livestock"
                  value={inventorySummary?.livestock?.toString() || '0'}
                  icon={<Heart className="w-6 h-6 text-white" />}
                  color="bg-indigo-500"
                />
              </div>
              <div onClick={() => setShowProduceModal(true)} className="cursor-pointer">
                <StatCard
                  title="Produce"
                  value={inventorySummary?.produce?.toString() || '0'}
                  icon={<Apple className="w-6 h-6 text-white" />}
                  color="bg-green-500"
                />
              </div>
              <div onClick={() => setShowConsumablesModal(true)} className="cursor-pointer">
                <StatCard
                  title="Consumables"
                  value={inventorySummary?.consumables?.toString() || '0'}
                  icon={<Box className="w-6 h-6 text-white" />}
                  color="bg-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Agricultural Analytics Widgets */}
        <div className="mb-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Farm Operations Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Crop Management Widget */}
            <div 
              onClick={() => setShowCropModal(true)}
              className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 dark:border-green-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Sprout className="h-5 w-5 mr-2 text-green-600" />
                  Crop Management
                </h3>
                <span className="text-sm text-gray-500 font-medium">N/A</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Planted Crops</span>
                  <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Health Status</span>
                  <span className="font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Harvest</span>
                  <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
                <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Yield Forecast</span>
                    <span className="text-gray-500 font-medium">N/A</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Soil Management Widget */}
            <div 
              onClick={() => setShowSoilModal(true)}
              className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 dark:border-amber-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-amber-600" />
                  Soil Management
                </h3>
                <span className="text-sm text-gray-500 font-medium">N/A</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Moisture Level</span>
                  <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">pH Level</span>
                  <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nutrient Status</span>
                  <span className="font-medium text-gray-500">N/A</span>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Treatment</span>
                    <span className="text-gray-500 font-medium">N/A</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Impact Widget */}
            <div 
              onClick={() => setShowWeatherModal(true)}
              className="bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/20 dark:to-sky-800/20 dark:border-blue-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-blue-600" />
                  Weather Impact
                </h3>
                <span className="text-sm text-gray-500 font-medium">N/A</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rainfall</span>
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</span>
                  <div className="flex items-center">
                    <Wind className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">N/A</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Growth Conditions</span>
                    <span className="text-gray-500 font-medium">N/A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Farm Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Irrigation Status */}
            <div 
              onClick={() => setShowIrrigationModal(true)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Auto-updated</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Irrigation Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Zone A</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Zone B</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Zone C</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Water Usage Today</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
              </div>
            </div>

            {/* Pest Control */}
            <div 
              onClick={() => setShowPestModal(true)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Last check: N/A</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pest Control</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Threat Level</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Treatments</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Spray</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Treatment Efficacy</span>
                  <span className="text-sm font-semibold text-gray-500">N/A</span>
                </div>
              </div>
            </div>

            {/* Equipment Status */}
            <div 
              onClick={() => setShowEquipmentModal(true)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Equipment Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Operational</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utilization</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Next Service</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
              </div>
            </div>

            {/* Field Activity */}
            <div 
              onClick={() => setShowFieldModal(true)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Real-time</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Field Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Workers</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Today</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                  <span className="text-sm font-medium text-gray-500">N/A</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Productivity</span>
                  <span className="text-sm font-semibold text-gray-500">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Modals */}
        
        {/* Crop Management Modal */}
        {showCropModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sprout className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Crop Management Dashboard</h2>
                  </div>
                  <button
                    onClick={() => setShowCropModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Active Crops</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">No crops configured</span>
                        <span className="text-sm font-medium text-gray-500">N/A</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Growth Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Growth Rate</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">N/A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Yield Prediction</span>
                        <span className="text-sm font-medium text-green-600">N/A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Harvest Readiness</span>
                        <span className="text-sm font-medium text-orange-600">N/A</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Crop Management Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sprout className="h-5 w-5 mr-2 text-green-600" />
                    Add New Crop
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crop Type</label>
                      <input
                        type="text"
                        value={cropData.newCrop}
                        onChange={(e) => setCropData({...cropData, newCrop: e.target.value})}
                        placeholder="e.g., Tomatoes, Lettuce"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Planting Date</label>
                      <input
                        type="date"
                        value={cropData.plantingDate}
                        onChange={(e) => setCropData({...cropData, plantingDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Harvest</label>
                      <input
                        type="date"
                        value={cropData.expectedHarvest}
                        onChange={(e) => setCropData({...cropData, expectedHarvest: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zone Assignment</label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Select Zone</option>
                        <option value="zone-a">Zone A</option>
                        <option value="zone-b">Zone B</option>
                        <option value="zone-c">Zone C</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={cropData.notes}
                      onChange={(e) => setCropData({...cropData, notes: e.target.value})}
                      placeholder="Add any special instructions or notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowCropModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        // Validate form data
                        if (!cropData.newCrop.trim() || !cropData.plantingDate || !cropData.expectedHarvest || !cropData.zoneAssignment) {
                          alert('Please fill in all required fields: Crop Type, Planting Date, Expected Harvest, and Zone Assignment');
                          return;
                        }

                        // Create new crop object
                        const newCrop = {
                          id: crops.length + 1,
                          name: cropData.newCrop,
                          zone: cropData.zoneAssignment,
                          plantingDate: cropData.plantingDate,
                          expectedHarvest: cropData.expectedHarvest,
                          status: 'Planned',
                          notes: cropData.notes
                        };

                        // Add to crops array
                        setCrops([...crops, newCrop]);
                        
                        // Clear form
                        setCropData({
                          newCrop: '',
                          plantingDate: '',
                          expectedHarvest: '',
                          zoneAssignment: '',
                          notes: ''
                        });

                        // Close modal
                        setShowCropModal(false);
                        
                        console.log('✅ Crop added:', newCrop);
                        alert(`Crop "${cropData.newCrop}" has been successfully added to the system!`);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Crop
                    </button>
                  </div>
                </div>
                
                {/* Crop Schedule Management */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming Activities</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 h-4 w-4 text-green-600 rounded" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Fertilizer Application - Zone A</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tomorrow, 8:00 AM</p>
                        </div>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 h-4 w-4 text-green-600 rounded" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Pest Inspection - Tomatoes</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Friday, 2:00 PM</p>
                        </div>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Soil Management Modal */}
        {showSoilModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Soil Management Dashboard</h2>
                  </div>
                  <button
                    onClick={() => setShowSoilModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Moisture Level</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">68%</p>
                    <p className="text-xs text-green-600 mt-1">Optimal Range</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">pH Level</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">6.8</p>
                    <p className="text-xs text-green-600 mt-1">Ideal Balance</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Nutrients</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                    <p className="text-xs text-green-600 mt-1">Well Balanced</p>
                  </div>
                </div>
                
                {/* Soil Analysis Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-amber-600" />
                    Update Soil Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moisture Level (%)</label>
                      <input
                        type="number"
                        value={soilData.moistureLevel}
                        onChange={(e) => setSoilData({...soilData, moistureLevel: e.target.value})}
                        placeholder="0-100"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">pH Level</label>
                      <input
                        type="number"
                        value={soilData.phLevel}
                        onChange={(e) => setSoilData({...soilData, phLevel: e.target.value})}
                        placeholder="0-14"
                        min="0"
                        max="14"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Select Zone</option>
                        <option value="zone-a">Zone A</option>
                        <option value="zone-b">Zone B</option>
                        <option value="zone-c">Zone C</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nitrogen (ppm)</label>
                      <input
                        type="number"
                        value={soilData.nitrogenLevel}
                        onChange={(e) => setSoilData({...soilData, nitrogenLevel: e.target.value})}
                        placeholder="e.g., 40"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phosphorus (ppm)</label>
                      <input
                        type="number"
                        value={soilData.phosphorusLevel}
                        onChange={(e) => setSoilData({...soilData, phosphorusLevel: e.target.value})}
                        placeholder="e.g., 30"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Potassium (ppm)</label>
                      <input
                        type="number"
                        value={soilData.potassiumLevel}
                        onChange={(e) => setSoilData({...soilData, potassiumLevel: e.target.value})}
                        placeholder="e.g., 200"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateSoilAnalysis}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Update Analysis
                    </button>
                  </div>
                </div>
                
                {/* Treatment Management */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Schedule Treatment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Treatment Type</label>
                      <select 
                        value={soilData.treatmentType}
                        onChange={(e) => setSoilData({...soilData, treatmentType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Treatment</option>
                        <option value="fertilizer">Fertilizer Application</option>
                        <option value="lime">Lime Treatment</option>
                        <option value="compost">Compost Addition</option>
                        <option value="mulch">Mulching</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Treatment Date</label>
                      <input
                        type="date"
                        value={soilData.treatmentDate}
                        onChange={(e) => setSoilData({...soilData, treatmentDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowSoilModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        // Add soil analysis logic here
                        console.log('Adding soil analysis:', soilData);
                        setShowSoilModal(false);
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Save Analysis
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Soil Analysis by Zone</h3>
                  <div className="space-y-3">
                    {['Zone A', 'Zone B', 'Zone C'].map((zone, index) => (
                      <div key={zone} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-900 dark:text-white">{zone}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">pH: {6.5 + index * 0.3}</span>
                          <span className="text-gray-600 dark:text-gray-400">Moisture: {65 + index * 5}%</span>
                          <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Impact Modal */}
        {showWeatherModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sun className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Weather Impact Dashboard</h2>
                  </div>
                  <button
                    onClick={() => setShowWeatherModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <Thermometer className="h-5 w-5 text-orange-500 mr-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Temperature Analysis</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                        <span className="font-medium text-gray-900 dark:text-white">28°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Today's Range</span>
                        <span className="font-medium text-gray-900 dark:text-white">22°C - 32°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Impact on Crops</span>
                        <span className="text-green-600 font-medium">Positive</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Rainfall Data</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                        <span className="font-medium text-gray-900 dark:text-white">45mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                        <span className="font-medium text-gray-900 dark:text-white">120mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Soil Saturation</span>
                        <span className="text-blue-600 font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">7-Day Forecast Impact</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{day}</p>
                        <Sun className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{26 + index}°</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Irrigation Status Modal */}
        {showIrrigationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Irrigation Control Center</h2>
                  </div>
                  <button
                    onClick={() => setShowIrrigationModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {/* Irrigation Schedule Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                    Schedule Irrigation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zone</label>
                      <select 
                        value={irrigationData.zone}
                        onChange={(e) => setIrrigationData({...irrigationData, zone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Zone</option>
                        <option value="zone-a">Zone A</option>
                        <option value="zone-b">Zone B</option>
                        <option value="zone-c">Zone C</option>
                        <option value="all-zones">All Zones</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={irrigationData.duration}
                        onChange={(e) => setIrrigationData({...irrigationData, duration: e.target.value})}
                        placeholder="e.g., 30"
                        min="1"
                        max="240"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={irrigationData.startTime}
                        onChange={(e) => setIrrigationData({...irrigationData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Water Amount (liters)</label>
                      <input
                        type="number"
                        value={irrigationData.waterAmount}
                        onChange={(e) => setIrrigationData({...irrigationData, waterAmount: e.target.value})}
                        placeholder="e.g., 500"
                        min="50"
                        max="5000"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                    <select 
                      value={irrigationData.frequency}
                      onChange={(e) => setIrrigationData({...irrigationData, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Frequency</option>
                      <option value="once">One Time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom Schedule</option>
                    </select>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowIrrigationModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleScheduleIrrigation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Schedule Irrigation
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { zone: 'Zone A', status: 'Active', usage: '850L', next: '2h' },
                    { zone: 'Zone B', status: 'Scheduled', usage: '0L', next: '6h' },
                    { zone: 'Zone C', status: 'Running', usage: '600L', next: '1h' }
                  ].map((zone) => (
                    <div key={zone.zone} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{zone.zone}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`text-sm font-medium ${
                            zone.status === 'Active' ? 'text-green-600' : 
                            zone.status === 'Running' ? 'text-blue-600' : 'text-gray-500'
                          }`}>{zone.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Usage Today</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{zone.usage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Next Cycle</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{zone.next}</span>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                            Start
                          </button>
                          <button className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                            Stop
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Water Usage Analytics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">2,450L</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Today's Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">-12%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">vs Yesterday</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">78%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">6.2h</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Runtime</p>
                    </div>
                  </div>
                  
                  {/* Quick Controls */}
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Emergency Controls</span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                          Stop All
                        </button>
                        <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                          Pause All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pest Control Modal */}
        {showPestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Pest Control Management</h2>
                  </div>
                  <button
                    onClick={() => setShowPestModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {/* Pest Treatment Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                    Report & Treat Pest Issue
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pest Type</label>
                      <select 
                        value={pestData.pestType}
                        onChange={(e) => setPestData({...pestData, pestType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Pest Type</option>
                        <option value="aphids">Aphids</option>
                        <option value="spider-mites">Spider Mites</option>
                        <option value="whiteflies">Whiteflies</option>
                        <option value="thrips">Thrips</option>
                        <option value="caterpillars">Caterpillars</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity Level</label>
                      <select 
                        value={pestData.severity}
                        onChange={(e) => setPestData({...pestData, severity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Severity</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Treatment Method</label>
                      <select 
                        value={pestData.treatmentMethod}
                        onChange={(e) => setPestData({...pestData, treatmentMethod: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Treatment</option>
                        <option value="neem-oil">Neem Oil</option>
                        <option value="insecticidal-soap">Insecticidal Soap</option>
                        <option value="pyrethrin">Pyrethrin</option>
                        <option value="beneficial-insects">Beneficial Insects</option>
                        <option value="chemical-pesticide">Chemical Pesticide</option>
                        <option value="manual-removal">Manual Removal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Affected Zone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Select Zone</option>
                        <option value="zone-a">Zone A</option>
                        <option value="zone-b">Zone B</option>
                        <option value="zone-c">Zone C</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Date</label>
                      <input
                        type="date"
                        value={pestData.applicationDate}
                        onChange={(e) => setPestData({...pestData, applicationDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Follow-up Date</label>
                      <input
                        type="date"
                        value={pestData.followUpDate}
                        onChange={(e) => setPestData({...pestData, followUpDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes & Observations</label>
                    <textarea
                      value={pestData.notes}
                      onChange={(e) => setPestData({...pestData, notes: e.target.value})}
                      placeholder="Describe the pest issue, affected crops, and any observations..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowPestModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateTreatmentPlan}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Create Treatment Plan
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Threats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Aphids</span>
                        <span className="text-sm font-medium text-yellow-600">Moderate</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Spider Mites</span>
                        <span className="text-sm font-medium text-green-600">Low</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Whiteflies</span>
                        <span className="text-sm font-medium text-orange-600">Monitoring</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Treatment Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Treatments</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Efficacy Rate</span>
                        <span className="text-sm font-medium text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Next Application</span>
                        <span className="text-sm font-medium text-blue-600">Tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Treatment Schedule</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">Neem Oil - Zone A</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completed 2 days ago</span>
                        <button className="text-xs text-blue-600 hover:text-blue-800">View Details</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">Insecticidal Soap - Zone B</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-600 font-medium">Tomorrow 8AM</span>
                        <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Status Modal */}
        {showEquipmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Equipment Monitoring</h2>
                  </div>
                  <button
                    onClick={() => setShowEquipmentModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Operational Equipment</h3>
                    <div className="space-y-2">
                      {['Tractor', 'Irrigation Pump', 'Harvester', 'Plow'].map((equipment) => (
                        <div key={equipment} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900 dark:text-white">{equipment}</span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">Running</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Maintenance Required</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 dark:text-white">Sprayer</span>
                        <span className="text-xs text-yellow-600 font-medium">In 3 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 dark:text-white">Generator</span>
                        <span className="text-xs text-orange-600 font-medium">Overdue</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">78%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Utilization</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">94%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">8/10</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Operational</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">2</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Field Activity Modal */}
        {showFieldModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Field Activity Monitor</h2>
                  </div>
                  <button
                    onClick={() => setShowFieldModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Workers</h4>
                    <p className="text-3xl font-bold text-blue-600">6</p>
                    <p className="text-xs text-green-600 mt-1">On Schedule</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tasks Today</h4>
                    <p className="text-3xl font-bold text-green-600">24/32</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">75% Complete</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                    <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Productivity</h4>
                    <p className="text-3xl font-bold text-purple-600">+18%</p>
                    <p className="text-xs text-green-600 mt-1">Above Average</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Activities</h3>
                  <div className="space-y-2">
                    {[
                      { worker: 'John D.', task: 'Harvesting Zone A', progress: 85, time: '2h 30m' },
                      { worker: 'Sarah M.', task: 'Irrigation Check', progress: 100, time: 'Completed' },
                      { worker: 'Mike R.', task: 'Fertilizer Application', progress: 60, time: '1h 15m' },
                      { worker: 'Lisa K.', task: 'Pest Inspection', progress: 40, time: '45m' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.worker}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{activity.task}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${activity.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{activity.progress}%</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal */}
        {showInventoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 mr-3" />
                    <h2 className="text-2xl font-bold">Inventory Analytics Dashboard</h2>
                  </div>
                  <button
                    onClick={() => setShowInventoryModal(false)}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Total Items Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Items</h3>
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {inventorySummary?.totalItems?.toLocaleString() || '0'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Low Stock Items</span>
                        <span className="font-medium text-orange-600">12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Out of Stock</span>
                        <span className="font-medium text-red-600">3</span>
                      </div>
                    </div>
                  </div>

                  {/* Livestock Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Livestock</h3>
                      <div className="p-3 bg-indigo-500 rounded-lg">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {inventorySummary?.livestock?.toLocaleString() || '0'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Healthy</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Needs Attention</span>
                        <span className="font-medium text-yellow-600">15%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Produce Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produce</h3>
                      <div className="p-3 bg-green-500 rounded-lg">
                        <Apple className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {inventorySummary?.produce?.toLocaleString() || '0'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Fresh Produce</span>
                        <span className="font-medium text-green-600">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Ready for Harvest</span>
                        <span className="font-medium text-blue-600">22%</span>
                      </div>
                    </div>
                  </div>

                  {/* Consumables Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consumables</h3>
                      <div className="p-3 bg-orange-500 rounded-lg">
                        <Box className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {inventorySummary?.consumables?.toLocaleString() || '0'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Well Stocked</span>
                        <span className="font-medium text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Expiring Soon</span>
                        <span className="font-medium text-orange-600">8%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Trends */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Inventory Trends</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">N/A</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">N/A</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">N/A</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={() => setShowInventoryModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

        export default Analytics;
