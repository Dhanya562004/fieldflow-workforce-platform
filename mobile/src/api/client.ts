import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Job, JobStatus, LoginResponse, User } from './types';

const TOKEN_KEY = 'fieldflow_auth_jwt_token';

// Local dev default: Android emulator maps 10.0.2.2 to host localhost, iOS/Web use localhost
const DEFAULT_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string = DEFAULT_URL;
  private inMemoryToken: string | null = null;

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async saveToken(token: string): Promise<void> {
    this.inMemoryToken = token;
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch {
      // In-memory fallback
    }
  }

  async getToken(): Promise<string | null> {
    if (this.inMemoryToken) return this.inMemoryToken;
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          this.inMemoryToken = stored;
          return stored;
        }
      }
    } catch {
      // In-memory fallback
    }
    return this.inMemoryToken;
  }

  async clearToken(): Promise<void> {
    this.inMemoryToken = null;
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      // In-memory fallback
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; status: number }> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          json?.error?.message || `Server returned error (${response.status})`;
        return { success: false, error: message, status: response.status };
      }

      return {
        success: true,
        data: (json.data ?? json) as T,
        status: response.status,
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout
        ? 'Network request timed out. Please check your connection.'
        : err.message || 'Network connection failed.';
      return { success: false, error: msg, status: 0 };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; data?: LoginResponse; error?: string }> {
    const res = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.token) {
      await this.saveToken(res.data.token);
    }
    return res;
  }

  async getMe(): Promise<{ success: boolean; data?: User; error?: string }> {
    return this.request<User>('/auth/me');
  }

  async getMyJobs(status?: JobStatus | 'ALL'): Promise<{ success: boolean; data?: Job[]; error?: string }> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return this.request<Job[]>(`/jobs${query}`);
  }

  async getJobById(jobId: string): Promise<{ success: boolean; data?: Job; error?: string }> {
    return this.request<Job>(`/jobs/${jobId}`);
  }

  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    note?: string
  ): Promise<{ success: boolean; data?: Job; error?: string }> {
    return this.request<Job>(`/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  async addJobNote(
    jobId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/jobs/${jobId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, isInternal }),
    });
  }
}

export const api = new ApiClient();
