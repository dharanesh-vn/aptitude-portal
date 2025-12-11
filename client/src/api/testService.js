import axios from 'axios';

// The base URL for all test-related API endpoints
const API_URL = 'http://localhost:5000/api/tests';

/**
 * Fetches a list of all available tests from the server.
 */
const getAllTests = () => {
  return axios.get(API_URL);
};

/**
 * Fetches the specific data for a single test to begin the quiz.
 * @param {string} testId The ID of the test to start.
 */
const startTest = (testId) => {
  // Correctly constructs the URL, e.g., http://localhost:5000/api/tests/SOME_ID/start
  return axios.get(`${API_URL}/${testId}/start`);
};

/**
 * Submits the user's answers to the server for grading.
 * @param {string} testId The ID of the test being submitted.
 * @param {object} answers The user's answers in the format { questionId: "userAnswer", ... }.
 */
const submitTest = (testId, answers) => {
  return axios.post(`${API_URL}/${testId}/submit`, { answers });
};


const testService = {
  getAllTests,
  startTest,
  submitTest,
};

export default testService;