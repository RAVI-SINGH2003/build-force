import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from './_layout';

// ─── Mock Data ────────────────────────────────────────────────────────
const ACTIVE_JOB = {
  id: 'a1',
  title: 'Site Cleanup & Material Handling',
  company: 'Apex Construction',
  location: 'Andheri East, Mumbai',
  pay: '₹400/hr',
  status: 'In Progress',
  startedAt: 'Today, 09:00 AM',
};

const COMPLETED_JOBS = [
  { id: 'c1', title: 'Tile Setting Support', company: 'Prime Builders', date: 'Sep 18, 2023', earned: '₹1200', rating: 5 },
  { id: 'c2', title: 'Trench Digging', company: 'Metro Pipes', date: 'Sep 15, 2023', earned: '₹1800', rating: 4 },
  { id: 'c3', title: 'Loading/Unloading Granite', company: 'StoneWorks', date: 'Sep 10, 2023', earned: '₹950', rating: 5 },
];

export default function MyJobsScreen() {
  const { openDrawer } = useDrawer();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Ionicons key={i} name={i < rating ? "star" : "star-outline"} size={14} color={i < rating ? "#FBBF24" : "#475569"} />
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

      {/* ─── Header Navigation ─── */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.topNavBrand}>MY JOBS</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Your Assignments</Text>
          <Text style={styles.pageSubtitle}>Manage your current active work and review previously completed jobs.</Text>
        </View>

        {/* ─── Active Job Section ─── */}
        <Text style={styles.sectionTitle}>ACTIVE JOB</Text>
        
        {ACTIVE_JOB ? (
          <View style={styles.activeJobCard}>
            <LinearGradient colors={['#132A20', '#0F172A']} style={styles.cardGradient}>
              <View style={styles.activeHeaderRow}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{ACTIVE_JOB.status}</Text>
                </View>
                <Text style={styles.payText}>{ACTIVE_JOB.pay}</Text>
              </View>

              <Text style={styles.jobTitle}>{ACTIVE_JOB.title}</Text>
              <Text style={styles.companyText}>{ACTIVE_JOB.company}</Text>

              <View style={styles.activeDetailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{ACTIVE_JOB.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>Started: {ACTIVE_JOB.startedAt}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>View Job Details</Text>
                <Ionicons name="arrow-forward" size={18} color="#0B1120" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="briefcase-outline" size={32} color="#334155" />
            <Text style={styles.emptyText}>You have no active assigned jobs.</Text>
          </View>
        )}

        {/* ─── Completed Jobs Section ─── */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>PREVIOUSLY COMPLETED</Text>

        <View style={styles.completedContainer}>
          {COMPLETED_JOBS.map((job) => (
            <View key={job.id} style={styles.completedJobRow}>
              <View style={styles.completedHeader}>
                <Text style={styles.completedTitle}>{job.title}</Text>
                <Text style={styles.earnedText}>{job.earned}</Text>
              </View>
              
              <Text style={styles.completedCompany}>{job.company}</Text>
              
              <View style={styles.completedFooter}>
                <Text style={styles.completedDate}>{job.date}</Text>
                <View style={styles.starsContainer}>
                  {renderStars(job.rating)}
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  topNav: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1724',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  menuButton: { padding: 4 },
  topNavBrand: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  pageHeader: { marginBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#94A3B8', lineHeight: 22 },
  
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', letterSpacing: 1.5, marginBottom: 16 },

  // Active Job Styles
  activeJobCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#10B981', marginBottom: 24, elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  cardGradient: { padding: 20 },
  activeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { color: '#10B981', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  payText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  jobTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  companyText: { color: '#94A3B8', fontSize: 15, marginBottom: 20 },
  activeDetailsContainer: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 12, padding: 16, gap: 12, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  primaryButton: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { color: '#0B1120', fontSize: 15, fontWeight: '700' },
  emptyCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 24 },
  emptyText: { color: '#64748B', fontSize: 14, marginTop: 12, fontWeight: '500' },

  // Completed Jobs Styles
  completedContainer: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 16, overflow: 'hidden' },
  completedJobRow: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  completedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  completedTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 10 },
  earnedText: { color: '#10B981', fontSize: 15, fontWeight: '800' },
  completedCompany: { color: '#64748B', fontSize: 13, marginBottom: 12 },
  completedFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completedDate: { color: '#475569', fontSize: 12, fontWeight: '600' },
  starsContainer: { flexDirection: 'row', gap: 2 },
});
