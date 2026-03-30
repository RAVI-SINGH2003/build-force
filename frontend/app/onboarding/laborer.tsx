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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { apiCompleteLaborerOnboarding } from '../../services/api';

// ─── Data ────────────────────────────────────────────────────────
const SKILLED_TRADES = [
  'Carpentry / Framing',
  'Concrete / Masonry',
  'Drywall / Plastering',
  'Electrical',
  'Flooring',
  'HVAC',
  'Landscaping / Excavation',
  'Painting',
  'Plumbing',
  'Project Management',
  'Roofing',
  'Steel / Ironwork',
  'Tiling',
  'Welding',
  'Other',
];

const UNSKILLED_TRADES = [
  'General Laborer',
  'Warehouse Worker',
  'Material Handler',
  'Site Cleanup crew',
  'Demolition Worker',
  'Flagging / Traffic Control',
  'Other',
];

const SKILLED_SKILLS = [
  'Blueprint Reading',
  'Concrete Pouring',
  'Crane Operation',
  'Demolition',
  'Forklift Operation',
  'Framing',
  'Grading / Leveling',
  'Heavy Equipment',
  'Interior Finishing',
  'Permits & Compliance',
  'Scaffolding',
  'Site Safety (OSHA)',
  'Structural Steel',
  'Surveying',
  'Tile Setting',
  'Waterproofing',
  'Welding (MIG/TIG)',
  'Window / Door Install',
  'Wiring / Conduit',
  'Wood Finishing',
];

const UNSKILLED_SKILLS = [
  'Heavy Lifting',
  'Site Cleanup',
  'Demolition Support',
  'Loading / Unloading',
  'Material Handling',
  'Digging / Trenching',
  'Tools Maintenance',
  'Traffic Control',
  'Safety Watch',
  'Assembly'
];

const INDIA_LOCATIONS: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Agra', 'Varanasi'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur']
};

const STATES = Object.keys(INDIA_LOCATIONS).sort();

