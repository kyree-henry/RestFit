/**
 * Parameters Example
 * 
 * This example demonstrates all parameter decorators:
 * - @Path() for path parameters
 * - @Query() for query parameters
 * - @Body() for request body
 * - @Header() for request headers
 */

import 'reflect-metadata';
import { Get, Post, Path, Query, Body, Header, createApiService } from '../src';

interface Todo {
  id?: number;
  userId: number;
  title: string;
  completed: boolean;
}

class TodoService {
  // Path parameter example
  @Get('/todos/{todoId}')
  async getTodo(@Path('todoId') todoId: number): Promise<Todo> {
    return {} as Todo;
  }

  // Multiple path parameters (if API supports it)
  @Get('/users/{userId}/todos/{todoId}')
  async getUserTodo(
    @Path('userId') userId: number,
    @Path('todoId') todoId: number
  ): Promise<Todo> {
    return {} as Todo;
  }

  // Query parameters
  @Get('/todos')
  async getTodos(
    @Query('userId') userId?: number,
    @Query('completed') completed?: boolean,
    @Query('_limit') limit?: number
  ): Promise<Todo[]> {
    return [];
  }

  // Body parameter
  @Post('/todos')
  async createTodo(@Body() todo: Todo): Promise<Todo> {
    return {} as Todo;
  }

  // Header parameter
  @Get('/todos')
  async getTodosWithAuth(
    @Header('Authorization') authToken: string,
    @Query('userId') userId?: number
  ): Promise<Todo[]> {
    return [];
  }

  // Combining all parameter types
  @Post('/users/{userId}/todos')
  async createUserTodo(
    @Path('userId') userId: number,
    @Header('X-Request-ID') requestId: string,
    @Body() todo: Omit<Todo, 'userId'>
  ): Promise<Todo> {
    return {} as Todo;
  }
}

const todoService = createApiService(TodoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function main() {
  try {
    console.log('=== Path Parameter ===');
    const todo = await todoService.getTodo(1);
    console.log('Todo 1:', todo);

    console.log('\n=== Query Parameters ===');
    const userTodos = await todoService.getTodos(1, false, 5);
    console.log(`Found ${userTodos.length} incomplete todos for user 1`);

    console.log('\n=== Body Parameter ===');
    const newTodo = await todoService.createTodo({
      userId: 1,
      title: 'Complete the samples',
      completed: false,
    });
    console.log('Created todo:', newTodo);

    console.log('\n=== Header Parameter ===');
    const todosWithAuth = await todoService.getTodosWithAuth('Bearer token123', 1);
    console.log(`Found ${todosWithAuth.length} todos with auth`);

    console.log('\n=== Multiple Parameter Types ===');
    const userTodo = await todoService.createUserTodo(
      1,
      'req-123',
      {
        title: 'New user todo',
        completed: false,
      }
    );
    console.log('Created user todo:', userTodo);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();

export { TodoService, todoService };

