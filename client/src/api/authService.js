import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';
axios.defaults.withCredentials = true;

const register = (name, email, password) => {
  return axios.post(`${API_URL}/register`, { name, email, password });
};
const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password });
};
const logout = () => {
  return axios.post(`${API_URL}/logout`);
};
const getMe = () => {
  return axios.get(`${API_URL}/me`);
};

const authService = { register, login, logout, getMe };
export default authService;