
/**
 * License Manager for handling license validation and hardware locking
 */
import { toast } from "sonner";

interface LicenseInfo {
  key: string;
  type: 'one_time' | 'time_limited' | 'permanent';
  deviceId: string;
  activated: boolean;
  activationDate: string;
  expiryDate?: string; // For time-limited licenses
  activationAttempts?: number; // Track failed activation attempts
}

// Mock function to get hardware ID (in a real app, this would use native APIs)
const getHardwareId = async (): Promise<string> => {
  // In a real app, this would use:
  // - MAC address (via Node.js os module or other native solution)
  // - CPU ID (via system commands or native solution)
  // - Hostname (via Node.js os module or other native solution)
  
  // For this mock, we'll generate a random ID and store it in localStorage to simulate hardware ID
  let hardwareId = localStorage.getItem('mock_hardware_id');
  
  if (!hardwareId) {
    const randomId = Math.random().toString(36).substring(2, 15);
    hardwareId = `WL-MAC-${randomId}-CPU-${randomId.substring(5)}-HOST-${randomId.substring(0, 4)}`;
    localStorage.setItem('mock_hardware_id', hardwareId);
  }
  
  return hardwareId;
};

// Validate license key format
const isValidLicenseFormat = (key: string): boolean => {
  // License key format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
  const licensePattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
  return licensePattern.test(key);
};

// Decode license type from key
// In a real implementation, this would use cryptographic methods
const decodeLicenseType = (key: string): { valid: boolean; type: 'one_time' | 'time_limited' | 'permanent', expiryDate?: string } => {
  if (!isValidLicenseFormat(key)) {
    return { valid: false, type: 'one_time' };
  }
  
  // This is a simplified approach - your external key generator would use a more secure method
  // Assume the key has encoded information about its type:
  if (key.startsWith('PERM')) {
    return { valid: true, type: 'permanent' };
  } else if (key.startsWith('TIME')) {
    // Decode expiry date - assume it's encoded in the key
    // For demonstration, set expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    return { valid: true, type: 'time_limited', expiryDate: expiryDate.toISOString() };
  } else if (key.startsWith('ONCE')) {
    // Treat as one-time license
    return { valid: true, type: 'one_time' };
  } else {
    // For testing purposes, accept keys starting with TEST-
    if (key.startsWith('TEST-')) {
      return { valid: true, type: 'permanent' };
    }
    // Invalid license key format
    return { valid: false, type: 'one_time' };
  }
};

// Activate license
export const activateLicense = async (licenseKey: string): Promise<boolean> => {
  try {
    // Get hardware ID
    const deviceId = await getHardwareId();
    
    // Validate and decode license
    const { valid, type, expiryDate } = decodeLicenseType(licenseKey);
    
    if (!valid) {
      toast.error('Invalid license key format');
      return false;
    }
    
    // Check if this device already has an activated license
    const existingLicense = getLicenseInfo();
    if (existingLicense && existingLicense.activated) {
      toast.error('A license is already activated on this device');
      return false;
    }
    
    // Save license info
    const licenseInfo: LicenseInfo = {
      key: licenseKey,
      type,
      deviceId,
      activated: true,
      activationDate: new Date().toISOString(),
      ...(expiryDate && { expiryDate })
    };
    
    localStorage.setItem('license_info', JSON.stringify(licenseInfo));
    toast.success(`License successfully activated (${type} license)`);
    return true;
  } catch (error) {
    console.error('License activation error:', error);
    toast.error(`License activation failed: ${error.message}`);
    return false;
  }
};

// Get current license info
export const getLicenseInfo = (): LicenseInfo | null => {
  const licenseInfo = localStorage.getItem('license_info');
  return licenseInfo ? JSON.parse(licenseInfo) : null;
};

// Check if license is valid and matches hardware ID
export const isLicenseValid = async (): Promise<boolean> => {
  try {
    const licenseInfo = getLicenseInfo();
    
    // No license found
    if (!licenseInfo) {
      return false;
    }
    
    // Check if license is activated
    if (!licenseInfo.activated) {
      return false;
    }
    
    // Get current hardware ID
    const currentDeviceId = await getHardwareId();
    
    // Check if hardware ID matches
    if (licenseInfo.deviceId !== currentDeviceId) {
      console.error('Hardware ID mismatch');
      return false;
    }
    
    // For time-limited licenses, check if it's expired
    if (licenseInfo.type === 'time_limited' && licenseInfo.expiryDate) {
      const expiryDate = new Date(licenseInfo.expiryDate);
      
      if (new Date() > expiryDate) {
        console.error('Time-limited license expired');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('License validation error:', error);
    return false;
  }
};

// Clear existing license (for testing purposes)
export const clearLicense = (): void => {
  localStorage.removeItem('license_info');
  toast.info('License has been removed');
};

export default {
  activateLicense,
  getLicenseInfo,
  isLicenseValid,
  clearLicense
};
