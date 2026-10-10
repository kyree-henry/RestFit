/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

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
 * Mutable request configuration exposed inside interceptors.
 * Provides chainable setters so you can modify the request before replaying it
 * via `response.retry()`.
 */
export interface InterceptorRequestConfig extends AxiosRequestConfig {
  /**
   * Sets or replaces a single request header.
   * @returns The config itself for chaining.
   */
  setHeader(name: string, value: string): InterceptorRequestConfig;

  /**
   * Removes a request header by name (case-insensitive match).
   * @returns The config itself for chaining.
   */
  removeHeader(name: string): InterceptorRequestConfig;

  /**
   * Merges an object of headers into the existing headers.
   * @returns The config itself for chaining.
   */
  mergeHeaders(headers: Record<string, string>): InterceptorRequestConfig;

  /**
   * Sets or replaces a single query parameter.
   * @returns The config itself for chaining.
   */
  setQueryParam(name: string, value: any): InterceptorRequestConfig;

  /**
   * Removes a query parameter.
   * @returns The config itself for chaining.
   */
  removeQueryParam(name: string): InterceptorRequestConfig;

  /**
   * Replaces the request body / data payload.
   * @returns The config itself for chaining.
   */
  setBody(data: any): InterceptorRequestConfig;

  /**
   * Overwrites the URL path (relative to `baseURL`).
   * @returns The config itself for chaining.
   */
  setUrl(url: string): InterceptorRequestConfig;
}

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

  /**
   * The original request configuration for this response.
   * This is a mutable `InterceptorRequestConfig` — you can modify headers,
   * query params, body, or URL and then call `retry()` to re-send the request.
   *
   * @example
   * ```typescript
   * @ResponseInterceptor(async (response) => {
   *   if (response.status === 401) {
   *     const newToken = await refreshToken();
   *     response.request.setHeader('Authorization', `Bearer ${newToken}`);
   *     return response.retry();
   *   }
   * })
   * ```
   */
  request: InterceptorRequestConfig;

  /**
   * Re-sends the request using the (optionally modified) request config.
   *
   * You can modify `response.request` before calling this, or pass an
   * entirely new config to override specific fields.
   *
   * @param {AxiosRequestConfig} [overrides] - Optional config overrides merged
   *   on top of the current request config.
   * @returns {Promise<ExtendedAxiosResponse>} The new response from the replayed request.
   *
   * @example
   * ```typescript
   * // Retry with the same config (e.g. after refreshing a token in-place)
   * return response.retry();
   *
   * // Retry with overrides
   * return response.retry({ params: { page: 2 } });
   * ```
   */
  retry(overrides?: AxiosRequestConfig): Promise<ExtendedAxiosResponse>;

  /** @internal Reference to the axios instance for retry(). */
  __axiosInstance?: AxiosInstance;
}

/**
 * Extends a raw AxiosRequestConfig with chainable setter methods.
 */
export function extendRequestConfig(config: AxiosRequestConfig): InterceptorRequestConfig {
  const ext = config as InterceptorRequestConfig;

  ext.setHeader = function (name: string, value: string): InterceptorRequestConfig {
    if (!this.headers) this.headers = {};
    (this.headers as Record<string, string>)[name] = value;
    return this;
  };

  ext.removeHeader = function (name: string): InterceptorRequestConfig {
    if (this.headers) {
      const lowerName = name.toLowerCase();
      for (const key of Object.keys(this.headers as Record<string, any>)) {
        if (key.toLowerCase() === lowerName) {
          delete (this.headers as Record<string, any>)[key];
        }
      }
    }
    return this;
  };

  ext.mergeHeaders = function (headers: Record<string, string>): InterceptorRequestConfig {
    if (!this.headers) this.headers = {};
    Object.assign(this.headers, headers);
    return this;
  };

  ext.setQueryParam = function (name: string, value: any): InterceptorRequestConfig {
    if (!this.params) this.params = {};
    this.params[name] = value;
    return this;
  };

  ext.removeQueryParam = function (name: string): InterceptorRequestConfig {
    if (this.params) delete this.params[name];
    return this;
  };

  ext.setBody = function (data: any): InterceptorRequestConfig {
    this.data = data;
    return this;
  };

  ext.setUrl = function (url: string): InterceptorRequestConfig {
    this.url = url;
    return this;
  };

  return ext;
}

/**
 * Extends an AxiosResponse with helper methods.
 *
 * @param response    - The raw Axios response.
 * @param axiosInst   - Optional. The AxiosInstance used to make the request.
 *                      When provided, `response.retry()` becomes functional.
 */
export function extendResponse<T = any>(
  response: AxiosResponse<T>,
  axiosInst?: AxiosInstance
): ExtendedAxiosResponse<T> {
  const extended = response as ExtendedAxiosResponse<T>;

  // Preserve an already-attached instance when re-extending (e.g. after cloneWithStatusCode)
  if (axiosInst) {
    extended.__axiosInstance = axiosInst;
  }

  // ── Build the mutable request config ──────────────────────────
  extended.request = extendRequestConfig({ ...(response.config || {}) });

  // ── Helper methods ────────────────────────────────────────────

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

    // Re-apply extensions to the cloned response (pass instance through)
    return extendResponse(cloned, this.__axiosInstance);
  };

  extended.createSuccess = function (data: any, statusCode: SuccessStatusCode = 200, config?: AxiosRequestConfig): ExtendedAxiosResponse<T> {
    return createSuccessResponse(data, statusCode, config || this.config, this.__axiosInstance);
  };

  extended.createError = function (data: any, statusCode: ErrorStatusCode = 500, config?: AxiosRequestConfig): ExtendedAxiosResponse<T> {
    return createErrorResponse(data, statusCode, config || this.config, this.__axiosInstance);
  };

  // ── retry() ───────────────────────────────────────────────────
  extended.retry = async function (overrides?: AxiosRequestConfig): Promise<ExtendedAxiosResponse> {
    const instance = this.__axiosInstance;
    if (!instance) {
      throw new Error(
        'retry() is not available: no axios instance is attached to this response. ' +
        'retry() is only available inside @ResponseInterceptor handlers and global responseInterceptors.'
      );
    }

    // Merge the (potentially mutated) request config with any overrides
    const retryConfig: AxiosRequestConfig = {
      ...this.request,
      ...(overrides || {}),
    };
    if (overrides?.headers) {
      retryConfig.headers = {
        ...(this.request.headers as Record<string, any> || {}),
        ...(overrides.headers as Record<string, any>),
      };
    }
    if (overrides?.params) {
      retryConfig.params = {
        ...(this.request.params || {}),
        ...overrides.params,
      };
    }

    const newResponse = await instance(retryConfig);
    return extendResponse(newResponse, instance);
  };

  return extended;
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T = any>(
  data: any,
  statusCode: SuccessStatusCode = 200,
  config?: AxiosRequestConfig,
  axiosInst?: AxiosInstance
): ExtendedAxiosResponse<T> {
  const response = {
    data,
    status: statusCode,
    statusText: getStatusText(statusCode),
    headers: {},
    config: config || {},
  } as AxiosResponse<T>;

  return extendResponse(response, axiosInst);
}

/**
 * Creates an error response
 */
export function createErrorResponse<T = any>(
  data: any,
  statusCode: ErrorStatusCode = 500,
  config?: AxiosRequestConfig,
  axiosInst?: AxiosInstance
): ExtendedAxiosResponse<T> {
  const response = {
    data,
    status: statusCode,
    statusText: getStatusText(statusCode),
    headers: {},
    config: config || {},
  } as AxiosResponse<T>;

  return extendResponse(response, axiosInst);
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

