import axios from 'axios';

const register = (name, email, password) =>
  axios.post('/api/auth/register', { name, email, password });

const login = (email, password) => axios.post('/api/auth/login', { email, password });

const logout = () => axios.post('/api/auth/logout');

const getMe = () => axios.get('/api/auth/me');

const authService = { register, login, logout, getMe };
export default authService;
