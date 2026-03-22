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

// ─── Data ────────────────────────────────────────────────────────
const TRADES = [
  'General Contractor',
  'Carpentry / Framing',
  'Concrete / Masonry',
  'Drywall / Plastering',
  'Electrical',
  'Flooring',
  'General Labor Providers',
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
export default function ContractorOnboardingScreen() {
  // Form State
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [trade, setTrade] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [indianState, setIndianState] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');

  // Dropdown Modals
  const [isTradeModalVisible, setIsTradeModalVisible] = useState(false);
  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);

  // Dynamic Cities
  const CITIES = indianState ? INDIA_LOCATIONS[indianState] || [] : [];

  const handleCompleteSetup = () => {
    // Save profile data to backend here...
    console.log('Contractor Profile:', {
      companyName, website, trade, experience, phone, city, state: indianState, bio
    });

    // Navigate to Dashboard
    router.replace('/(tabs)');
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageSubtitle}>Your profile is the first thing workers see. Make it count.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="BuildRight Construction LLC"
                placeholderTextColor="#64748B"
                value={companyName}
                onChangeText={setCompanyName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="https://yourcompany.com"
                placeholderTextColor="#64748B"
                keyboardType="url"
                autoCapitalize="none"
                value={website}
                onChangeText={setWebsite}
              />
            </View>

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
              <Text style={styles.label}>Years of Experience <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="5"
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
                placeholder="+91 98765 43210"
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
                    {indianState || 'State'}
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
                    {city || 'Houston'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={indianState ? "#94A3B8" : "#334155"} />
                </TouchableOpacity>
              </View>
            </View>

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

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleCompleteSetup}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Complete Setup & Go to Dashboard</Text>
            </TouchableOpacity>

          </View>



        </ScrollView>

        {/* Render Modals */}
        {renderListModal(isTradeModalVisible, () => setIsTradeModalVisible(false), TRADES, setTrade, 'Select Primary Trade')}
        {renderListModal(isStateModalVisible, () => setIsStateModalVisible(false), STATES, (val) => {
          setIndianState(val);
          setCity(''); // Reset dynamic city
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
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
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  pickerButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerDisabled: {
    opacity: 0.4,
  },
  pickerText: {
    color: '#FFF',
    fontSize: 15,
  },
  placeholderText: {
    color: '#64748B',
  },
  submitButton: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
