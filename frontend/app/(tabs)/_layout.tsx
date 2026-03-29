import React, { useState, useRef, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, ScrollView, Platform, Easing } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85;
const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

export const DrawerContext = createContext({
  openDrawer: () => {},
  closeDrawer: () => {},
  isDrawerOpen: false,
  bottomNavHeight: BOTTOM_NAV_HEIGHT,
});

export function useDrawer() {
  return useContext(DrawerContext);
}

// Profile removed from sidebar — it lives in the bottom nav now
const MENU_ITEMS = [
  { id: 'index', label: 'Overview', icon: 'grid-outline' },
  { id: 'open_jobs', label: 'Open Jobs', icon: 'search-outline' },
  { id: 'my_jobs', label: 'My Jobs', icon: 'briefcase-outline' },
  { id: 'marketplace', label: 'Marketplace', icon: 'bag-handle-outline', isComingSoon: true },
  { id: 'training', label: 'Training', icon: 'school-outline', isComingSoon: true },
  { id: 'video_resume', label: 'Video Resume', icon: 'videocam-outline', isComingSoon: true },
  { id: 'messages', label: 'Messages', icon: 'chatbubble-outline', isComingSoon: true },
  { id: 'earnings', label: 'Earnings', icon: 'wallet-outline' },
  { id: 'reviews', label: 'Reviews', icon: 'star-outline', isComingSoon: true },
  { id: 'finance', label: 'Finance', icon: 'trending-up-outline', isComingSoon: true },
  { id: 'my_id_card', label: 'My ID Card', icon: 'id-card-outline' },
];

// Bottom navigation tab definitions
const BOTTOM_TABS = [
  { id: 'index', label: 'Overview', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'open_jobs', label: 'Open Jobs', icon: 'search-outline', activeIcon: 'search' },
  { id: 'my_jobs', label: 'My Jobs', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { id: 'profile', label: 'profile_tab', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

export default function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pathname = usePathname();

  // TODO: Replace with real user data from auth context
  const userName = 'Ravi Singh';

  const openDrawer = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4)),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.poly(4)),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const handleSignOut = () => {
    closeDrawer();
    router.replace('/auth');
  };

  const navigateToTab = (tabId: string) => {
    if (tabId === 'index') {
      router.push('/(tabs)');
    } else {
      router.push(`/(tabs)/${tabId}` as any);
    }
  };

  const isTabActive = (tabId: string) => {
    if (tabId === 'index') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname === `/${tabId}`;
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, isDrawerOpen: isOpen, bottomNavHeight: BOTTOM_NAV_HEIGHT }}>
      <View style={styles.container}>
        {/* Main Application Stack */}
        <View style={styles.mainContent}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="open_jobs" />
            <Stack.Screen name="my_jobs" />
          </Stack>
        </View>

        {/* ─── Bottom Navigation Bar ─── */}
        <View style={styles.bottomNav}>
          <View style={styles.bottomNavInner}>
            {BOTTOM_TABS.map((tab) => {
              const active = isTabActive(tab.id);
              const isProfileTab = tab.id === 'profile';

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.bottomNavTab}
                  onPress={() => navigateToTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.tabIconContainer, active && styles.tabIconContainerActive]}>
                    <Ionicons
                      name={(active ? tab.activeIcon : tab.icon) as any}
                      size={isProfileTab ? 22 : 20}
                      color={active ? '#F97316' : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.bottomNavLabel,
                      active && styles.bottomNavLabelActive,
                      isProfileTab && styles.profileTabLabel,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {isProfileTab ? userName : tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Drawer Overlay (Dim Background) */}
        {isOpen && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDrawer} />
            <TouchableOpacity style={styles.closeIconWrapper} onPress={closeDrawer}>
              <Ionicons name="close" size={28} color="#000" style={{opacity: 0.6}} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* The Sliding Drawer Itself */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          
          {/* Header */}
          <View style={styles.drawerHeader}>
            <Ionicons name="flash" size={18} color="#FFF" />
            <Text style={styles.drawerHeaderText}>Built with Hercules</Text>
          </View>

          {/* Role Pill */}
          <View style={styles.roleContainer}>
            <View style={styles.rolePill}>
              <Ionicons name="construct-outline" size={16} color="#10B981" />
              <Text style={styles.roleText}>Skilled Laborer</Text>
            </View>
          </View>

          {/* Scrollable Nav Items */}
          <ScrollView contentContainerStyle={styles.navContainer} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item, index) => {
              // Determine if this item is active
              const isActive = (pathname === '/' && item.id === 'index') || 
                               (pathname === `/${item.id}`) ||
                               (item.id === 'index' && pathname === '/index');

              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.navItem, isActive && styles.navItemActive, item.isComingSoon && styles.navItemDisabled]}
                  activeOpacity={item.isComingSoon ? 1 : 0.7}
                  onPress={() => {
                    if (item.isComingSoon) return;
                    closeDrawer();
                    navigateToTab(item.id);
                  }}
                >
                  <View style={styles.navItemLeft}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={isActive ? "#F97316" : "#cbd5e1"} 
                    />
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </View>

                  {/* Navigation Icon or Soon Badge */}
                  {item.isComingSoon ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Soon</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={isActive ? "#F97316" : "#64748B"} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Drawer Footer — Sign Out only (profile moved to bottom nav) */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <View style={styles.signOutIconContainer}>
                <Ionicons name="log-out-outline" size={20} color="#F87171" />
              </View>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingBottom: BOTTOM_NAV_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 10,
  },
  closeIconWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    padding: 8,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#120A05',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    backgroundColor: '#292524',
    gap: 8,
  },
  drawerHeaderText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleContainer: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
  },
  rolePill: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#292524',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  navContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#431407',
  },
  navItemDisabled: {
    opacity: 0.6,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navLabel: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#292524',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  drawerFooter: {
    padding: 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#292524',
    backgroundColor: '#120A05',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.15)',
  },
  signOutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '600',
  },

  // ─── Bottom Navigation Styles ───
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_NAV_HEIGHT,
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    zIndex: 5,
  },
  bottomNavInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
    flex: 1,
  },
  bottomNavTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  bottomNavLabelActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  profileTabLabel: {
    maxWidth: 70,
  },
});
