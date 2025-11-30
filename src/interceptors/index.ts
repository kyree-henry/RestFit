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
      // Execute all interceptors (can modify response)
      let modifiedResponse = response;
      for (const interceptor of interceptors) {
        const result = await interceptor.handler(modifiedResponse);
        if (result) {
          modifiedResponse = result;
        }
      }
      return modifiedResponse;
    },
    async (error: any) => {
      // Also execute interceptors on error responses
      if (error.response) {
        let modifiedResponse = error.response;
        for (const interceptor of interceptors) {
          const result = await interceptor.handler(modifiedResponse);
          if (result) {
            modifiedResponse = result;
            // If interceptor changed status to success (2xx), return it as success (no error thrown)
            if (modifiedResponse.status >= 200 && modifiedResponse.status < 300) {
              return modifiedResponse;
            }
          }
        }
        error.response = modifiedResponse;
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

