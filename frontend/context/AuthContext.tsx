import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGoogleSignIn, apiGetMe } from '../services/api';

// ─── Types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  phoneNumber: string | null;
  role: 'LABORER' | 'CONTRACTOR' | 'PROPERTY_OWNER' | null;
  onboardingComplete: boolean;
  laborerProfile?: any;
  contractorProfile?: any;
  propertyOwnerProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: (idToken: string) => Promise<{ user: User; isNewUser: boolean }>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
  setToken: (token: string) => Promise<void>;
}

// ─── Storage Keys ───────────────────────────────────────────────────

const STORAGE_KEY_TOKEN = '@buildforce_auth_token';
const STORAGE_KEY_USER = '@buildforce_user';

// ─── Context ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  signInWithGoogle: async () => ({ user: {} as User, isNewUser: true }),
  signOut: async () => {},
  updateUser: () => {},
  setToken: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Provider ───────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, restore saved auth session
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);

      if (savedToken && savedUser) {
        setTokenState(savedToken);
        setUser(JSON.parse(savedUser));

        // Optionally verify the token is still valid by calling /me
        try {
          const response = await apiGetMe(savedToken);
          const freshUser: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            photoUrl: response.user.photoUrl,
            phoneNumber: response.user.phoneNumber || null,
            role: response.user.role,
            onboardingComplete: response.user.onboardingComplete,
            laborerProfile: response.user.laborerProfile,
            contractorProfile: response.user.contractorProfile,
            propertyOwnerProfile: response.user.propertyOwnerProfile,
          };
          setUser(freshUser);
          await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(freshUser));
        } catch (err) {
          // Token expired or invalid — clear session
          console.log('Token expired, clearing session');
          await clearSession();
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
    setTokenState(null);
    setUser(null);
  };

  /**
   * Sign in with Google: sends the idToken to the backend,
   * receives a JWT + user data, persists them.
   */
  const signInWithGoogle = async (idToken: string): Promise<{ user: User; isNewUser: boolean }> => {
    const response = await apiGoogleSignIn(idToken);

    const { token: jwtToken, user: userData } = response;

    const authUser: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      photoUrl: userData.photoUrl,
      phoneNumber: userData.phoneNumber || null,
      role: userData.role,
      onboardingComplete: userData.onboardingComplete,
      laborerProfile: userData.laborerProfile,
      contractorProfile: userData.contractorProfile,
      propertyOwnerProfile: userData.propertyOwnerProfile,
    };

    // Persist
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, jwtToken);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
    setTokenState(jwtToken);
    setUser(authUser);

    // If user has completed onboarding, they're returning; otherwise new
    const isNewUser = !authUser.onboardingComplete;

    return { user: authUser, isNewUser };
  };

  const signOut = async () => {
    await clearSession();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
  };

  const setToken = async (newToken: string) => {
    setTokenState(newToken);
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        signInWithGoogle,
        signOut,
        updateUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
