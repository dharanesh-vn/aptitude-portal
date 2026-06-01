import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Test from './pages/Test';
import Results from './pages/Results';
import Profile from './pages/Profile';
import ReviewPage from './pages/ReviewPage';
// Admin Pages
import AdminTestsList from './pages/admin/AdminTestsList';
import AdminTestDetail from './pages/admin/AdminTestDetail';
import AdminQuestionsList from './pages/admin/AdminQuestionsList';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* If a user is NOT logged in, the root path '/' shows the landing page. */}
      {/* If they are logged in, it redirects them to their dashboard. */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />

      {/* Public auth routes (also redirect if user is already logged in) */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      {/* Protected routes wrapped in the Layout (with the main navbar) */}
      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/test/:testId" element={<Test />} />
        <Route path="/results/:submissionId" element={<Results />} />
        <Route path="/review/:submissionId" element={<ReviewPage />} />
      </Route>
      
      {/* Protected Admin routes also wrapped in the Layout */}
      <Route path="/admin" element={user?.isAdmin ? <Layout /> : <Navigate to="/dashboard" />}>
        <Route index element={<AdminTestsList />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="tests/:testId" element={<AdminTestDetail />} />
        <Route path="questions" element={<AdminQuestionsList />} />
      </Route>

      {/* Fallback for any other route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (<Router><AppRoutes /></Router>);
const AppWrapper = () => (<AuthProvider><App /></AuthProvider>);
export default AppWrapper;