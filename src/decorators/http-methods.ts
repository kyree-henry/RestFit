/* eslint-disable @typescript-eslint/no-explicit-any */
import { Method } from 'axios';
import { META_METHOD, META_PATH } from '../constants/metadata';

export function Get<ReturnType>(path: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    Reflect.defineMetadata(META_METHOD, 'GET' as Method, target.constructor.prototype, propertyKey);
    Reflect.defineMetadata(META_PATH, path, target.constructor.prototype, propertyKey);
    if (descriptor) {
      descriptor.value = async function (...args: any[]): Promise<ReturnType> {
        throw new Error('Method not implemented by decorator');
      };
    }
  } as any;
}

export function Post<ReturnType = unknown>(path: string) {
  return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
    Reflect.defineMetadata(META_METHOD, 'POST' as Method, target.constructor.prototype, propertyKey);
    Reflect.defineMetadata(META_PATH, path, target.constructor.prototype, propertyKey);
    if (descriptor) {
      descriptor.value = async function (...args: any[]) {
        return {} as ReturnType;
      };
    }
  } as any;
}

export function Put<ReturnType = unknown>(path: string) {
  return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
    Reflect.defineMetadata(META_METHOD, 'PUT' as Method, target.constructor.prototype, propertyKey);
    Reflect.defineMetadata(META_PATH, path, target.constructor.prototype, propertyKey);
    if (descriptor) {
      descriptor.value = async function (...args: any[]) {
        return {} as ReturnType;
      };
    }
  } as any;
}

export function Patch<ReturnType = unknown>(path: string) {
  return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
    Reflect.defineMetadata(META_METHOD, 'PATCH' as Method, target.constructor.prototype, propertyKey);
    Reflect.defineMetadata(META_PATH, path, target.constructor.prototype, propertyKey);
    if (descriptor) {
      descriptor.value = async function (...args: any[]) {
        return {} as ReturnType;
      };
    }
  } as any;
}

export function Delete<ReturnType = unknown>(path: string) {
  return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
    Reflect.defineMetadata(META_METHOD, 'DELETE' as Method, target.constructor.prototype, propertyKey);
    Reflect.defineMetadata(META_PATH, path, target.constructor.prototype, propertyKey);
    if (descriptor) {
      descriptor.value = async function (...args: any[]) {
        return {} as ReturnType;
      };
    }
  } as any;
}

