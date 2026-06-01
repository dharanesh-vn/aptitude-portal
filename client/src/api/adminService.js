import axios from 'axios';

const getQuestions = (page = 1, limit = 50, category = '') =>
  axios.get('/api/admin/questions', {
    params: { page, limit, category },
  });

/** Loads every question in the bank by paging (server caps limit at 50). */
const fetchFullQuestionBank = async () => {
  let page = 1;
  const questions = [];
  let totalPages = 1;
  let allCategories = [];

  do {
    const res = await getQuestions(page, 50, '');
    questions.push(...res.data.questions);
    totalPages = res.data.totalPages;
    if (page === 1) allCategories = res.data.allCategories || [];
    page += 1;
  } while (page <= totalPages);

  return { questions, allCategories };
};

const createQuestion = (questionData) => axios.post('/api/admin/questions', questionData);

const updateQuestion = (id, questionData) =>
  axios.put(`/api/admin/questions/${id}`, questionData);

const deleteQuestion = (id) => axios.delete(`/api/admin/questions/${id}`);

const getTestById = (id) => axios.get(`/api/admin/tests/${id}`);

const createTest = (testData) => axios.post('/api/admin/tests', testData);

const updateTest = (id, testData) => axios.put(`/api/admin/tests/${id}`, testData);

const deleteTest = (id) => axios.delete(`/api/admin/tests/${id}`);

const getAnalytics = () => axios.get('/api/admin/analytics');

const getTestResults = (testId) => axios.get(`/api/admin/tests/${testId}/results`);

const getUsers = () => axios.get('/api/admin/users');

const getAllSubmissions = () => axios.get('/api/admin/submissions');

const setUserAdmin = (userId, isAdmin) =>
  axios.patch(`/api/admin/users/${userId}/admin`, { isAdmin });

const getViolationsForTest = (testId) =>
  axios.get(`/api/admin/tests/${testId}/violations`);

const exportTestScores = (testId) =>
  axios.get(`/api/admin/tests/${testId}/export`, { responseType: 'blob' }).then((res) => {
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-${testId}-scores.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

const adminService = {
  getQuestions,
  fetchFullQuestionBank,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getAnalytics,
  getTestResults,
  getUsers,
  getAllSubmissions,
  setUserAdmin,
  getViolationsForTest,
  exportTestScores,
};

export default adminService;
