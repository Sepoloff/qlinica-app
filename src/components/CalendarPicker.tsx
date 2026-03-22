import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/Colors';

interface CalendarPickerProps {
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
  selectedDate?: string;
}

interface Day {
  date: Date;
  dateString: string;
  dayOfMonth: number;
  month: number;
  year: number;
  disabled: boolean;
  isWeekend: boolean;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  onSelectDate,
  minDate,
  maxDate,
  disabledDates,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date): Day[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get starting day of week (0 = Sunday)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Day[] = [];
    let currentDate = new Date(startDate);

    // Generate 42 days (6 weeks) for consistent calendar view
    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfMonth = currentDate.getDate();
      const dayMonth = currentDate.getMonth();
      const isCurrentMonth = dayMonth === month;
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      let disabled = false;

      if (!isCurrentMonth) {
        disabled = true;
      }

      if (minDate && currentDate < minDate) {
        disabled = true;
      }

      if (maxDate && currentDate > maxDate) {
        disabled = true;
      }

      if (disabledDates && disabledDates(currentDate)) {
        disabled = true;
      }

      days.push({
        date: new Date(currentDate),
        dateString,
        dayOfMonth,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        disabled,
        isWeekend,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const daysInCurrentMonth = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.monthYear}>{monthName}</Text>

        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Weekdays */}
      <View style={styles.weekdaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {daysInCurrentMonth.map((day, index) => {
          const isSelected = selectedDate === day.dateString;
          const isCurrentMonth = day.month === currentMonth.getMonth();

          return (
            <TouchableOpacity
              key={`${day.dateString}-${index}`}
              style={[
                styles.dayButton,
                !isCurrentMonth && styles.dayButtonOtherMonth,
                day.disabled && styles.dayButtonDisabled,
                isSelected && styles.dayButtonSelected,
              ]}
              disabled={day.disabled}
              onPress={() => onSelectDate(day.date)}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextOtherMonth,
                  day.disabled && styles.dayTextDisabled,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {day.dayOfMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: `${COLORS.gold}25` },
            ]}
          />
          <Text style={styles.legendText}>Disponível</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: `${COLORS.grey}25` },
            ]}
          />
          <Text style={styles.legendText}>Indisponível</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${COLORS.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: COLORS.gold,
    fontWeight: '600',
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    textTransform: 'capitalize',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  dayButtonOtherMonth: {
    opacity: 0.3,
  },
  dayButtonDisabled: {
    opacity: 0.4,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.gold,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  dayTextOtherMonth: {
    color: COLORS.grey,
  },
  dayTextDisabled: {
    color: COLORS.grey,
  },
  dayTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
});
