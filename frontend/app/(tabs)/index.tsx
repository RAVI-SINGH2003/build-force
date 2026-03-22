import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDrawer } from './_layout';

// Helper for dynamic greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

export default function DashboardScreen() {
  const [greeting, setGreeting] = useState('');
  const { openDrawer } = useDrawer();

  useEffect(() => {
    setGreeting(getGreeting());
    
    // Update the greeting exactly once at the top of the hour if desired, 
    // but for now, setting on mount is perfectly fine.
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── Header Section ─── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
              <Ionicons name="menu-outline" size={32} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.roleBadge}>
              <Ionicons name="construct-outline" size={16} color="#10B981" />
              <Text style={styles.roleBadgeText}>CONSTRUCTION LABORER</Text>
            </View>
          </View>
          
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>{greeting}, !</Text>
          </View>
          <Text style={styles.greetingSubtitle}>Here's your BuildForce overview — let's get to work.</Text>
        </View>

        {/* ─── Metrics Grid ─── */}
        <View style={styles.metricsGrid}>
          {/* Card 1 */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <Ionicons name="briefcase-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.metricValue}>0</Text>
            </View>
            <Text style={styles.metricTitle}>Applications Sent</Text>
            <Text style={styles.metricSubtitle}>Jobs you've applied to</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="people-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>0</Text>
            </View>
            <Text style={styles.metricTitle}>Jobs Won</Text>
            <Text style={styles.metricSubtitle}>Accepted applications</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="star-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.metricValue}>0</Text>
            </View>
            <Text style={styles.metricTitle}>Jobs Completed</Text>
            <Text style={styles.metricSubtitle}>Finished & rated</Text>
          </View>

          {/* Card 4 */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                <Ionicons name="cash-outline" size={20} color="#14B8A6" />
              </View>
              <Text style={styles.metricValue}>₹0</Text>
            </View>
            <Text style={styles.metricTitle}>Total Earned</Text>
            <Text style={styles.metricSubtitle}>Lifetime earnings</Text>
          </View>
        </View>

        {/* ─── Quick Actions Section ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

          {/* Quick Action Card 1 */}
          <View style={styles.actionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Open Jobs</Text>
              <Text style={styles.cardSubtitle}>Search nearby sites live</Text>
            </View>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/open_jobs')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>View Jobs</Text>
              <Ionicons name="arrow-forward" size={18} color="#0B1120" />
            </TouchableOpacity>
          </View>

          {/* Quick Action Card 2 */}
          <View style={styles.actionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>My Jobs</Text>
              <Text style={styles.cardSubtitle}>View active & past jobs</Text>
            </View>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/my_jobs')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>View Jobs</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuButton: {
    padding: 4,
    marginLeft: -4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1917',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#292524',
    gap: 6,
  },
  roleBadgeText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  greetingRow: {
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    width: (Dimensions.get('window').width - 40 - 12) / 2, // 40=padding, 12=gap
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94A3B8',
  },
  primaryButton: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
