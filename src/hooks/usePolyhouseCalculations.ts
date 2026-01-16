import { useState, useCallback } from 'react';
import { PolyhouseConfig, CalculationResult } from '@/types/polyhouse';
import { supabase } from '@/integrations/supabase/client';

export function usePolyhouseCalculations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = useCallback(async (config: PolyhouseConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('calculate-polyhouse', {
        body: config,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Calculation failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { calculate, isLoading, error, result };
}

export function useCropSuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const getSuggestions = useCallback(async (config: PolyhouseConfig, climate: any) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('crop-suggestions', {
        body: { config, climate },
      });

      if (error) throw error;
      setSuggestions(data.suggestions);
      return data.suggestions;
    } catch (err) {
      console.error('Failed to get crop suggestions:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getSuggestions, isLoading, suggestions };
}
