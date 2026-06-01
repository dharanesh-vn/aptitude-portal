import { extendTheme, defineStyle, defineStyleConfig } from '@chakra-ui/react';

const glass = defineStyle({
  bg: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: 'xl',
  border: '1px solid',
  borderColor: 'whiteAlpha.300',
  boxShadow: '2xl',
});

const solidLight = defineStyle({
  bg: 'white',
  color: 'brand.700',
  _hover: { bg: 'gray.100' },
  _active: { bg: 'gray.200' },
});

const authLabel = defineStyle({
  color: 'gray.100',
  fontWeight: '600',
});

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f0ff',
      100: '#b8d4fe',
      200: '#8aaeff',
      300: '#5c88ff',
      400: '#2e62ff',
      500: '#0047AB',
      600: '#003989',
      700: '#002b66',
      800: '#001e44',
      900: '#000f22',
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#F59E0B',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  semanticTokens: {
    colors: {
      'ui.background': { default: '#EDF2F7' },
      'ui.card': { default: '#FFFFFF' },
    },
  },
  fonts: {
    heading: `Georgia, "Times New Roman", serif`,
    body: `'Segoe UI', 'Roboto', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'ui.background',
        color: 'gray.800',
      },
    },
  },
  components: {
    Box: defineStyleConfig({
      variants: { glass },
    }),
    Button: defineStyleConfig({
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      variants: {
        'solid-light': solidLight,
      },
    }),
    FormLabel: defineStyleConfig({
      variants: {
        auth: authLabel,
      },
    }),
    Input: defineStyleConfig({
      baseStyle: {
        bg: 'white',
        color: 'gray.800',
        borderColor: 'gray.300',
        _placeholder: { color: 'gray.500' },
      },
    }),
    Textarea: defineStyleConfig({
      baseStyle: {
        bg: 'white',
        color: 'gray.800',
        borderColor: 'gray.300',
      },
    }),
    Card: defineStyleConfig({
      baseStyle: {
        container: {
          bg: 'ui.card',
        },
      },
    }),
    Heading: defineStyleConfig({
      baseStyle: {
        fontFamily: 'heading',
        color: 'gray.700',
        fontWeight: '600',
      },
    }),
  },
});

export default theme;
