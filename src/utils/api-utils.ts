/**
 * API utility functions for the backend
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

/**
 * Handles API errors and returns a standardized error response
 * @param error The error to handle
 * @returns HttpException with appropriate status and message
 */
export function handleApiError(error: any): HttpException {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return new HttpException(
        {
          statusCode: axiosError.response.status,
          message: `External API error: ${axiosError.response.statusText}`,
          error: axiosError.response.data
        },
        axiosError.response.status
      );
    } else if (axiosError.request) {
      // The request was made but no response was received
      return new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'External API did not respond',
          error: 'Service Unavailable'
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      return new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error setting up request: ${axiosError.message}`,
          error: 'Internal Server Error'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // Generic error handling
  return new HttpException(
    {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'An unexpected error occurred',
      error: 'Internal Server Error'
    },
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}

/**
 * Creates a cache key for API requests
 * @param baseKey The base key for the cache
 * @param params Additional parameters to include in the key
 * @returns Cache key string
 */
export function createCacheKey(baseKey: string, params?: Record<string, any>): string {
  if (!params) {
    return baseKey;
  }
  
  const paramString = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  return `${baseKey}?${paramString}`;
}
