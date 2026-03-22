import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface RoleCardProps {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge?: string;
  delay: number;
  onPress: () => void;
}

function RoleCard({ title, subtitle, description, bullets, icon, color, badge, delay, onPress }: RoleCardProps) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: 20,
      }}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <LinearGradient
          colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
          style={[styles.card, { borderColor: color }]}
        >
          {badge && (
            <View style={[styles.badgeContainer, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>

          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color }]}>{subtitle}</Text>
          <Text style={styles.cardDescription}>{description}</Text>

          <View style={styles.bulletsContainer}>
            {bullets.map((bullet, index) => (
              <View key={index} style={styles.bulletRow}>
                <Ionicons name="checkmark" size={16} color={color} style={styles.bulletIcon} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelectionScreen() {
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const selectRole = (role: string) => {
    console.log('Selected Role:', role);

    if (role === 'laborer') {
      router.push('/onboarding/laborer');
    } else if (role === 'contractor') {
      router.push('/onboarding/contractor');
    } else if (role === 'property_owner') {
      router.push('/onboarding/property-owner');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background */}
      <LinearGradient colors={['#0B1120', '#0F1724', '#131D30']} style={StyleSheet.absoluteFillObject} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: headerFade, marginBottom: 32 }}>
          <Text style={styles.headerTitle}>Who are you?</Text>
          <Text style={styles.headerSubtitle}>
            Choose how you want to use BuildForce. You can change this later in settings.
          </Text>
        </Animated.View>

        <RoleCard
          title="Property Owner"
          subtitle="I need work done on my property"
          description="Post renovation, construction, or maintenance projects. Hire verified contractors and crews."
          bullets={['Post unlimited jobs', 'Escrow payment protection', 'Rate your crew']}
          icon="home-outline"
          color="#FBBF24" // Amber/Yellow
          delay={100}
          onPress={() => selectRole('property_owner')}
        />

        <RoleCard
          title="Contractor"
          subtitle="I manage construction projects"
          description="Build your on-demand crew. Post jobs, manage applications, and scale your workforce instantly."
          bullets={['Access 12,000+ workers', 'Per-job messaging', 'Analytics dashboard']}
          icon="business-outline"
          color="#F97316" // Orange
          badge="MOST POPULAR"
          delay={250}
          onPress={() => selectRole('contractor')}
        />

        <RoleCard
          title="Laborer"
          subtitle="I'm looking for construction work"
          description="Showcase your trade skills, apply to jobs that match your expertise, and get paid securely."
          bullets={['Instant job notifications', 'Escrow-backed pay', 'Build your reputation']}
          icon="construct-outline"
          color="#22C55E" // Green
          delay={400}
          onPress={() => selectRole('laborer')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
    marginBottom: 20,
  },
  bulletsContainer: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIcon: {
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#E2E8F0',
    flex: 1,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
