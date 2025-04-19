// Mock data utilities

/**
 * Generate random revenue data for the dashboard
 * @param {number} days - Number of days to generate data for
 * @returns {Array} Array of objects with date and revenue
 */
export const generateRevenueData = (days = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - i - 1));
    
    // Generate a random revenue between $500 and $3000
    const revenue = Math.floor(Math.random() * 2500) + 500;
    
    data.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      revenue
    });
  }
  
  return data;
};

/**
 * Format date for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, format = 'short') => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    case 'medium':
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    case 'long':
      return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    default:
      return dateString;
  }
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}; 