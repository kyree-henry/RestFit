/**
 * Wrapped Responses Example
 * 
 * This example demonstrates the automatic response wrapping feature.
 * When enabled, all responses are wrapped in a consistent format with
 * { data, success, error } properties, eliminating the need for try-catch blocks.
 */

import 'reflect-metadata';
import { Get, Path, OnError, createApiService, WrappedResponse } from '../src';
import { AxiosError } from 'axios';

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
  async getUsers(): Promise<User[]> {
    return [];
  }

  @Get('/users/{userId}')
  async getUser(@Path('userId') userId: number): Promise<User> {
    return {} as User;
  }

  @Get('/posts/{postId}')
  async getPost(@Path('postId') postId: number): Promise<Post> {
    return {} as Post;
  }

  @Get('/posts/99999') // Non-existent post to trigger 404
  @OnError((error: AxiosError) => {
    // Error handler is required for wrapping to work
    // Return value goes into the 'error' field of wrapped response
    return {
      message: error.message || 'Request failed',
      statusCode: error.response?.status,
      details: error.response?.data
    };
  })
  async getNonExistentPost(): Promise<Post> {
    return {} as Post;
  }

  @Get('/posts/88888') // Non-existent post WITHOUT error handler
  async getNonExistentPostWithoutHandler(): Promise<Post> {
    return {} as Post;
  }
}

async function main() {
  console.log('=== Wrapped Responses Example ===\n');

  // Create service with automatic response wrapping enabled
  const userService = createApiService(UserService, {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    wrapResponses: true, // Enable automatic wrapping
  });

  console.log('1. Success response (getUsers):');
  const usersResult = await userService.getUsers();
  console.log('   Result:', usersResult);
  console.log('   Type:', typeof usersResult);

  if ('success' in usersResult) {
    const wrapped = usersResult as any;
    console.log('   ✅ success:', wrapped.success);
    console.log('   📦 data:', (wrapped.data as User[])?.length, 'users (array wrapped in data)');
    console.log('   ❌ error:', wrapped.error);
  }
  console.log();

  console.log('2. Success response (getUser):');
  const userResult = await userService.getUser(1);
  console.log('   Result:', userResult);

  if ('success' in userResult) {
    const wrapped = userResult as any;
    console.log('   ✅ success:', wrapped.success);
    console.log('   📦 user data:', wrapped.name || wrapped.id);
    console.log('   ❌ error:', wrapped.error);
  }
  console.log();

  console.log('3. Error response (404 - non-existent post):');
  const errorResult = await userService.getNonExistentPost();
  console.log('   Result:', errorResult);

  if ('success' in errorResult) {
    const wrapped = errorResult as any;
    console.log('   ✅ success:', wrapped.success);
    console.log('   ❌ error:', wrapped.error, '(value returned from @OnError handler)');
    if (wrapped.error && typeof wrapped.error === 'object') {
      console.log('      - message:', wrapped.error.message);
      console.log('      - statusCode:', wrapped.error.statusCode);
    }
  }
  console.log();

  console.log('4. Usage pattern (destructuring with array response):');
  const { data: users, success, error } = await userService.getUsers() as any;

  if (success) {
    console.log('   ✅ Success! Users:', users?.length);
  } else {
    console.log('   ❌ Error:', error);
  }
  console.log();

  console.log('5. Usage pattern (conditional check):');
  const result = await userService.getUser(1);

  if ('success' in result && result.success) {
    const wrapped = result as any;
    console.log('   ✅ User fetched:', wrapped.name || wrapped.id);
  } else if ('success' in result) {
    const wrapped = result as any;
    console.log('   ❌ Failed:', wrapped.error);
  }
  console.log();

  console.log('6. Method WITHOUT @OnError handler (will throw even with wrapResponses):');
  try {
    const resultWithoutHandler = await userService.getNonExistentPostWithoutHandler();
    console.log('   Result:', resultWithoutHandler);
  } catch (error: any) {
    console.log('   ❌ Error thrown (expected):', error.message);
    console.log('   📝 Note: Methods without @OnError handlers throw errors even when wrapResponses is enabled');
  }
  console.log();

  console.log('📝 Notes:');
  console.log('   - Method signatures remain unchanged');
  console.log('   - Object responses are spread with success added');
  console.log('   - Array/primitive responses are wrapped in { data, success }');
  console.log('   - No try-catch blocks needed for methods with @OnError handlers');
  console.log('   - Methods WITHOUT @OnError handlers will still throw errors');
  console.log('   - Error field contains whatever @OnError handler returns');
}

main().catch(console.error);
