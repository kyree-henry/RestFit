/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance, AxiosResponse } from 'axios';
import { ResponseInterceptorConfig } from '../types';
import { extendResponse, ExtendedAxiosResponse } from '../utils/response-helpers';

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
      // Extend response with helper methods
      let modifiedResponse = extendResponse(response);

      // Execute all interceptors (can modify response)
      for (const interceptor of interceptors) {
        const result = await interceptor.handler(modifiedResponse);
        if (result) {
          modifiedResponse = extendResponse(result);
        }
      }
      return modifiedResponse;
    },
    async (error: any) => {
      // Create or use existing response for interceptors
      let responseToIntercept: AxiosResponse;

      if (error.response) {
        // HTTP error with response (4xx, 5xx)
        responseToIntercept = error.response;
      } else {
        // Network error (no response) - create synthetic response
        responseToIntercept = {
          data: error.message || 'Network Error',
          status: 0, // 0 indicates network error
          statusText: error.code || 'Network Error',
          headers: {},
          config: error.config || {},
        } as AxiosResponse;
      }

      // Extend response with helper methods and execute interceptors
      let modifiedResponse = extendResponse(responseToIntercept);
      for (const interceptor of interceptors) {
        const result = await interceptor.handler(modifiedResponse);
        if (result) {
          modifiedResponse = extendResponse(result);
          // If interceptor changed status to success (2xx), return it as success (no error thrown)
          if (modifiedResponse.isSuccessStatusCode()) {
            return modifiedResponse;
          }
        }
      }

      // Update error.response if it existed, or attach the modified synthetic response
      if (error.response) {
        error.response = modifiedResponse;
      } else {
        // For network errors, if interceptor didn't convert to success, still reject
        // but attach the modified response for potential use
        error.response = modifiedResponse;
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

