// HTTP Client abstraction - Dependency Inversion Principle
// Abstracts the underlying fetch mechanism
import { IApiResponse } from '@/types';

export interface IHttpClient {
  post<T>(endpoint: string, data: unknown): Promise<IApiResponse<T>>;
  get<T>(endpoint: string): Promise<IApiResponse<T>>;
  put<T>(endpoint: string, data: unknown): Promise<IApiResponse<T>>;
}

export class FetchHttpClient implements IHttpClient {
  async post<T>(endpoint: string, data: unknown): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async get<T>(endpoint: string): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(endpoint);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async put<T>(endpoint: string, data: unknown): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}

// Singleton instance
export const httpClient = new FetchHttpClient();
