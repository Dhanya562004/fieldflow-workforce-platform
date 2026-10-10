import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { Job } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Button } from '../components/Button';
import { Colors } from '../theme/colors';

export const JobDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const jobId = route.params?.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    const res = await api.getJobById(jobId);
    if (res.success && res.data) {
      setJob(res.data);
    } else {
      Alert.alert('Error', res.error || 'Failed to load work order');
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleStartJob = async () => {
    setActionLoading(true);
    const res = await api.updateJobStatus(jobId, 'IN_PROGRESS', 'Technician arrived on site and started work');
    if (res.success) {
      Alert.alert('Job Started', 'Work order status transitioned to In Progress');
      fetchJob();
    } else {
      Alert.alert('Status Error', res.error || 'Could not start job');
    }
    setActionLoading(false);
  };

  const handleCompleteJob = async () => {
    setActionLoading(true);
    const res = await api.updateJobStatus(jobId, 'COMPLETED', 'Work verified and marked complete by field specialist');
    if (res.success) {
      Alert.alert('Job Completed', 'Work order has been successfully closed out!');
      fetchJob();
    } else {
      Alert.alert('Completion Error', res.error || 'Could not complete job');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading work order dossier...</Text>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Work order not found or access denied.</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not scheduled';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.jobNumber}>{job.jobNumber}</Text>
            <View style={styles.badgeRow}>
              <PriorityBadge priority={job.priority} />
              <View style={{ width: 6 }} />
              <StatusBadge status={job.status} />
            </View>
          </View>
          <Text style={styles.title}>{job.title}</Text>
        </View>

        {/* Customer & Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer & Site Location</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Facility:</Text>
            <Text style={styles.infoValue}>{job.customer?.name || 'Customer'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{job.customer?.phone || 'No phone'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Address:</Text>
            <Text style={styles.infoValue}>{job.serviceAddress}</Text>
          </View>
          {job.customer?.notes ? (
            <View style={styles.alertNoteBox}>
              <Text style={styles.alertNoteText}>
                ⚠️ Site Access Note: {job.customer.notes}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Schedule & SLAs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule & Target Windows</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scheduled Start:</Text>
            <Text style={styles.infoValue}>{formatDate(job.scheduledStart)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Due Date:</Text>
            <Text style={styles.infoValue}>{formatDate(job.dueDate)}</Text>
          </View>
          {job.startedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Actual Start:</Text>
              <Text style={styles.infoValue}>{formatDate(job.startedAt)}</Text>
            </View>
          )}
          {job.completedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Completed At:</Text>
              <Text style={styles.infoValue}>{formatDate(job.completedAt)}</Text>
            </View>
          )}
        </View>

        {/* Description / Scope */}
        {job.description ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Work Scope & Reported Symptoms</Text>
            <Text style={styles.descText}>{job.description}</Text>
          </View>
        ) : null}

        {/* Action Controls */}
        <View style={styles.actionSection}>
          {job.status === 'ASSIGNED' && (
            <Button
              title="▶ Arrived On Site — Start Job"
              variant="primary"
              onPress={handleStartJob}
              loading={actionLoading}
              style={{ marginBottom: 12 }}
            />
          )}

          {job.status === 'IN_PROGRESS' && (
            <Button
              title="✅ Mark Work Completed"
              variant="success"
              onPress={handleCompleteJob}
              loading={actionLoading}
              style={{ marginBottom: 12 }}
            />
          )}

          {job.status !== 'COMPLETED' && (
            <Button
              title="📝 Update Status & Add Field Notes"
              variant="secondary"
              onPress={() => navigation.navigate('UpdateJob', { jobId: job.id })}
            />
          )}
        </View>

        {/* Field Notes History */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Field Notes History ({job.notes?.length || 0})
          </Text>
          {!job.notes || job.notes.length === 0 ? (
            <Text style={styles.emptyNotesText}>No field notes logged yet.</Text>
          ) : (
            job.notes.map((n) => (
              <View key={n.id} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteAuthor}>
                    {n.author?.name || 'Specialist'}{' '}
                    {n.isInternal ? '(Internal)' : ''}
                  </Text>
                  <Text style={styles.noteTime}>{formatDate(n.createdAt)}</Text>
                </View>
                <Text style={styles.noteContent}>{n.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    width: 120,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  alertNoteBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  alertNoteText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '600',
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 14,
  },
  emptyNotesText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  noteItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  noteTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  noteContent: {
    fontSize: 13,
    color: '#334155',
  },
});
