import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import Landing from './components/Landing';
import ClientDashboard from './components/client/ClientDashboard';
import WorkerDashboard from './components/worker/WorkerDashboard';
import GlobalMessageCenter from './components/messaging/GlobalMessageCenter';
import VerifyEmail from './components/auth/VerifyEmail';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { userRole, loading } = useUser();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{element}</>;
};

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <ChatProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route 
                  path="/client-dashboard" 
                  element={<ProtectedRoute element={<ClientDashboard />} requiredRole="client" />} 
                />
                <Route 
                  path="/worker-dashboard" 
                  element={<ProtectedRoute element={<WorkerDashboard />} requiredRole="worker" />} 
                />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <GlobalMessageCenter />
            </Router>
          </NotificationProvider>
        </ChatProvider>
      </SocketProvider>
    </UserProvider>
  );
}

export default App;