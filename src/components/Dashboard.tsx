import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  FileText, 
  Dumbbell, 
  UserCircle, 
  ChevronRight,
  Activity,
  Plus,
  Search,
  LayoutDashboard,
  Lock,
  ArrowRight,
  X,
  Sparkles,
  Calendar,
  Clock,
  Settings,
  Bell,
  Grid,
  Stethoscope,
  LogOut,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit 
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Button } from '@/components/ui/button';
import { PatientReports } from './PatientReports';

interface DashboardProps {
  user: FirebaseUser | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

const DashboardSection = ({ children, index, title, icon: Icon, action }: { children: React.ReactNode, index: number, title: string, icon: any, action?: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400">
            <Icon size={20} />
          </div>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </motion.div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, isDarkMode, onClose, onSignIn }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'analyses'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error('Dashboard onSnapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Dashboard Container */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full h-full md:w-[98vw] md:h-[95vh] bg-gray-50 dark:bg-slate-950 md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col will-change-transform"
      >
        {/* Header */}
        <div className="h-[60px] min-h-[60px] px-10 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-slate-900 z-20">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-medical-600 text-white shadow-lg shadow-medical-600/20">
              <LayoutDashboard size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Patient Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-gray-700">
              <Search size={14} className="text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Search medical records..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-gray-400 dark:text-gray-200"
              />
            </div>
            <motion.button 
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X size={24} />
            </motion.button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-12 bg-white dark:bg-slate-900 transition-colors">
              <div className="w-24 h-24 bg-medical-50 dark:bg-medical-900/20 rounded-[2.5rem] flex items-center justify-center text-medical-600 dark:text-medical-400 shadow-inner">
                <Lock size={40} />
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In Required</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Please sign in to your account to access your personalized medical dashboard and recovery plans.</p>
              </div>
              <Button 
                onClick={() => {
                  onClose();
                  onSignIn();
                }}
                className="bg-medical-600 hover:bg-medical-500 text-white rounded-full px-10 py-8 h-auto text-xl font-bold shadow-xl shadow-medical-600/20 transition-all active:scale-95 flex items-center gap-4 group"
              >
                Sign In to OrthoDoct
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <>
              {/* Left Sidebar - Important Stuffs (190px) */}
              <div className="hidden md:flex w-[190px] flex-col border-r border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden">
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-8">
                  {/* Navigation Group */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Navigation</p>
                    <nav className="space-y-1">
                      {[
                        { icon: Grid, label: 'Overview', active: true },
                        { icon: Activity, label: 'Vitals' },
                        { icon: Stethoscope, label: 'Specialists' },
                        { icon: Calendar, label: 'Schedule' },
                      ].map((item, i) => (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ x: 6, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white' }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                            item.active ? 'text-medical-600 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-medical-600 dark:hover:text-medical-400'
                          }`}
                        >
                          <item.icon size={18} className={item.active ? 'text-medical-600' : 'text-gray-400 dark:text-gray-500'} />
                          <span className="text-xs font-semibold">{item.label}</span>
                        </motion.button>
                      ))}
                    </nav>
                  </div>

                  {/* Modules Group */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Modules</p>
                    <nav className="space-y-1">
                      {[
                        { icon: FileText, label: 'E-Health' },
                        { icon: Dumbbell, label: 'Training' },
                        { icon: Bell, label: 'Notifs' },
                      ].map((item, i) => (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (i + 4) * 0.05 }}
                          whileHover={{ x: 6, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white' }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group"
                        >
                          <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:bg-medical-50 dark:group-hover:bg-medical-900/30 group-hover:text-medical-600 transition-colors">
                            <item.icon size={16} />
                          </div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-medical-700 dark:group-hover:text-medical-300">{item.label}</span>
                        </motion.button>
                      ))}
                    </nav>
                  </div>

                  {/* Settings / Extra */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Utility</p>
                    <nav className="space-y-1">
                      {[
                        { icon: Settings, label: 'Settings' },
                        { icon: HelpCircle, label: 'Support' },
                      ].map((item, i) => (
                        <motion.button
                          key={item.label}
                          whileHover={{ x: 4 }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all font-medium"
                        >
                          <item.icon size={18} />
                          <span className="text-xs">{item.label}</span>
                        </motion.button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-bold"
                  >
                    <LogOut size={14} />
                    Logout
                  </motion.button>
                </div>
              </div>

              {/* Left Column - Main Sections */}
              <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-10">
                <DashboardSection 
                  index={0} 
                  title="Medical Reports" 
                  icon={FileText}
                  action={
                    <div className="flex items-center gap-3">
                      <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-medical-600 transition-colors shadow-sm" title="Share with Physician">
                        <UserCircle size={18} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-medical-600 transition-colors shadow-sm" title="Export PDF">
                        <FileText size={18} />
                      </button>
                      <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                      <button className="text-sm font-bold text-medical-600 hover:text-medical-500 transition-colors flex items-center gap-1 group">
                        View All
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  }
                >
                  <PatientReports uid={user.uid} hideTitle={true} />
                </DashboardSection>

                <DashboardSection index={1} title="Recovery Exercises" icon={Dumbbell}>
                  {reports.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 bg-gray-50/50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-gray-300 dark:text-gray-600 shadow-sm">
                        <Dumbbell size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">No exercises recommended yet!</p>
                        <p className="text-gray-500 dark:text-gray-400">Your personalized exercise plan will appear here after analysis.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Recovery Nudge */}
                      <div className="p-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-3xl flex items-center gap-6">
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                          <Activity size={28} className="animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-black text-orange-700 dark:text-orange-400">Daily Goal: Complete Mobility Routine</h4>
                          <p className="text-sm text-orange-600/80 dark:text-orange-500/80 font-medium">Regular movement is crucial for your recovery. Start with the exercises below to maintain range of motion.</p>
                        </div>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all px-6">
                          Let's Begin
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: "Knee Extensions", reps: "3 Sets x 12 Reps", intensity: "Low", type: "Mobility", color: "blue" },
                          { title: "Quadriceps Sets", reps: "2 Sets x 15 Reps", intensity: "Medium", type: "Strength", color: "medical" },
                          { title: "Wall Slides", reps: "3 Sets x 10 Reps", intensity: "Low", type: "Therapy", color: "orange" }
                        ].map((exercise, i) => (
                          <motion.div
                            key={exercise.title}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                          >
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                              <Dumbbell size={80} />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:bg-medical-600 group-hover:text-white transition-all duration-500">
                                <Activity size={20} />
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none mb-1 ${
                                  exercise.intensity === 'Low' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                  {exercise.intensity}
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Intensity</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mb-6">
                              <h4 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-medical-600 transition-colors">
                                {exercise.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{exercise.reps}</p>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse" />
                                <span className="text-[10px] font-black text-medical-600 dark:text-medical-400 uppercase tracking-[0.2em]">{exercise.type}</span>
                              </div>
                              <button className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                                <CheckCircle2 size={20} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </DashboardSection>

                <DashboardSection index={2} title="Recovery Journey" icon={Activity}>
                  <div className="relative pt-8 pb-4 px-4 overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    <div className="absolute top-0 left-12 bottom-0 w-1 bg-gray-50 dark:bg-slate-800 rounded-full" />
                    
                    <div className="space-y-12 relative z-10">
                      {[
                        { title: "Initial Analysis", date: "Apr 12", status: "completed", desc: "First knee injury report analyzed." },
                        { title: "Physical Therapy Start", date: "Apr 20", status: "completed", desc: "Started mobility routine." },
                        { title: "Intensity Increase", date: "Today", status: "active", desc: "Moving to strength-building exercises." },
                        { title: "Recovery Checkout", date: "May 15", status: "pending", desc: "Goal: Full range of motion." }
                      ].map((step, i) => (
                        <motion.div 
                          key={step.title}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-8"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 shadow-sm z-10 ${
                            step.status === 'completed' ? 'bg-medical-500 text-white' : 
                            step.status === 'active' ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : 
                            'bg-gray-200 dark:bg-slate-800 text-gray-400'
                          }`}>
                            {step.status === 'completed' ? <CheckCircle2 size={14} /> : (i + 1)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className={`font-bold ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {step.title}
                              </h4>
                              <span className="text-[10px] font-black text-medical-600 dark:text-medical-400 uppercase tracking-tighter bg-medical-50 dark:bg-medical-900/30 px-2 py-0.5 rounded-md">
                                {step.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                              {step.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </DashboardSection>
              </div>

              {/* Right Column - Fixed Info */}
              <div className="hidden lg:block w-[400px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-10 space-y-10 overflow-y-auto no-scrollbar">
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400">
                        <Sparkles size={20} />
                      </div>
                      Recovery Status
                    </h3>
                  </div>
                  
                  <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-medical-600 to-medical-800 text-white shadow-xl shadow-medical-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20">
                      <Activity size={80} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div>
                        <p className="text-medical-100 text-xs font-bold uppercase tracking-widest mb-1">Current Phase</p>
                        <h4 className="text-2xl font-black">Initial Assessment</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-medical-100">Overall Progress</span>
                          <span>15%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "15%" }}
                            className="h-full bg-white transition-all duration-1000"
                          />
                        </div>
                      </div>
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                        View Detailed Timeline
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400">
                      <UserCircle size={20} />
                    </div>
                    Doctors Consulted
                  </h3>
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6 space-y-6 bg-gray-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                    <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-gray-200 dark:text-gray-700 shadow-sm">
                      <UserCircle size={48} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">No consultations yet!</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Connect with our world-class orthopedic specialists.</p>
                    </div>
                    <Button variant="outline" className="w-full rounded-2xl border-medical-200 dark:border-medical-800 text-medical-600 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-900/20 h-14 font-bold">
                      Find a Specialist
                    </Button>
                  </div>
                </section>

                <Card className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-transparent flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:border-medical-300 dark:hover:border-medical-500 hover:bg-medical-50/50 dark:hover:bg-medical-900/10 transition-all duration-500 rounded-[2.5rem]">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:bg-medical-100 dark:group-hover:bg-medical-900/30 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-all duration-500 group-hover:rotate-90">
                    <Plus size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-medical-700 dark:group-hover:text-medical-300 transition-colors">Add New Module</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your health view</p>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {user && (
          <div className="h-[73.5px] min-h-[73.5px] px-10 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between z-20">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-medical-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-medical-600 dark:text-medical-400 shadow-sm">
                    U{i}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-bold">Join 2,400+ patients</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Recovering with OrthoDoct</p>
              </div>
            </div>
            <Button className="px-10 py-4 bg-medical-600 text-white rounded-full text-base font-bold shadow-xl shadow-medical-600/20 hover:bg-medical-500 transition-all active:scale-95 h-auto">
              Book a Consultation
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
