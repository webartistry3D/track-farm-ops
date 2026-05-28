// Currency formatting utilities

export const formatCurrency = (
  value: number | string | null | undefined,
  options: {
    symbol?: string;
    includeSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return options.includeSymbol !== false ? `${options.symbol || '₦'}0.00` : '0.00';
  }
  
  // Convert to number for calculation
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  
  // Handle invalid numbers
  if (isNaN(numValue)) {
    return options.includeSymbol !== false ? `${options.symbol || '₦'}0.00` : '0.00';
  }
  
  // Format with proper locale and digit handling
  const minimumFractionDigits = options.minimumFractionDigits || 2;
  const maximumFractionDigits = options.maximumFractionDigits || 2;
  
  // For very large numbers, ensure proper formatting
  const formattedValue = numValue.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  });
  
  return options.includeSymbol !== false ? `${options.symbol || '₦'}${formattedValue}` : formattedValue;
};

export const formatCurrencyDisplay = (value: number | string | null | undefined): string => {
  return formatCurrency(value);
};

export const formatNumber = (value: number | string | null | undefined): string => {
  return formatCurrency(value, { includeSymbol: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parseCurrency = (formattedValue: string): number => {
  // Remove all non-digit characters except decimal point
  const cleanValue = formattedValue.replace(/[^\d.]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const validateCurrencyInput = (value: string): boolean => {
  // Allow only numbers, decimal point, and commas (for thousand separators)
  return /^[\d,]*\.?\d*$/.test(value) || value === '';
};
