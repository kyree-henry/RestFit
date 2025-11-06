/**
 * Resilience Configuration Example
 * 
 * This example demonstrates how to configure retry policies and circuit breakers
 * for different scenarios using RestFit's resilience features.
 */

import 'reflect-metadata';
import { Get, Path, Query, createApiService, DEFAULT_RESILIENCE_POLICY } from '../src';

interface Photo {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

class PhotoService {
  @Get('/photos/{photoId}')
  async getPhoto(@Path('photoId') photoId: number): Promise<Photo> {
    return {} as Photo;
  }

  @Get('/photos')
  async getPhotos(
    @Query('albumId') albumId?: number,
    @Query('_limit') limit?: number
  ): Promise<Photo[]> {
    return [];
  }
}

// Example 1: Default resilience (automatic)
const defaultPhotoService = createApiService(PhotoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  // Default resilience is automatically applied
});

// Example 2: Custom resilience configuration
const customResilienceService = createApiService(PhotoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  resilience: {
    retry: {
      retries: 5,
      retryDelay: 200,
      retryDelayMax: 5000,
      exponentialBackoff: true,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      retryOnNetworkError: true,
    },
    circuitBreaker: {
      enabled: true,
      threshold: 10,
      window: 60000, // 1 minute
      timeout: 30000, // 30 seconds
      minimumRequests: 5,
      errorStatusCodes: [500, 502, 503, 504],
    },
  },
});

// Example 3: Disable resilience
const noResilienceService = createApiService(PhotoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  resilience: false,
});

// Example 4: Retry only (no circuit breaker)
const retryOnlyService = createApiService(PhotoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  resilience: {
    retry: {
      retries: 3,
      retryDelay: 100,
      retryDelayMax: 2000,
      exponentialBackoff: true,
    },
    circuitBreaker: false,
  },
});

// Example 5: Circuit breaker only (no retry)
const circuitBreakerOnlyService = createApiService(PhotoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  resilience: {
    retry: false,
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      window: 60000,
      timeout: 30000,
    },
  },
});

// Example 6: Advanced custom retry logic
const advancedRetryService = createApiService(PhotoService, {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  resilience: {
    retry: {
      retries: 3,
      shouldRetry: async (error, retryCount) => {
        // Custom logic: only retry on 429 (rate limit) or network errors
        if (error.response?.status === 429) {
          return true; // Always retry rate limits
        }
        if (!error.response) {
          return retryCount < 2; // Retry network errors up to 2 times
        }
        return false;
      },
      retryDelayFn: (retryCount, error) => {
        // Use Retry-After header if available (for 429 errors)
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            return parseInt(retryAfter) * 1000; // Convert to milliseconds
          }
        }
        // Exponential backoff: 100ms, 200ms, 400ms
        return 100 * Math.pow(2, retryCount);
      },
    },
    circuitBreaker: {
      isFailure: (error) => {
        // Only count 5xx errors as failures
        return error.response?.status >= 500 || !error.response;
      },
    },
  },
});

async function main() {
  console.log('=== Default Resilience ===');
  console.log('Making request with default retry policy (3 retries)...');
  try {
    const photo = await defaultPhotoService.getPhoto(1);
    console.log('✅ Success! Photo:', photo.title);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n=== Custom Resilience ===');
  console.log('Making request with custom retry policy (5 retries)...');
  try {
    const photos = await customResilienceService.getPhotos(1, 5);
    console.log(`✅ Success! Found ${photos.length} photos`);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n=== No Resilience ===');
  console.log('Making request without resilience (no retries)...');
  try {
    const photo = await noResilienceService.getPhoto(1);
    console.log('✅ Success! Photo:', photo.title);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n=== Testing Retry Behavior ===');
  console.log('Note: Retries only occur on retryable status codes (408, 429, 500, 502, 503, 504) or network errors.');
  console.log('404 errors do not trigger retries by default.');
  console.log('To see retries in action, you would need:');
  console.log('  - A server returning 5xx errors');
  console.log('  - Network connectivity issues');
  console.log('  - Rate limiting (429 status)');
  console.log('\nMaking a normal request (will succeed, no retries needed):');
  try {
    const photos = await advancedRetryService.getPhotos(1);
    console.log(`✅ Success! Found ${photos.length} photos (no retries needed)`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n=== Advanced Retry Logic ===');
  console.log('Making request with advanced retry logic...');
  try {
    const photos = await advancedRetryService.getPhotos(1);
    console.log(`✅ Success! Found ${photos.length} photos with advanced retry`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();

export {
  PhotoService,
  defaultPhotoService,
  customResilienceService,
  noResilienceService,
  retryOnlyService,
  circuitBreakerOnlyService,
  advancedRetryService,
};

