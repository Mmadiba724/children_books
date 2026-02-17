import axios, { AxiosError } from 'axios';
import tokenStorage from './tokenStorage';

export interface ErrorResponse {
    status: number;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp?: string;
}

export interface ErrorHandlerOptions {
    serviceName?: string;
    customMessages?: Record<number, string>;
    throwError?: boolean;
    logError?: boolean;
}

export type ErrorType = AxiosError | TypeError | Error | ErrorResponse;

// Default error messages for common HTTP status codes
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
    400: 'Bad request. Please check your input and try again.',
    401: 'Unauthorized. Please log in again.',
    403: 'Forbidden. You do not have permission to access this resource.',
    404: 'The requested resource was not found.',
    409: 'Conflict. The resource already exists or has been modified.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. Please try again later.',
};

/**
 * Helper to handle Axios errors and extract error response.
 */
function handleAxiosError(
    error: AxiosError,
    customMessages: Record<number, string>
): ErrorResponse {
    const status = error.response?.status || 500;
    const responseData: Record<string, unknown> | undefined = error.response?.data as Record<string, unknown> | undefined;

    // Extract details from responseData
    let details: Record<string, unknown> | undefined;
    if (typeof responseData?.details === 'object' && responseData?.details !== null) {
        details = responseData.details as Record<string, unknown>;
    } else if (typeof responseData?.errors === 'object' && responseData?.errors !== null) {
        details = responseData.errors as Record<string, unknown>;
    } else {
        details = undefined;
    }

    let message =
        customMessages[status] ||
        (typeof responseData?.message === 'string'
            ? responseData.message
            : JSON.stringify(responseData?.message ?? '')) ||
        DEFAULT_ERROR_MESSAGES[status] ||
        DEFAULT_ERROR_MESSAGES[500];

    // Handle specific error cases
    if (status === 429) {
        message = 'Too many requests. Please wait before retrying.';
    }

    return {
        status,
        message,
        code: typeof responseData?.code === 'string' ? responseData.code : `ERROR_${status}`,
        details,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Global error handler for API services
 * Parses and formats errors with customizable messages and logging
 *
 * @param error - The error object (typically AxiosError)
 * @param options - Configuration options for error handling
 * @returns Formatted error response
 */
export const handleError = (
    error: ErrorType,
    options: ErrorHandlerOptions = {}
): ErrorResponse => {
    const {
        serviceName = 'API',
        customMessages = {},
        throwError = false,
        logError = true,
    } = options;

    let errorResponse: ErrorResponse = {
        status: 500,
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    };

    if (axios.isAxiosError(error)) {
        errorResponse = handleAxiosError(error as AxiosError, customMessages);

        // Handle specific error cases outside helper for side effects
        const status = error.response?.status || 500;
        if (status === 401) {
            // Clear auth tokens on unauthorized
            tokenStorage.clearAll();
        }
    } else if (error instanceof TypeError) {
        // Network errors
        errorResponse = {
            status: 0,
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
            details: { message: error.message },
            timestamp: new Date().toISOString(),
        };
    } else if (error instanceof Error) {
        // Generic JS errors
        errorResponse = {
            status: 500,
            message: error.message || 'An unexpected error occurred',
            code: 'ERROR',
            details: { stack: error.stack },
            timestamp: new Date().toISOString(),
        };
    }

    // Log error if enabled
    if (logError) {
        console.error(
            `[${serviceName}] Error (${errorResponse.code}):`,
            errorResponse
        );
    }

    // Throw error if enabled
    if (throwError) {
        throw errorResponse;
    }

    return errorResponse;
};

/**
 * Wrapped error handler for async operations
 * Use with try-catch blocks
 *
 * @param error - The error object
 * @param context - Context information for the error
 * @returns Formatted error response
 */
export const asyncErrorHandler = (
    error: ErrorType,
    context: ErrorHandlerOptions & { operation?: string }
): ErrorResponse => {
    const { operation = 'Operation' } = context;

    if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const customMessage = context.customMessages?.[status];

        if (!customMessage && context.customMessages) {
            context.customMessages[status] = `${operation} failed`;
        }
    }

    return handleError(error, context);
};

/**
 * Error handler for specific service with preset configuration
 * Factory function to create service-specific error handlers
 *
 * @param serviceName - Name of the service
 * @param customMessages - Service-specific error messages
 * @returns Configured error handler function
 */
export const createServiceErrorHandler = (
    serviceName: string,
    customMessages?: Record<number, string>
) => {
    return (error: ErrorType, additionalOptions?: Partial<ErrorHandlerOptions>) => {
        return handleError(error, {
            serviceName,
            customMessages,
            ...additionalOptions,
        });
    };
};

/**
 * Check if error is a specific HTTP status
 *
 * @param error - The error object or ErrorResponse
 * @param status - HTTP status code to check
 * @returns True if error matches the status
 */
export const isErrorStatus = (
    error: ErrorType,
    status: number
): boolean => {
    if ('status' in error && error.status === status) return true;
    if (axios.isAxiosError(error) && error.response?.status === status) {
        return true;
    }
    return false;
};

/**
 * Check if error is a client error (4xx)
 */
export const isClientError = (error: ErrorType): boolean => {
    const status =
        (error instanceof Error && 'status' in error ? (error as ErrorResponse).status : undefined) ||
        (axios.isAxiosError(error) ? error.response?.status : undefined);
    return status ? status >= 400 && status < 500 : false;
};

/**
 * Check if error is a server error (5xx)
 */
export const isServerError = (error: ErrorType): boolean => {
    const status =
        (error instanceof Error && 'status' in error ? (error as ErrorResponse).status : undefined) ||
        (axios.isAxiosError(error) ? error.response?.status : undefined);
    return status ? status >= 500 && status < 600 : false;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: ErrorType): boolean => {
    return (
        (axios.isAxiosError(error) && !error.response) ||
        error instanceof TypeError ||
        (error instanceof Error && 'code' in error && (error as Error & { code: string }).code === 'NETWORK_ERROR')
    );
};

/**
 * Retry logic for failed requests
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Delay between retries in ms
 * @returns Promise that resolves with function result or rejects with error
 */
export const retryRequest = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> => {
    let lastError: ErrorType | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as ErrorType;
            const typedError = error as ErrorType;

            // Don't retry on client errors or auth errors
            if (isClientError(typedError) && !isErrorStatus(typedError, 429)) {
                throw error;
            }

            // Wait before retrying (except on last attempt)
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    throw lastError;
};

export default handleError;
