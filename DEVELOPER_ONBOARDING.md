# Qlinica App - Developer Onboarding Guide

Welcome to the Qlinica development team! 🎉

This guide will help you get up to speed with the codebase and development workflows.

---

## 🚀 Getting Started (First 30 minutes)

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/Sepoloff/qlinica-app.git
cd qlinica-app

# Install dependencies
npm install

# Setup git config (if needed)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Understand the Project Structure
```
qlinica-app/
├── App.tsx                 # Main entry point & navigation setup
├── src/
│   ├── screens/           # 10 app screens
│   ├── components/        # 45+ reusable UI components
│   ├── context/           # 6 Context API providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API & business logic
│   ├── utils/             # Helper functions
│   └── constants/         # Colors, mock data, messages
└── docs/                  # Documentation
```

### 3. Read Key Documentation
Priority order:
1. **README.md** - Project overview & setup
2. **API_SPECIFICATION.md** - Backend API contract
3. **TESTING_GUIDE.md** - How to test
4. **SESSION_3_PROGRESS.md** - Current status

### 4. Start the App
```bash
# Option 1: Development server
npm start

# Option 2: iOS simulator (macOS)
npm run ios

# Option 3: Android emulator
npm run android
```

---

## 📚 Architecture Overview

### Context API State Management
```
AuthContext
├── user: User | null
├── isAuthenticated: boolean
├── login(email, password)
├── register(email, password, name)
├── logout()
└── updateUser(userData)

BookingFlowContext
├── bookingState: { serviceId, therapistId, date, time, notes }
├── setBookingState(partial)
├── submitBooking()
└── resetBookingState()

ThemeContext
├── isDark: boolean
├── toggleTheme()
└── theme: colors

ToastContext
├── showToast(message, type)
├── success(message)
├── error(message)
└── warning(message)

NotificationContext
├── notifications: Notification[]
├── addNotification(payload)
└── removeNotification(id)
```

### Key Services
```
bookingService       - CRUD operations for bookings
notificationService  - Push & local notifications
analyticsService     - Event tracking & logging
authStorage          - Token persistence
userStorage          - User profile caching
apiClient            - Wrapped API calls with error handling
```

### Navigation Structure
```
App.tsx
├── RootNavigator
│   ├── AuthStack (if !isAuthenticated)
│   │   ├── LoginScreen
│   │   └── RegisterScreen
│   └── AppStack (if isAuthenticated)
│       ├── MainTabs
│       │   ├── HomeScreen
│       │   ├── BookingsScreen
│       │   └── ProfileScreen
│       └── BookingStack
│           ├── ServiceSelectionScreen
│           ├── TherapistSelectionScreen
│           ├── CalendarSelectionScreen
│           └── BookingSummaryScreen
```

---

## 💻 Development Workflows

### Adding a New Feature

1. **Create a new branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make your changes**
   - Create/modify screen component
   - Add TypeScript types
   - Create custom hook if needed
   - Add to navigation
   - Test locally

3. **Check TypeScript compilation**
   ```bash
   npm run type-check
   ```

4. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add awesome feature

   - Description of what was done
   - Any breaking changes
   - References to tickets/issues"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/feature-name
   ```

### Fixing a Bug

1. **Create bug branch**
   ```bash
   git checkout -b fix/bug-description
   ```

2. **Create a test case that fails**
   - Demonstrate the bug
   - Write test that should pass

3. **Fix the bug**
   - Make minimal changes
   - Ensure test passes

4. **Commit**
   ```bash
   git commit -m "fix: resolve bug with description

   - Root cause
   - Solution
   - Testing"
   ```

### Refactoring Code

1. **Create refactor branch**
   ```bash
   git checkout -b refactor/area-description
   ```

2. **Refactor incrementally**
   - One component/file at a time
   - Keep tests passing
   - Maintain backwards compatibility

3. **Document changes**
   ```bash
   git commit -m "refactor: improve code organization

   - What changed
   - Why it's better
   - Performance impact (if any)"
   ```

---

## 🎨 Code Style & Patterns

### TypeScript
```typescript
// Define interfaces for props
interface ScreenProps {
  route: RouteProp<RootStackParamList, 'ScreenName'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'ScreenName'>;
}

// Use functional components with hooks
export default function MyScreen({ route, navigation }: ScreenProps) {
  const { user } = useAuth();
  const [state, setState] = useState<StateType>(initialValue);

  useEffect(() => {
    // Initialize or subscribe to data
  }, [dependencies]);

  return (
    <View>
      {/* JSX */}
    </View>
  );
}
```

### Custom Hooks
```typescript
// hooks/useMyFeature.ts
export const useMyFeature = () => {
  const [state, setState] = useState();
  
  const action = useCallback(() => {
    // Do something
  }, [dependencies]);

  return { state, action };
};

// Usage
const { state, action } = useMyFeature();
```

### Error Handling
```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

export default function MyScreen() {
  const { handleError, getDisplayMessage, clearError } = useErrorHandler();

  const doSomething = async () => {
    try {
      // API call
    } catch (error) {
      handleError(error, { context: 'MyScreen' });
    }
  };

  return (
    <View>
      {getDisplayMessage() && (
        <AlertBox message={getDisplayMessage()} onClose={clearError} />
      )}
    </View>
  );
}
```

### Form Handling
```typescript
import { useFormValidation, emailRule, passwordRule } from '../hooks/useFormValidation';
import { validateEmail, validatePassword } from '../utils/validation';

