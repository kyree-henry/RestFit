/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import { META_METHOD, META_PATH, META_PARAMS, META_ERRORS, META_SUCCESS, META_RESPONSE } from '../constants/metadata';
import { ParamMetadata, SuccessHandlerMetadata, ResponseInterceptorMetadata, ResponseInterceptorConfig } from '../types';
import { ResiliencePolicy, DEFAULT_RESILIENCE_POLICY } from '../types/resilience';
import { applyResilience } from '../resilience';
import { applyResponseInterceptors } from '../interceptors';
import { extendResponse, ExtendedAxiosResponse } from '../utils/response-helpers';

export interface ApiServiceConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  /**
   * Authorization configuration.
   * Can be a Bearer token string, or a function that returns a token.
   * If the function returns null or empty string, authorization header will not be added.
   */
  authorization?: string | (() => string | null | Promise<string | null>);
  /**
   * Authorization type. Defaults to 'Bearer'.
   */
  authorizationType?: 'Bearer' | 'Basic' | 'Custom';
  /**
   * Resilience policy configuration.
   * If not provided, default resilience policy will be applied.
   * Set to false to disable resilience features.
   */
  resilience?: ResiliencePolicy | false;
  /**
   * Global response interceptors.
   * These interceptors will be applied to all requests made by this service.
   * Can be combined with method-specific @ResponseInterceptor decorators.
   */
  responseInterceptors?: ResponseInterceptorConfig[];
}

// Overload for single service
export function createApiService<T>(
  ServiceClass: new () => T,
  config: ApiServiceConfig
): T;

// Overload for multiple services
export function createApiService<T extends Record<string, new () => any>>(
  config: ApiServiceConfig,
  services: { [K in keyof T]: T[K] }
): { [K in keyof T]: InstanceType<T[K]> };

// Implementation
export function createApiService<T extends Record<string, new () => any>>(
  ServiceClassOrConfig: (new () => any) | ApiServiceConfig,
  configOrServices?: ApiServiceConfig | { [K in keyof T]: T[K] }
): T | { [K in keyof T]: InstanceType<T[K]> } {
  // Check if first argument is a function (constructor) or a config object
  if (typeof ServiceClassOrConfig === 'function') {
    // Single service overload: createApiService(ServiceClass, config)
    const ServiceClass = ServiceClassOrConfig as new () => T;
    const config = configOrServices as ApiServiceConfig;
    return createSingleService(ServiceClass, config);
  } else {
    // Multiple services overload: createApiService(config, services)
    const config = ServiceClassOrConfig as ApiServiceConfig;
    const services = configOrServices as { [K in keyof T]: T[K] };
    const client = {} as any;
    Object.entries(services).forEach(([key, ServiceClass]) => {
      client[key] = createSingleService(ServiceClass, config);
    });
    return client;
  }
}

