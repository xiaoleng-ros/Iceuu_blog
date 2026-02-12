'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseSearchOverlayProps {
  isOpen: boolean;
}

export function useSearchState({ isOpen }: UseSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const clearError = useCallback(() => setError(false), []);

  return { query, setQuery, error, setError, clearError };
}

interface UseSearchSubmitParams {
  query: string;
  error: boolean;
  onClose: () => void;
  setQuery: (value: string) => void;
  setError: (value: boolean) => void;
}

export function useSearchSubmit({ query, onClose, setQuery, setError }: UseSearchSubmitParams) {
  const router = useRouter();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
      setError(false);
    } else {
      setError(true);
    }
  }, [query, router, onClose, setQuery, setError]);

  return { handleSubmit };
}