export default function LoginForm() {
  const { errors, validate, isValid } = useFormValidation({
    initialValues: { email: '', password: '' },
    validationRules: {
      email: { ...emailRule, message: 'Invalid email' },
      password: { required: true, minLength: 8 },
    },
  });

  const handleSubmit = () => {
    const errors = validate({ email, password });
    if (Object.keys(errors).length === 0) {
      // Submit form
    }
  };

  return (
    <View>
      {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
      {/* Form fields */}
    </View>
  );
}
```

---

## 🧪 Testing

### Manual Testing
Follow the **TESTING_GUIDE.md** for comprehensive testing procedures.

### Unit Tests
```typescript
// __tests__/utils/validation.test.ts
import { validateEmail, validatePassword } from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

### Integration Tests
```typescript
// __tests__/screens/LoginScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/AuthScreens/LoginScreen';

describe('LoginScreen Integration', () => {
  it('should login successfully with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Pass123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      // Assert navigation or state changes
    });
  });
});
```

---

## 🔐 API Integration

### Using the Enhanced API Client
```typescript
import { apiGet, apiPost, apiPut } from '../services/apiClient';

// GET request
const response = await apiGet<Booking[]>('/bookings', { status: 'upcoming' }, 'fetchBookings');
if (response.success) {
  const bookings = response.data;
} else {
  const error = response.error; // AppError type
  console.error(error.userMessage);
}

// POST request
const response = await apiPost('/bookings', bookingData, 'createBooking');
if (!response.success) {
  if (response.error?.retryable) {
    // Show retry button
  }
}
```

### API Response Types
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}

interface AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
  retryable: boolean;
  details?: Record<string, any>;
}
```

---

## 🚨 Common Gotchas

### 1. Context Not Updating
**Problem:** useAuth() hook not updating when user logs in
**Solution:** Ensure AuthProvider wraps all components in App.tsx

```typescript
// ✓ Correct
<AuthProvider>
  <BookingFlowProvider>
    {/* App screens */}
  </BookingFlowProvider>
</AuthProvider>

// ✗ Wrong
<BookingFlowProvider>
  <AuthProvider>
    {/* App screens */}
  </AuthProvider>
</BookingFlowProvider>
```

### 2. Navigation Not Working
**Problem:** Navigation.navigate() throws error
**Solution:** Make sure you're inside a navigable context

```typescript
// ✓ Correct (inside RootNavigator)
function MyScreen() {
  const navigation = useNavigation();
  navigation.navigate('NextScreen');
}

// ✗ Wrong (outside navigator)
function MyComponent() {
  const navigation = useNavigation(); // Error!
}
```

### 3. AsyncStorage Issues
**Problem:** Data not persisting between app restarts
**Solution:** Check AsyncStorage initialization order

```typescript
// Make sure AuthProvider initializes first
useEffect(() => {
  bootstrapAsync(); // This loads from storage
}, []);
```

### 4. TypeScript Errors
**Problem:** TS2749 Circular reference
**Solution:** Extract types to separate files

```typescript
// ✓ types.ts
export interface User { /* ... */ }

// ✓ context.tsx
import { User } from './types';

// ✗ Don't import from hook
```

---

## 📖 Resources

### Internal Documentation
- **README.md** - Project overview
- **API_SPECIFICATION.md** - API contract
- **TESTING_GUIDE.md** - Testing procedures
- **SESSION_3_PROGRESS.md** - Current status

### External Resources
- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Community
- Join team Discord for questions
- Code review process in GitHub
- Sprint planning in Jira/Linear

---

## ✅ Developer Checklist

Before your first commit:
- [ ] Cloned repository successfully
- [ ] npm install completed without errors
- [ ] App runs on iOS simulator or Android emulator
- [ ] Can navigate through all screens
- [ ] Read README.md and API_SPECIFICATION.md
- [ ] Understand the Context API architecture
- [ ] Know how to run tests
- [ ] Set up git config with your name/email
- [ ] Can create and switch branches
- [ ] Understand conventional commit format

Before submitting a PR:
- [ ] Code compiles without TypeScript errors
- [ ] Manual testing done (follow TESTING_GUIDE.md)
- [ ] Console has no warnings/errors
- [ ] Tests passing
- [ ] Code follows style guide
- [ ] PR has descriptive title and description
- [ ] No hardcoded values (use constants)
- [ ] Error handling implemented
- [ ] Accessibility considered

---

## 🆘 Getting Help

### Questions?
1. Check documentation files first
2. Look at similar existing code
3. Ask in team Discord
4. Create GitHub discussion

### Found a Bug?
1. Reproduce it reliably
2. Document steps to reproduce
3. Create a GitHub issue with template
4. Include device, OS version, and app version

### Performance Issue?
1. Profile with React DevTools
2. Check memory and CPU usage
3. Look for unnecessary re-renders
4. Check bundle size impact

---

## 🎯 Next Steps

1. **Set up your environment** (30 min)
   - Complete the onboarding checklist
   - Get the app running locally
   - Explore the codebase

2. **Pick a first task** (1-2 hours)
   - Look at GitHub issues labeled "good-first-issue"
   - Start with small bug fixes or features
   - Submit a PR with description

3. **Get familiar with the workflow** (1-2 days)
   - Understand PR review process
   - Learn the testing procedures
   - Know the deployment pipeline

4. **Become productive** (1-2 weeks)
   - Take on larger features
   - Help other developers
   - Suggest improvements

---

## 📞 Contact

- **Tech Lead:** @marcelo-dev
- **Team Discord:** [Link to server]
- **GitHub Issues:** For bug reports
- **Pull Requests:** For code contributions

---

**Last Updated:** 2024-03-22
**Document Version:** 1.0
**Status:** Ready for onboarding

Welcome to the team! Let's build something amazing! 🚀
