// Decorators
export { Get, Post, Put, Patch, Delete } from './decorators/http-methods';
export { Header, Query, Path, Body } from './decorators/parameters';
export { OnError, OnSuccess } from './decorators/handlers';
export { SerializedName, AliasAs } from './decorators/serialization';

// Factory functions
export { createApiService } from './factory/create-api-service';
export type { ApiServiceConfig } from './factory/create-api-service';

// Types
export type {
  ParamType,
  ParamMetadata,
  ErrorHandlerMetadata,
  SuccessHandlerMetadata,
  ResiliencePolicy,
  RetryPolicy,
  CircuitBreakerPolicy
} from './types';

export { DEFAULT_RESILIENCE_POLICY } from './types';

