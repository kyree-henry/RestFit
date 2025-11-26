/**
 * Response Interceptors Example
 * 
 * This example demonstrates both global and method-specific response interceptors:
 * 1. Global interceptors - configured in ApiServiceConfig (applied to all requests)
 * 2. Method-specific interceptors - using @Interceptor decorator
 * 
 * Both can be used together, with global interceptors running first.
 */

import 'reflect-metadata';
import { Get, Path, createApiService, Interceptor, ResponseInterceptorConfig } from '../src';
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

class UserService {
  @Get('/users')
  @Interceptor((response) => {
    // Check condition and execute action in one function
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
  @Interceptor(async (response) => {
    // Check condition and execute action in one function
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
}

class PostService {
  @Get('/posts')
  @Interceptor((response) => {
    // Check condition and execute action in one function
    const posts = response.data as Post[];
    if (posts.length > 0 && posts.some(p => p.title.includes('important'))) {
      const importantPosts = posts.filter(p => p.title.includes('important'));
      console.log(`🔔 Found ${importantPosts.length} important post(s)!`);

      // Example: Send notification, update UI, etc.
      // notificationService.notify('Important posts detected');
    }
  })
  @Interceptor((response) => {
    // Multiple interceptors can be chained
    // Check condition and execute action in one function
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
  @Interceptor(async (response) => {
    // Check condition and execute action in one function
    if (response.headers['x-something']) {
      const customHeader = response.headers['x-something'];
      console.log(`🎯 Custom header detected: ${customHeader}`);

      // Example: Trigger app-specific logic
      // await appState.update({ customFlag: customHeader });
      // eventBus.emit('custom-event', { value: customHeader });
    }
  })
  async getPost(@Path('postId') postId: number): Promise<Post> {
    return {} as Post;
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

    console.log('4. Fetching a specific post (global + method-specific interceptors)...\n');
    const post = await postService.getPost(1);
    console.log(`   Post: ${post.title}\n`);

    console.log('\n📝 Note: Global interceptors run first, then method-specific interceptors.');
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
main();

