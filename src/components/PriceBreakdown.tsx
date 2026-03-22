import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { formatCurrency } from '../utils/formatters';

interface PriceItem {
  label: string;
  amount: number;
}

interface PriceBreakdownProps {
  items: PriceItem[];
  taxRate?: number; // Percentage (e.g., 23 for 23%)
  discount?: number; // Fixed amount
}

/**
 * Component to display itemized pricing breakdown
 */
export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  items,
  taxRate = 0,
  discount = 0,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  return (
    <View style={styles.container}>
      {/* Items */}
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        </View>
      ))}

      {/* Subtotal */}
      <View style={[styles.row, styles.rowBorder]}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.amount}>{formatCurrency(subtotal)}</Text>
      </View>

      {/* Tax */}
      {taxRate > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>IVA ({taxRate}%)</Text>
          <Text style={styles.amount}>{formatCurrency(taxAmount)}</Text>
        </View>
      )}

      {/* Discount */}
      {discount > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, styles.discountLabel]}>Desconto</Text>
          <Text style={[styles.amount, styles.discountAmount]}>
            -{formatCurrency(discount)}
          </Text>
        </View>
      )}

      {/* Total */}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a252f',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
    marginBottom: 8,
    paddingBottom: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#8895a0',
  },
  amount: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#E8E8E8',
  },
  discountLabel: {
    color: COLORS.success,
  },
  discountAmount: {
    color: COLORS.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#34495E',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: COLORS.gold,
  },
  totalAmount: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: COLORS.gold,
  },
});
