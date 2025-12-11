import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// The unused 'Box' and 'Heading' imports have been removed from the line below
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
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

// A component that acts as a gatekeeper for protected routes
const ProtectedRoute = ({ children, isAdminRoute = false }) => {
    const { user } = useContext(AuthContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (isAdminRoute && !user.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const AppRoutes = () => {
  const { loading } = useContext(AuthContext);
  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/test/:testId" element={<ProtectedRoute><Test /></ProtectedRoute>} />
            <Route path="/results/:submissionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/review/:submissionId" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute isAdminRoute={true}><AdminTestsList /></ProtectedRoute>} />
            <Route path="/admin/tests/:testId" element={<ProtectedRoute isAdminRoute={true}><AdminTestDetail /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute isAdminRoute={true}><AdminQuestionsList /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
        </Route>
    </Routes>
  );
};

const App = () => (<Router><AppRoutes /></Router>);
const AppWrapper = () => (<AuthProvider><App /></AuthProvider>);
export default AppWrapper;