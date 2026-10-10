import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobStatus } from '../api/types';
import { Colors } from '../theme/colors';

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const getConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: Colors.statusCompletedBg,
          text: Colors.statusCompletedText,
          border: Colors.statusCompletedBorder,
          label: 'Completed',
        };
      case 'IN_PROGRESS':
        return {
          bg: Colors.statusInProgressBg,
          text: Colors.statusInProgressText,
          border: Colors.statusInProgressBorder,
          label: 'In Progress',
        };
      case 'ASSIGNED':
        return {
          bg: Colors.statusAssignedBg,
          text: Colors.statusAssignedText,
          border: Colors.statusAssignedBorder,
          label: 'Assigned',
        };
      case 'OPEN':
      default:
        return {
          bg: Colors.statusOpenBg,
          text: Colors.statusOpenText,
          border: Colors.statusOpenBorder,
          label: status,
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
