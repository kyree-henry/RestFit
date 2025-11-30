/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse, AxiosRequestConfig } from 'axios';

/**
 * HTTP Success Status Codes (2xx)
 */
export type SuccessStatusCode =
  | 200 // OK
  | 201 // Created
  | 202 // Accepted
  | 203 // Non-Authoritative Information
  | 204 // No Content
  | 205 // Reset Content
  | 206 // Partial Content
  | 207 // Multi-Status
  | 208 // Already Reported
  | 226; // IM Used

/**
 * HTTP Error Status Codes (4xx, 5xx)
 */
export type ErrorStatusCode =
  | 400 // Bad Request
  | 401 // Unauthorized
  | 402 // Payment Required
  | 403 // Forbidden
  | 404 // Not Found
  | 405 // Method Not Allowed
  | 406 // Not Acceptable
  | 407 // Proxy Authentication Required
  | 408 // Request Timeout
  | 409 // Conflict
  | 410 // Gone
  | 411 // Length Required
  | 412 // Precondition Failed
  | 413 // Payload Too Large
  | 414 // URI Too Long
  | 415 // Unsupported Media Type
  | 416 // Range Not Satisfiable
  | 417 // Expectation Failed
  | 418 // I'm a teapot
  | 421 // Misdirected Request
  | 422 // Unprocessable Entity
  | 423 // Locked
  | 424 // Failed Dependency
  | 425 // Too Early
  | 426 // Upgrade Required
  | 428 // Precondition Required
  | 429 // Too Many Requests
  | 431 // Request Header Fields Too Large
  | 451 // Unavailable For Legal Reasons
  | 500 // Internal Server Error
  | 501 // Not Implemented
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504 // Gateway Timeout
  | 505 // HTTP Version Not Supported
  | 506 // Variant Also Negotiates
  | 507 // Insufficient Storage
  | 508 // Loop Detected
  | 510 // Not Extended
  | 511; // Network Authentication Required

/**
 * Extended AxiosResponse with helper methods
 */
export interface ExtendedAxiosResponse<T = any> extends AxiosResponse<T> {
  /**
   * Throws an error if the status code is not in the 2xx range
   * @throws {Error} If status code is not successful
   */
  ensureSuccessStatusCode(): void;

  /**
   * Checks if the status code is in the 2xx range
   * @returns {boolean} True if status is successful (2xx)
   */
  isSuccessStatusCode(): boolean;

  /**
   * Creates a clone of the response with a new status code
   * @param {number} statusCode - The new status code
   * @returns {ExtendedAxiosResponse} A new response object with the updated status code
   */
  cloneWithStatusCode(statusCode: number): ExtendedAxiosResponse<T>;

  /**
   * Creates a success response (static method)
   * @param {any} data - The response data
   * @param {SuccessStatusCode} statusCode - The success status code (default: 200)
   * @param {AxiosRequestConfig} config - Optional request config
   * @returns {ExtendedAxiosResponse} A success response object
   */
  createSuccess(data: any, statusCode?: SuccessStatusCode, config?: AxiosRequestConfig): ExtendedAxiosResponse<T>;

  /**
   * Creates an error response (static method)
   * @param {any} data - The error data
   * @param {ErrorStatusCode} statusCode - The error status code (default: 500)
   * @param {AxiosRequestConfig} config - Optional request config
   * @returns {ExtendedAxiosResponse} An error response object
   */
  createError(data: any, statusCode?: ErrorStatusCode, config?: AxiosRequestConfig): ExtendedAxiosResponse<T>;
}

/**
 * Extends an AxiosResponse with helper methods
 */
export function extendResponse<T = any>(response: AxiosResponse<T>): ExtendedAxiosResponse<T> {
  const extended = response as ExtendedAxiosResponse<T>;

  extended.ensureSuccessStatusCode = function (): void {
    if (!this.isSuccessStatusCode()) {
      throw new Error(`HTTP ${this.status} Error: ${this.statusText || 'Request failed'}`);
    }
  };

  extended.isSuccessStatusCode = function (): boolean {
    return this.status >= 200 && this.status < 300;
  };

  extended.cloneWithStatusCode = function (statusCode: number): ExtendedAxiosResponse<T> {
    const cloned = {
      ...this,
      status: statusCode,
      statusText: getStatusText(statusCode),
    } as ExtendedAxiosResponse<T>;

    // Re-apply extensions to the cloned response
    return extendResponse(cloned);
  };

  extended.createSuccess = function (data: any, statusCode: SuccessStatusCode = 200, config?: AxiosRequestConfig): ExtendedAxiosResponse<T> {
    return createSuccessResponse(data, statusCode, config || this.config);
  };

  extended.createError = function (data: any, statusCode: ErrorStatusCode = 500, config?: AxiosRequestConfig): ExtendedAxiosResponse<T> {
    return createErrorResponse(data, statusCode, config || this.config);
  };

  return extended;
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T = any>(
  data: any,
  statusCode: SuccessStatusCode = 200,
  config?: AxiosRequestConfig
): ExtendedAxiosResponse<T> {
  const response = {
    data,
    status: statusCode,
    statusText: getStatusText(statusCode),
    headers: {},
    config: config || {},
  } as AxiosResponse<T>;

  return extendResponse(response);
}

/**
 * Creates an error response
 */
export function createErrorResponse<T = any>(
  data: any,
  statusCode: ErrorStatusCode = 500,
  config?: AxiosRequestConfig
): ExtendedAxiosResponse<T> {
  const response = {
    data,
    status: statusCode,
    statusText: getStatusText(statusCode),
    headers: {},
    config: config || {},
  } as AxiosResponse<T>;

  return extendResponse(response);
}

/**
 * Gets the standard HTTP status text for a status code
 */
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    // 1xx Informational
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',

    // 2xx Success
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',

    // 3xx Redirection
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Switch Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',

    // 4xx Client Error
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',

    // 5xx Server Error
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
  };

  return statusTexts[statusCode] || 'Unknown';
}

