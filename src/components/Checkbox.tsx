import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface CheckboxProps {
  checked: boolean;
  onPress?: (value: boolean) => void;
  onChange?: (value: boolean) => void;
  onValueChange?: (value: boolean) => void;
  label?: string | React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  onChange,
  onValueChange,
  label,
  disabled = false,
  style,
  testID,
}) => {
  const handleChange = (value: boolean) => {
    onPress?.(value);
    onChange?.(value);
    onValueChange?.(value);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style, disabled && styles.disabled]}
      onPress={() => !disabled && handleChange(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: `${COLORS.gold}50`,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  boxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  disabled: {
    opacity: 0.6,
  },
});
