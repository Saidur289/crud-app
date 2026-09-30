import { Platform } from 'react-native';

export const PALETTE = {
  light: {
    primary: '#4F46E5', // Refined Indigo 600
    primaryLight: '#6366F1', // Indigo 500
    primaryDark: '#4338CA', // Indigo 700
    primarySurface: '#EEF2FF', // Indigo 50
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    borderColor: '#E2E8F0', // Slate 200
    borderSubtle: '#F1F5F9', // Slate 100
    success: '#10B981', // Emerald 500
    successSurface: '#ECFDF5', // Emerald 50
    danger: '#EF4444', // Rose 500
    dangerSurface: '#FEF2F2', // Rose 50
    dangerText: '#DC2626',
    badgeBg: '#F1F5F9',
    badgeText: '#475569',
    cardShadowColor: '#0F172A',
  },
  dark: {
    primary: '#818CF8', // Indigo 400
    primaryLight: '#A5B4FC', // Indigo 300
    primaryDark: '#6366F1', // Indigo 500
    primarySurface: '#1E1B4B', // Deep indigo 950
    background: '#0B0F19', // Deep dark
    surface: '#1E293B', // Slate 800
    surfaceElevated: '#334155', // Slate 700
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    borderColor: '#334155', // Slate 700
    borderSubtle: '#1E293B',
    success: '#34D399', // Emerald 400
    successSurface: '#064E3B', // Emerald 900
    danger: '#FB7185', // Rose 400
    dangerSurface: '#4C0519', // Rose 950
    dangerText: '#FDA4AF',
    badgeBg: '#334155',
    badgeText: '#CBD5E1',
    cardShadowColor: '#000000',
  },
};

export const SHADOWS = {
  card: Platform.select({
    web: {
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    },
    default: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    },
  }),
  elevated: Platform.select({
    web: {
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)',
    },
    default: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
  }),
  floating: Platform.select({
    web: {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    },
    default: {
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  }),
};
