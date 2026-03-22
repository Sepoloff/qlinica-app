/**
 * useUnmount Hook - Run effect only on component unmount
 */

import { useEffect } from 'react';

export const useUnmount = (callback: () => void) => {
  useEffect(() => {
    return callback;
  }, []);
};
