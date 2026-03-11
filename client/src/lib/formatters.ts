/**
 * Format currency values consistently across the app
 * Handles large numbers with proper K/M notation
 */
export function formatCurrency(value: number | null | undefined, options: {
  decimals?: number;
  showSymbol?: boolean;
  compact?: boolean;
} = {}): string {
  if (value === null || value === undefined) return '—';

  const { decimals = 0, showSymbol = true, compact = true } = options;
  const symbol = showSymbol ? '£' : '';

  // Handle very large numbers (millions)
  if (compact && Math.abs(value) >= 1000000) {
    const millions = value / 1000000;
    return `${symbol}${millions.toFixed(decimals === 0 ? 1 : decimals)}M`;
  }

  // Handle large numbers (thousands)
  if (compact && Math.abs(value) >= 1000) {
    const thousands = value / 1000;
    return `${symbol}${Math.round(thousands)}K`;
  }

  // Handle small numbers
  return `${symbol}${Math.round(value).toLocaleString()}`;
}

/**
 * Format currency for display in tooltips and detailed views
 */
export function formatCurrencyDetailed(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `£${Math.round(value).toLocaleString()}`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format yield as percentage
 */
export function formatYield(value: number | null | undefined): string {
  return formatPercentage(value, 2);
}