// ─── Component ────────────────────────────────────────────────────
export default function LaborerOnboardingScreen() {
  // Form State
  const [laborType, setLaborType] = useState<'skilled' | 'unskilled'>('skilled');
  const [trade, setTrade] = useState('');
  const [rate, setRate] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [indianState, setIndianState] = useState('');
  const [city, setCity] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth context
  const { token, updateUser, user } = useAuth();

  // Dropdown Modals
  const [isLaborTypeModalVisible, setIsLaborTypeModalVisible] = useState(false);
  const [isTradeModalVisible, setIsTradeModalVisible] = useState(false);
  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);

  // Dynamic Cities based on selected State
  const CITIES = indianState ? INDIA_LOCATIONS[indianState] || [] : [];

  // Toggle Skill
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleCompleteSetup = async () => {
    // Validate required fields
    if (!trade) {
      Alert.alert('Missing Field', 'Please select a primary trade.');
      return;
    }
    if (!rate) {
      Alert.alert('Missing Field', 'Please enter your hourly rate.');
      return;
    }
    if (!experience) {
      Alert.alert('Missing Field', 'Please enter years of experience.');
      return;
    }
    if (!phone) {
      Alert.alert('Missing Field', 'Please enter your phone number.');
      return;
    }
    if (!indianState || !city) {
      Alert.alert('Missing Field', 'Please select your state and city.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'You must be signed in. Please go back and sign in again.');
      router.replace('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      const onboardingData = {
        type: laborType === 'skilled' ? 'SKILLED' as const : 'UNSKILLED' as const,
        trade,
        hourlyRate: rate,
        experience,
        phone,
        state: indianState,
        city,
        skills: selectedSkills,
        bio: bio || undefined,
      };

      console.log('📤 Submitting laborer onboarding:', onboardingData);
      const response = await apiCompleteLaborerOnboarding(token, onboardingData);
      console.log('✅ Onboarding complete:', response);

      // Update local user state to reflect completed onboarding
      if (user) {
        updateUser({ 
          ...user, 
          onboardingComplete: true,
          phoneNumber: phone,
          laborerProfile: response.profile
        });
      }

      // Navigate to Dashboard
      Alert.alert(
        '🎉 Profile Complete!',
        'Your laborer profile has been created successfully. Welcome to BuildForce!',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper render for modal lists
  const renderListModal = (
    visible: boolean,
    close: () => void,
    data: string[],
    onSelect: (val: string) => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={close} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  close();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                <Ionicons name="chevron-forward" size={18} color="#475569" />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

        {/* Loading overlay */}
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Saving your profile...</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Complete Your Profile</Text>
          <Text style={styles.pageSubtitle}>Tell contractors about your skills and experience to start landing jobs.</Text>

          {/* ─── Type Dropdown ─── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Labor Type <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setIsLaborTypeModalVisible(true)}>
              <Text style={styles.pickerText}>
                {laborType === 'skilled' ? 'Skilled' : 'General / Unskilled'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* ─── Form Fields ─── */}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Trade <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setIsTradeModalVisible(true)}>
              <Text style={[styles.pickerText, !trade && styles.placeholderText]}>
                {trade || 'Select trade category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate (INR) <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={[styles.input, styles.inputWithPrefix]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#64748B"
                value={rate}
                onChangeText={setRate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Years of Experience <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor="#64748B"
              value={experience}
              onChangeText={setExperience}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="+91 99999 99999"
              placeholderTextColor="#64748B"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setIsStateModalVisible(true)}>
                <Text style={[styles.pickerText, !indianState && styles.placeholderText]} numberOfLines={1}>
                  {indianState || 'Select State'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={[styles.pickerButton, !indianState && styles.pickerDisabled]} 
                onPress={() => indianState && setIsCityModalVisible(true)}
                activeOpacity={indianState ? 0.7 : 1}
              >
                <Text style={[styles.pickerText, !city && styles.placeholderText]} numberOfLines={1}>
                  {city || 'Select City'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={indianState ? "#94A3B8" : "#334155"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Skills Selection ─── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skills <Text style={styles.optional}>(select all that apply)</Text></Text>
            <View style={styles.skillsContainer}>
              {(laborType === 'skilled' ? SKILLED_SKILLS : UNSKILLED_SKILLS).map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.skillChip, isSelected && styles.skillChipActive]}
                    onPress={() => toggleSkill(skill)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isSelected ? "checkmark" : "add"} 
                      size={14} 
                      color={isSelected ? "#FFF" : "#94A3B8"} 
                    />
                    <Text style={[styles.skillText, isSelected && styles.skillTextActive]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ─── Bio ─── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell contractors a bit about yourself and your experience..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={bio}
              onChangeText={setBio}
            />
          </View>

          {/* ─── Submit Button ─── */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleCompleteSetup}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Setup & Go to Dashboard</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Render Modals */}
        {renderListModal(isLaborTypeModalVisible, () => setIsLaborTypeModalVisible(false), ['Skilled', 'General / Unskilled'], (val) => {
          setLaborType(val === 'Skilled' ? 'skilled' : 'unskilled');
          setTrade('');
          setSelectedSkills([]);
        }, 'Select Labor Type')}
        {renderListModal(isTradeModalVisible, () => setIsTradeModalVisible(false), laborType === 'skilled' ? SKILLED_TRADES : UNSKILLED_TRADES, setTrade, 'Select Primary Trade')}
        {renderListModal(isStateModalVisible, () => setIsStateModalVisible(false), STATES, (val) => {
          setIndianState(val);
          setCity(''); // Reset city when state changes
        }, 'Select State')}
        {renderListModal(isCityModalVisible, () => setIsCityModalVisible(false), CITIES, setCity, 'Select City')}

      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 60,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  optional: {
    color: '#64748B',
    fontWeight: '400',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputPrefix: {
    position: 'absolute',
    left: 16,
    color: '#94A3B8',
    fontSize: 15,
    zIndex: 1,
  },
  inputWithPrefix: {
    paddingLeft: 32,
  },
  pickerButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  pickerText: {
    color: '#FFF',
    fontSize: 15,
  },
  placeholderText: {
    color: '#64748B',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  skillChipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  skillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  skillTextActive: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },

  // ─── Modal Styles ───
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1724',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalItemText: {
    color: '#E2E8F0',
    fontSize: 16,
  },
});
