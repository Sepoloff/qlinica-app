/**
 * Test Service - Unit testing utilities
 */

export class TestableService {
  protected logDebug(message: string, data?: any) {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  protected logError(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
  }

  protected logInfo(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data || '');
  }

  protected logWarn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }
}

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const expectAsync = async (fn: () => Promise<void>) => {
  return fn();
};

export const expectToThrow = async (fn: () => Promise<any>) => {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    return error;
  }
};
