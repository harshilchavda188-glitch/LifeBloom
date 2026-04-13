import { StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { responsiveSpacing } from '@/lib/responsive';

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: responsiveSpacing(16),
    bottom: responsiveSpacing(32),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
      },
    }),
  },
});

export default styles;

