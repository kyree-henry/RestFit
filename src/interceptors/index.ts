/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance, AxiosResponse } from 'axios';
import { ResponseInterceptorConfig } from '../types';

/**
 * Apply response interceptors to an axios instance
 */
export function applyResponseInterceptors(
  axiosInstance: AxiosInstance,
  interceptors: ResponseInterceptorConfig[]
): AxiosInstance {
  // Add axios response interceptor
  axiosInstance.interceptors.response.use(
    async (response: AxiosResponse) => {
      // Execute all interceptors
      for (const interceptor of interceptors) {
        await interceptor.handler(response);
      }
      return response;
    },
    async (error: any) => {
      // Also execute interceptors on error responses
      if (error.response) {
        for (const interceptor of interceptors) {
          await interceptor.handler(error.response);
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

