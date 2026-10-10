import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { JobStatus } from '../api/types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../theme/colors';

const STATUS_OPTIONS: { key: JobStatus; label: string; desc: string }[] = [
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Technician on site performing diagnostic or repair' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Scope fully addressed, tested, and resolved' },
  { key: 'ASSIGNED', label: 'Assigned / Paused', desc: 'Awaiting parts, specialist shift, or site access' },
];

export const UpdateJobScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const jobId = route.params?.jobId;

  const [selectedStatus, setSelectedStatus] = useState<JobStatus>('IN_PROGRESS');
  const [fieldNote, setFieldNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent duplicate submission
    setIsSubmitting(true);

    try {
      const res = await api.updateJobStatus(
        jobId,
        selectedStatus,
        fieldNote.trim() || undefined
      );

      if (res.success) {
        Alert.alert('Status Updated', 'Work order updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Update Failed', res.error || 'Failed to update work order');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Update Operational Status</Text>
        <Text style={styles.headerSubtitle}>
          Transition the work order state and submit official field diagnostic notes.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Select Target Status</Text>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.7}
                onPress={() => setSelectedStatus(opt.key)}
                style={[styles.statusOption, isSelected && styles.statusOptionSelected]}
              >
                <View style={styles.radioOuter}>
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusLabel, isSelected && styles.statusLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.statusDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Technician Field Note</Text>
          <Input
            value={fieldNote}
            onChangeText={setFieldNote}
            placeholder="Record manifold pressure readings, components replaced, or reasons for delay..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        <Button
          title={isSubmitting ? 'Saving Updates...' : 'Submit Work Order Update'}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginTop: 12 }}
        />
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
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  statusOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0f7ff',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  statusLabelSelected: {
    color: Colors.primary,
  },
  statusDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
