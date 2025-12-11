import axios from 'axios';
const API_URL = 'http://localhost:5000/api/admin';

// Question Functions
const getQuestions = (page = 1, limit = 10, category = '') => {
  return axios.get(`${API_URL}/questions?page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`);
};
const createQuestion = (questionData) => axios.post(`${API_URL}/questions`, questionData);
const updateQuestion = (id, questionData) => axios.put(`${API_URL}/questions/${id}`, questionData);
const deleteQuestion = (id) => axios.delete(`${API_URL}/questions/${id}`);

// Test Functions
const getTestById = (id) => axios.get(`${API_URL}/tests/${id}`);
const createTest = (testData) => axios.post(`${API_URL}/tests`, testData);
const updateTest = (id, testData) => axios.put(`${API_URL}/tests/${id}`, testData);
const deleteTest = (id) => axios.delete(`${API_URL}/tests/${id}`);

const adminService = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
};

export default adminService;