
/**
 * License Key Generator Utility
 * Generates license keys for different license types
 */

// Helper function to generate a random string of specified length
const generateRandomString = (length: number, allowedChars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"): string => {
  let result = '';
  const charactersLength = allowedChars.length;
  
  for (let i = 0; i < length; i++) {
    result += allowedChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

// Generate a single license key with format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
// With a prefix based on license type
const generateLicenseKey = (type: 'one_time' | 'time_limited' | 'permanent'): string => {
  let prefix = '';
  
  // Create prefix based on license type
  switch(type) {
    case 'one_time':
      prefix = 'ONCE-';
      break;
    case 'time_limited':
      prefix = 'TIME-';
      break;
    case 'permanent':
      prefix = 'PERM-';
      break;
  }
  
  // Generate the remaining parts of the key
  const part1 = generateRandomString(5);
  const part2 = generateRandomString(5);
  const part3 = generateRandomString(5);
  const part4 = generateRandomString(5);
  
  // Combine prefix with random parts to create the license key
  return `${prefix}${part1}-${part2}-${part3}-${part4}`;
};

// Generate multiple license keys
export const generateLicenseKeys = async (
  type: 'one_time' | 'time_limited' | 'permanent',
  quantity: number,
  expiryDays: number
): Promise<string[]> => {
  // Validate input
  if (quantity <= 0 || quantity > 10000) {
    throw new Error('Quantity must be between 1 and 10000');
  }
  
  if (type === 'time_limited' && (expiryDays <= 0 || expiryDays > 3650)) {
    throw new Error('Expiry days must be between 1 and 3650 (10 years)');
  }
  
  // Generate the specified number of license keys
  const keys: string[] = [];
  const generatedKeys = new Set<string>(); // To ensure uniqueness
  
  for (let i = 0; i < quantity; i++) {
    // Make sure the key is unique
    let key: string;
    do {
      key = generateLicenseKey(type);
    } while (generatedKeys.has(key));
    
    generatedKeys.add(key);
    keys.push(key);
    
    // Add a small delay to prevent browser freezing for large quantities
    if (i % 100 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return keys;
};

export default {
  generateLicenseKeys
};
