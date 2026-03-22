/**
 * useMount Hook - Run effect only on component mount
 */

import { useEffect } from 'react';

export const useMount = (callback: () => void | (() => void)) => {
  useEffect(() => {
    const cleanup = callback();
    return cleanup;
  }, []);
};
