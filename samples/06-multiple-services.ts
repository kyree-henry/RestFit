/**
 * Multiple Services Example
 * 
 * This example demonstrates how to create and use multiple services
 * together using the unified createApiService function.
 */

import 'reflect-metadata';
import { Get, Post, Path, Query, Body, createApiService } from '../src';

// User Service
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

class UserService {
  @Get('/users')
  async getAllUsers(): Promise<User[]> {
    return [];
  }

  @Get('/users/{userId}')
  async getUser(@Path('userId') userId: number): Promise<User> {
    return {} as User;
  }
}

// Post Service
interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

class PostService {
  @Get('/posts')
  async getAllPosts(): Promise<Post[]> {
    return [];
  }

  @Get('/posts/{postId}')
  async getPost(@Path('postId') postId: number): Promise<Post> {
    return {} as Post;
  }

  @Get('/posts')
  async getPostsByUser(@Query('userId') userId: number): Promise<Post[]> {
    return [];
  }

  @Post('/posts')
  async createPost(@Body() post: Omit<Post, 'id'>): Promise<Post> {
    return {} as Post;
  }
}

// Comment Service
interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

class CommentService {
  @Get('/comments')
  async getAllComments(): Promise<Comment[]> {
    return [];
  }

  @Get('/comments')
  async getCommentsByPost(@Query('postId') postId: number): Promise<Comment[]> {
    return [];
  }
}

// Create all services at once with shared configuration
const api = createApiService(
  {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    headers: {
      'Content-Type': 'application/json',
    },
    // Shared resilience configuration
    resilience: {
      retry: {
        retries: 3,
        retryDelay: 100,
        retryDelayMax: 2000,
      },
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        window: 60000,
        timeout: 30000,
      },
    },
  },
  {
    users: UserService,
    posts: PostService,
    comments: CommentService,
  }
);

async function main() {
  try {
    console.log('=== User Service ===');
    const users = await api.users.getAllUsers();
    console.log(`Total users: ${users.length}`);

    const user = await api.users.getUser(1);
    console.log('User 1:', user.name);

    console.log('\n=== Post Service ===');
    const posts = await api.posts.getAllPosts();
    console.log(`Total posts: ${posts.length}`);

    const post = await api.posts.getPost(1);
    console.log('Post 1:', post.title);

    const userPosts = await api.posts.getPostsByUser(1);
    console.log(`User 1 has ${userPosts.length} posts`);

    const newPost = await api.posts.createPost({
      userId: 1,
      title: 'New Post',
      body: 'This is a new post',
    });
    console.log('Created post:', newPost.title);

    console.log('\n=== Comment Service ===');
    const comments = await api.comments.getAllComments();
    console.log(`Total comments: ${comments.length}`);

    const postComments = await api.comments.getCommentsByPost(1);
    console.log(`Post 1 has ${postComments.length} comments`);

    console.log('\n=== Combined Example ===');
    // Get a user, their posts, and comments for each post
    const userId = 1;
    const userData = await api.users.getUser(userId);
    const userPostsData = await api.posts.getPostsByUser(userId);
    
    console.log(`User: ${userData.name}`);
    console.log(`Posts: ${userPostsData.length}`);
    
    for (const postData of userPostsData.slice(0, 3)) {
      const postCommentsData = await api.comments.getCommentsByPost(postData.id);
      console.log(`  Post "${postData.title}": ${postCommentsData.length} comments`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

export { api, UserService, PostService, CommentService };

