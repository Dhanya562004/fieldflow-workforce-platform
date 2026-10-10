import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobPriority } from '../api/types';
import { Colors } from '../theme/colors';

export const PriorityBadge: React.FC<{ priority: JobPriority }> = ({ priority }) => {
  const getConfig = () => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: Colors.priorityCriticalBg,
          text: Colors.priorityCriticalText,
          border: Colors.priorityCriticalBorder,
          label: 'Critical',
        };
      case 'HIGH':
        return {
          bg: Colors.priorityHighBg,
          text: Colors.priorityHighText,
          border: Colors.priorityHighBorder,
          label: 'High',
        };
      case 'LOW':
        return {
          bg: Colors.priorityLowBg,
          text: Colors.priorityLowText,
          border: Colors.priorityLowBorder,
          label: 'Low',
        };
      case 'MEDIUM':
      default:
        return {
          bg: Colors.priorityMediumBg,
          text: Colors.priorityMediumText,
          border: Colors.priorityMediumBorder,
          label: 'Medium',
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
