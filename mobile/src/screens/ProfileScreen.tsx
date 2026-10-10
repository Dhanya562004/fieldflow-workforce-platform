import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Colors } from '../theme/colors';
import { api } from '../api/client';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const profile = user?.technicianProfile;

  const handleLogout = () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to log out of FieldFlow?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'SP'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Field Specialist'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'TECHNICIAN'}</Text>
          </View>
        </View>

        {/* Operational Profile */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Field Operations Profile</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned Zone:</Text>
            <Text style={styles.infoValue}>{profile?.serviceZone || 'Metro'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Assigned:</Text>
            <Text style={styles.infoValue}>{profile?.vehicleNumber || 'VAN-101'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Max Concurrent Jobs:</Text>
            <Text style={styles.infoValue}>{profile?.maxConcurrentJobs || 4}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Skills:</Text>
            <Text style={styles.infoValue}>{profile?.skills || 'General Maintenance'}</Text>
          </View>
        </View>

        {/* Network & Infrastructure */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gateway Connectivity</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>API URL:</Text>
            <Text style={styles.infoValueSmall}>{api.getBaseUrl()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: Colors.success }]}>Online</Text>
          </View>
        </View>

        <Button
          title="Sign Out of FieldFlow"
          variant="danger"
          onPress={handleLogout}
          style={{ marginTop: 8 }}
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
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: '100%',
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  infoValueSmall: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'right',
    flex: 1,
  },
});
