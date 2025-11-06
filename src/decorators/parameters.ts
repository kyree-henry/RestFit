/* eslint-disable @typescript-eslint/no-explicit-any */
import { META_PARAMS } from '../constants/metadata';

export function Header(headerName: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const params = Reflect.getMetadata(META_PARAMS, target.constructor.prototype, propertyKey) || new Array(10).fill(null);
    params[parameterIndex] = { type: 'header', name: headerName, index: parameterIndex };
    Reflect.defineMetadata(META_PARAMS, params, target.constructor.prototype, propertyKey);
  } as any;
}

export function Query(paramName: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const params = Reflect.getMetadata(META_PARAMS, target.constructor.prototype, propertyKey) || new Array(10).fill(null);
    params[parameterIndex] = { type: 'query', name: paramName, index: parameterIndex };
    Reflect.defineMetadata(META_PARAMS, params, target.constructor.prototype, propertyKey);
  } as any;
}

export function Path(paramName: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const params = Reflect.getMetadata(META_PARAMS, target.constructor.prototype, propertyKey) || new Array(10).fill(null);
    params[parameterIndex] = { type: 'path', name: paramName, index: parameterIndex };
    Reflect.defineMetadata(META_PARAMS, params, target.constructor.prototype, propertyKey);
  } as any;
}

export function Body() {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const params = Reflect.getMetadata(META_PARAMS, target.constructor.prototype, propertyKey) || new Array(10).fill(null);
    params[parameterIndex] = { type: 'body', name: null, index: parameterIndex };
    Reflect.defineMetadata(META_PARAMS, params, target.constructor.prototype, propertyKey);
  } as any;
}

