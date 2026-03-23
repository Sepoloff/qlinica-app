'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { useToast } from '../context/ToastContext';
import { paymentService, PaymentResult } from '../services/paymentService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Header } from '../components/Header';
import { validateCreditCard, validateCardNumber, validateCardExpiry, validateCardCVC } from '../utils/validation';
import { logger } from '../utils/logger';
import { useAnalytics } from '../hooks/useAnalytics';

interface PaymentScreenProps {
  bookingId: string;
  amount: number;
  description: string;
  onSuccess: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

export default function PaymentScreen({ 
  bookingId, 
  amount, 
  description,
  onSuccess,
  onError 
}: PaymentScreenProps) {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { trackEvent, trackScreenView } = useAnalytics();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [processingPayment, setProcessingPayment] = useState(false);

  // Calculate totals
  const { subtotal, tax, total } = paymentService.calculateTotal(amount);
  const formattedTotal = paymentService.formatPrice(total);

  useEffect(() => {
    trackScreenView('payment', { amount, bookingId });
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedMethod(methods[0].id);
      }
    } catch (error) {
      logger.error('Error loading payment methods', error);
      showToast({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar métodos de pagamento',
      });
      trackEvent('payment_methods_load_error', { error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const validateNewCard = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateCardNumber(cardNumber)) {
      errors.cardNumber = 'Número de cartão inválido';
    }

    const expiryValidation = validateCardExpiry(cardExpiry);
    if (!expiryValidation.valid) {
      errors.expiry = expiryValidation.error || 'Data de validade inválida';
    }

    if (!validateCardCVC(cardCVC)) {
      errors.cvc = 'CVC inválido (3-4 dígitos)';
    }

    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      errors.cardHolder = 'Nome do titular inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!selectedMethod && !showNewCardForm) {
      showToast({
        type: 'warning',
        title: 'Pagamento',
        message: 'Selecione um método de pagamento',
      });
      trackEvent('payment_no_method_selected');
      return;
    }

    // Validate new card if entered
    if (showNewCardForm && !validateNewCard()) {
      showToast({
        type: 'error',
        title: 'Validação',
        message: 'Verifique os dados do cartão',
      });
      trackEvent('payment_validation_error', { errorCount: Object.keys(validationErrors).length });
      return;
    }

    setProcessingPayment(true);
    try {
      logger.debug(`Processing payment for booking ${bookingId}`);
      
      if (showNewCardForm) {
        logger.debug('Processing new card payment');
        // Validate card format (already done above)
        // Add card to payment service
      } else {
        logger.debug(`Processing with saved method ${selectedMethod}`);
      }

      // Simulate payment processing
      // In real app, this would call the payment service API
      await new Promise(resolve => setTimeout(resolve, 2000));

      trackEvent('payment_success', { 
        amount, 
        bookingId,
        method: showNewCardForm ? 'new_card' : selectedMethod,
      });

      showToast({
        type: 'success',
        title: 'Pagamento Confirmado',
        message: `Pagamento de €${formattedTotal} realizado com sucesso`,
      });

      if (onSuccess) {
        onSuccess({
          transactionId: `TXN_${Date.now()}`,
          amount: total,
          bookingId,
          method: showNewCardForm ? 'card' : selectedMethod,
          status: 'success',
        });
      }
    } catch (error) {
      logger.error('Payment failed', error);
      const errorMsg = (error as any)?.message || 'Falha no processamento do pagamento';

      showToast({
        type: 'error',
        title: 'Erro de Pagamento',
        message: errorMsg,
      });

      trackEvent('payment_error', { 
        error: errorMsg,
        bookingId,
      });

      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  if (isLoading && paymentMethods.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Pagamento" />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header title="Pagamento" />

      {/* Booking Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo da Consulta</Text>
        <Text style={styles.summaryDescription}>{description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{paymentService.formatPrice(subtotal)}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>IVA (23%)</Text>
          <Text style={styles.priceValue}>{paymentService.formatPrice(tax)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formattedTotal}</Text>
        </View>
      </Card>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de Pagamento</Text>

        {paymentMethods.length > 0 && !showNewCardForm && (
          <View>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.methodCardSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.methodRadio}>
                  {selectedMethod === method.id && (
                    <View style={styles.methodRadioInner} />
                  )}
                </View>
                <View style={styles.methodContent}>
                  <Text style={styles.methodBrand}>{method.brand.toUpperCase()}</Text>
                  <Text style={styles.methodNumber}>
                    **** **** **** {method.last4}
                  </Text>
                  <Text style={styles.methodExpiry}>
                    {method.expiryMonth}/{method.expiryYear}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showNewCardForm ? (
          <View style={styles.cardForm}>
            <Text style={styles.formLabel}>Número do Cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#999"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              maxLength={19}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>Validade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  placeholderTextColor="#999"
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#999"
                  value={cardCVC}
                  onChangeText={setCardCVC}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Nome do Titular</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999"
              value={cardHolder}
              onChangeText={setCardHolder}
            />

            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => {
                setShowNewCardForm(false);
                setCardNumber('');
                setCardExpiry('');
                setCardCVC('');
                setCardHolder('');
              }}
            />
          </View>
        ) : (
          <Button
            title="+ Adicionar Novo Cartão"
            variant="secondary"
            onPress={() => setShowNewCardForm(true)}
          />
        )}
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Pagamento seguro com encriptação SSL 256-bit
        </Text>
      </View>

      {/* Payment Button */}
      <Button
        title={isLoading ? 'A processar...' : `Pagar ${formattedTotal}`}
        onPress={handlePayment}
        disabled={isLoading || (!selectedMethod && !showNewCardForm)}
      />

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalRow: {
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: COLORS.surfaceLight,
  },
  methodCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '10',
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  methodContent: {
    flex: 1,
  },
  methodBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  methodNumber: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  methodExpiry: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardForm: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  securityNotice: {
    marginHorizontal: 20,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    borderRadius: 8,
    padding: 12,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.success,
    flex: 1,
  },
  spacer: {
    height: 20,
  },
});
