/**
 * Request Modification and Retry Example
 * 
 * This example demonstrates how to use the `request` property and `retry()` method
 * on `ExtendedAxiosResponse` to intercept a response (like a 401 Unauthorized),
 * modify the original request (like refreshing a token), and re-send it.
 * 
 * It shows how this can be achieved identically using either:
 * 1. Method-specific decorators (@ResponseInterceptor)
 * 2. Global service configurations (ApiServiceConfig.responseInterceptors)
 */

import 'reflect-metadata';
import { Get, createApiService, ResponseInterceptor, ResponseInterceptorConfig } from '../src';

interface User {
  id: number;
  name: string;
}

// ──────────────────────────────────────────────
// Mock Authentication Environment
// ──────────────────────────────────────────────

// A mock state for our tokens
const authState = {
  accessToken: 'expired-token',
  refreshToken: 'valid-refresh-token',
};

// Reset state between tests
function resetAuthState() {
  authState.accessToken = 'expired-token';
  authState.refreshToken = 'valid-refresh-token';
}

// A mock function to simulate refreshing a token
async function performTokenRefresh(): Promise<string> {
  console.log('   🔄 [Auth] Refreshing token...');
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  if (authState.refreshToken === 'valid-refresh-token') {
    authState.accessToken = 'new-valid-token';
    console.log(`   ✅ [Auth] Token refreshed successfully: ${authState.accessToken}`);
    return authState.accessToken;
  }
  throw new Error('Refresh token is invalid');
}

// ──────────────────────────────────────────────
// Example 1: Method-Specific Interceptor
// ──────────────────────────────────────────────

class MethodDecoratorService {
  /**
   * Method-level interceptor to handle 401 errors.
   */
  @Get('/method-protected-user')
  @ResponseInterceptor(async (response) => {
    // If we get a 401 Unauthorized
    if (response.status === 401) {
      console.log('   🚫 [Method Interceptor] Received 401 Unauthorized.');
      
      try {
        // 1. Refresh the token
        const newToken = await performTokenRefresh();
        
        // 2. Modify the original request to use the new token
        console.log('   ✏️  [Method Interceptor] Updating request headers with new token.');
        response.request.setHeader('Authorization', `Bearer ${newToken}`);
        
        // 3. Re-send the request and return the new response
        console.log('   🔁 [Method Interceptor] Retrying the request...');
        return await response.retry();
      } catch (err) {
        console.log('   ❌ [Method Interceptor] Failed to refresh token or retry request.');
        return response; // Return original 401 response
      }
    }
  })
  async getUser(): Promise<User> {
    return {} as User;
  }
}

// ──────────────────────────────────────────────
// Example 2: Global Interceptor
// ──────────────────────────────────────────────

class GlobalInterceptorService {
  // No decorators needed here, the retry logic is handled globally
  @Get('/global-protected-user')
  async getUser(): Promise<User> {
    return {} as User;
  }
}

const globalRetryInterceptor: ResponseInterceptorConfig = {
  handler: async (response) => {
    if (response.status === 401) {
      console.log('   🚫 [Global Interceptor] Received 401 Unauthorized.');
      
      try {
        const newToken = await performTokenRefresh();
        
        console.log('   ✏️  [Global Interceptor] Updating request headers with new token.');
        response.request.setHeader('Authorization', `Bearer ${newToken}`);
        
        console.log('   🔁 [Global Interceptor] Retrying the request...');
        return await response.retry();
      } catch (err) {
        console.log('   ❌ [Global Interceptor] Failed to refresh token or retry request.');
        return response;
      }
    }
  }
};


// ──────────────────────────────────────────────
// Main Execution
// ──────────────────────────────────────────────

async function main() {
  console.log('🚀 Request Modification & Retry Example\n');

  // A mock backend implemented as a global interceptor that intercepts 
  // requests before they error out and simulates an API server.
  const mockBackendInterceptors: ResponseInterceptorConfig[] = [
    {
      handler: (response) => {
        const authHeader = response.config.headers?.['Authorization'] || response.config.headers?.['authorization'];
        
        if (response.config.url?.includes('-protected-user')) {
          if (authHeader === 'Bearer new-valid-token') {
            const cloned = response.cloneWithStatusCode(200);
            cloned.data = { id: 1, name: 'Alice (Authenticated)' };
            return cloned;
          } else {
            const cloned = response.cloneWithStatusCode(401);
            cloned.data = { message: 'Unauthorized' };
            return cloned;
          }
        }
      }
    }
  ];

  // Initialize Service 1 (Method Decorators)
  const methodService = createApiService(MethodDecoratorService, {
    baseUrl: 'https://api.example.com',
    headers: { 'Authorization': `Bearer ${authState.accessToken}` },
    responseInterceptors: mockBackendInterceptors, // Inject mock backend
  });

  // Initialize Service 2 (Global Config)
  const globalService = createApiService(GlobalInterceptorService, {
    baseUrl: 'https://api.example.com',
    headers: { 'Authorization': `Bearer ${authState.accessToken}` },
    // Order matters: Mock backend runs first to simulate the server response,
    // then our global retry interceptor handles that response.
    responseInterceptors: [...mockBackendInterceptors, globalRetryInterceptor],
  });

  try {
    // ── Run Example 1 ────────────────────────────
    console.log('--- Example 1: Method Decorator (@ResponseInterceptor) ---');
    console.log(`Initial token state: ${authState.accessToken}\n`);
    
    const user1 = await methodService.getUser();
    
    console.log('\n🎉 Final result (Method Decorator):');
    console.log('   User:', user1);
    
    
    // ── Reset and Run Example 2 ──────────────────
    resetAuthState();
    
    console.log('\n\n--- Example 2: Global Configuration (ApiServiceConfig) ---');
    console.log(`Initial token state: ${authState.accessToken}\n`);
    
    // We must manually pass the expired token in this test since the service 
    // instance was created with the old token. In a real app, you might use 
    // the dynamic `authorization: () => getToken()` config instead.
    globalService['__axiosInstance'].defaults.headers['Authorization'] = `Bearer ${authState.accessToken}`;
    
    const user2 = await globalService.getUser();
    
    console.log('\n🎉 Final result (Global Config):');
    console.log('   User:', user2);
    
    console.log('\n✅ Both examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
main();
