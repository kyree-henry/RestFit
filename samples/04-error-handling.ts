/**
 * Error and Success Handlers Example
 * 
 * This example demonstrates how to use @OnError and @OnSuccess decorators
 * to handle different HTTP status codes and transform responses.
 */

import 'reflect-metadata';
import { Get, Post, Path, OnError, OnSuccess, createApiService } from '../src';
import { AxiosError } from 'axios';

interface Album {
  id: number;
  userId: number;
  title: string;
}

interface AlbumWithMetadata extends Album {
  fetchedAt: string;
  fromCache?: boolean;
}

class AlbumService {
  // Success handler for 200 status
  @Get('/albums/{albumId}')
  @OnSuccess(200, (data: Album): AlbumWithMetadata => {
    return {
      ...data,
      fetchedAt: new Date().toISOString(),
      fromCache: false,
    };
  })
  async getAlbum(@Path('albumId') albumId: number): Promise<AlbumWithMetadata> {
    return {} as AlbumWithMetadata;
  }

  // Error handler for 404
  @Get('/albums/{albumId}')
  @OnError(404, (error: AxiosError) => {
    console.warn(`Album not found: ${error.config?.url}`);
    return {
      id: 0,
      userId: 0,
      title: 'Not Found',
      fetchedAt: new Date().toISOString(),
    } as AlbumWithMetadata;
  })
  async getAlbumWithFallback(@Path('albumId') albumId: number): Promise<AlbumWithMetadata> {
    return {} as AlbumWithMetadata;
  }

  // Multiple success handlers for different status codes
  @Get('/albums')
  @OnSuccess([200, 201], (data: Album[]) => {
    return data.map(album => ({
      ...album,
      fetchedAt: new Date().toISOString(),
    }));
  })
  @OnSuccess(204, () => {
    console.log('No content returned');
    return [];
  })
  async getAllAlbums(): Promise<AlbumWithMetadata[]> {
    return [];
  }

  // Error handler for multiple status codes
  @Post('/albums')
  @OnError(400, (error: AxiosError) => {
    console.error('Bad request:', error.response?.data);
    throw new Error('Invalid album data provided');
  })
  @OnError(401, (error: AxiosError) => {
    console.error('Unauthorized:', error.config?.url);
    throw new Error('Authentication required');
  })
  @OnError(500, (error: AxiosError) => {
    console.error('Server error:', error.response?.data);
    // Return a default album instead of throwing
    return {
      id: -1,
      userId: 0,
      title: 'Error creating album',
      fetchedAt: new Date().toISOString(),
    } as AlbumWithMetadata;
  })
  async createAlbum(album: Omit<Album, 'id'>): Promise<AlbumWithMetadata> {
    return {} as AlbumWithMetadata;
  }

  // Null error handler (catch-all for any error) - old syntax
  @Get('/albums/{albumId}/photos')
  @OnError(null, (error: AxiosError) => {
    console.error('Unexpected error:', error.message);
    return {
      error: true,
      message: error.message,
      status: error.response?.status || 0,
    };
  })
  async getAlbumPhotos(@Path('albumId') albumId: number): Promise<any> {
    return {};
  }

  // Catch-all error handler - new syntax (no status parameter)
  @Get('/albums/{albumId}/comments')
  @OnError((error: AxiosError) => {
    console.error('Catch-all error handler:', error.message);
    return {
      error: true,
      message: error.message,
      status: error.response?.status || 0,
      handled: true,
    };
  })
  async getAlbumComments(@Path('albumId') albumId: number): Promise<any> {
    return {};
  }
}

const albumService = createApiService(AlbumService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function main() {
  try {
    console.log('=== Success Handler ===');
    const album = await albumService.getAlbum(1);
    console.log('Album with metadata:', album);

    console.log('\n=== Error Handler (404) ===');
    // This will trigger the 404 handler
    const notFoundAlbum = await albumService.getAlbumWithFallback(99999);
    console.log('Fallback album:', notFoundAlbum);

    console.log('\n=== Multiple Success Handlers ===');
    const albums = await albumService.getAllAlbums();
    console.log(`Found ${albums.length} albums with metadata`);

    console.log('\n=== Multiple Error Handlers ===');
    try {
      const newAlbum = await albumService.createAlbum({
        userId: 1,
        title: 'My New Album',
      });
      console.log('Created album:', newAlbum);
    } catch (error: any) {
      console.log('Error handled:', error.message);
    }

    console.log('\n=== Catch-All Error Handler (null syntax) ===');
    const photos = await albumService.getAlbumPhotos(1);
    console.log('Photos result:', photos);

    console.log('\n=== Catch-All Error Handler (no status) ===');
    const comments = await albumService.getAlbumComments(1);
    console.log('Comments result:', comments);
  } catch (error) {
    console.error('Unhandled error:', error);
  }
}

// Run the example
main();

export { AlbumService, albumService };

