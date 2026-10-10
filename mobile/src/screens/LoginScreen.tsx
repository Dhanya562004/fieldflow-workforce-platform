import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../theme/colors';
import { api } from '../api/client';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl());
  const [showApiConfig, setShowApiConfig] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setErrorMessage('');
    const res = await login(email.trim(), password.trim());
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid technician credentials');
    }
  };

  const handleQuickDemoTech = () => {
    setEmail('marcus.vance@fieldflow.io');
    setPassword('Tech123!');
    setErrorMessage('');
  };

  const handleSaveApiUrl = () => {
    api.setBaseUrl(apiUrl);
    setShowApiConfig(false);
    Alert.alert('API Configured', `Base URL set to: ${apiUrl}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandContainer}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>FF</Text>
            </View>
            <Text style={styles.title}>FieldFlow</Text>
            <Text style={styles.subtitle}>
              Technician Field Operations & Workforce Mobile
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formHeader}>Specialist Sign In</Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Technician Email"
              value={email}
              onChangeText={setEmail}
              placeholder="technician@fieldflow.io"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Button
              title="Sign In to Work Orders"
              onPress={handleLogin}
              loading={isLoading}
              style={{ marginTop: 8 }}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>DEMO SHORTCUT</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Quick-Fill: Marcus Vance (Tech 1)"
              variant="secondary"
              onPress={handleQuickDemoTech}
            />
          </View>

          {/* Local network gateway configuration helper */}
          <View style={styles.apiConfigSection}>
            <Button
              title={showApiConfig ? 'Hide Network Gateway' : '⚙️ Configure API Base URL'}
              variant="secondary"
              onPress={() => setShowApiConfig(!showApiConfig)}
              style={styles.configToggleBtn}
              textStyle={{ fontSize: 13 }}
            />

            {showApiConfig ? (
              <View style={styles.apiBox}>
                <Input
                  label="Backend API Base URL"
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  placeholder="http://192.168.1.X:5000/api"
                />
                <Button
                  title="Save Gateway URL"
                  variant="primary"
                  onPress={handleSaveApiUrl}
                />
                <Text style={styles.apiHint}>
                  For physical phone testing on local Wi-Fi, enter your computer IP (e.g. http://192.168.1.50:5000/api).
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandBadgeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  apiConfigSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  configToggleBtn: {
    height: 38,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  apiBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  apiHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 15,
  },
});
