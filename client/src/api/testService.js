import axios from 'axios';

const getAllTests = () => axios.get('/api/tests');

const startTest = (testId) => axios.get(`/api/tests/${testId}/start`);

const submitTest = (testId, payload) =>
  axios.post(`/api/tests/${testId}/submit`, payload);

const logViolation = (testId, body) =>
  axios.post(`/api/tests/${testId}/violations`, body);

const testService = {
  getAllTests,
  startTest,
  submitTest,
  logViolation,
};

export default testService;
