import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from './_layout';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../context/AuthContext';

export default function MyIdCardScreen() {
  const { openDrawer } = useDrawer();
  const { user } = useAuth();
  
  const laborerProfile = user?.laborerProfile || {};
  const platformId = laborerProfile.platformId || `LAB-${user?.id?.substring(0, 6).toUpperCase() || '477541'}`;
  
  const idCardRef = useRef<ViewShot>(null);

  const downloadCard = async () => {
    try {
      if (idCardRef.current && idCardRef.current.capture) {
        const uri = await idCardRef.current.capture();
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          alert('Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Snapshot failed', error);
      alert('Failed to download card');
    }
  };
  
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  const profileLink = `https://buildforce.onhercules.app/u/${platformId}`;

  const shareProfileLink = async () => {
    try {
      await Share.share({
        message: profileLink,
      });
    } catch (error) {
      alert('Error sharing link');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Digital ID</Text>
          <Text style={styles.headerSubtitle}>Your verified identity on the BuildForce platform</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.downloadButton} onPress={downloadCard} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={16} color="#0B1120" />
            <Text style={styles.downloadButtonText}>Download Card</Text>
          </TouchableOpacity>
        </View>

        {/* Digital ID Card */}
        <View style={styles.idCardWrapper}>
          <ViewShot ref={idCardRef} options={{ format: 'png', quality: 1.0 }} style={{ width: '100%' }}>
            <View style={styles.idCardBorder}>
            <View style={styles.idCardContainer}>
              {/* ID Card Header */}
              <View style={styles.idCardTopBar}>
                <View style={styles.brandRow}>
                  <Ionicons name="construct-outline" size={18} color="#0B1120" />
                  <Text style={styles.idCardBrand}>BUILDFORCE</Text>
                </View>
                <View style={styles.digitalIdPill}>
                  <Text style={styles.digitalIdText}>DIGITAL ID</Text>
                </View>
              </View>
              
              <View style={styles.idCardBody}>
                {/* Profile Info */}
                <View style={styles.profileRow}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{getInitials(user?.name || '')}</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{user?.name || 'Unknown'}</Text>
                    <Text style={styles.roleText}>Skilled Laborer</Text>
                    <Text style={styles.tradeText}>{laborerProfile.trade || 'Trade not set'}</Text>
                  </View>
                </View>

                {/* Platform ID Box */}
                <View style={styles.platformIdBox}>
                  <Text style={styles.platformIdLabel}>PLATFORM ID</Text>
                  <Text style={styles.platformIdValue}>{platformId}</Text>
                </View>

                {/* Trust Score block inside the card */}
                <View style={styles.trustScoreBlock}>
                  <View style={styles.trustScoreHeader}>
                    <Text style={styles.trustScoreLabel}>TRUST SCORE</Text>
                    <Text style={styles.trustScoreValue}><Text style={styles.trustScoreHighlight}>Average</Text> 50/100</Text>
                  </View>
                  <View style={styles.progressBarTrackCard}>
                    <View style={[styles.progressBarFillCard, { width: '50%' }]} />
                  </View>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>0 jobs completed</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={12} color="#94A3B8" />
                      <Text style={styles.statsText}>
                        {laborerProfile.city ? `${laborerProfile.city}, ${laborerProfile.state}` : 'Location not set'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ID Card Footer */}
              <View style={styles.idCardFooter}>
                <Text style={styles.footerText}>buildforce.app</Text>
                <Text style={styles.footerText}>Issued {currentMonth} {currentYear}</Text>
              </View>
            </View>
            </View>
          </ViewShot>
        </View>

        {/* Public Profile Link */}
        <View style={styles.publicProfileContainer}>
          <Text style={styles.publicProfileLabel}>YOUR PUBLIC PROFILE LINK</Text>
          <TouchableOpacity onPress={shareProfileLink} activeOpacity={0.7}>
            <Text style={styles.publicProfileLink}>{profileLink}</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Score Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Trust Score</Text>
            <View style={styles.averagePill}>
              <Text style={styles.averageText}>Average</Text>
            </View>
          </View>

          <View style={styles.largeScoreRow}>
            <Text style={styles.largeScoreNum}>50</Text>
            <Text style={styles.largeScoreMax}>/100</Text>
          </View>

          <View style={styles.largeProgressBarTrack}>
            <View style={[styles.largeProgressBarFill, { width: '50%' }]} />
          </View>

          <View style={styles.scaleContainer}>
            <View style={[styles.scaleItem, {borderRightWidth: 1, borderColor: '#334155'}]}>
              <Text style={[styles.scaleLabel, {color: '#F87171'}]}>Risky</Text>
              <Text style={styles.scaleSubtext}>0-39</Text>
            </View>
            <View style={[styles.scaleItem, {borderRightWidth: 1, borderColor: '#F97316', backgroundColor: 'rgba(249, 115, 22, 0.05)'}]}>
              <Text style={[styles.scaleLabel, {color: '#FBBF24'}]}>Average</Text>
              <Text style={[styles.scaleSubtext, {color: '#FBBF24'}]}>40-59</Text>
            </View>
            <View style={[styles.scaleItem, {borderRightWidth: 1, borderColor: '#334155'}]}>
              <Text style={[styles.scaleLabel, {color: '#60A5FA'}]}>Reliable</Text>
              <Text style={styles.scaleSubtext}>60-79</Text>
            </View>
            <View style={styles.scaleItem}>
              <Text style={[styles.scaleLabel, {color: '#34D399'}]}>Trusted Pro</Text>
              <Text style={styles.scaleSubtext}>80-100</Text>
            </View>
          </View>
        </View>

        {/* How Score is Calculated Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.calculationHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
            <Text style={styles.calculationTitle}>How your score is calculated</Text>
          </View>

          <View style={styles.calculationList}>
            <View style={styles.calcRow}>
              <View style={styles.calcLeft}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text style={styles.calcText}>Job completed (escrow released)</Text>
              </View>
              <Text style={styles.calcPoints}>+5</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.calcRow}>
              <View style={styles.calcLeft}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text style={styles.calcText}>Positive review (rating &gt; 4★)</Text>
              </View>
              <Text style={styles.calcPoints}>+2</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.calcRow}>
              <View style={styles.calcLeft}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text style={styles.calcText}>Profile verified by admin</Text>
              </View>
              <Text style={styles.calcPoints}>+5</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.calcRow}>
              <View style={styles.calcLeft}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
                <Text style={styles.calcText}>Video resume uploaded (first)</Text>
              </View>
              <Text style={styles.calcPoints}>+5</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#0F1724',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  menuButton: { padding: 4, marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  // Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: { color: '#0B1120', fontWeight: '700', fontSize: 13 },

  // ID Card
  idCardWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  idCardBorder: {
    backgroundColor: '#1E293B',
    padding: 1,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  idCardContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 15,
    overflow: 'hidden',
  },
  idCardTopBar: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  idCardBrand: { color: '#0B1120', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  digitalIdPill: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  digitalIdText: { color: '#0B1120', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  idCardBody: { padding: 20 },
  
  // Profile Row
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarContainer: {
    width: 60, height: 60,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1, borderColor: '#F97316',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#F97316', fontSize: 24, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  roleText: { color: '#94A3B8', fontSize: 14, marginBottom: 2 },
  tradeText: { color: '#F97316', fontSize: 12, fontWeight: '600' },

  // Platform ID Box
  platformIdBox: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  platformIdLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  platformIdValue: { color: '#F97316', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

  // Inside Card Trust Score
  trustScoreBlock: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 16,
  },
  trustScoreHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  trustScoreLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  trustScoreValue: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  trustScoreHighlight: { color: '#FBBF24' },
  progressBarTrackCard: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBarFillCard: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: { color: '#64748B', fontSize: 11 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0B1120',
  },
  footerText: { color: '#475569', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  // Public Profile Link
  publicProfileContainer: {
    backgroundColor: '#111827',
    borderWidth: 1, borderColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  publicProfileLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  publicProfileLink: { color: '#F97316', fontSize: 13, fontWeight: '500' },

  // Sections
  sectionContainer: {
    backgroundColor: '#111827',
    borderWidth: 1, borderColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  averagePill: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  averageText: { color: '#FBBF24', fontSize: 12, fontWeight: '700' },
  
  largeScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  largeScoreNum: { color: '#FBBF24', fontSize: 48, fontWeight: '800', lineHeight: 50 },
  largeScoreMax: { color: '#94A3B8', fontSize: 20, fontWeight: '600', marginLeft: 4 },

  largeProgressBarTrack: {
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  largeProgressBarFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 5,
  },

  scaleContainer: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: '#334155',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scaleItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scaleLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  scaleSubtext: { color: '#64748B', fontSize: 10 },

  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calculationTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  calculationList: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calcLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calcText: { color: '#cbd5e1', fontSize: 13, fontWeight: '500' },
  calcPoints: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 4 },
});
