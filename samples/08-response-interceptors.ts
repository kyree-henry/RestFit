/**
 * Response Interceptors Example
 * 
 * This example demonstrates both global and method-specific response interceptors:
 * 1. Global interceptors - configured in ApiServiceConfig (applied to all requests)
 * 2. Method-specific interceptors - using @ResponseInterceptor decorator
 * 
 * Both can be used together, with global interceptors running first.
 * 
 * Interceptors can:
 * - Check response headers/data and trigger actions (void return)
 * - Modify response data and return the modified response
 */

import 'reflect-metadata';
import { Get, Path, createApiService, ResponseInterceptor, ResponseInterceptorConfig } from '../src';
import { AxiosResponse } from 'axios';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// ServiceResponse format for consistent API responses
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: number;
    details?: any;
  };
  errorMessage?: string;
  statusCode: number;
  timestamp: string;
}

class UserService {
  @Get('/users')
  @ResponseInterceptor((response) => {
    // Check condition and execute action (void return - no modification)
    if (response.headers['x-rate-limit-remaining']) {
      const remaining = response.headers['x-rate-limit-remaining'];
      const limit = response.headers['x-rate-limit-limit'];
      console.log(`📊 Rate Limit Info: ${remaining}/${limit} requests remaining`);

      // You can trigger any app logic here
      if (Number(remaining) < 10) {
        console.warn('⚠️  Warning: Rate limit is getting low!');
      }
    }
  })
  async getUsers(): Promise<User[]> {
    return [];
  }

  @Get('/users/{userId}')
  @ResponseInterceptor(async (response) => {
    // Check condition and execute action (void return - no modification)
    if (response.status === 200) {
      const user = response.data as User;
      console.log(`✅ Successfully fetched user: ${user.name}`);

      // Example: Update analytics, cache, or trigger notifications
      // await analytics.track('user_fetched', { userId: user.id });
    }
  })
  async getUser(@Path('userId') userId: number): Promise<User> {
    return {} as User;
  }

  @Get('/users/{userId}/posts')
  @ResponseInterceptor((response) => {
    // Example: Modify response data and return modified response
    if (response.data && Array.isArray(response.data)) {
      // Add a computed property to each post
      const modifiedData = response.data.map((post: any) => ({
        ...post,
        computedProperty: `Post #${post.id} by User ${post.userId}`,
        timestamp: new Date().toISOString()
      }));

      // Return modified response
      response.data = modifiedData;
      return response;
    }
  })
  async getUserPosts(@Path('userId') userId: number): Promise<any[]> {
    return [];
  }
}

class PostService {
  @Get('/posts')
  @ResponseInterceptor((response) => {
    // Check condition and execute action (void return - no modification)
    const posts = response.data as Post[];
    if (posts.length > 0 && posts.some(p => p.title.includes('important'))) {
      const importantPosts = posts.filter(p => p.title.includes('important'));
      console.log(`🔔 Found ${importantPosts.length} important post(s)!`);

      // Example: Send notification, update UI, etc.
      // notificationService.notify('Important posts detected');
    }
  })
  @ResponseInterceptor((response) => {
    // Multiple interceptors can be chained
    // Check condition and execute action (void return - no modification)
    if (response.headers['cache-control']) {
      const cacheControl = response.headers['cache-control'];
      console.log(`💾 Cache Control: ${cacheControl}`);

      // Example: Update cache strategy based on headers
      // cacheManager.updateStrategy(cacheControl);
    }
  })
  async getPosts(): Promise<Post[]> {
    return [];
  }

  @Get('/posts/{postId}')
  @ResponseInterceptor(async (response) => {
    // Example: Modify response and return it
    // Add metadata to the response data
    if (response.data) {
      const post = response.data as Post;
      response.data = {
        ...post,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'jsonplaceholder-api',
          processed: true
        }
      };
      return response; // Return modified response
    }
  })
  async getPost(@Path('postId') postId: number): Promise<Post & { metadata?: any }> {
    return {} as Post & { metadata?: any };
  }
}

