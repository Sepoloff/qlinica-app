import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/Colors';

interface TimeSlotPickerProps {
  availableSlots: string[]; // Format: "09:00", "10:00", etc
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

/**
 * Component for selecting available time slots
 */
export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availableSlots,
  selectedSlot,
  onSelectSlot,
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {availableSlots.map((slot) => (
        <TouchableOpacity
          key={slot}
          style={[
            styles.slot,
            selectedSlot === slot && styles.slotSelected,
          ]}
          onPress={() => onSelectSlot(slot)}
        >
          <Text
            style={[
              styles.slotText,
              selectedSlot === slot && styles.slotTextSelected,
            ]}
          >
            {slot}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  slot: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#34495E',
    borderWidth: 1,
    borderColor: '#34495E',
  },
  slotSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  slotText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#8895a0',
  },
  slotTextSelected: {
    color: '#2C3E50',
  },
});
