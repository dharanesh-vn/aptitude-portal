import axios from 'axios';
const API_URL = 'http://localhost:5000/api/submissions';

const getMyHistory = () => axios.get(`${API_URL}/my-history`);
const getSubmissionForReview = (id) => axios.get(`${API_URL}/${id}/review`);

const submissionService = {
  getMyHistory,
  getSubmissionForReview,
};

export default submissionService;