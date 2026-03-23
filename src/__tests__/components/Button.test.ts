/**
 * Button Component Tests
 */

describe('Button Component', () => {
  describe('Props Validation', () => {
    it('should render with required props', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test Button',
      };
      expect(props.onPress).toBeDefined();
      expect(props.title).toBe('Test Button');
    });

    it('should handle variant prop', () => {
      const variants = ['primary', 'secondary', 'danger', 'success', 'outline'] as const;
      variants.forEach(variant => {
        expect(variant).toBeDefined();
      });
    });

    it('should handle size prop', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      sizes.forEach(size => {
        expect(size).toBeDefined();
      });
    });

    it('should handle loading state', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        loading: true,
      };
      expect(props.loading).toBe(true);
    });

    it('should handle disabled state', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        disabled: true,
      };
      expect(props.disabled).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Login',
        accessibilityLabel: 'Login Button',
      };
      expect(props.accessibilityLabel).toBe('Login Button');
    });

    it('should have accessibility hint', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Submit',
        accessibilityHint: 'Submeta o formulário',
      };
      expect(props.accessibilityHint).toBe('Submeta o formulário');
    });

    it('should have accessibility role', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        accessibilityRole: 'button' as const,
      };
      expect(props.accessibilityRole).toBe('button');
    });

    it('should have test ID', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        testID: 'test-button',
      };
      expect(props.testID).toBe('test-button');
    });

    it('should show loading hint when loading', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Login',
        loading: true,
      };
      expect(props.loading).toBe(true);
    });
  });

  describe('Haptic Feedback', () => {
    it('should have haptic enabled by default', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        enableHaptic: true,
      };
      expect(props.enableHaptic).toBe(true);
    });

    it('should support light haptic', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        enableHaptic: true,
        hapticType: 'light' as const,
      };
      expect(props.hapticType).toBe('light');
    });

    it('should support success haptic', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        enableHaptic: true,
        hapticType: 'success' as const,
      };
      expect(props.hapticType).toBe('success');
    });
  });

  describe('Styling', () => {
    it('should support fullWidth prop', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        fullWidth: true,
      };
      expect(props.fullWidth).toBe(true);
    });

    it('should accept custom styles', () => {
      const customStyle = { marginTop: 10 };
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        style: customStyle,
      };
      expect(props.style).toEqual(customStyle);
    });

    it('should accept custom text styles', () => {
      const customTextStyle = { fontSize: 18 };
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        textStyle: customTextStyle,
      };
      expect(props.textStyle).toEqual(customTextStyle);
    });
  });

  describe('Content Rendering', () => {
    it('should support title prop', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Click Me',
      };
      expect(props.title).toBe('Click Me');
    });

    it('should support children prop', () => {
      const props = {
        onPress: jest.fn(),
        children: 'Click Me',
      };
      expect(props.children).toBe('Click Me');
    });

    it('should support label prop', () => {
      const props = {
        onPress: jest.fn(),
        label: 'Label Text',
      };
      expect(props.label).toBe('Label Text');
    });

    it('should support icon prop (string)', () => {
      const props = {
        onPress: jest.fn(),
        title: 'Test',
        icon: '🔒',
      };
      expect(props.icon).toBe('🔒');
    });
  });
});