function createSingleService<T>(
  ServiceClass: new () => T,
  config: ApiServiceConfig
): T {
  const instance = new ServiceClass();

  // Prepare headers with authorization if provided
  const headers: Record<string, string> = { ...config.headers };

  if (config.authorization) {
    const authHeader = config.authorizationType === 'Basic'
      ? 'Authorization'
      : config.authorizationType === 'Custom'
        ? 'Authorization'
        : 'Authorization';

    // Authorization will be added dynamically per request if it's a function
    // Otherwise, add it to headers now
    if (typeof config.authorization === 'string') {
      const authType = config.authorizationType || 'Bearer';
      headers[authHeader] = authType === 'Bearer'
        ? `Bearer ${config.authorization}`
        : authType === 'Basic'
          ? `Basic ${config.authorization}`
          : config.authorization;
    }
  }

  const axiosInstance = axios.create({ baseURL: config.baseUrl, headers });

  // Apply resilience policies if enabled
  if (config.resilience !== false) {
    const resiliencePolicy = config.resilience || DEFAULT_RESILIENCE_POLICY;
    applyResilience(axiosInstance, resiliencePolicy);
  }

  // Apply global response interceptors if provided
  if (config.responseInterceptors && config.responseInterceptors.length > 0) {
    applyResponseInterceptors(axiosInstance, config.responseInterceptors);
  }

  // Expose axios instance for advanced use cases (e.g., custom interceptors)
  (instance as any).__axiosInstance = axiosInstance;
  const prototype = Object.getPrototypeOf(instance);
  const methodNames = Object.getOwnPropertyNames(prototype).filter(name => name !== 'constructor');

  methodNames.forEach((methodName) => {
    if (!Reflect.hasMetadata(META_METHOD, prototype, methodName)) return;

    const httpMethod = Reflect.getMetadata(META_METHOD, prototype, methodName) as Method;
    const pathTemplate = Reflect.getMetadata(META_PATH, prototype, methodName) as string;
    const paramMetadata: ParamMetadata[] = [];
    const rawParams = Reflect.getMetadata(META_PARAMS, prototype, methodName) || [];

    for (let i = 0; i < rawParams.length; i++) {
      const p = rawParams[i];
      if (p) paramMetadata.push({ ...p, index: i });
    }

    const errorHandlers = Reflect.getMetadata(META_ERRORS, prototype, methodName) || [];
    const responseInterceptors: ResponseInterceptorMetadata[] = Reflect.getMetadata(META_RESPONSE, prototype, methodName) || [];

    (instance as any)[methodName] = async function (...args: any[]) {
      let url = pathTemplate;
      const queryParams: Record<string, any> = {};
      let requestBody: any = undefined;
      const requestHeaders: Record<string, string> = { ...headers };

      // Handle dynamic authorization if it's a function
      if (config.authorization && typeof config.authorization === 'function') {
        const token = await config.authorization();
        if (token) {
          const authType = config.authorizationType || 'Bearer';
          requestHeaders['Authorization'] = authType === 'Bearer'
            ? `Bearer ${token}`
            : authType === 'Basic'
              ? `Basic ${token}`
              : token;
        }
      }

      paramMetadata.forEach((param) => {
        const { type, name, index } = param;
        if (index >= args.length) return;
        const value = args[index];

        if (type === 'path' && name && value !== undefined) {
          url = url.replace(`{${name}}`, encodeURIComponent(String(value)));
        } else if (type === 'query' && name && value !== undefined) {
          queryParams[name] = value;
        } else if (type === 'body') {
          requestBody = value;
        } else if (type === 'header' && name && value !== undefined) {
          requestHeaders[name] = String(value);
        }
      });

      try {
        let response = await axiosInstance({
          method: httpMethod,
          url,
          params: Object.keys(queryParams).length ? queryParams : undefined,
          data: requestBody,
          headers: requestHeaders
        });

        // Extend response with helper methods and execute interceptors
        let extendedResponse = extendResponse(response);
        for (const interceptor of responseInterceptors) {
          const result = await interceptor.handler(extendedResponse);
          if (result) {
            extendedResponse = extendResponse(result);
          }
        }
        response = extendedResponse;

        const status = response.status;
        const successHandlers: SuccessHandlerMetadata<any>[] = Reflect.getMetadata(META_SUCCESS, prototype, methodName) || [];
        const successHandler = successHandlers.find((h) =>
          Array.isArray(h.status) ? h.status.includes(status) : h.status === status
        );

        if (successHandler) {
          return await successHandler.handler(response.data);
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Create or use existing response for method-specific interceptors
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
          for (const interceptor of responseInterceptors) {
            const result = await interceptor.handler(modifiedResponse);
            if (result) {
              modifiedResponse = extendResponse(result);
              // If interceptor changed status to success (2xx), return it as success (no error thrown)
              if (modifiedResponse.isSuccessStatusCode()) {
                return modifiedResponse.data;
              }
            }
          }

          // If interceptor converted to success, we already returned above
          // Otherwise, continue with error handler logic
          const status = modifiedResponse.status;

          // Find matching error handler
          const handler = errorHandlers.find((h: any) => {
            if (h.status === null) return true; // Catch-all handler
            if (status === 0) return h.status === null; // Network error (status 0) only handled by catch-all
            if (Array.isArray(h.status)) return h.status.includes(status);
            return h.status === status;
          });

          if (handler) return handler.handler(error as AxiosError);
        }
        throw error;
      }
    };
  });

  return instance;
}

