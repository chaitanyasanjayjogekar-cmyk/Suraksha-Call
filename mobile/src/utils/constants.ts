export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

export const SUSPICIOUS_KEYWORDS = [
  'otp', 'aadhaar', 'cbi', 'police', 'arrest', 'giraftaar', 'kyc',
  'bank account', 'money transfer', 'paisa', 'criminal', 'crime',
  'urgent', 'turant', 'abhi', 'jaldi', 'immediately', 'secret',
  'kisi ko mat batana', 'password', 'pin', 'cvv', 'lottery', 'prize',
  'warrant', 'jail', 'court', 'case', 'enforcement',
];

export const SCAM_DEMO_TRANSCRIPT = `Sir, main CBI se bol raha hoon. Aapka Aadhaar card ek crime mein involve hai. Aapko abhi apna OTP share karna hoga warna aapko giraftaar kar liya jayega. Ye bahut urgent matter hai, kisi ko mat batana.`;

export const NORMAL_DEMO_TRANSCRIPT = `Hello sir, how are you? Your appointment has been confirmed for tomorrow at 10 AM. Please bring your original documents. Thank you for calling.`;

export const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Scam Calls Detect Karein',
    subtitle: 'AI aapki awaaz analyze karta hai aur scam identify karta hai',
    emoji: '🛡️',
    color: '#2563EB',
  },
  {
    id: 2,
    title: 'Real-time Warning',
    subtitle: 'Jab bhi khatra ho, turant red alert aur Hindi voice warning milti hai',
    emoji: '⚠️',
    color: '#DC2626',
  },
  {
    id: 3,
    title: 'Family Ko Alert Karein',
    subtitle: 'Emergency contacts save karein aur scam ka WhatsApp alert bhejein',
    emoji: '👨‍👩‍👧',
    color: '#16A34A',
  },
];

