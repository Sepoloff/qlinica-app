import {
  FormSubmissionManager,
  FormValidationManager,
  FormManager,
  createFormState,
} from '../../utils/formSubmissionHelper';

describe('formSubmissionHelper', () => {
  describe('FormSubmissionManager', () => {
    let manager: FormSubmissionManager;

    beforeEach(() => {
      manager = new FormSubmissionManager();
    });

    afterEach(() => {
      manager.cleanup();
    });

    it('should initialize with default state', () => {
      const state = manager.getState();
      expect(state.isSubmitting).toBe(false);
      expect(state.isSuccess).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle successful submission', async () => {
      const mockFn = jest.fn().mockResolvedValue({ id: '123' });
      const onSuccess = jest.fn();

      const result = await manager.submit(mockFn, {
        onSuccess,
        successMessage: 'Success!',
      });

      expect(result).toEqual({ id: '123' });
      expect(onSuccess).toHaveBeenCalledWith({ id: '123' });

      const state = manager.getState();
      expect(state.isSuccess).toBe(true);
      expect(state.successMessage).toBe('Success!');
    }, 10000);

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      const mockFn = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      const result = await manager.submit(mockFn, { onError });

      expect(result).toBeNull();
      expect(onError).toHaveBeenCalledWith(error);

      const state = manager.getState();
      expect(state.error).toBe('Submission failed');
      expect(state.isSuccess).toBe(false);
    }, 10000);

    it('should prevent duplicate submissions', async () => {
      const mockFn = jest.fn(
        () => new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      const promise1 = manager.submit(mockFn);

      // Try to submit again while first is pending
      await expect(manager.submit(mockFn)).rejects.toThrow(
        'Submission already in progress'
      );

      await promise1;
    }, 10000);

    it('should reset state', () => {
      const state = manager.getState();
      state.isSuccess = true;
      state.error = 'Some error';

      manager.reset();

      const resetState = manager.getState();
      expect(resetState.isSuccess).toBe(false);
      expect(resetState.error).toBeNull();
    });

    it('should notify listeners on state change', async () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      const mockFn = jest.fn().mockResolvedValue({});
      await manager.submit(mockFn);

      expect(listener).toHaveBeenCalled();
    }, 10000);
  });

  describe('FormValidationManager', () => {
    let manager: FormValidationManager;

    beforeEach(() => {
      manager = new FormValidationManager();
    });

    it('should set field errors', () => {
      manager.setFieldError('email', 'Invalid email');

      const state = manager.getState();
      expect(state.email.error).toBe('Invalid email');
      expect(state.email.isValid).toBe(false);
    });

    it('should clear field errors', () => {
      manager.setFieldError('email', 'Invalid email');
      manager.setFieldError('email', null);

      const state = manager.getState();
      expect(state.email.error).toBeNull();
      expect(state.email.isValid).toBe(true);
    });

    it('should track touched fields', () => {
      manager.touchField('email');

      const state = manager.getState();
      expect(state.email.isTouched).toBe(true);
    });

    it('should check form validity', () => {
      manager.setFieldError('email', 'Invalid');
      expect(manager.isFormValid()).toBe(false);

      manager.setFieldError('email', null);
      expect(manager.isFormValid()).toBe(true);
    });

    it('should get all errors', () => {
      manager.setFieldError('email', 'Invalid email');
      manager.setFieldError('password', 'Too short');

      const errors = manager.getErrors();
      expect(errors.email).toBe('Invalid email');
      expect(errors.password).toBe('Too short');
    });

    it('should reset field', () => {
      manager.setFieldError('email', 'Invalid');
      manager.resetField('email');

      const state = manager.getState();
      expect(state.email).toBeUndefined();
    });

    it('should reset all fields', () => {
      manager.setFieldError('email', 'Invalid');
      manager.setFieldError('password', 'Too short');
      manager.resetAll();

      const state = manager.getState();
      expect(Object.keys(state).length).toBe(0);
    });
  });

  describe('FormManager', () => {
    let manager: FormManager;

    beforeEach(() => {
      manager = new FormManager();
    });

    afterEach(() => {
      manager.cleanup();
    });

    it('should combine submission and validation', async () => {
      const mockFn = jest.fn().mockResolvedValue({});

      manager.getValidationManager().setFieldError('email', null);
      expect(manager.canSubmit()).toBe(true);

      await manager.submit(mockFn);

      const submissionState = manager.getSubmissionManager().getState();
      expect(submissionState.isSuccess).toBe(true);
    }, 10000);

    it('should prevent submission if form is invalid', async () => {
      const mockFn = jest.fn();

      manager.getValidationManager().setFieldError('email', 'Invalid');

      await expect(manager.submit(mockFn)).rejects.toThrow(
        'Form has validation errors'
      );
    }, 10000);
  });

  describe('createFormState', () => {
    it('should create form state helper', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const initialValues = { email: 'test@example.com', password: '123456' };

      const form = createFormState(initialValues, onSubmit);

      expect(form.isFormValid()).toBe(true);
      expect(form.canSubmit()).toBe(true);

      await form.submit();

      expect(onSubmit).toHaveBeenCalledWith(initialValues);

      form.cleanup();
    }, 10000);

    it('should track validation errors', () => {
      const form = createFormState(
        { email: '', password: '' },
        async () => {}
      );

      form.setFieldError('email', 'Invalid email');

      const errors = form.getErrors();
      expect(errors.email).toBe('Invalid email');
      expect(form.isFormValid()).toBe(false);

      form.cleanup();
    });
  });
});
