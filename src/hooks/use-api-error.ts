import { useState, useCallback } from "react";

/**
 * Hook for handling API errors consistently
 */
export const useApiError = () => {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError("An unknown error occurred");
    }
  }, []);

  return { error, setError, clearError, handleError };
};
