import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppWrapper from './App';

// Define our final "Cosmic Dark" theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },

  styles: {
    global: {
      body: {
        bg: '#040407', // Deep, near-black background
        color: 'gray.200',
      },
      // Style the scrollbar to match the dark theme
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: '#040407',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#1A1A1F',
        borderRadius: '8px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#2D2D3A',
      },
    },
  },

  fonts: {
    heading: `'Inter', 'Roboto', sans-serif`,
    body: `'Inter', 'Roboto', sans-serif`,
  },

  components: {
    Button: {
      variants: {
        'solid-light': { // Primary CTA button (e.g., Create Account, Discover Now)
          bg: 'white',
          color: 'black',
          fontWeight: 'bold',
          borderRadius: 'full',
          transition: 'all 0.2s ease-in-out',
          _hover: { bg: 'gray.200', transform: 'scale(1.05)' },
        },
        'ghost-white': { // Secondary links in the navbar
            color: 'gray.300',
            _hover: {
                color: 'white',
                bg: 'whiteAlpha.100'
            }
        }
      },
    },
    // Define a base style for Cards/Boxes acting as containers
    Box: {
        variants: {
            'glass': { // A reusable "glassmorphism" variant
                bg: 'rgba(22, 22, 29, 0.5)', // Dark, semi-transparent
                backdropFilter: "blur(15px) saturate(120%)",
                borderRadius: "2xl",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "lg"
            }
        }
    }
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AppWrapper />
      <ToastContainer theme="dark" position="top-right" autoClose={3000} hideProgressBar={false} />
    </ChakraProvider>
  </React.StrictMode>
);