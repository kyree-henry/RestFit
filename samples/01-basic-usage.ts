/**
 * Basic Usage Example
 * 
 * This example demonstrates the most basic usage of RestFit with JSONPlaceholder API.
 * It shows how to create a simple service with GET requests.
 */

import 'reflect-metadata';
import { Get, Path, Query, createApiService } from '../src';

// Define the User type
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// Create a service class with decorators
class UserService {
  @Get('/users')
  async getAllUsers(): Promise<User[]> {
    // Implementation is handled by the decorator
    return [];
  }

  @Get('/users/{userId}')
  async getUserById(@Path('userId') userId: number): Promise<User> {
    // Implementation is handled by the decorator
    return {} as User;
  }

  @Get('/users')
  async getUsersByQuery(
    @Query('_limit') limit?: number,
    @Query('_page') page?: number
  ): Promise<User[]> {
    // Implementation is handled by the decorator
    return [];
  }
}

// Create an instance of the service
const userService = createApiService(UserService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example usage
async function main() {
  try {
    console.log('Fetching all users...');
    const users = await userService.getAllUsers();
    console.log(`Found ${users.length} users`);
    console.log('First user:', users[0]);

    console.log('\nFetching user by ID...');
    const user = await userService.getUserById(1);
    console.log('User:', user);

    console.log('\nFetching users with pagination...');
    const paginatedUsers = await userService.getUsersByQuery(5, 1);
    console.log(`Found ${paginatedUsers.length} users`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();

export { UserService, userService };

