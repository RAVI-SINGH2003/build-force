import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDrawer } from './_layout';
import { useAuth } from '../../context/AuthContext';

// ─── Data ────────────────────────────────────────────────────────
const TRADES = [
  'General Laborer', 'Carpenter', 'Electrician', 'Plumber', 'HVAC Technician',
  'Mason', 'Welder', 'Painter', 'Drywall Installer', 'Roofer', 'Heavy Equipment Operator',
];

const SKILLS = [
  'Blueprint Reading', 'Concrete Pouring', 'Crane Operation', 'Demolition',
  'Framing', 'Forklift Operation', 'Grading / Leveling', 'Heavy Equipment',
  'Interior Finishing', 'Permits & Compliance', 'Scaffolding', 'Site Safety (OSHA)',
  'Structural Steel', 'Surveying', 'Tile Setting', 'Waterproofing',
  'Welding (MIG/TIG)', 'Window / Door Install', 'Wiring / Conduit', 'Wood Finishing'
];

const INDIA_LOCATIONS: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Agra', 'Varanasi'],
};
const STATES = Object.keys(INDIA_LOCATIONS).sort();

// ─── Component ────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const laborerProfile = user?.laborerProfile || {};

  // Form State (Pre-filled with data from the database via AuthContext)
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [trade, setTrade] = useState(laborerProfile.trade || '');
  const [experience, setExperience] = useState(laborerProfile.experience || '');
  const [hourlyRate, setHourlyRate] = useState(laborerProfile.hourlyRate ? String(laborerProfile.hourlyRate) : '');
  const [bio, setBio] = useState(laborerProfile.bio || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [indianState, setIndianState] = useState(laborerProfile.state || '');
  const [city, setCity] = useState(laborerProfile.city || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(laborerProfile.skills || []);

  // Modals
  const [isTradeModalVisible, setIsTradeModalVisible] = useState(false);
  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);

  const CITIES = indianState ? INDIA_LOCATIONS[indianState] || [] : [];

  const handleSaveProfile = () => {
    // Save logic
    alert('Profile Saved Successfully!');
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(current => 
      current.includes(skill)
        ? current.filter(s => s !== skill)
        : [...current, skill]
    );
  };

  const renderListModal = (
    visible: boolean, close: () => void, data: string[], onSelect: (val: string) => void, title: string
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
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); close(); }}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

        {/* ─── Header ─── */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.topNavBrand}>BUILDFORCE</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>MY PROFILE</Text>
            <Text style={styles.pageSubtitle}>Keep your profile up to date to attract the best opportunities.</Text>
            
            {/* Badges */}
            <View style={styles.badgesWrapper}>
              {!user?.onboardingComplete && (
                <View style={styles.unverifiedBadge}>
                  <Ionicons name="information-circle-outline" size={14} color="#F87171" />
                  <Text style={styles.unverifiedText}>Profile Incomplete</Text>
                </View>
              )}
            </View>
          </View>

          {/* ─── Card 1: Identity ─── */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>IDENTITY (FROM SIGN-IN)</Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={[styles.input, styles.inputDisabled]} value={fullName} editable={false} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />
              </View>
            </View>
          </View>

          {/* ─── Card 2: Professional Details ─── */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>PROFESSIONAL DETAILS</Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Primary Trade</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setIsTradeModalVisible(true)}>
                  <Text style={styles.pickerText} numberOfLines={1}>{trade || 'Select trade'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Years Experience</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={experience} onChangeText={setExperience} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate (INR) <Text style={{color: '#94A3B8'}}>(₹)</Text></Text>
              <View style={styles.currencyInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput style={styles.currencyInput} keyboardType="numeric" value={hourlyRate} onChangeText={setHourlyRate} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell people about your background and experience..."
                placeholderTextColor="#64748B"
                multiline numberOfLines={3}
                textAlignVertical="top"
                value={bio} onChangeText={setBio}
              />
            </View>
          </View>

          {/* ─── Card 3: Contact & Location ─── */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>CONTACT & LOCATION</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>State</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setIsStateModalVisible(true)}>
                  <Text style={styles.pickerText} numberOfLines={1}>{indianState || 'State'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <TouchableOpacity style={[styles.pickerButton, !indianState && {opacity: 0.5}]} onPress={() => indianState && setIsCityModalVisible(true)}>
                  <Text style={styles.pickerText} numberOfLines={1}>{city || 'City'}</Text>
                  <Ionicons name="chevron-down" size={16} color={indianState ? "#94A3B8" : "#334155"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ─── Card 4: Skills ─── */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>SKILLS</Text>
            <View style={styles.skillsGrid}>
              {SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.skillPill, isSelected && styles.skillPillActive]}
                    onPress={() => toggleSkill(skill)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isSelected ? "close" : "add"} size={14} color={isSelected ? "#F97316" : "#cbd5e1"} />
                    <Text style={[styles.skillText, isSelected && styles.skillTextActive]}>{skill}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} activeOpacity={0.8}>
            <Ionicons name="save-outline" size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>

        </ScrollView>

        {renderListModal(isTradeModalVisible, () => setIsTradeModalVisible(false), TRADES, setTrade, 'Primary Trade')}
        {renderListModal(isStateModalVisible, () => setIsStateModalVisible(false), STATES, (val) => { setIndianState(val); setCity(''); }, 'Select State')}
        {renderListModal(isCityModalVisible, () => setIsCityModalVisible(false), CITIES, setCity, 'Select City')}

      </View>
    </KeyboardAvoidingView>
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
    borderBottomColor: '#1E293B'
  },
  menuButton: { padding: 4 },
  topNavBrand: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: 0.5, marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#94A3B8', lineHeight: 20, marginBottom: 16 },
  badgesWrapper: { flexDirection: 'row', gap: 12 },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6
  },
  unverifiedText: { color: '#F87171', fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1, borderColor: '#1E293B',
    borderRadius: 12, padding: 20, marginBottom: 20
  },
  cardHeaderTitle: {
    fontSize: 12, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 1.2, marginBottom: 20
  },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#E2E8F0', marginBottom: 8 },
  input: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, color: '#FFF',
    fontSize: 14
  },
  inputDisabled: { opacity: 0.6, backgroundColor: '#0B1120' },
  pickerButton: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  pickerText: { color: '#FFF', fontSize: 14 },
  currencyInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 8,
  },
  currencySymbol: { paddingHorizontal: 14, color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  currencyInput: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 12, paddingRight: 14 },
  textArea: { height: 80, paddingTop: 12 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 6
  },
  skillPillActive: { backgroundColor: 'rgba(249, 115, 22, 0.1)', borderColor: '#F97316' },
  skillText: { color: '#cbd5e1', fontSize: 13, fontWeight: '500' },
  skillTextActive: { color: '#F97316', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#F97316', borderRadius: 8, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  // Modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  closeIcon: { padding: 4 },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  modalItemText: { color: '#FFF', fontSize: 15 }
});
