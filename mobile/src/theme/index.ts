// Theme — matches the web app color system exactly

export const Colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primaryText: '#172033',
  secondaryText: '#64748B',
  primary: '#2563EB',
  safe: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.primaryText },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.primaryText },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.primaryText },
  h4: { fontSize: 16, fontWeight: '600' as const, color: Colors.primaryText },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.primaryText },
  bodyLarge: { fontSize: 17, fontWeight: '400' as const, color: Colors.primaryText },
  small: { fontSize: 13, fontWeight: '400' as const, color: Colors.secondaryText },
  label: { fontSize: 11, fontWeight: '600' as const, color: Colors.secondaryText, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  mono: { fontSize: 13, fontFamily: 'monospace' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

export function getRiskColor(score: number) {
  if (score >= 80) return { primary: Colors.danger, light: '#FEF2F2', border: '#FECACA' };
  if (score >= 40) return { primary: Colors.warning, light: '#FFFBEB', border: '#FDE68A' };
  return { primary: Colors.safe, light: '#F0FDF4', border: '#BBF7D0' };
}

export function getRiskLabel(score: number) {
  if (score >= 80) return 'HIGH RISK';
  if (score >= 40) return 'SUSPICIOUS';
  return 'SAFE';
}

