import { useCallback } from 'react';

interface ErrorHandlerOptions {
  onError?: (error: Error, context?: string) => void;
  logError?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { onError, logError = true } = options;

  const handleError = useCallback((error: Error, context?: string) => {
    if (logError) {
      console.error(`Error in ${context || 'unknown context'}:`, error);
    }
    
    if (onError) {
      onError(error, context);
    }
  }, [onError, logError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};

export default useErrorHandler;
