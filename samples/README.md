# RestFit Samples

This directory contains example code demonstrating various features and use cases of RestFit.

## Examples

### 01-basic-usage.ts
Basic usage example showing how to create a simple service with GET requests using JSONPlaceholder API.

**Key Features:**
- Basic service creation
- GET requests
- Path parameters
- Query parameters

### 02-http-methods.ts
Demonstrates all HTTP methods (GET, POST, PUT, PATCH, DELETE) using JSONPlaceholder API.

**Key Features:**
- All HTTP method decorators
- Creating and updating resources
- Request bodies

### 03-parameters.ts
Shows how to use all parameter decorators for path, query, body, and header parameters.

**Key Features:**
- `@Path()` for URL path parameters
- `@Query()` for query string parameters
- `@Body()` for request bodies
- `@Header()` for request headers
- Combining multiple parameter types

### 04-error-handling.ts
Demonstrates error and success handlers using `@OnError` and `@OnSuccess` decorators.

**Key Features:**
- Custom error handling for specific status codes
- Response transformation with success handlers
- Multiple error handlers
- Catch-all error handlers

### 05-resilience.ts
Shows different resilience configuration scenarios including retry policies and circuit breakers.

**Key Features:**
- Default resilience configuration
- Custom retry policies
- Circuit breaker configuration
- Disabling resilience features
- Advanced retry logic with custom functions

### 06-multiple-services.ts
Demonstrates creating and using multiple services together with the unified API.

**Key Features:**
- Creating multiple services at once
- Shared configuration
- Type-safe service access
- Combining data from multiple services

### 07-real-world-api.ts
A practical example using REST Countries API showing real-world patterns.

**Key Features:**
- Real API integration
- Data transformation
- Error handling in production scenarios
- Complex queries and filtering

### 08-response-interceptors.ts
Demonstrates how to use `@Interceptor` decorator and global interceptors to check responses and trigger actions.

**Key Features:**
- Checking response headers (e.g., rate limits, custom headers)
- Analyzing response data
- Triggering app logic based on response characteristics
- Chaining multiple response interceptors

## Running the Samples

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run any sample using npm scripts:**
   ```bash
   npm run sample:basic        # Basic usage example
   npm run sample:methods      # HTTP methods example
   npm run sample:params       # Parameters example
   npm run sample:errors       # Error handling example
   npm run sample:resilience   # Resilience configuration example
   npm run sample:multiple     # Multiple services example
   npm run sample:realworld    # Real-world API example
   npm run sample:interceptors # Response interceptors example
   ```

### Alternative Methods

**Using tsx directly:**
```bash
npx tsx samples/01-basic-usage.ts
```

**Using ts-node:**
```bash
npx ts-node samples/01-basic-usage.ts
```

**Note:** The samples have their `main()` functions enabled by default. If you want to use them as modules, comment out the `main()` call at the bottom of each file.

## Public APIs Used

These samples use the following public APIs:

- **JSONPlaceholder** (`https://jsonplaceholder.typicode.com`)
  - Fake REST API for testing and prototyping
  - Used in examples 01-06

- **REST Countries** (`https://restcountries.com`)
  - Real-world API for country data
  - Used in example 07

## Notes

- All samples include commented-out `main()` function calls. Uncomment them to run the examples.
- Some examples demonstrate error scenarios. You may need to adjust error conditions based on API responses.
- Resilience features are demonstrated in example 05, but default resilience is enabled in all examples unless explicitly disabled.
- The samples are written in TypeScript and require the `reflect-metadata` import at the top of each file.

## Next Steps

After exploring these samples, you can:

1. Modify the examples to match your API endpoints
2. Experiment with different resilience configurations
3. Combine patterns from multiple examples
4. Create your own services based on these patterns

## Contributing

Feel free to add more examples! Good examples to add:
- Authentication examples (JWT, OAuth)
- File upload/download
- Streaming responses
- WebSocket integration
- Custom interceptors