// Service using decorator-based interceptors (method-specific)
class DecoratorBasedService {
  @Get('/users/{userId}')
  @ResponseInterceptor((response) => {
    // Transform response to ServiceResponse format
    // Method-specific interceptors only receive successful responses (2xx)
    const serviceResponse: ServiceResponse<User> = {
      success: true,
      data: response.data as User,
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
    response.data = serviceResponse;
    return response;
  })
  async getUser(@Path('userId') userId: number): Promise<ServiceResponse<User>> {
    return {} as ServiceResponse<User>;
  }

  @Get('/posts')
  @ResponseInterceptor((response) => {
    // Transform response to ServiceResponse format
    const serviceResponse: ServiceResponse<Post[]> = {
      success: true,
      data: response.data as Post[],
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
    response.data = serviceResponse;
    return response;
  })
  async getPosts(): Promise<ServiceResponse<Post[]>> {
    return {} as ServiceResponse<Post[]>;
  }
}

// Service using global interceptors (handles both success and errors)
class GlobalInterceptorService {
  @Get('/users/{userId}')
  async getUser(@Path('userId') userId: number): Promise<ServiceResponse<User>> {
    return {} as ServiceResponse<User>;
  }

  @Get('/posts/{postId}')
  async getPostById(@Path('postId') postId: number): Promise<ServiceResponse<Post>> {
    return {} as ServiceResponse<Post>;
  }

  @Get('/posts/99999')
  async getNonExistentPost(): Promise<ServiceResponse<Post>> {
    return {} as ServiceResponse<Post>;
  }
}

async function main() {
  console.log('🚀 Response Interceptors Example\n');

  // Example 1: Global interceptors (applied to all requests)
  console.log('📋 Example 1: Global Interceptors\n');

  const globalInterceptors: ResponseInterceptorConfig[] = [
    {
      // Handler: Check condition and execute action in one function
      handler: (response) => {
        const hasCustomHeader = Object.keys(response.headers).some(
          key => key.toLowerCase().startsWith('x-')
        );
        if (hasCustomHeader) {
          const customHeaders = Object.entries(response.headers)
            .filter(([key]) => key.toLowerCase().startsWith('x-'))
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          console.log(`   🌐 Global Interceptor: Found custom headers - ${customHeaders}`);
        }
      }
    },
    {
      // Handler: Always log successful responses (for monitoring)
      handler: (response) => {
        if (response.status >= 200 && response.status < 300) {
          console.log(`   ✅ Global Interceptor: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
      }
    }
  ];

  const userService = createApiService(UserService, {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    responseInterceptors: globalInterceptors, // Global interceptors applied here
  });

  const postService = createApiService(PostService, {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    responseInterceptors: globalInterceptors, // Same global interceptors
  });

  try {
    console.log('1. Fetching users (global + method-specific interceptors)...\n');
    const users = await userService.getUsers();
    console.log(`   Retrieved ${users.length} users\n`);

    console.log('2. Fetching a specific user (global + method-specific interceptors)...\n');
    const user = await userService.getUser(1);
    console.log(`   User: ${user.name}\n`);

    console.log('3. Fetching posts (global + multiple method-specific interceptors)...\n');
    const posts = await postService.getPosts();
    console.log(`   Retrieved ${posts.length} posts\n`);

    console.log('4. Fetching a specific post (global + method-specific interceptors with modification)...\n');
    const post = await postService.getPost(1);
    console.log(`   Post: ${post.title}`);
    if ((post as any).metadata) {
      console.log(`   Metadata: ${JSON.stringify((post as any).metadata)}\n`);
    }

    console.log('5. Fetching user posts (with response modification)...\n');
    const userPosts = await userService.getUserPosts(1);
    if (userPosts.length > 0 && (userPosts[0] as any).computedProperty) {
      console.log(`   Modified post example: ${(userPosts[0] as any).computedProperty}\n`);
    }

    // Example 2a: Decorator-based interceptors (method-specific, success only)
    console.log('\n📋 Example 2a: Decorator-Based Interceptors (Method-Specific, Success Only)\n');

    const decoratorService = createApiService(DecoratorBasedService, {
      baseUrl: 'https://jsonplaceholder.typicode.com',
    });

    console.log('6. Fetching user with decorator-based interceptor (success only)...\n');
    const userResponse = await decoratorService.getUser(1);
    console.log(`   Success: ${userResponse.success}`);
    console.log(`   Status Code: ${userResponse.statusCode}`);
    console.log(`   User Name: ${userResponse.data?.name}`);
    console.log(`   Timestamp: ${userResponse.timestamp}\n`);

    console.log('7. Fetching posts with decorator-based interceptor (success only)...\n');
    const postsResponse = await decoratorService.getPosts();
    console.log(`   Success: ${postsResponse.success}`);
    console.log(`   Status Code: ${postsResponse.statusCode}`);
    console.log(`   Posts Count: ${postsResponse.data?.length || 0}`);
    console.log(`   Timestamp: ${postsResponse.timestamp}\n`);

    // Example 2b: Global interceptors (handles both success and errors)
    console.log('\n📋 Example 2b: Global Interceptors (Handles Errors)\n');

    // Global interceptor: transform errors to ServiceResponse and change status to 200
    const serviceResponseInterceptors: ResponseInterceptorConfig[] = [
      {
        handler: (response) => {
          if (response.status >= 400) {
            const originalStatusCode = response.status;
            const serviceResponse: ServiceResponse<null> = {
              success: false,
              error: {
                message: `HTTP ${originalStatusCode} Error`,
                code: originalStatusCode,
                details: response.data
              },
              errorMessage: `HTTP ${originalStatusCode} Error`,
              statusCode: originalStatusCode,
              timestamp: new Date().toISOString()
            };
            // Change status to 200 so no error is thrown
            response.status = 200;
            response.statusText = "OK";
            response.data = serviceResponse;
            return response;
          }
        }
      }
    ];

    const globalService = createApiService(GlobalInterceptorService, {
      baseUrl: 'https://jsonplaceholder.typicode.com',
      responseInterceptors: serviceResponseInterceptors,
    });

    console.log('8. Testing error transformation with global interceptor (404 error)...\n');
    // This will trigger a 404, which is transformed by global interceptor to:
    // - HTTP status 200 (no error thrown)
    // - ServiceResponse with success:false
    // - Original status code (404) preserved in ServiceResponse.statusCode
    const errorResponse = await globalService.getPostById(99999);
    console.log(`   ✅ Response received (no error thrown!)`);
    console.log(`   Success: ${errorResponse.success}`);
    console.log(`   HTTP Status: 200 (converted from original ${errorResponse.statusCode})`);
    console.log(`   Original Status Code: ${errorResponse.statusCode} (preserved in ServiceResponse)`);
    console.log(`   Error Message: ${errorResponse.errorMessage}\n`);

    console.log('9. Testing error transformation with dedicated error endpoint...\n');
    // This endpoint will definitely return 404
    const errorResponse2 = await globalService.getNonExistentPost();
    console.log(`   ✅ Response received (no error thrown!)`);
    console.log(`   Success: ${errorResponse2.success}`);
    console.log(`   HTTP Status: 200 (converted from original ${errorResponse2.statusCode})`);
    console.log(`   Original Status Code: ${errorResponse2.statusCode}`);
    console.log(`   Error Message: ${errorResponse2.errorMessage}\n`);


    console.log('\n📝 Note: Global interceptors run first, then method-specific interceptors.');
    console.log('📝 Note: Interceptors can return void (side effects) or a modified AxiosResponse.');
    console.log('📝 Note: ServiceResponse format provides consistent structure for both success and error responses.');
    console.log('📝 Note: Converting errors to successful responses is OPTIONAL - you can use @OnError decorators instead.');
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
main();

