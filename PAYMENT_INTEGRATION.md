# Payment Integration Guide

## Overview

The Qlinica app now includes full payment integration via Stripe, with a complete payment service, UI component, and hooks for managing payment operations.

## Components

### 1. Payment Service (`src/services/paymentService.ts`)

Core payment processing service that handles:
- Payment intent creation
- Payment confirmation
- Payment method management (save, list, delete)
- Payment history retrieval
- Price calculation and formatting

#### Key Methods

```typescript
// Initialize payment service
await paymentService.initialize(config?: StripeConfig);

// Create payment intent for booking
const intent = await paymentService.createPaymentIntent({
  amount: 100,
  currency: 'EUR',
  bookingId: 'booking_123',
  description: 'Massage Therapy Session'
});

// Confirm payment
const result = await paymentService.confirmPayment({
  clientSecret: intent.clientSecret,
  paymentMethodId: 'pm_123',
  amount: 100,
  currency: 'EUR'
});

// Manage payment methods
const methods = await paymentService.getPaymentMethods();
await paymentService.savePaymentMethod(paymentMethodId);
await paymentService.deletePaymentMethod(paymentMethodId);

// Get payment history
const history = await paymentService.getPaymentHistory({ limit: 10 });

// Calculate totals (with 23% VAT for Portugal)
const { subtotal, tax, total } = paymentService.calculateTotal(100);

// Format prices
const formatted = paymentService.formatPrice(100, 'EUR'); // "100,00 €"
```

### 2. Payment Screen (`src/screens/PaymentScreen.tsx`)

Complete UI for payment processing with:
- Booking summary display
- Saved payment methods selection
- New card entry form
- Security information
- Loading states

#### Usage

```typescript
import PaymentScreen from './screens/PaymentScreen';

<PaymentScreen 
  bookingId="booking_123"
  amount={100}
  description="Massage Therapy - 60 min"
  onSuccess={(result) => {
    console.log('Payment successful:', result);
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
/>
```

#### Features

- **Payment Method Selection**: Choose from saved cards or add new
- **Card Form**: Secure card number, expiry, CVC input
- **Price Breakdown**: Shows subtotal, VAT (23%), and total
- **Security Badge**: Displays SSL encryption notice
- **Loading States**: Disabled buttons during processing
- **Responsive Design**: Works on all screen sizes

### 3. usePayment Hook (`src/hooks/usePayment.ts`)

React hook for managing payment operations in components.

#### Usage

```typescript
import { usePayment } from '../hooks/usePayment';

function MyComponent() {
  const {
    isLoading,
    error,
    paymentMethods,
    selectedMethodId,
    
    loadPaymentMethods,
    processPayment,
    savePaymentMethod,
    deletePaymentMethod,
    getPaymentHistory,
    calculateTotal,
    formatPrice,
    clearError,
  } = usePayment({
    onSuccess: (result) => console.log('Success:', result),
    onError: (error) => console.error('Error:', error),
  });

  return (
    <View>
      {isLoading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      <Text>Total: {formatPrice(100)}</Text>
    </View>
  );
}
```

#### Hook Methods

- `loadPaymentMethods()` - Fetch saved payment methods
- `createPaymentIntent(options)` - Create Stripe payment intent
- `processPayment(options)` - Process payment
- `savePaymentMethod(paymentMethodId)` - Save card for future use
- `deletePaymentMethod(paymentMethodId)` - Remove saved card
- `getPaymentHistory(options?)` - Fetch transaction history
- `calculateTotal(subtotal, taxRate?)` - Calculate with tax
- `formatPrice(amount, currency?)` - Format for display
- `clearError()` - Clear error state

## Integration with Booking Flow

### Updated BookingSummaryScreen

The booking summary screen should now include payment:

```typescript
const handleConfirmBooking = async () => {
  try {
    // Create payment intent first
    const intent = await paymentService.createPaymentIntent({
      amount: bookingTotal,
      currency: 'EUR',
      bookingId: bookingData.id,
      description: `${service.name} with ${therapist.name}`
    });

    // Navigate to payment screen
    navigation.navigate('Payment', {
      bookingId: bookingData.id,
      amount: bookingTotal,
      intent: intent,
      onSuccess: handlePaymentSuccess,
      onError: handlePaymentError,
    });
  } catch (error) {
    showToast('Erro ao processar agendamento', 'error');
  }
};
```

