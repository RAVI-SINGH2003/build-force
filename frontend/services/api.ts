import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For a real device on the same network, use the machine's local IP
// Alternatively, Expo dev client can provide the host IP dynamically.
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Use the Expo packager's host IP (e.g. 192.168.x.x)
      const debuggerHost = Constants.expoConfig?.hostUri || '';
      if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:5000`;
      }
      // For emulator use 10.0.2.2, for physical device use your local machine's IP
      return 'http://192.168.1.8:5000'; 
    }
    return 'http://localhost:5000'; // iOS simulator
  }
  return 'https://api.buildforce.com'; // Production URL (placeholder)
};

export const API_BASE_URL = getBaseUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string | null;
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  console.log(`📡 API ${method} ${API_BASE_URL}${endpoint}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ API Error ${response.status}:`, data);
    throw new Error(data.error || 'API request failed');
  }

  console.log(`✅ API Response:`, data);
  return data;
}

// ─── Auth API ──────────────────────────────────────────────────────

export async function apiGoogleSignIn(idToken: string) {
  return apiRequest('/api/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}

export async function apiGetMe(token: string) {
  return apiRequest('/api/auth/me', {
    method: 'GET',
    token,
  });
}

// ─── Onboarding API ───────────────────────────────────────────────

export async function apiSetRole(token: string, role: string) {
  return apiRequest('/api/onboarding/role', {
    method: 'POST',
    body: { role },
    token,
  });
}

export interface LaborerOnboardingData {
  type: 'SKILLED' | 'UNSKILLED';
  trade: string;
  hourlyRate: string;
  experience: string;
  phone: string;
  state: string;
  city: string;
  skills: string[];
  bio?: string;
}

export async function apiCompleteLaborerOnboarding(token: string, data: LaborerOnboardingData) {
  return apiRequest('/api/onboarding/laborer', {
    method: 'POST',
    body: data,
    token,
  });
}
