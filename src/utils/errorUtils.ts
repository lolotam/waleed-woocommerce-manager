
/**
 * Utility functions for error handling and detection
 */

/**
 * Detects if a log message contains permission error indicators
 */
export const detectPermissionError = (message: string): boolean => {
  const permissionErrorIndicators = [
    "not allowed to create posts",
    "permission denied",
    "insufficient capabilities",
    "rest_cannot_create",
    "woocommerce_rest_cannot_create",
    "you don't have permission",
    "Permission Error",
    "Authentication Failed",
    "401",
    "403"
  ];
  
  return permissionErrorIndicators.some(indicator => 
    message.toLowerCase().includes(indicator.toLowerCase())
  );
};

/**
 * Formats API error messages for user display
 */
export const formatApiError = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    return error.message || 'Unknown error occurred';
  }
  
  if (error && error.message) {
    return error.message;
  }
  
  return 'Unknown error occurred';
};
