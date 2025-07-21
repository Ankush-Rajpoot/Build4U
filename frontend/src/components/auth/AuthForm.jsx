import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Star } from 'lucide-react';
import Login from './Login';
import SignUp from './SignUp';

const AuthForm = ({ role, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setInfo('');
  };

  // Enhanced dark theme, shadcn-inspired, no gradients
  const themeColors = {
    client: {
      primary: 'bg-[#0A0A0A]',
      border: 'border-[#404040]',
      shadow: 'shadow-black/40',
      ring: 'focus:ring-[#404040]/60',
      button: 'bg-[#404040] hover:bg-[#525252]',
      accent: 'bg-[#262626]/80 border-[#404040] text-[#e5e5e5]',
      glow: 'shadow-[#373737]/40'
    },
    worker: {
      primary: 'bg-[#0A0A0A]',
      border: 'border-[#525252]',
      shadow: 'shadow-black/40',
      ring: 'focus:ring-[#525252]/60',
      button: 'bg-[#525252] hover:bg-[#737373]',
      accent: 'bg-[#373737]/80 border-[#525252] text-[#e5e5e5]',
      glow: 'shadow-[#404040]/40'
    }
  };

  const theme = themeColors[role];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? 'login-container' : 'signup-container'}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ 
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1]
        }}
        className={`
          ${!isLogin && role === 'worker' ? 'max-w-lg sm:max-w-xl lg:max-w-3xl' : 'max-w-sm sm:max-w-md'} 
          w-full mx-auto relative overflow-hidden
          backdrop-blur-2xl 
          ${theme.primary}
          border ${theme.border}
          rounded-2xl 
          shadow-2xl ${theme.shadow} ${theme.glow}
          p-3 sm:p-5 md:p-8
          max-h-[95vh] overflow-y-auto
          transition-all duration-500
        `}
      >
        {/* Glass overlay for enhanced depth */}
        <div className="absolute inset-0 bg-[#0A0A0A] rounded-2xl pointer-events-none" />
        
        {/* Header with enhanced styling */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-[#171717]/80 hover:bg-[#262626]/80 border border-[#404040] shadow-md transition-all duration-200 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 text-[#e5e5e5]" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#e5e5e5] mb-0.5 truncate tracking-tight">
                  {isLogin ? 'Welcome back!' : `Join as ${role === 'client' ? 'a Client' : 'a Professional'}`}
                </h2>
                <p className="text-[#737373] text-xs hidden sm:block">
                  {isLogin 
                    ? `Sign in to your ${role} account`
                    : `Create your ${role} account and get started`
                  }
                </p>
              </div>
            </div>
            
            {/* Role badge */}
            <div
              className={`
                px-3 py-1.5 rounded-full text-[#222] text-xs font-semibold
                border-0 flex items-center space-x-1 flex-shrink-0 shadow-sm
                ${role === 'client' ? 'bg-[#bae6fd]' : 'bg-[#bbf7d0]'}
              `}
            >
              {role === 'client' ? <Shield className="h-3 w-3 text-[#2563eb]" /> : <Star className="h-3 w-3 text-[#059669]" />}
              <span className="capitalize hidden sm:inline">{role}</span>
            </div>
          </div>

          {/* Status messages with enhanced styling */}
          {info && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-[#262626]/80 border border-[#404040] text-[#e5e5e5] backdrop-blur-sm shadow"
            >
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-[#525252] rounded-full" />
                <span className="text-xs font-medium">{info}</span>
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-[#262626]/80 border border-[#404040] text-[#ffb4b4] backdrop-blur-sm shadow"
            >
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-[#ffb4b4] rounded-full" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form Content */}
        <div className="relative z-10">
          {isLogin ? (
            <Login 
              role={role}
              theme={theme}
              onToggleMode={toggleMode}
              setError={setError}
              setLoading={setLoading}
              loading={loading}
            />
          ) : (
            <SignUp 
              role={role}
              theme={theme}
              onToggleMode={toggleMode}
              setError={setError}
              setInfo={setInfo}
              setLoading={setLoading}
              loading={loading}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Set the page background to #000000
if (typeof window !== 'undefined') {
  document.body.style.background = '#000000';
}

export default AuthForm;
