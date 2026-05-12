import axios from 'axios';

const getMyHistory = () => axios.get('/api/submissions/my-history');

const getSubmissionForReview = (id) => axios.get(`/api/submissions/${id}/review`);

const downloadReport = async (submissionId) => {
  const res = await axios.get(`/api/submissions/${submissionId}/report`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aptitude-report-${submissionId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const submissionService = {
  getMyHistory,
  getSubmissionForReview,
  downloadReport,
};

export default submissionService;
