import axios from 'axios';

interface ApiErrorResponse {
  error: string;
}

interface TestConfig {
  url: string;
  deviceType?: 'desktop' | 'mobile';
  location?: string;
}

interface TestResult {
  testId: string;
  url: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  timestamp: string; // Added for the comparison tool
  results?: {
    metrics: {
      loadTime: number;
      resourceCount: number;
      totalSize: number;
      ttfb: number;
      fcp?: number;
      lcp?: number;
      cls?: number;
    };
    lighthouse: {
      performance: number;
    };
  };
}

class ApiService {
  private baseUrl: string;
  private client: any; // Using 'any' type instead of AxiosInstance

  constructor() {
    this.baseUrl = '/api';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });
  }

  private handleError(error: any): ApiErrorResponse {
    if (error.response) {
      // Server responded with error
      console.error('API error:', error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized (logout user, redirect to login)
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return { error: error.response.data?.message || 'An error occurred' };
    } else if (error.request) {
      // Request made but no response
      console.error('API no response:', error.request);
      return { error: 'No response from server. Please try again later.' };
    } else {
      // Request setup error
      console.error('API request error:', error.message);
      return { error: error.message };
    }
  }

  async runTest(testData: TestConfig): Promise<TestResult | null> {
    try {
      const response = await this.client.post('/tests', testData);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async getTestResult(testId: string): Promise<TestResult | null> {
    try {
      const response = await this.client.get(`/tests/${testId}`);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async getTestHistory(userId: string, params = {}): Promise<TestResult[]> {
    try {
      const response = await this.client.get(`/users/${userId}/tests`, { params });
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return [];
    }
  }

  async getUserProfile(userId: string): Promise<any | null> {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async updateUserProfile(userId: string, userData: any): Promise<any | null> {
    try {
      const response = await this.client.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async getUserSubscription(userId: string): Promise<any | null> {
    try {
      const response = await this.client.get(`/users/${userId}/subscription`);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async upgradeSubscription(userId: string, planId: string): Promise<any | null> {
    try {
      const response = await this.client.post(`/users/${userId}/subscription`, { planId });
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async createApiKey(userId: string, keyData: any): Promise<any | null> {
    try {
      const response = await this.client.post(`/users/${userId}/api-keys`, keyData);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  async listApiKeys(userId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/users/${userId}/api-keys`);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return [];
    }
  }

  async revokeApiKey(userId: string, keyId: string): Promise<any | null> {
    try {
      const response = await this.client.delete(`/users/${userId}/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error as any);
      console.error(apiError);
      return null;
    }
  }

  getApiReference() {
    return {
      baseUrl: this.baseUrl,
      endpoints: [
        {
          name: 'Run Test',
          method: 'POST',
          endpoint: '/api/tests',
          description: 'Run a new performance test',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'URL to test' },
            { name: 'deviceType', type: 'string', required: false, description: 'Device type (desktop/mobile)', defaultValue: 'desktop' },
            { name: 'location', type: 'string', required: false, description: 'Test location', defaultValue: 'us-east' }
          ],
          exampleRequest: JSON.stringify({ url: 'https://example.com', deviceType: 'desktop' }, null, 2),
          exampleResponse: JSON.stringify({ testId: 'test_123456789', status: 'queued' }, null, 2)
        },
        {
          name: 'Get Test Results',
          method: 'GET',
          endpoint: '/api/tests/{testId}',
          description: 'Get results for a specific test',
          parameters: [
            { name: 'testId', type: 'string', required: true, description: 'Test ID', inUrl: true }
          ],
          exampleResponse: JSON.stringify({ 
            testId: 'test_123456789', 
            url: 'https://example.com',
            status: 'completed',
            results: {
              metrics: { loadTime: 1250, resourceCount: 45 },
              lighthouse: { performance: 85 }
            }
          }, null, 2)
        }
      ]
    };
  }
}

export default new ApiService();
export type { TestResult, TestConfig };
