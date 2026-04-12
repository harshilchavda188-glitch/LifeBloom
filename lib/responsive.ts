import { Platform, Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 320,   // Extra small devices (phones)
  sm: 576,   // Small devices (large phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (small laptops)
  xl: 1280,  // Extra large devices (laptops)
  xxl: 1536, // Extra extra large devices (desktops)
};

// Get current screen size category
export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' {
  if (SCREEN_WIDTH < BREAKPOINTS.sm) return 'xs';
  if (SCREEN_WIDTH < BREAKPOINTS.md) return 'sm';
  if (SCREEN_WIDTH < BREAKPOINTS.lg) return 'md';
  if (SCREEN_WIDTH < BREAKPOINTS.xl) return 'lg';
  if (SCREEN_WIDTH < BREAKPOINTS.xxl) return 'xl';
  return 'xxl';
}

// Check if device is tablet or larger
export const isTablet = SCREEN_WIDTH >= BREAKPOINTS.md;

// Check if device is desktop
export const isDesktop = SCREEN_WIDTH >= BREAKPOINTS.lg;

// Check if running on web
export const isWeb = Platform.OS === 'web';

// Calculate responsive font size based on screen width
export function responsiveFontSize(baseSize: number): number {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone width
  const newSize = baseSize * scale;
  
  if (isWeb) {
    // On web, use more conservative scaling
    return Math.round(PixelRatio.roundToNearestPixel(newSize * 0.9));
  }
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Calculate responsive spacing/padding
export function responsiveSpacing(baseSpacing: number): number {
  const scale = SCREEN_WIDTH / 375;
  const newSpacing = baseSpacing * scale;
  
  if (isWeb) {
    return Math.round(PixelRatio.roundToNearestPixel(newSpacing * 0.95));
  }
  
  return Math.round(PixelRatio.roundToNearestPixel(newSpacing));
}

// Calculate responsive width with max constraint
export function responsiveWidth(percentage: number, maxWidth?: number): number {
  const width = (SCREEN_WIDTH * percentage) / 100;
  return maxWidth ? Math.min(width, maxWidth) : width;
}

// Get content width based on screen size
export function getContentWidth(): number {
  const size = getScreenSize();
  
  switch (size) {
    case 'xs':
    case 'sm':
      return SCREEN_WIDTH;
    case 'md':
      return Math.min(SCREEN_WIDTH, 720);
    case 'lg':
      return Math.min(SCREEN_WIDTH, 960);
    case 'xl':
      return Math.min(SCREEN_WIDTH, 1140);
    case 'xxl':
      return Math.min(SCREEN_WIDTH, 1320);
    default:
      return SCREEN_WIDTH;
  }
}

// Get horizontal padding based on screen size
export function getHorizontalPadding(): number {
  const size = getScreenSize();
  
  switch (size) {
    case 'xs':
      return 16;
    case 'sm':
      return 20;
    case 'md':
      return 24;
    case 'lg':
    case 'xl':
    case 'xxl':
      return 32;
    default:
      return 16;
  }
}

// Get grid columns based on screen size
export function getGridColumns(): number {
  const size = getScreenSize();
  
  switch (size) {
    case 'xs':
    case 'sm':
      return 2;
    case 'md':
      return 3;
    case 'lg':
      return 4;
    case 'xl':
    case 'xxl':
      return 5;
    default:
      return 2;
  }
}

// Web-specific top padding for navigation
export function getWebTopPadding(): number {
  return isWeb ? 67 : 0;
}

// Responsive card sizing
export function getCardDimensions() {
  const size = getScreenSize();
  
  switch (size) {
    case 'xs':
      return { padding: 12, borderRadius: 12, gap: 8 };
    case 'sm':
      return { padding: 14, borderRadius: 14, gap: 10 };
    case 'md':
      return { padding: 16, borderRadius: 16, gap: 12 };
    case 'lg':
    case 'xl':
    case 'xxl':
      return { padding: 20, borderRadius: 18, gap: 16 };
    default:
      return { padding: 16, borderRadius: 16, gap: 12 };
  }
}

// Responsive button sizing
export function getButtonDimensions(size: 'small' | 'medium' | 'large' = 'medium') {
  const screenCategory = getScreenSize();
  const multiplier = screenCategory === 'xs' ? 0.9 : screenCategory === 'xxl' ? 1.1 : 1;
  
  const sizes = {
    small: {
      height: Math.round(36 * multiplier),
      fontSize: Math.round(13 * multiplier),
      paddingHorizontal: Math.round(12 * multiplier),
    },
    medium: {
      height: Math.round(44 * multiplier),
      fontSize: Math.round(15 * multiplier),
      paddingHorizontal: Math.round(16 * multiplier),
    },
    large: {
      height: Math.round(52 * multiplier),
      fontSize: Math.round(17 * multiplier),
      paddingHorizontal: Math.round(20 * multiplier),
    },
  };
  
  return sizes[size];
}

// Dynamic styles helper for responsive layouts
export function createResponsiveStyles<T extends object>(
  mobileStyles: T,
  tabletStyles?: Partial<T>,
  desktopStyles?: Partial<T>
): T {
  const size = getScreenSize();
  
  if (size === 'xs' || size === 'sm') {
    return mobileStyles;
  }
  
  if (size === 'md' && tabletStyles) {
    return { ...mobileStyles, ...tabletStyles };
  }
  
  if ((size === 'lg' || size === 'xl' || size === 'xxl') && desktopStyles) {
    return { ...mobileStyles, ...(tabletStyles || {}), ...desktopStyles };
  }
  
  return mobileStyles;
}

// Media query helper (for web)
export function useMediaQuery(query: string): boolean {
  if (!isWeb) return false;
  
  // This would need window.matchMedia in actual implementation
  // For now, return false as placeholder
  return false;
}

export default {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  BREAKPOINTS,
  getScreenSize,
  isTablet,
  isDesktop,
  isWeb,
  responsiveFontSize,
  responsiveSpacing,
  responsiveWidth,
  getContentWidth,
  getHorizontalPadding,
  getGridColumns,
  getWebTopPadding,
  getCardDimensions,
  getButtonDimensions,
  createResponsiveStyles,
};
