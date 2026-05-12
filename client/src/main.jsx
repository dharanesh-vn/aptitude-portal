import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppWrapper from './App';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = apiBase;
axios.defaults.withCredentials = true;

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
    ui: {
      background: '#EDF2F7',
      card: '#FFFFFF',
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
    Card: {
      baseStyle: {
        container: {
          backgroundColor: 'ui.card',
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        color: 'gray.700',
        fontWeight: '600',
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AppWrapper />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </ChakraProvider>
  </React.StrictMode>
);
