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

// Re-export resilience types
export type {
  ResiliencePolicy,
  RetryPolicy,
  CircuitBreakerPolicy,
} from './resilience';

export { DEFAULT_RESILIENCE_POLICY } from './resilience';

