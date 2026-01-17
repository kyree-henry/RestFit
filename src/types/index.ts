import { AxiosError, AxiosResponse } from 'axios';
import { ExtendedAxiosResponse } from '../utils/response-helpers';

export type ParamType = 'path' | 'query' | 'body' | 'header';

export interface ParamMetadata {
  type: ParamType;
  name: string | null;
  index: number;
}

export interface ErrorHandlerMetadata<ReturnType> {
  status: number | null;
  handler: (error: AxiosError) => ReturnType | Promise<ReturnType>;
}

export interface SuccessHandlerMetadata<ReturnType> {
  status: number | number[];
  handler: (response: any) => ReturnType | Promise<ReturnType>;
}

export interface ResponseInterceptorMetadata {
  handler: (response: ExtendedAxiosResponse) => void | ExtendedAxiosResponse | Promise<void | ExtendedAxiosResponse>;
}

export interface ResponseInterceptorConfig {
  handler: (response: ExtendedAxiosResponse) => void | ExtendedAxiosResponse | Promise<void | ExtendedAxiosResponse>;
}

export interface RetryHandlerMetadata<ReturnType = void> {
  handler: (retryCount: number, error: AxiosError) => ReturnType | Promise<ReturnType>;
}

/**
 * Wrapped response format for automatic response wrapping
 * When wrapResponses is enabled, the original response data is spread (if object)
 * and success/error properties are added.
 */
export type WrappedResponse<T> = T extends object
  ? T & { success: boolean; error?: any }
  : { data: T; success: boolean; error?: any };

// Re-export resilience types
export type {
  ResiliencePolicy,
  RetryPolicy,
  CircuitBreakerPolicy,
} from './resilience';

export { DEFAULT_RESILIENCE_POLICY } from './resilience';

