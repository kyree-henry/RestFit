/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { META_RESPONSE } from '../constants/metadata';
import { ResponseInterceptorMetadata } from '../types';
import { ExtendedAxiosResponse } from '../utils/response-helpers';

/**
 * Decorator to intercept responses and optionally modify them.
 * 
 * @param handler - A function that processes the response.
 *                  Can return void (for side effects) or a modified AxiosResponse.
 *                  If a response is returned, it will replace the original response.
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @Get('/users')
 *   @ResponseInterceptor((response) => {
 *     if (response.headers['x-something']) {
 *       console.log('Custom header found!', response.headers['x-something']);
 *       // Trigger your app logic here
 *     }
 *   })
 *   getUsers(): Promise<User[]> {
 *     return {} as Promise<User[]>;
 *   }
 * 
 *   @Get('/data')
 *   @ResponseInterceptor((response) => {
 *     // Modify response data
 *     response.data = { ...response.data, modified: true };
 *     return response; // Return modified response
 *   })
 *   getData(): Promise<any> {
 *     return {} as Promise<any>;
 *   }
 * }
 * ```
 */
export function ResponseInterceptor(
  handler: (response: ExtendedAxiosResponse) => void | ExtendedAxiosResponse | Promise<void | ExtendedAxiosResponse>
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const interceptors: ResponseInterceptorMetadata[] =
      Reflect.getMetadata(META_RESPONSE, target.constructor.prototype, propertyKey) || [];
    interceptors.push({ handler });
    Reflect.defineMetadata(META_RESPONSE, interceptors, target.constructor.prototype, propertyKey);
  };
}

