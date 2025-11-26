/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { META_RESPONSE } from '../constants/metadata';
import { ResponseInterceptorMetadata } from '../types';

/**
 * Decorator to intercept responses and trigger actions.
 * 
 * @param handler - A function that processes the response (can check conditions internally)
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @Get('/users')
 *   @Interceptor((response) => {
 *     if (response.headers['x-something']) {
 *       console.log('Custom header found!', response.headers['x-something']);
 *       // Trigger your app logic here
 *     }
 *   })
 *   getUsers(): Promise<User[]> {
 *     return {} as Promise<User[]>;
 *   }
 * }
 * ```
 */
export function Interceptor(
  handler: (response: AxiosResponse) => void | Promise<void>
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const interceptors: ResponseInterceptorMetadata[] =
      Reflect.getMetadata(META_RESPONSE, target.constructor.prototype, propertyKey) || [];
    interceptors.push({ handler });
    Reflect.defineMetadata(META_RESPONSE, interceptors, target.constructor.prototype, propertyKey);
  };
}

