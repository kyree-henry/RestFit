/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  /**
   * Number of retry attempts
   * @default 3
   */
  retries?: number;

  /**
   * Initial delay in milliseconds before first retry
   * @default 100
   */
  retryDelay?: number;

  /**
   * Maximum delay in milliseconds between retries
   * @default 2000
   */
  retryDelayMax?: number;

  /**
   * Exponential backoff multiplier
   * @default 2
   */
  exponentialBackoff?: boolean | number;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatusCodes?: number[];

  /**
   * Whether to retry on network errors (ECONNRESET, ENOTFOUND, etc.)
   * @default true
   */
  retryOnNetworkError?: boolean;

  /**
   * Custom function to determine if a request should be retried
   */
  shouldRetry?: (error: any, retryCount: number) => boolean | Promise<boolean>;

  /**
   * Custom function to calculate retry delay
   */
  retryDelayFn?: (retryCount: number, error: any) => number;
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerPolicy {
  /**
   * Enable circuit breaker
   * @default true
   */
  enabled?: boolean;

  /**
   * Threshold for failures before opening circuit
   * @default 5
   */
  threshold?: number;

  /**
   * Time window in milliseconds to count failures
   * @default 60000 (1 minute)
   */
  window?: number;

  /**
   * Time in milliseconds to wait before attempting to close circuit (half-open state)
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Minimum number of requests in window before circuit can open
   * @default 10
   */
  minimumRequests?: number;

  /**
   * HTTP status codes that count as failures
   * @default [500, 502, 503, 504]
   */
  errorStatusCodes?: number[];

  /**
   * Custom function to determine if an error should count as a failure
   */
  isFailure?: (error: any) => boolean;
}

/**
 * Resilience policy combining retry and circuit breaker
 */
export interface ResiliencePolicy {
  /**
   * Retry policy configuration
   */
  retry?: RetryPolicy | false;

  /**
   * Circuit breaker policy configuration
   */
  circuitBreaker?: CircuitBreakerPolicy | false;
}

/**
 * Default resilience configuration similar to Refit
 */
export const DEFAULT_RESILIENCE_POLICY: ResiliencePolicy = {
  retry: {
    retries: 3,
    retryDelay: 100,
    retryDelayMax: 2000,
    exponentialBackoff: true,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnNetworkError: true,
  },
  circuitBreaker: {
    enabled: true,
    threshold: 5,
    window: 60000, // 1 minute
    timeout: 30000, // 30 seconds
    minimumRequests: 10,
    errorStatusCodes: [500, 502, 503, 504],
  },
};

