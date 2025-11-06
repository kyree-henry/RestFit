/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from 'axios';
import { META_ERRORS, META_SUCCESS } from '../constants/metadata';
import { SuccessHandlerMetadata } from '../types';

export function OnError<ReturnType>(
  status: number | number[] | null,
  handler: (error: AxiosError) => ReturnType | Promise<ReturnType>
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const errors = Reflect.getMetadata(META_ERRORS, target.constructor.prototype, propertyKey) || [];
    const statuses = status === null ? [null] : (Array.isArray(status) ? status : [status]);
    statuses.forEach(s => {
      errors.push({ status: s, handler });
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

