/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { axiosCircuitBreaker } from 'axios-circuit-breaker';
import { ResiliencePolicy, RetryPolicy, CircuitBreakerPolicy, DEFAULT_RESILIENCE_POLICY } from '../types/resilience';

/**
 * Apply resilience policies to an axios instance
 */
export function applyResilience(
  axiosInstance: AxiosInstance,
  policy: ResiliencePolicy = DEFAULT_RESILIENCE_POLICY
): AxiosInstance {
  // Apply retry policy
  if (policy.retry !== false) {
    const retryConfig = (policy.retry || DEFAULT_RESILIENCE_POLICY.retry!) as RetryPolicy;
    applyRetryPolicy(axiosInstance, retryConfig);
  }

  // Apply circuit breaker policy
  if (policy.circuitBreaker !== false) {
    const circuitBreakerConfig = (policy.circuitBreaker || DEFAULT_RESILIENCE_POLICY.circuitBreaker!) as CircuitBreakerPolicy;
    applyCircuitBreakerPolicy(axiosInstance, circuitBreakerConfig);
  }

  return axiosInstance;
}

/**
 * Apply retry policy to axios instance
 */
function applyRetryPolicy(axiosInstance: AxiosInstance, policy: RetryPolicy): void {
  const retryConfig: IAxiosRetryConfig = {
    retries: policy.retries ?? 3,
    retryDelay: (retryCount: number, error: any) => {
      if (policy.retryDelayFn) {
        return policy.retryDelayFn(retryCount, error);
      }

      let delay = policy.retryDelay ?? 100;

      if (policy.exponentialBackoff) {
        const multiplier = typeof policy.exponentialBackoff === 'number' ? policy.exponentialBackoff : 2;
        delay = delay * Math.pow(multiplier, retryCount);
      }

      const maxDelay = policy.retryDelayMax ?? 2000;
      return Math.min(delay, maxDelay);
    },
    retryCondition: async (error: AxiosError) => {
      // Use custom shouldRetry function if provided
      if (policy.shouldRetry) {
        const retryCount = (error.config as any)?.['axios-retry']?.retryCount ?? 0;
        return await policy.shouldRetry(error, retryCount);
      }

      // Default retry conditions
      const retryableStatusCodes = policy.retryableStatusCodes ?? [408, 429, 500, 502, 503, 504];

      // Retry on network errors if enabled
      if (policy.retryOnNetworkError !== false && (!error.response || !error.response.status)) {
        return true;
      }

      // Retry on specific status codes
      if (error.response && retryableStatusCodes.includes(error.response.status)) {
        return true;
      }

      return false;
    },
    onRetry: (retryCount: number, error: AxiosError) => {
      // Log retry attempts for visibility
      console.log(`🔄 Retrying request (attempt ${retryCount}/${policy.retries ?? 3}):`, error.config?.url);
      if (error.response) {
        console.log(`   Status: ${error.response.status}, Message: ${error.message}`);
      } else {
        console.log(`   Network error: ${error.message}`);
      }
    },
  };

  axiosRetry(axiosInstance, retryConfig);
}


/**
 * Apply circuit breaker policy to axios instance
 */
function applyCircuitBreakerPolicy(axiosInstance: AxiosInstance, policy: CircuitBreakerPolicy): void {
  if (!policy.enabled) {
    return;
  }

  // axios-circuit-breaker options
  // Map our policy to axios-circuit-breaker's expected options
  const circuitBreakerOptions: any = {
    thresholdPeriodMs: policy.window ?? 60000,
    numRequestsToCloseCircuit: policy.threshold ?? 5,
    resetPeriodMs: policy.timeout ?? 30000,
    isFault: policy.isFailure || ((error: any) => {
      const errorStatusCodes = policy.errorStatusCodes ?? [500, 502, 503, 504];
      if (error?.response?.status) {
        return errorStatusCodes.includes(error.response.status);
      }
      return !error?.response;
    }),
  };

  // Apply circuit breaker
  axiosCircuitBreaker(axiosInstance, circuitBreakerOptions);
}

/**
 * Merge resilience policies, with the second policy taking precedence
 */
export function mergeResiliencePolicies(
  base: ResiliencePolicy,
  override: Partial<ResiliencePolicy>
): ResiliencePolicy {
  const merged: ResiliencePolicy = { ...base };

  if (override.retry !== undefined) {
    if (override.retry === false) {
      merged.retry = false;
    } else {
      merged.retry = {
        ...(typeof base.retry === 'object' ? base.retry : {}),
        ...override.retry,
      };
    }
  }

  if (override.circuitBreaker !== undefined) {
    if (override.circuitBreaker === false) {
      merged.circuitBreaker = false;
    } else {
      merged.circuitBreaker = {
        ...(typeof base.circuitBreaker === 'object' ? base.circuitBreaker : {}),
        ...override.circuitBreaker,
      };
    }
  }

  return merged;
}

