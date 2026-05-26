import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Mail, 
  Phone, 
  Github, 
  ArrowRight, 
  ChevronLeft,
  Lock,
  User as UserIcon,
  X
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithMicrosoft,
  auth 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile
} from 'firebase/auth';
import { WaterdropBackground } from './WaterdropBackground';

type AuthView = 'main' | 'email' | 'phone';

interface SignInProps {
  onClose: () => void;
  onRefreshUser?: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onClose, onRefreshUser }) => {
  const [view, setView] = useState<AuthView>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleOAuth = async (method: () => Promise<any>) => {
    setLoading(true);
    setError('');
    try {
      await method();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal', // Changed to normal for better reliability in iframes
          callback: () => {
            console.log('Recaptcha verified');
          },
          'expired-callback': () => {
            setError('Recaptcha expired. Please try again.');
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
            }
          }
        });
      } catch (err: any) {
        setError('Failed to initialize security check. Please refresh.');
        console.error('Recaptcha init error:', err);
      }
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.startsWith('+')) {
      setError('Phone number must start with + and include country code (e.g., +15550000000)');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      (window as any).confirmationResult = confirmation;
      setShowOtp(true);
    } catch (err: any) {
      console.error('Phone sign in error:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please use +[country_code][number].');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('Security check failed. Please try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('SMS Region Blocked: Please enable your country in Firebase Console > Authentication > Settings > SMS Region Policy.');
      } else if (err.code === 'auth/billing-not-enabled') {
        setError('Billing Required: Firebase requires a Blaze plan for SMS in some regions. You can also use "Test Phone Numbers" in Firebase Console for free testing.');
      } else {
        setError(err.message || 'Failed to send code. Check your connection.');
      }
      
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await (window as any).confirmationResult.confirm(otp);
      console.log('Phone sign in success:', result.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
        onRefreshUser?.();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 5 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 5 }}
        transition={{ 
          type: 'spring', 
          damping: 28, 
          stiffness: 450,
          mass: 0.4
        }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar will-change-[transform,opacity] transition-colors"
      >
        <div className="relative min-h-full w-full">
          <WaterdropBackground />
          
          <div className="relative z-10 p-6 md:p-10 flex flex-col items-center">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 md:w-14 md:h-14 bg-medical-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-medical-600/20 mb-4 md:mb-6">
              <Activity size={24} className="md:w-7 md:h-7" />
            </div>

            <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Patient Portal</h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 md:mb-8 font-light text-center transition-colors">
              Sign in to protect your sensitive orthopedic data and track recovery.
            </p>

            <AnimatePresence mode="wait">
              {view === 'main' && (
                <motion.div
                  key="main"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="w-full space-y-3"
                >
                  <button
                    onClick={() => handleOAuth(signInWithGoogle)}
                    className="w-full flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-gray-700 py-3.5 px-6 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-medical-500 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="flex-1 text-left">Continue with Google</span>
                  </button>

                  <button
                    onClick={() => handleOAuth(signInWithMicrosoft)}
                    className="w-full flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-gray-700 py-3.5 px-6 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-blue-500 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                    <span className="flex-1 text-left">Continue with Microsoft</span>
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-900 px-2 text-gray-400 transition-colors">Other methods</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setView('email')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/30 dark:hover:bg-medical-900/20 transition-all"
                    >
                      <Mail size={20} className="text-medical-600 dark:text-medical-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors">Email</span>
                    </button>
                    <button
                      onClick={() => setView('phone')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-medical-500 dark:hover:border-medical-500 hover:bg-medical-50/30 dark:hover:bg-medical-900/20 transition-all"
                    >
                      <Phone size={20} className="text-medical-600 dark:text-medical-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 transition-colors">Phone</span>
                    </button>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
                    >
                      <p className="text-xs text-red-500 text-center">{error}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {view === 'email' && (
                <motion.div
                  key="email"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="w-full"
                >
                  <button 
                    onClick={() => setView('main')}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 mb-6 transition-colors"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <AnimatePresence>
                      {isSignUp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1 transition-colors">Full Name</label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              required
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-medical-500 dark:focus:border-medical-400 transition-all dark:text-white"
                              placeholder="John Doe"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1 transition-colors">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-medical-500 dark:focus:border-medical-400 transition-all dark:text-white"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1 transition-colors">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-medical-500 dark:focus:border-medical-400 transition-all dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}

                    <button
                      disabled={loading}
                      className="w-full bg-medical-600 dark:bg-medical-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-medical-600/20 hover:bg-medical-700 dark:hover:bg-medical-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="w-full text-sm text-gray-500 hover:text-medical-600 dark:hover:text-medical-400 transition-colors"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                  </form>
                </motion.div>
              )}

              {view === 'phone' && (
                <motion.div
                  key="phone"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="w-full"
                >
                  <button 
                    onClick={() => {
                      setView('main');
                      setShowOtp(false);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 mb-6 transition-colors"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>

                  <div className="space-y-6 text-center">
                    <div className="p-6 bg-medical-50 dark:bg-medical-900/20 rounded-3xl border border-medical-100 dark:border-medical-900 transition-colors">
                      <Phone size={32} className="text-medical-600 dark:text-medical-400 mx-auto mb-4" />
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                        {showOtp ? 'Verify Code' : 'Phone Authentication'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                        {showOtp 
                          ? `Enter the 6-digit code sent to ${phoneNumber}`
                          : 'Enter your phone number with country code (e.g., +15550000000) to receive a secure login code.'}
                      </p>
                    </div>
                    
                    {!showOtp ? (
                      <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div className="space-y-2 text-left">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1 transition-colors">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="tel"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-medical-500 dark:focus:border-medical-400 transition-all dark:text-white"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>

                        {error && <p className="text-xs text-red-500 text-left ml-1 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors">{error}</p>}

                        <div id="recaptcha-container" className="flex justify-center my-4"></div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-medical-600 dark:bg-medical-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-medical-600/20 hover:bg-medical-700 dark:hover:bg-medical-600 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2 text-left">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1 transition-colors">Verification Code</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-medical-500 dark:focus:border-medical-400 transition-all tracking-[0.5em] font-mono text-center text-xl dark:text-white"
                              placeholder="000000"
                            />
                          </div>
                        </div>

                        {error && <p className="text-xs text-red-500 text-left ml-1">{error}</p>}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-medical-600 dark:bg-medical-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-medical-600/20 hover:bg-medical-700 dark:hover:bg-medical-600 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowOtp(false)}
                          className="w-full text-sm text-gray-500 hover:text-medical-600 dark:hover:text-medical-400 transition-colors"
                        >
                          Change Phone Number
                        </button>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-10 text-[10px] text-gray-400 dark:text-gray-500 px-6 text-center uppercase tracking-widest leading-relaxed transition-colors">
              Secured by enterprise-grade encryption<br />
              © 2026 OrthoDoct Medical Systems
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
