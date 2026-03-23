import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/Colors';

interface PaymentSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  description?: string;
  therapistName?: string;
  serviceName?: string;
  date?: string;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  subtotal,
  tax,
  total,
  description,
  therapistName,
  serviceName,
  date,
}) => {
  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumo do Pagamento</Text>
      </View>

      {/* Booking Info */}
      {(serviceName || therapistName) && (
        <View style={styles.bookingInfo}>
          {serviceName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Serviço:</Text>
              <Text style={styles.infoValue}>{serviceName}</Text>
            </View>
          )}
          {therapistName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Terapeuta:</Text>
              <Text style={styles.infoValue}>{therapistName}</Text>
            </View>
          )}
          {date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data:</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
          )}
        </View>
      )}

      {/* Description */}
      {description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}

      {/* Price Breakdown */}
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
        </View>

        <View style={[styles.priceRow, styles.taxRow]}>
          <Text style={styles.priceLabel}>IVA (23%)</Text>
          <Text style={styles.priceValue}>{formatPrice(tax)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total a Pagar</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Pagamento seguro com encriptação de ponta a ponta
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold + '20',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  bookingInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryDark + '50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.gold + '10',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  descriptionText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    lineHeight: 16,
  },
  priceBreakdown: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  taxRow: {
    opacity: 0.8,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gold + '20',
    marginVertical: 12,
  },
  totalRow: {
    marginVertical: 0,
    paddingVertical: 0,
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '700',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryDark + '50',
    borderTopWidth: 1,
    borderTopColor: COLORS.gold + '20',
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
  },
});
