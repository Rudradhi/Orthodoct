import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Shield, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  MoreHorizontal,
  Sparkles,
  Home,
  LayoutDashboard,
  Dumbbell,
  FileText,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptBox } from '@/src/components/PromptBox';
import { MedicalBackground } from '@/src/components/MedicalBackground';
import { WordCycler } from '@/src/components/WordCycler';
import { SignIn } from '@/src/components/SignIn';
import { PatientReports } from '@/src/components/PatientReports';
import { Dashboard } from '@/src/components/Dashboard';
import { auth, logout, db } from '@/src/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUserSync } from '@/src/hooks/useUserSync';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-errors';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useUserSync(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) setShowSignIn(false);
    });
    return () => unsubscribe();
  }, []);

  const { scrollYProgress } = useScroll();

  const handleIssueSubmit = async (issue: string, mediaUrls: string[]) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }

    setIsAnalyzing(true);
    const path = 'analyses';
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = "Based on your description, we recommend starting with gentle stretching and low-impact mobility exercises. Please consult with our specialists for a detailed recovery plan.";
      
      // Save to Firestore
      await addDoc(collection(db, path), {
        uid: user.uid,
        issue,
        result,
        mediaUrls,
        createdAt: serverTimestamp()
      });

      console.log('Analysis saved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-medical-600 dark:text-medical-400"
        >
          <Activity size={40} />
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const handleRefreshUser = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Force a re-render by creating a new object reference
      setUser({ ...currentUser } as FirebaseUser);
    }
  };

  const getRecoveryPhase = () => {
    return "Phase 1: Initial Assessment";
  };


  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <MedicalBackground />

      {/* Navigation */}
      <nav className="relative z-50 px-4 md:px-6 py-6 md:py-8 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-medical-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-medical-600/20">
            <Activity size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-base md:text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase tracking-widest transition-colors">OrthoDoct</span>
        </motion.div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="hidden xl:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {['Exercises', 'Dashboard', 'Specialists'].map((item) => (
              <a 
                key={item} 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (item === 'Dashboard') setShowDashboard(true);
                }}
                className="hover:text-medical-600 dark:hover:text-medical-400 transition-all duration-300 relative group px-2 py-1"
              >
                {item}
                <motion.span 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-medical-500 transition-all group-hover:w-full"
                  whileHover={{ width: '100%' }}
                />
              </a>
            ))}
          </motion.div>

          {/* More Menu (3 Dots) - Visible when xl links are hidden but lg is visible */}
          <div className="hidden lg:flex xl:hidden items-center">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: "#f0f9ff" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-500 hover:text-medical-600 transition-all rounded-full hover:bg-white shadow-sm"
              title="More Options"
            >
              <MoreHorizontal size={24} />
            </motion.button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle Desktop - Hidden on mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden lg:flex p-2 rounded-full hover:bg-white/50 transition-colors text-gray-500 dark:text-gray-400"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm transition-colors translate-x-[4px]">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center overflow-hidden transition-colors border border-medical-200 dark:border-medical-800">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] md:text-[10px] font-black text-medical-600 dark:text-medical-400 uppercase">
                        {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : <UserIcon size={12} />}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-xs md:text-sm font-bold truncate max-w-[80px] md:max-w-none transition-colors">
                    {user.displayName?.split(' ')[0] || 'Patient'}
                  </span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            ) : (
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#0284c7",
                  color: "#fff",
                  borderColor: "#0284c7",
                  boxShadow: "0 10px 20px -5px rgba(2, 132, 199, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSignIn(true)}
                className="bg-white dark:bg-slate-900 px-4 md:px-6 py-2 md:py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 transition-all shadow-sm text-xs md:text-sm font-bold tracking-tight"
              >
                Sign In
              </motion.button>
            )}

            {/* Mobile Menu Toggle (Hamburger) - Highly visible on small screens */}
            <motion.button 
              whileHover={{ scale: 1.1, color: "#0ea5e9" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all"
            >
              <Menu size={24} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Royal Mobile Menu Pop-up */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Blurry Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Pop-up Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                mass: 0.8
              }}
              className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden shadow-medical-900/10 will-change-transform"
            >
              {/* Royal Background Elements (Subtle) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-medical-600 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-royal-gold rounded-full blur-[60px]" />
              </div>

              <div className="relative z-10 flex flex-col h-full p-8 md:p-12 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-12 relative">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-medical-600 flex items-center justify-center text-white shadow-lg shadow-medical-600/20 overflow-hidden border-2 border-white dark:border-slate-800">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black uppercase tracking-tighter">
                            {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : <UserIcon size={24} />}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                          {user.displayName?.split(' ')[0] || 'Patient'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          {user.email?.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-medical-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-medical-600/20">
                        <Activity size={24} />
                      </div>
                      <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">OrthoDoct</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X size={28} />
                  </button>
                </div>

                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.1
                      }
                    }
                  }}
                  className="flex flex-col gap-3 md:gap-4"
                >
                  {['Exercises', 'Dashboard', 'Specialists', 'About Us', 'Contact'].map((item, i) => (
                    <motion.a
                      key={item}
                      variants={{
                        hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
                        visible: { opacity: 1, x: 0, filter: 'blur(0px)' }
                      }}
                      whileHover={{ x: 12, backgroundColor: 'rgba(2, 132, 199, 0.05)' }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ 
                        type: 'spring',
                        damping: 20,
                        stiffness: 300
                      }}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (item === 'Dashboard') setShowDashboard(true);
                      }}
                      className="group relative px-6 py-4 rounded-[2rem] transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="absolute inset-0 bg-medical-50 dark:bg-medical-900/10 opacity-0 group-hover:opacity-100 rounded-[2rem] transition-all duration-300 -z-10" />
                      <span className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                        {item}
                      </span>
                      <ChevronRight className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 text-medical-500" size={28} />
                    </motion.a>
                  ))}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800"
                >
                  <div className="flex flex-col gap-6">
                    {/* Theme Toggle Mobile */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-medical-900/30 text-medical-400' : 'bg-white text-medical-600 shadow-sm'}`}>
                          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">Dark Mode</span>
                      </div>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-medical-600' : 'bg-gray-300'}`}
                      >
                        <motion.div
                          animate={{ x: isDarkMode ? 24 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>

                    {!user && (
                      <motion.button 
                        whileHover={{ 
                          scale: 1.02,
                          backgroundColor: "#0284c7",
                          boxShadow: "0 20px 25px -5px rgba(2, 132, 199, 0.2)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setShowSignIn(true);
                        }}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/10 transition-all"
                      >
                        Sign In to Portal
                      </motion.button>
                    )}
                    <p className="text-gray-400 text-sm text-center uppercase tracking-widest font-medium">
                      Excellence in Orthopedic Care
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignIn && (
          <SignIn 
            onClose={() => setShowSignIn(false)} 
            onRefreshUser={handleRefreshUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDashboard && (
          <Dashboard 
            user={user} 
            isDarkMode={isDarkMode}
            onClose={() => setShowDashboard(false)} 
            onSignIn={() => setShowSignIn(true)} 
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.main 
        className="relative z-10 px-6 pt-12 pb-24 max-w-7xl mx-auto flex flex-col items-center text-center"
        style={{ willChange: "transform" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-50/80 dark:bg-sky-900/40 border border-medical-200 dark:border-sky-800 text-medical-800 dark:text-sky-300 text-xs font-semibold mb-8 backdrop-blur-md transition-colors"
        >
          <Zap size={14} className="fill-medical-500 text-medical-500" />
          <span>Next-Gen Orthopedic Recovery</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 max-w-5xl leading-[1.1] md:leading-[1.05]"
        >
          Your path to <WordCycler /> <br className="hidden md:block" /> movement starts from here.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl font-light px-4"
        >
          Share your orthopedic concerns and receive AI-curated animated exercises designed specifically for your recovery journey.
        </motion.p>

        <PromptBox onSubmit={handleIssueSubmit} isLoading={isAnalyzing} />
      </motion.main>

      {/* Patient Reports Section */}
      <AnimatePresence>
        {user && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative z-10 py-12 px-6 max-w-4xl mx-auto"
          >
            <PatientReports uid={user.uid} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6 border-y border-gray-100/50 dark:border-gray-800/50 transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Shield, title: "Clinically Validated", desc: "Exercises based on orthopedic best practices and physical therapy standards." },
              { icon: Zap, title: "Instant Analysis", desc: "Our AI identifies movement patterns and suggests immediate relief exercises." },
              { icon: Heart, title: "Patient Centric", desc: "Designed for ease of use, focusing on your comfort and long-term mobility." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-medical-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-medical-50 dark:bg-medical-900/20 flex items-center justify-center text-medical-600 dark:text-medical-400 mb-6 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                <motion.button 
                  whileHover={{ x: 5 }}
                  className="mt-6 flex items-center gap-2 text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 font-semibold text-sm transition-colors group/btn"
                >
                  <span className="relative">
                    Learn more
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-medical-500 transition-all group-hover/btn:w-full" />
                  </span>
                  <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Recovery that adapts <br /> to your <span className="text-medical-600 dark:text-medical-400 italic">unique</span> needs.
            </h2>
            <div className="space-y-6">
              {[
                "Personalized exercise intensity levels",
                "Real-time progress tracking",
                "Direct specialist consultation",
                "Mobile-first recovery companion"
              ].map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <CheckCircle2 className="text-medical-500" size={20} />
                  <span className="font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-medical-500/10 blur-3xl rounded-full" />
            <div className="relative bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="aspect-video rounded-[2rem] bg-gray-50 dark:bg-slate-800 overflow-hidden relative group">
                <img 
                  src="https://picsum.photos/seed/ortho/800/450" 
                  alt="Recovery Animation" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl dark:shadow-medical-900/40 cursor-pointer transition-colors"
                  >
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-medical-600 dark:border-l-medical-400 border-b-[10px] border-b-transparent ml-1 transition-colors" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 dark:border-gray-800 py-16 px-6 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={24} className="text-medical-600 dark:text-medical-400" />
                <span className="font-bold text-2xl text-gray-900 dark:text-white transition-colors">OrthoDoct</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Empowering patients with AI-driven orthopedic recovery tools. Move better, live stronger.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h5 className="font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Product</h5>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Exercises</a></li>
                  <li><a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Mobile App</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Company</h5>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
            <p className="text-sm text-gray-400 dark:text-gray-500">© 2026 OrthoDoct. All rights reserved. Consult a doctor before starting any exercise program.</p>
            <div className="flex gap-8 text-sm font-medium text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-medical-600 dark:hover:text-medical-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
