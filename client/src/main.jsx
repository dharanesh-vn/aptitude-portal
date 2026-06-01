import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import AppWrapper from './App';
import theme from './theme';

// Default: same-origin (Vite dev proxy in development, Express static in production).
// Set VITE_API_URL only when the API runs on a different host (e.g. separate deploy).
const apiBase = import.meta.env.VITE_API_URL ?? '';
axios.defaults.baseURL = apiBase;
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AppWrapper />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </ChakraProvider>
  </React.StrictMode>
);
