/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

/**
 * SerializedName decorator - Maps a TypeScript property name to a different JSON property name.
 * Useful when the API uses different naming conventions (e.g., snake_case vs camelCase).
 * 
 * @param name - The name to use in the JSON request/response
 * 
 * @example
 * ```typescript
 * class User {
 *   @SerializedName('first_name')
 *   firstName: string;
 * 
 *   @SerializedName('last_name')
 *   lastName: string;
 * }
 * ```
 */
export function SerializedName(name: string) {
  return function (target: any, propertyKey: string | symbol) {
    // Store the serialized name for this property
    const metadataKey = Symbol(`serializedName:${String(propertyKey)}`);
    Reflect.defineMetadata(metadataKey, name, target, propertyKey);
  } as any;
}

/**
 * AliasAs decorator - Alternative name for SerializedName.
 * Maps a TypeScript property name to a different JSON property name.
 * 
 * @param name - The name to use in the JSON request/response
 * 
 * @example
 * ```typescript
 * class User {
 *   @AliasAs('first_name')
 *   firstName: string;
 * }
 * ```
 */
export function AliasAs(name: string) {
  return SerializedName(name);
}

