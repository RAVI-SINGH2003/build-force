import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDrawer } from './_layout';

const { width } = Dimensions.get('window');

// ─── Mock Data ────────────────────────────────────────────────────────
const INITIAL_JOBS = [
  { id: '1', title: 'Site Cleanup & Material Handling', company: 'Apex Construction', location: 'Andheri East', distance: 2.4, pay: '₹400/hr', time: 'Today, 10:00 AM', type: 'General Labor' },
  { id: '2', title: 'Concrete Pouring Support', company: 'SolidBuild Ltd.', location: 'Bandra West', distance: 4.1, pay: '₹550/hr', time: 'Tomorrow, 08:00 AM', type: 'Concrete / Masonry' },
  { id: '3', title: 'Loading/Unloading Granite', company: 'StoneWorks', location: 'Powai', distance: 8.5, pay: '₹350/hr', time: 'Today, 02:00 PM', type: 'Heavy Lifting' },
  { id: '4', title: 'Scaffolding Setup', company: 'SkyHigh Builders', location: 'Navi Mumbai', distance: 15.2, pay: '₹600/hr', time: 'Sep 24, 07:00 AM', type: 'Scaffolding' },
  { id: '5', title: 'Trench Digging', company: 'Metro Pipes', location: 'Dadar', distance: 6.8, pay: '₹450/hr', time: 'Sep 25, 09:00 AM', type: 'Digging / Trenching' },
];

const DISTANCE_OPTIONS = [5, 10, 20, 50];

// ─── Component ────────────────────────────────────────────────────
export default function OpenJobsScreen() {
  const { openDrawer } = useDrawer();
  const [maxDistance, setMaxDistance] = useState<number>(5);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [acceptedJobId, setAcceptedJobId] = useState<string | null>(null);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Pulse effect to simulate "Live Radar" scanning
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const visibleJobs = jobs.filter(job => job.distance <= maxDistance);

  const handleAcceptJob = (id: string) => {
    // Lock the dashboard to this active job
    setAcceptedJobId(id);
    alert('Job Accepted! The contractor has been notified and other jobs are now disabled.');
  };

  const handleDeclineJob = (id: string) => {
    // Hide the job from the current feed
    setJobs(current => current.filter(job => job.id !== id));
  };

  const renderListModal = (
    visible: boolean, close: () => void, data: number[], onSelect: (val: number) => void, title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={close} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  close();
                }}
              >
                <Text style={styles.modalItemText}>{item} km</Text>
                <Ionicons name="chevron-forward" size={18} color="#475569" />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderJobCard = ({ item }: { item: typeof INITIAL_JOBS[0] }) => {
    const isOtherJobDisabled = acceptedJobId !== null && acceptedJobId !== item.id;
    const isActiveJob = acceptedJobId === item.id;

    return (
      <View style={[styles.jobCard, isOtherJobDisabled && styles.jobCardDisabled]} pointerEvents={isOtherJobDisabled ? 'none' : 'auto'}>
        <LinearGradient colors={isActiveJob ? ['#132A20', '#0F172A'] : ['#1E293B', '#0F172A']} style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <View style={[styles.jobTypeBadge, isActiveJob && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.jobTypeText, isActiveJob && { color: '#10B981' }]}>{item.type}</Text>
            </View>
            <Text style={styles.distanceText}>
              <Ionicons name="location" size={12} color={isActiveJob ? "#10B981" : "#F97316"} /> {item.distance} km
            </Text>
          </View>

          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyText}>{item.company} • {item.location}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={16} color="#10B981" />
              <Text style={styles.detailText}>{item.pay}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#94A3B8" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
          </View>

          {!isActiveJob ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.declineButton} 
                onPress={() => handleDeclineJob(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptButton} 
                onPress={() => handleAcceptJob(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.acceptButtonText}>ACCEPT JOB</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activeJobStatus}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.activeJobStatusText}>You are actively assigned</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

      {/* ─── Header ─── */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.topNavBrand}>LIVE OPEN JOBS</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        
        {/* Radar / Scanning Status */}
        <View style={styles.radarSection}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="radio" size={32} color="#F97316" />
          </Animated.View>
          <View style={styles.radarTextContainer}>
            <Text style={styles.radarTitle}>Scanning for nearby jobs...</Text>
            <Text style={styles.radarSubtitle}>
              {visibleJobs.length} {visibleJobs.length === 1 ? 'job' : 'jobs'} available within {maxDistance}km
            </Text>
          </View>
        </View>

        {/* Distance Filter Dropdown */}
        <View style={styles.filterSection}>
          <View style={styles.pickerRow}>
            <Text style={styles.filterLabel}>Search Radius Filter:</Text>
            {acceptedJobId && <Text style={styles.lockedLabel}>(LOCKED)</Text>}
          </View>
          <TouchableOpacity 
            style={[styles.pickerButton, acceptedJobId !== null && styles.pickerDisabled]} 
            onPress={() => setIsDistanceModalVisible(true)}
            activeOpacity={0.8}
            disabled={acceptedJobId !== null}
          >
            <Text style={styles.pickerText}>Within {maxDistance} km</Text>
            <Ionicons name="chevron-down" size={20} color={acceptedJobId ? "#334155" : "#94A3B8"} />
          </TouchableOpacity>
        </View>

        {/* Jobs Feed */}
        {visibleJobs.length > 0 ? (
          <FlatList
            data={visibleJobs}
            keyExtractor={item => item.id}
            renderItem={renderJobCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>No Jobs Found</Text>
            <Text style={styles.emptySubtitle}>
              Increase your search radius to {DISTANCE_OPTIONS.find(d => d > maxDistance) || 'a larger distance'} to view more jobs.
            </Text>
          </View>
        )}

      </View>

      {/* Render Setup Distance Modal */}
      {renderListModal(isDistanceModalVisible, () => setIsDistanceModalVisible(false), DISTANCE_OPTIONS, setMaxDistance, 'Select Search Radius')}
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
  content: { flex: 1 },
  
  radarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 36, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  pulseCircle: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radarTextContainer: { flex: 1 },
  radarTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  radarSubtitle: { color: '#10B981', fontSize: 13, fontWeight: '600' },
  
  filterSection: { padding: 20, paddingBottom: 10 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  filterLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  lockedLabel: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  pickerButton: {
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#334155',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  pickerText: { color: '#FFF', fontSize: 15 },
  pickerDisabled: { opacity: 0.5, borderColor: '#1E293B' },
  
  listContent: { padding: 20, paddingBottom: 40 },
  jobCard: {
    flex: 1, marginBottom: 16, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#334155',
  },
  jobCardDisabled: {
    opacity: 0.4,
  },
  cardGradient: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobTypeBadge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  jobTypeText: { color: '#38BDF8', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  distanceText: { color: '#F97316', fontSize: 13, fontWeight: '700' },
  jobTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  companyText: { color: '#94A3B8', fontSize: 14, marginBottom: 16 },
  detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activeJobStatus: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  activeJobStatusText: { color: '#10B981', fontSize: 15, fontWeight: '700' },
  declineButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  acceptButton: {
    flex: 1, height: 48, borderRadius: 12,
    backgroundColor: '#F97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  acceptButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  closeIcon: { padding: 4 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalItemText: { color: '#E2E8F0', fontSize: 16 }
});
