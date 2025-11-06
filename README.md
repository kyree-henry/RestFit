# RestFit

A TypeScript decorator-based REST API client library that provides a clean and type-safe way to define API services.

> **Inspired by**: [Retrofit](https://square.github.io/retrofit/) (Java/Android) and [Refit](https://github.com/reactiveui/refit) (.NET)

## Features

- 🎯 **Type-safe**: Full TypeScript support with type inference
- 🎨 **Decorator-based**: Clean, declarative API using decorators
- 🔧 **Flexible**: Support for path parameters, query strings, headers, and request bodies
- ⚡ **Error Handling**: Custom error and success handlers for different HTTP status codes
- 🛡️ **Resilient**: Built-in retry policies and circuit breaker patterns (similar to Refit)
- 📦 **Lightweight**: Built on top of axios with minimal overhead

## Installation

```bash
npm install restfit axios reflect-metadata axios-retry axios-circuit-breaker
```

## Quick Start

```typescript
import 'reflect-metadata';
import { Get, Post, Path, Query, Body, Header, createApiService } from 'restfit';

class UserService {
  @Get('/users/{userId}')
  async getUser(@Path('userId') userId: string): Promise<User> {
    // Implementation is handled by the decorator
  }

  @Post('/users')
  async createUser(@Body() user: User): Promise<User> {
    // Implementation is handled by the decorator
  }

  @Get('/users')
  async listUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Header('Authorization') auth: string
  ): Promise<User[]> {
    // Implementation is handled by the decorator
  }
}

// Create an instance
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  },
  // Optional: Authorization
  authorization: 'your-token-here', // Static token
  // Or use a function for dynamic tokens:
  // authorization: async () => await getTokenFromStorage(),
  authorizationType: 'Bearer' // 'Bearer' | 'Basic' | 'Custom'
});

// Use it
const user = await userService.getUser('123');
const newUser = await userService.createUser({ name: 'John' });

// Or create multiple services at once
const api = createApiService(
  {
    baseUrl: 'https://api.example.com',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    users: UserService,
    posts: PostService,
    comments: CommentService
  }
);

// Use them
const user = await api.users.getUser('123');
const posts = await api.posts.listPosts();
```

## HTTP Method Decorators

- `@Get(path)` - GET request
- `@Post(path)` - POST request
- `@Put(path)` - PUT request
- `@Patch(path)` - PATCH request
- `@Delete(path)` - DELETE request

## Parameter Decorators

- `@Path(name)` - Path parameter (e.g., `/users/{userId}`)
- `@Query(name)` - Query parameter (e.g., `?page=1`)
- `@Body()` - Request body
- `@Header(name)` - Request header
- `@SerializedName(name)` or `@AliasAs(name)` - Map property name to different JSON key (for request/response serialization)

### Serialization Decorators

Use `@SerializedName` or `@AliasAs` to map TypeScript property names to different JSON keys:

```typescript
class User {
  @SerializedName('first_name')
  firstName: string;

  @SerializedName('last_name')
  lastName: string;

  @AliasAs('email_address') // Alternative name
  email: string;
}
```

## Handler Decorators

- `@OnError(status, handler)` - Custom error handler for specific status codes
  - `status` can be a single number, array of numbers, or `null` for catch-all
  - Example: `@OnError([404, 500], handler)` or `@OnError(null, handler)`
- `@OnSuccess(status, handler)` - Custom success handler for specific status codes
  - `status` can be a single number or array of numbers
  - Example: `@OnSuccess([200, 201], handler)`

### Authorization Configuration

RestFit supports flexible authorization configuration:

```typescript
// Static Bearer token
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  authorization: 'your-token-here',
  authorizationType: 'Bearer'
});

// Dynamic token (function)
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  authorization: async () => {
    // Get token from storage, refresh if needed, etc.
    return await getTokenFromStorage();
  },
  authorizationType: 'Bearer'
});

// Basic authentication
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  authorization: Buffer.from('username:password').toString('base64'),
  authorizationType: 'Basic'
});

// Custom authorization header
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  authorization: 'CustomTokenValue',
  authorizationType: 'Custom'
});
```

## Resilience Features

RestFit includes built-in resilience features similar to Refit in .NET, with automatic retry policies and circuit breaker patterns enabled by default.

### Default Resilience Policy

By default, RestFit applies a resilience policy that includes:
- **Retry Policy**: 3 retries with exponential backoff (100ms initial, max 2000ms)
- **Circuit Breaker**: Opens after 5 failures in 1 minute, resets after 30 seconds
- Retries on: 408, 429, 500, 502, 503, 504 status codes and network errors

### Using Default Resilience

```typescript
// Default resilience is automatically applied
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com'
});
```

### Customizing Resilience

```typescript
import { createApiService, DEFAULT_RESILIENCE_POLICY } from 'restfit';

// Custom resilience configuration
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  resilience: {
    retry: {
      retries: 5,
      retryDelay: 200,
      retryDelayMax: 5000,
      exponentialBackoff: true,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      retryOnNetworkError: true
    },
    circuitBreaker: {
      enabled: true,
      threshold: 10,
      window: 60000,
      timeout: 60000,
      minimumRequests: 5,
      errorStatusCodes: [500, 502, 503, 504]
    }
  }
});
```

### Disabling Resilience

```typescript
// Disable all resilience features
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  resilience: false
});

// Disable only retry
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  resilience: {
    retry: false,
    circuitBreaker: {
      // custom circuit breaker config
    }
  }
});
```

### Advanced Resilience Configuration

```typescript
// Custom retry logic
const userService = createApiService(UserService, {
  baseUrl: 'https://api.example.com',
  resilience: {
    retry: {
      retries: 3,
      shouldRetry: async (error, retryCount) => {
        // Custom logic to determine if request should be retried
        if (retryCount >= 3) return false;
        if (error.response?.status === 429) return true;
        return false;
      },
      retryDelayFn: (retryCount, error) => {
        // Custom delay calculation
        if (error.response?.status === 429) {
          return error.response.headers['retry-after'] || 1000;
        }
        return 100 * Math.pow(2, retryCount);
      }
    },
    circuitBreaker: {
      isFailure: (error) => {
        // Custom failure detection
        return error.response?.status >= 500 || !error.response;
      }
    }
  }
});
```

### Resilience Policy Options

#### RetryPolicy

- `retries` (number): Number of retry attempts (default: 3)
- `retryDelay` (number): Initial delay in milliseconds (default: 100)
- `retryDelayMax` (number): Maximum delay in milliseconds (default: 2000)
- `exponentialBackoff` (boolean | number): Enable exponential backoff with optional multiplier (default: true)
- `retryableStatusCodes` (number[]): HTTP status codes that trigger retry (default: [408, 429, 500, 502, 503, 504])
- `retryOnNetworkError` (boolean): Retry on network errors (default: true)
- `shouldRetry` (function): Custom function to determine if request should be retried
- `retryDelayFn` (function): Custom function to calculate retry delay

#### CircuitBreakerPolicy

- `enabled` (boolean): Enable circuit breaker (default: true)
- `threshold` (number): Failure threshold before opening circuit (default: 5)
- `window` (number): Time window in milliseconds to count failures (default: 60000)
- `timeout` (number): Time in milliseconds before attempting to close circuit (default: 30000)
- `minimumRequests` (number): Minimum requests in window before circuit can open (default: 10)
- `errorStatusCodes` (number[]): HTTP status codes that count as failures (default: [500, 502, 503, 504])
- `isFailure` (function): Custom function to determine if an error counts as a failure

## Credits

RestFit is inspired by:
- **[Retrofit](https://square.github.io/retrofit/)** - A type-safe HTTP client for Android and Java by Square
- **[Refit](https://github.com/reactiveui/refit)** - The automatic type-safe REST library for .NET by ReactiveUI

We thank the creators and maintainers of these excellent libraries for their inspiration and design patterns.

## License

MIT

