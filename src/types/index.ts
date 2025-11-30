import { AxiosError, AxiosResponse } from 'axios';

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
  handler: (response: AxiosResponse) => void | AxiosResponse | Promise<void | AxiosResponse>;
}

export interface ResponseInterceptorConfig {
  handler: (response: AxiosResponse) => void | AxiosResponse | Promise<void | AxiosResponse>;
}

// Re-export resilience types
export type {
  ResiliencePolicy,
  RetryPolicy,
  CircuitBreakerPolicy,
} from './resilience';

export { DEFAULT_RESILIENCE_POLICY } from './resilience';

