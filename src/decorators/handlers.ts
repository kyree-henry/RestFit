/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from 'axios';
import { META_ERRORS, META_SUCCESS, META_RETRY } from '../constants/metadata';
import { SuccessHandlerMetadata } from '../types';

export function OnError<ReturnType>(
  handler: (error: AxiosError) => ReturnType | Promise<ReturnType>
): MethodDecorator;
export function OnError<ReturnType>(
  status: number | number[] | null,
  handler: (error: AxiosError) => ReturnType | Promise<ReturnType>
): MethodDecorator;
export function OnError<ReturnType>(
  statusOrHandler: number | number[] | null | ((error: AxiosError) => ReturnType | Promise<ReturnType>),
  handler?: (error: AxiosError) => ReturnType | Promise<ReturnType>
): MethodDecorator {

  const status = handler === undefined ? null : (statusOrHandler as number | number[] | null);
  const errorHandler = handler || (statusOrHandler as (error: AxiosError) => ReturnType | Promise<ReturnType>);

  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const errors = Reflect.getMetadata(META_ERRORS, target.constructor.prototype, propertyKey) || [];
    const statuses = status === null ? [null] : (Array.isArray(status) ? status : [status]);
    statuses.forEach(s => {
      errors.push({ status: s, handler: errorHandler });
    });
    Reflect.defineMetadata(META_ERRORS, errors, target.constructor.prototype, propertyKey);
  };
}

export function OnSuccess<ReturnType>(
  status: number | number[],
  handler: (resp: any) => ReturnType | Promise<ReturnType>
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const successes: SuccessHandlerMetadata<ReturnType>[] =
      Reflect.getMetadata(META_SUCCESS, target.constructor.prototype, propertyKey) || [];
    const statuses = Array.isArray(status) ? status : [status];
    successes.push({ status: statuses, handler });
    Reflect.defineMetadata(META_SUCCESS, successes, target.constructor.prototype, propertyKey);
  };
}

export function OnRetrying<ReturnType = void>(
  handler: (retryCount: number, error: AxiosError) => ReturnType | Promise<ReturnType>
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(META_RETRY, handler, target.constructor.prototype, propertyKey);
  };
}
