import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ──────────────────────────────────────────────
// 🔑  Configure Google Sign-In
// ──────────────────────────────────────────────
GoogleSignin.configure({
  webClientId: '664083031630-7f17tp1fjk78r32570h7i2j9uosf7c56.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, isAuthenticated, user, isLoading: authLoading } = useAuth();

  // If user is already authenticated, redirect based on onboarding status
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.onboardingComplete) {
        router.replace('/(tabs)');
      } else if (user.role) {
        // Has role but didn't finish onboarding
        if (user.role === 'LABORER') router.replace('/onboarding/laborer');
        else if (user.role === 'CONTRACTOR') router.replace('/onboarding/contractor');
        else if (user.role === 'PROPERTY_OWNER') router.replace('/onboarding/property-owner');
      } else {
        router.replace('/role-selection');
      }
    }
  }, [authLoading, isAuthenticated, user]);

  const handleContinueWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign out first so the account chooser is always shown
      await GoogleSignin.signOut();

      // Trigger native Google Sign-In
      const response = await GoogleSignin.signIn();

      if (response.type === 'success' && response.data) {
        const { idToken } = response.data;
        const { user: googleUser } = response.data;

        console.log('✅ Google user info:', googleUser);
        console.log('   Name:', googleUser.name);
        console.log('   Email:', googleUser.email);

        if (!idToken) {
          Alert.alert('Error', 'Could not get ID token from Google. Please try again.');
          return;
        }

        // Send idToken to our backend for verification
        try {
          const { user: authUser, isNewUser } = await signInWithGoogle(idToken);
          console.log('✅ Backend auth successful:', authUser.email);

          if (authUser.onboardingComplete) {
            // Returning user — go straight to dashboard
            router.replace('/(tabs)');
          } else if (authUser.role) {
            // Has role but didn't finish onboarding
            if (authUser.role === 'LABORER') router.replace('/onboarding/laborer');
            else if (authUser.role === 'CONTRACTOR') router.replace('/onboarding/contractor');
            else if (authUser.role === 'PROPERTY_OWNER') router.replace('/onboarding/property-owner');
          } else {
            // New user — go to role selection
            router.replace('/role-selection');
          }
        } catch (backendError: any) {
          console.error('Backend auth error:', backendError);
          Alert.alert(
            'Authentication Error',
            `Could not verify your account with our server.\n\n${backendError.message || 'Please try again.'}`
          );
        }
      } else if (response.type === 'cancelled') {
        console.log('User cancelled Google sign-in');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Sign-in cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services is not available on this device.');
      } else {
        Alert.alert(
          'Sign-In Error',
          `Something went wrong. Please try again.\n\nDetails: ${error.message || error}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Animations ──────────────────────────────
  const fadeIn = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoSlide = useRef(new Animated.Value(-20)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoSlide, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Show loading spinner while checking saved auth
  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#0B1120', '#0F1724', '#131D30']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#0B1120', '#0F1724', '#131D30']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.orbContainer}>
        <Animated.View
          style={[styles.orb, styles.orbTopRight, { opacity: glowPulse }]}
        />
        <View style={[styles.orb, styles.orbBottomLeft]} />
        <Animated.View
          style={[styles.orb, styles.orbCenter, { opacity: glowPulse }]}
        />
      </View>

      <View style={styles.content}>
        {/* ─── Top: Logo & Branding ─── */}
        <View style={styles.brandSection}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeIn,
                transform: [{ scale: logoScale }, { translateY: logoSlide }],
              },
            ]}
          >
            <Animated.View
              style={[styles.logoGlow, { opacity: glowPulse }]}
            />
            <LinearGradient
              colors={['#F97316', '#F59E0B', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <Ionicons name="construct" size={44} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={{
              opacity: textFade,
              transform: [{ translateY: textSlide }],
            }}
          >
            <Text style={styles.appName}>BuildForce</Text>
            <Text style={styles.tagline}>Build smarter. Hire faster.</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: textFade,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <FeatureChip icon="people-outline" label="Connect with workers" />
            <FeatureChip icon="briefcase-outline" label="Post & find Opportunities" />
            <FeatureChip
              icon="shield-checkmark-outline"
              label="Verified profiles"
            />
          </Animated.View>
        </View>

        {/* ─── Bottom: Google Button ─── */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleContinueWithGoogle}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#1F2937" size="small" />
            ) : (
              <>
                <View style={styles.googleIconWrap}>
                  <GoogleLogo />
                </View>
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' & '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

function FeatureChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureChip}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon as any} size={16} color="#F97316" />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function GoogleLogo() {
  return (
    <View style={styles.gLogoContainer}>
      <Text style={styles.gBlue}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTopRight: {
    width: 320,
    height: 320,
    top: -100,
    right: -100,
    backgroundColor: 'rgba(249, 115, 22, 0.07)',
  },
  orbBottomLeft: {
    width: 260,
    height: 260,
    bottom: 40,
    left: -100,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  orbCenter: {
    width: 200,
    height: 200,
    top: height * 0.3,
    left: width * 0.3,
    backgroundColor: 'rgba(251, 191, 36, 0.04)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: height * 0.12,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.4,
  },
  featuresContainer: {
    marginTop: 40,
    gap: 14,
    width: '100%',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.25)',
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureLabel: {
    fontSize: 15,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 17,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  googleIconWrap: {
    marginRight: 14,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  gLogoContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gBlue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
  },
  termsText: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  termsLink: {
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
