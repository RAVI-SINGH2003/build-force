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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

// ──────────────────────────────────────────────
// 🔑  Your Google OAuth Client ID (Web type)
// ──────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '664083031630-7f17tp1fjk78r32570h7i2j9uosf7c56.apps.googleusercontent.com';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);

  // Automatically handles Web (localhost), Expo Go (proxy), and Native (buildforce://) securely
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'buildforce',
    preferLocalhost: Platform.OS === 'web', // MUST be false on mobile to force the auth.expo.io proxy
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false, // Forces Google to accept implicit proxy flow without challenge_method errors
    },
    discovery
  );

  // Watch for auth flow completion
  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.params.access_token;
      if (accessToken) {
        handleGoogleToken(accessToken);
      }
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      setIsLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setIsLoading(false);
    }
  }, [response]);

  const handleContinueWithGoogle = async () => {
    setIsLoading(true);
    try {
      // 🚨 CRITICAL FIX FOR EXPO GO ON MOBILE 🚨
      // Google's OAuth 2.0 policy permanently blocks any redirect_uri starting with 'exp://'.
      // Since Expo completely removed their auth proxy in newer versions, real Google auth 
      // will ONLY work exactly right on Web (localhost) or in a compiled Production Android/iOS Build.
      // To allow you to keep testing your mobile app right now without setting up a 20-minute Android Native Dev Build:
      if (Platform.OS !== 'web' && Constants.appOwnership === 'expo') {
        console.log('🤖 Detected Expo Go Mobile: Simulating Google Login so you can test the UI!');
        setTimeout(() => {
          setIsLoading(false);
          router.replace('/role-selection');
        }, 800);
        return;
      }

      await promptAsync();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  const handleGoogleToken = async (accessToken: string) => {
    try {
      // Fetch user profile securely
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await res.json();
      console.log('✅ Google user info:', userInfo);

      // Successfully authenticated -> Redirect to Role Selection
      router.replace('/role-selection');
    } catch (error) {
      console.error('Failed to fetch user info:', error);
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
            <FeatureChip icon="briefcase-outline" label="Post & find jobs" />
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
            disabled={isLoading || !request}
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
