import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { validateCardNumber, validateCardExpiry, validateCardCVC } from '../utils/validation';

export interface PaymentFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardHolder: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  loading?: boolean;
  submitButtonLabel?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  loading = false,
  submitButtonLabel = 'Pagar Agora',
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardHolder: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max length with spaces
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
    validateField('cardNumber', formatted);
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    setFormData(prev => ({ ...prev, cardExpiry: formatted }));
    validateField('cardExpiry', formatted);
  };

  const handleCVCChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 4);
    setFormData(prev => ({ ...prev, cardCVC: cleaned }));
    validateField('cardCVC', cleaned);
  };

  const handleCardHolderChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z\s]/g, '');
    setFormData(prev => ({ ...prev, cardHolder: cleaned }));
    validateField('cardHolder', cleaned);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cardNumber':
        if (!value.trim()) {
          newErrors.cardNumber = 'Número de cartão obrigatório';
        } else if (!validateCardNumber(value.replace(/\s/g, ''))) {
          newErrors.cardNumber = 'Número de cartão inválido';
        } else {
          delete newErrors.cardNumber;
        }
        break;

      case 'cardExpiry':
        if (!value) {
          newErrors.cardExpiry = 'Data de validade obrigatória';
        } else if (!validateCardExpiry(value).valid) {
          newErrors.cardExpiry = validateCardExpiry(value).error || 'Data de validade inválida';
        } else {
          delete newErrors.cardExpiry;
        }
        break;

      case 'cardCVC':
        if (!value) {
          newErrors.cardCVC = 'CVC obrigatório';
        } else if (!validateCardCVC(value)) {
          newErrors.cardCVC = 'CVC inválido (3-4 dígitos)';
        } else {
          delete newErrors.cardCVC;
        }
        break;

      case 'cardHolder':
        if (!value.trim()) {
          newErrors.cardHolder = 'Nome obrigatório';
        } else if (value.trim().length < 3) {
          newErrors.cardHolder = 'Nome deve ter pelo menos 3 caracteres';
        } else {
          delete newErrors.cardHolder;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = useCallback(() => {
    return (
      formData.cardNumber.replace(/\s/g, '').length >= 13 &&
      validateCardNumber(formData.cardNumber.replace(/\s/g, '')) &&
      validateCardExpiry(formData.cardExpiry).valid &&
      validateCardCVC(formData.cardCVC) &&
      formData.cardHolder.trim().length >= 3
    );
  }, [formData]);

  const handleSubmit = async () => {
    // Validate all fields
    validateField('cardNumber', formData.cardNumber);
    validateField('cardExpiry', formData.cardExpiry);
    validateField('cardCVC', formData.cardCVC);
    validateField('cardHolder', formData.cardHolder);

    if (!isFormValid()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Payment form submission error:', error);
    }
  };

  const getCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) return 'Visa';
    if (/^5[1-5][0-9]{14}$/.test(cleaned)) return 'Mastercard';
    if (/^3[47][0-9]{13}$/.test(cleaned)) return 'Amex';
    return '';
  };

  const cardType = getCardType(formData.cardNumber);
  const isCardNumberValid = formData.cardNumber.replace(/\s/g, '').length >= 13 && validateCardNumber(formData.cardNumber.replace(/\s/g, ''));

  return (
    <View style={styles.container}>
      {/* Card Preview */}
      {formData.cardNumber && (
        <View style={styles.cardPreview}>
          <LinearGradientPreview colors={[COLORS.gold, COLORS.goldDark]}>
            <View style={styles.cardContent}>
              <View style={styles.cardChip}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <Text style={styles.cardNumber}>
                {'•••• •••• •••• '}
                {formData.cardNumber.slice(-4)}
              </Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>TITULAR</Text>
                  <Text style={styles.cardValue} numberOfLines={1}>
                    {formData.cardHolder || 'SEU NOME'}
                  </Text>
                </View>
                {cardType && (
                  <Text style={styles.cardType}>{cardType}</Text>
                )}
              </View>
            </View>
          </LinearGradientPreview>
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.formSection}>
        {/* Card Holder */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome no Cartão</Text>
          <TextInput
            style={[
              styles.input,
              touched.cardHolder && errors.cardHolder ? styles.inputError : {},
            ]}
            placeholder="João Silva"
            placeholderTextColor={COLORS.grey}
            value={formData.cardHolder}
            onChangeText={handleCardHolderChange}
            onBlur={() => handleBlur('cardHolder')}
            editable={!loading}
          />
          {touched.cardHolder && errors.cardHolder && (
            <Text style={styles.errorText}>{errors.cardHolder}</Text>
          )}
        </View>

        {/* Card Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Número do Cartão</Text>
          <View style={styles.cardNumberContainer}>
            <TextInput
              style={[
                styles.input,
                styles.cardNumberInput,
                touched.cardNumber && errors.cardNumber ? styles.inputError : {},
              ]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={COLORS.grey}
              value={formData.cardNumber}
              onChangeText={handleCardNumberChange}
              onBlur={() => handleBlur('cardNumber')}
              keyboardType="numeric"
              editable={!loading}
              maxLength={19}
            />
            {formData.cardNumber && isCardNumberValid && (
              <Text style={styles.validIcon}>✓</Text>
            )}
          </View>
          {touched.cardNumber && errors.cardNumber && (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          )}
          {cardType && (
            <Text style={styles.cardTypeHint}>{cardType}</Text>
          )}
        </View>

        {/* Expiry & CVC */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Válido até</Text>
            <TextInput
              style={[
                styles.input,
                touched.cardExpiry && errors.cardExpiry ? styles.inputError : {},
              ]}
              placeholder="MM/YY"
              placeholderTextColor={COLORS.grey}
              value={formData.cardExpiry}
              onChangeText={handleExpiryChange}
              onBlur={() => handleBlur('cardExpiry')}
              keyboardType="numeric"
              editable={!loading}
              maxLength={5}
            />
            {touched.cardExpiry && errors.cardExpiry && (
              <Text style={styles.errorText}>{errors.cardExpiry}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>CVC</Text>
            <View style={styles.cvcContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.cvcInput,
                  touched.cardCVC && errors.cardCVC ? styles.inputError : {},
                ]}
                placeholder="123"
                placeholderTextColor={COLORS.grey}
                value={formData.cardCVC}
                onChangeText={handleCVCChange}
                onBlur={() => handleBlur('cardCVC')}
                keyboardType="numeric"
                editable={!loading}
                maxLength={4}
                secureTextEntry
              />
            </View>
            {touched.cardCVC && errors.cardCVC && (
              <Text style={styles.errorText}>{errors.cardCVC}</Text>
            )}
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Os seus dados de cartão são encriptados e nunca são armazenados nos nossos servidores
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid() || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primaryDark} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>{submitButtonLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Placeholder for LinearGradient (since we're in a component file)
const LinearGradientPreview: React.FC<{ colors: string[]; children: React.ReactNode }> = ({ colors, children }) => {
  return <View style={styles.gradientContainer}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  cardPreview: {
    marginHorizontal: 20,
  },
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
  },
  cardContent: {
    padding: 20,
  },
  cardChip: {
    width: 50,
    height: 40,
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    padding: 6,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  chipLine: {
    height: 8,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 2,
  },
  cardNumber: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '600',
    marginTop: 4,
  },
  cardType: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  cardNumberContainer: {
    position: 'relative',
  },
  cardNumberInput: {
    paddingRight: 40,
  },
  validIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
    fontSize: 18,
    color: '#4CAF50',
  },
  cardTypeHint: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cvcContainer: {
    position: 'relative',
  },
  cvcInput: {
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontFamily: 'DMSans',
    marginTop: 6,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#4CAF50' + '15',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    marginVertical: 12,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    lineHeight: 16,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gold + '50',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
});
