
/**
 * License Manager for handling license validation and hardware locking
 */
import { toast } from "sonner";

interface LicenseInfo {
  key: string;
  type: 'trial' | 'full';
  deviceId: string;
  activated: boolean;
  activationDate: string;
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

// Mock license validation (in a real app, this would validate against a server)
const validateLicense = async (key: string): Promise<{ valid: boolean; type: 'trial' | 'full' }> => {
  // For demo purposes, we'll simulate license validation
  if (!isValidLicenseFormat(key)) {
    return { valid: false, type: 'trial' };
  }
  
  // Check if it's a trial or full license based on key prefix
  // In a real app, this would validate with a license server
  const isTrial = key.startsWith('TRIAL');
  
  return { 
    valid: true, 
    type: isTrial ? 'trial' : 'full' 
  };
};

// Activate license
export const activateLicense = async (licenseKey: string): Promise<boolean> => {
  try {
    // Get hardware ID
    const deviceId = await getHardwareId();
    
    // Validate license
    const { valid, type } = await validateLicense(licenseKey);
    
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
      activationDate: new Date().toISOString()
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
    
    // For trial licenses, check if it's expired
    if (licenseInfo.type === 'trial') {
      const activationDate = new Date(licenseInfo.activationDate);
      const trialDays = 14; // 14-day trial
      const expirationDate = new Date(activationDate);
      expirationDate.setDate(expirationDate.getDate() + trialDays);
      
      if (new Date() > expirationDate) {
        console.error('Trial license expired');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('License validation error:', error);
    return false;
  }
};

// Generate a sample license key (for demo purposes)
export const generateSampleLicenseKey = (type: 'trial' | 'full'): string => {
  const generateSegment = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array(5).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };
  
  const prefix = type === 'trial' ? 'TRIAL' : 'FULL-';
  const segments = [prefix, generateSegment(), generateSegment(), generateSegment(), generateSegment()];
  
  return segments.join('-');
};

export default {
  activateLicense,
  getLicenseInfo,
  isLicenseValid,
  generateSampleLicenseKey
};
