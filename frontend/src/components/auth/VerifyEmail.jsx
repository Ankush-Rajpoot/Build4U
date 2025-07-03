import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');
    if (!token || !role) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    const verify = async () => {
      try {
        const endpoint = role === 'worker' ? '/workers/verify' : '/clients/verify';
        await api.get(`${endpoint}?token=${token}`);
        setStatus('success');
        setMessage('Email verified! You can now log in.');
        setTimeout(() => navigate('/auth'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Verification failed.');
      }
    };
    verify();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status !== 'verifying' && <p>{message}</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;
