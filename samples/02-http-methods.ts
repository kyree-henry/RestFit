/**
 * HTTP Methods Example
 * 
 * This example demonstrates all HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * using JSONPlaceholder API.
 */

import 'reflect-metadata';
import { Get, Post, Put, Patch, Delete, Path, Body, Query, createApiService } from '../src';

interface Post {
  id?: number;
  userId: number;
  title: string;
  body: string;
}

interface Comment {
  id?: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

class PostService {
  // GET - Retrieve all posts
  @Get('/posts')
  async getAllPosts(): Promise<Post[]> {
    return [];
  }

  // GET - Retrieve a specific post
  @Get('/posts/{postId}')
  async getPost(@Path('postId') postId: number): Promise<Post> {
    return {} as Post;
  }

  // GET - Retrieve posts with query parameters
  @Get('/posts')
  async getPostsByUser(
    @Query('userId') userId: number
  ): Promise<Post[]> {
    return [];
  }

  // POST - Create a new post
  @Post('/posts')
  async createPost(@Body() post: Post): Promise<Post> {
    return {} as Post;
  }

  // PUT - Update an entire post
  @Put('/posts/{postId}')
  async updatePost(
    @Path('postId') postId: number,
    @Body() post: Post
  ): Promise<Post> {
    return {} as Post;
  }

  // PATCH - Partially update a post
  @Patch('/posts/{postId}')
  async patchPost(
    @Path('postId') postId: number,
    @Body() partialPost: Partial<Post>
  ): Promise<Post> {
    return {} as Post;
  }

  // DELETE - Delete a post
  @Delete('/posts/{postId}')
  async deletePost(@Path('postId') postId: number): Promise<void> {
    // JSONPlaceholder returns empty object, but we'll make it void
  }
}

const postService = createApiService(PostService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function main() {
  try {
    console.log('=== GET Examples ===');
    const allPosts = await postService.getAllPosts();
    console.log(`Total posts: ${allPosts.length}`);

    const post = await postService.getPost(1);
    console.log('Post 1:', post.title);

    const userPosts = await postService.getPostsByUser(1);
    console.log(`User 1 has ${userPosts.length} posts`);

    console.log('\n=== POST Example ===');
    const newPost = await postService.createPost({
      userId: 1,
      title: 'My New Post',
      body: 'This is the body of my new post',
    });
    console.log('Created post:', newPost);

    console.log('\n=== PUT Example ===');
    const updatedPost = await postService.updatePost(1, {
      userId: 1,
      title: 'Updated Title',
      body: 'Updated body',
    });
    console.log('Updated post:', updatedPost);

    console.log('\n=== PATCH Example ===');
    const patchedPost = await postService.patchPost(1, {
      title: 'Patched Title Only',
    });
    console.log('Patched post:', patchedPost);

    console.log('\n=== DELETE Example ===');
    await postService.deletePost(1);
    console.log('Post deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();

export { PostService, postService };

