import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/Colors';

export interface TimeSlot {
  time: string;
  available: boolean;
  therapistName?: string;
}

interface TimePickerProps {
  slots: TimeSlot[];
  onSelectTime: (time: string) => void;
  selectedTime?: string;
  isLoading?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  slots,
  onSelectTime,
  selectedTime,
  isLoading = false,
}) => {
  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum horário disponível para esta data</Text>
      </View>
    );
  }

  // Group slots by hour for better visual organization
  const groupedSlots: { [key: string]: TimeSlot[] } = {};
  slots.forEach((slot) => {
    const hour = slot.time.split(':')[0];
    if (!groupedSlots[hour]) {
      groupedSlots[hour] = [];
    }
    groupedSlots[hour].push(slot);
  });

  const hours = Object.keys(groupedSlots).sort();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {hours.map((hour) => (
        <View key={hour} style={styles.hourGroup}>
          <Text style={styles.hourLabel}>{hour}:00</Text>
          <View style={styles.slotsContainer}>
            {groupedSlots[hour].map((slot, index) => {
              const isSelected = selectedTime === slot.time;
              const isDisabled = !slot.available;

              return (
                <TouchableOpacity
                  key={`${slot.time}-${index}`}
                  style={[
                    styles.timeButton,
                    isSelected && styles.timeButtonSelected,
                    isDisabled && styles.timeButtonDisabled,
                  ]}
                  disabled={isDisabled || isLoading}
                  onPress={() => onSelectTime(slot.time)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeText,
                      isSelected && styles.timeTextSelected,
                      isDisabled && styles.timeTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>
                  {!slot.available && (
                    <Text style={styles.unavailableLabel}>Indisponível</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textAlign: 'center',
  },
  hourGroup: {
    marginBottom: 20,
  },
  hourLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    flex: 0,
    minWidth: '30%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: `${COLORS.gold}15`,
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}40`,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  timeButtonDisabled: {
    opacity: 0.4,
    backgroundColor: `${COLORS.grey}15`,
    borderColor: `${COLORS.grey}25`,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  timeTextSelected: {
    color: COLORS.primaryDark,
  },
  timeTextDisabled: {
    color: COLORS.grey,
  },
  unavailableLabel: {
    fontSize: 9,
    color: COLORS.danger,
    fontFamily: 'DMSans',
    marginTop: 2,
  },
});
