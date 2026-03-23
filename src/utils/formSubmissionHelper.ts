/**
 * Form Submission Helper
 * Manages form submission lifecycle with loading, error, and success states
 */

export interface FormSubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  successMessage: string | null;
  completedAt: Date | null;
}

export interface FormSubmissionOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  onFinally?: () => void | Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Form submission manager
 */
export class FormSubmissionManager<T = any> {
  private state: FormSubmissionState = {
    isSubmitting: false,
    isSuccess: false,
    error: null,
    successMessage: null,
    completedAt: null,
  };

  private listeners: Array<(state: FormSubmissionState) => void> = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options?: {
    retryCount?: number;
    retryDelay?: number;
  }) {
    this.maxRetries = options?.retryCount ?? 0;
    this.retryDelay = options?.retryDelay ?? 1000;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: FormSubmissionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get current state
   */
  getState(): FormSubmissionState {
    return { ...this.state };
  }

  /**
   * Reset state
   */
  reset(): void {
    this.state = {
      isSubmitting: false,
      isSuccess: false,
      error: null,
      successMessage: null,
      completedAt: null,
    };
    this.retryCount = 0;
    this.notifyListeners();
  }

  /**
   * Submit form with automatic retry and timeout
   */
  async submit<R = T>(
    submitFn: () => Promise<R>,
    options?: FormSubmissionOptions<R>
  ): Promise<R | null> {
    const {
      onSuccess,
      onError,
      onFinally,
      successMessage = 'Operação realizada com sucesso!',
      errorMessage = 'Erro na operação. Tente novamente.',
      timeout = 30000,
    } = options ?? {};

    // Prevent duplicate submissions
    if (this.state.isSubmitting) {
      throw new Error('Submission already in progress');
    }

    this.setState({
      isSubmitting: true,
      error: null,
      isSuccess: false,
    });

    try {
      // Execute with timeout
      const result = await Promise.race([
        submitFn(),
        this.createTimeoutPromise<R>(timeout),
      ]);

      this.setState({
        isSuccess: true,
        successMessage,
        error: null,
        completedAt: new Date(),
      });

      if (onSuccess && result !== undefined) {
        onSuccess(result as R);
      }
      return result as R;
    } catch (error: any) {
      const errorMsg = error?.message ?? errorMessage;

      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await this.delay(this.retryDelay);
        return this.submit(submitFn, options);
      }

      this.setState({
        error: errorMsg,
        isSuccess: false,
        completedAt: new Date(),
      });

      onError?.(error);
      return null;
    } finally {
      this.setState({ isSubmitting: false });
      onFinally?.();
    }
  }

  /**
   * Clear success state after delay
   */
  clearSuccessAfter(delayMs: number = 3000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      if (this.state.isSuccess) {
        this.setState({
          isSuccess: false,
          successMessage: null,
        });
      }
    }, delayMs);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.listeners = [];
  }

  // Private methods

  private setState(partial: Partial<FormSubmissionState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private createTimeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Form validation state manager
 */
export interface ValidationState {
  [fieldName: string]: {
    isValid: boolean;
    error: string | null;
    isDirty: boolean;
    isTouched: boolean;
  };
}

export class FormValidationManager {
  private validationState: ValidationState = {};
  private listeners: Array<(state: ValidationState) => void> = [];

  /**
   * Subscribe to validation changes
   */
  subscribe(listener: (state: ValidationState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Set field validation state
   */
  setFieldError(fieldName: string, error: string | null): void {
    this.validationState[fieldName] = {
      ...this.validationState[fieldName],
      error,
      isValid: !error,
      isDirty: true,
    };
    this.notifyListeners();
  }

  /**
   * Mark field as touched
   */
  touchField(fieldName: string): void {
    this.validationState[fieldName] = {
      ...this.validationState[fieldName],
      isTouched: true,
    };
    this.notifyListeners();
  }

  /**
   * Reset specific field
   */
  resetField(fieldName: string): void {
    delete this.validationState[fieldName];
    this.notifyListeners();
  }

  /**
   * Reset all fields
   */
  resetAll(): void {
    this.validationState = {};
    this.notifyListeners();
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return Object.values(this.validationState).every(field => field.isValid);
  }

  /**
   * Get all errors
   */
  getErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    Object.entries(this.validationState).forEach(([fieldName, state]) => {
      if (state.error) {
        errors[fieldName] = state.error;
      }
    });
    return errors;
  }

  /**
   * Get current state
   */
  getState(): ValidationState {
    return { ...this.validationState };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

/**
 * Combined form manager (submission + validation)
 */
export class FormManager<T = any> {
  private submission: FormSubmissionManager<T>;
  private validation: FormValidationManager;

  constructor(options?: {
    retryCount?: number;
    retryDelay?: number;
  }) {
    this.submission = new FormSubmissionManager(options);
    this.validation = new FormValidationManager();
  }

  /**
   * Get submission manager
   */
  getSubmissionManager(): FormSubmissionManager<T> {
    return this.submission;
  }

  /**
   * Get validation manager
   */
  getValidationManager(): FormValidationManager {
    return this.validation;
  }

  /**
   * Can submit (form is valid and not already submitting)
   */
  canSubmit(): boolean {
    const submissionState = this.submission.getState();
    return !submissionState.isSubmitting && this.validation.isFormValid();
  }

  /**
   * Submit form with validation
   */
  async submit<R = T>(
    submitFn: () => Promise<R>,
    options?: FormSubmissionOptions<R>
  ): Promise<R | null> {
    if (!this.validation.isFormValid()) {
      throw new Error('Form has validation errors');
    }

    return this.submission.submit(submitFn, options);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.submission.cleanup();
  }
}

/**
 * Hook-friendly form state builder
 */
export function createFormState<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void,
  options?: FormSubmissionOptions<void>
) {
  const manager = new FormManager<void>(options);
  const submissionState = manager.getSubmissionManager();
  const validationState = manager.getValidationManager();

  return {
    // State accessors
    getSubmissionState: () => submissionState.getState(),
    getValidationState: () => validationState.getState(),

    // Submission
    submit: async () => {
      return submissionState.submit(
        async () => {
          await Promise.resolve(onSubmit(initialValues));
        },
        options as FormSubmissionOptions<void>
      );
    },

    // Validation
    setFieldError: (field: keyof T, error: string | null) => {
      validationState.setFieldError(String(field), error);
    },
    touchField: (field: keyof T) => {
      validationState.touchField(String(field));
    },
    resetValidation: () => {
      validationState.resetAll();
    },

    // Query
    canSubmit: () => manager.canSubmit(),
    isFormValid: () => validationState.isFormValid(),
    getErrors: () => validationState.getErrors(),

    // Lifecycle
    cleanup: () => manager.cleanup(),

    // Subscriptions
    onSubmissionChange: (listener: (state: FormSubmissionState) => void) => {
      return submissionState.subscribe(listener);
    },
    onValidationChange: (listener: (state: ValidationState) => void) => {
      return validationState.subscribe(listener);
    },
  };
}
