import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job } from '../api/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Colors } from '../theme/colors';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const isOverdue = () => {
    if (!job.dueDate || job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      return false;
    }
    return new Date(job.dueDate).getTime() < Date.now();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const overdue = isOverdue();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, overdue && styles.cardOverdue]}
    >
      <View style={styles.header}>
        <Text style={styles.jobNumber}>{job.jobNumber}</Text>
        <View style={styles.badges}>
          <PriorityBadge priority={job.priority} />
          <View style={{ width: 6 }} />
          <StatusBadge status={job.status} />
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>

      <View style={styles.meta}>
        <Text style={styles.customerName} numberOfLines={1}>
          🏢 {job.customer?.name || 'Customer Site'}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          📍 {job.serviceAddress}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.dueText, overdue && styles.dueOverdue]}>
          ⏰ Due: {formatDate(job.dueDate)}
          {overdue ? ' (OVERDUE)' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  meta: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  dueText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dueOverdue: {
    color: Colors.danger,
    fontWeight: '700',
  },
});