## Backend API Endpoints

The payment service expects these backend endpoints:

### Create Payment Intent
```
POST /api/payment/intents
Body: {
  amount: number (in cents),
  currency: string,
  bookingId: string,
  description?: string
}
Response: {
  clientSecret: string,
  ephemeralKey?: string
}
```

### Confirm Payment
```
POST /api/payment/confirm
Body: {
  clientSecret: string,
  paymentMethodId: string,
  amount: number,
  currency: string
}
Response: {
  status: 'succeeded' | 'failed',
  id: string,
  error?: { message: string }
}
```

### Get Payment Methods
```
GET /api/payment/methods
Response: Array of {
  id: string,
  type: 'card' | 'wallet',
  last4: string,
  brand: string,
  exp_month: number,
  exp_year: number
}
```

### Save Payment Method
```
POST /api/payment/methods
Body: { paymentMethodId: string }
Response: PaymentMethod
```

### Delete Payment Method
```
DELETE /api/payment/methods/:paymentMethodId
```

### Get Payment History
```
GET /api/payment/history?limit=10&offset=0
Response: Array of {
  id: string,
  amount: number,
  currency: string,
  date: string,
  status: 'succeeded' | 'pending' | 'failed',
  bookingId: string
}
```

## Stripe SDK Integration (Future)

To integrate the Stripe React Native SDK for actual card processing:

1. Install Stripe SDK:
```bash
npm install @stripe/stripe-react-native
```

2. Initialize in App.tsx:
```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_...">
      {/* Your app */}
    </StripeProvider>
  );
}
```

3. Update PaymentScreen to use CardField:
```typescript
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';

const { confirmPayment } = useConfirmPayment();

const handlePayment = async () => {
  const { paymentIntent, error } = await confirmPayment(
    clientSecret,
    {
      type: 'Card',
      billingDetails: {
        name: cardHolder,
      },
    }
  );
  
  if (error) {
    // Handle error
  } else {
    // Payment successful
  }
};
```

## Analytics Integration

Payment events are automatically tracked:

- `payment_service_initialized` - Service initialization
- `payment_intent_created` - Intent creation
- `payment_successful` - Successful payment
- `payment_method_saved` - Card saved
- `payment_method_deleted` - Card removed
- `payment_error` - Payment failure with details

Access via:
```typescript
import { advancedAnalyticsService } from './services/advancedAnalyticsService';

advancedAnalyticsService.trackConversionFunnel('paymentCompleted');
```

## Testing

Use provided mock data for testing:

```typescript
import { 
  mockServices, 
  generateTestData, 
  mockApiResponses 
} from './utils/testingHelpers';

// Mock payment
const testPayment = {
  amount: 100,
  currency: 'EUR',
  bookingId: generateTestData.bookingId(),
  description: mockServices[0].name,
};
```

## Security Considerations

1. **Never store full card details** - Always use Stripe tokens
2. **HTTPS Only** - All payment requests must use HTTPS
3. **PCI Compliance** - Use Stripe's hosted forms for card entry
4. **Token Expiry** - Payment intents expire after 24 hours
5. **Amount Validation** - Always validate amounts server-side

## Environment Configuration

Set these environment variables:

```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_API_URL=https://api.qlinica.com
```

## Troubleshooting

### Payment Intent Creation Fails
- Check backend API is running
- Verify correct base URL in config
- Check Stripe API keys in backend

### Payment Method Not Saving
- Ensure PaymentMethod API endpoint is implemented
- Check AsyncStorage permissions

### Card Validation Issues
- Verify card format validation
- Check Stripe SDK initialization
- Ensure proper error handling

## Future Enhancements

- [ ] Apple Pay integration
- [ ] Google Pay integration
- [ ] PayPal integration
- [ ] Subscription billing
- [ ] Invoicing system
- [ ] Refund management
- [ ] Transaction receipts
- [ ] Payment analytics dashboard

---

**Last Updated**: March 22, 2026
**Version**: 1.0.0
